// Lighthouse Storage Service for MedChain
import lighthouse from '@lighthouse-web3/sdk';

const LIGHTHOUSE_API_KEY = import.meta.env.VITE_LIGHTHOUSE_API_KEY || 'your-lighthouse-api-key';

class LighthouseService {
  constructor() {
    this.apiKey = LIGHTHOUSE_API_KEY;
    // Cache for uploaded files to avoid re-uploading
    this.uploadCache = new Map();
    // Cache for profile pictures to improve loading
    this.profilePictureCache = new Map();
    // Upload progress tracking
    this.uploadProgress = new Map();
  }

  /**
   * Upload a file to Lighthouse (IPFS) with caching and progress tracking
   * @param {File} file - The file to upload
   * @param {string} manufacturerAddress - Ethereum address of the manufacturer
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<{hash: string, url: string}>} - IPFS hash and gateway URL
   */
  async uploadFile(file, manufacturerAddress, onProgress = null) {
    try {
      // Generate file hash for caching
      const fileHash = await this.generateFileHash(file);
      const cacheKey = `${manufacturerAddress}_${fileHash}`;

      // Check cache first
      if (this.uploadCache.has(cacheKey)) {
        console.log('� Using cached upload result');
        const cached = this.uploadCache.get(cacheKey);
        onProgress?.(100);
        return cached;
      }

      console.log('�📤 Uploading file to Lighthouse:', { 
        fileName: file.name, 
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        manufacturer: manufacturerAddress 
      });

      // Set initial progress
      const progressId = `${manufacturerAddress}_${Date.now()}`;
      this.uploadProgress.set(progressId, 0);
      onProgress?.(0);

      // Compress image if it's too large
      let fileToUpload = file;
      if (file.type.startsWith('image/') && file.size > 1024 * 1024) { // > 1MB
        console.log('🗜️ Compressing image...');
        onProgress?.(10);
        fileToUpload = await this.compressImage(file);
      }

      onProgress?.(20);

      // Upload file to Lighthouse with progress simulation
      const uploadResponse = await lighthouse.upload([fileToUpload], this.apiKey);
      
      onProgress?.(80);
      
      if (!uploadResponse.data.Hash) {
        throw new Error('Failed to upload file to Lighthouse');
      }

      const ipfsHash = uploadResponse.data.Hash;
      const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${ipfsHash}`;

      const result = {
        hash: ipfsHash,
        url: gatewayUrl,
        size: fileToUpload.size,
        type: fileToUpload.type,
        name: fileToUpload.name,
        originalSize: file.size,
        compressed: fileToUpload.size !== file.size,
        uploadedAt: Date.now()
      };

      // Cache the result
      this.uploadCache.set(cacheKey, result);
      this.uploadProgress.delete(progressId);
      onProgress?.(100);

      console.log('✅ File uploaded successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ Error uploading file to Lighthouse:', error);
      throw new Error(`Lighthouse upload failed: ${error.message}`);
    }
  }

  /**
   * Generate hash for file (for caching)
   * @param {File} file - File to hash
   * @returns {Promise<string>} - File hash
   */
  async generateFileHash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Compress image file
   * @param {File} file - Image file to compress
   * @param {number} quality - Compression quality (0-1)
   * @returns {Promise<File>} - Compressed file
   */
  async compressImage(file, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate optimal dimensions (max 1024px)
        const maxSize = 1024;
        let { width, height } = img;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload manufacturer profile picture
   * @param {File} imageFile - The image file to upload
   * @param {string} manufacturerAddress - Ethereum address of the manufacturer
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<{hash: string, url: string}>} - IPFS hash and gateway URL
   */
  async uploadManufacturerProfilePicture(imageFile, manufacturerAddress, onProgress = null) {
    try {
      // Validate file type
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (imageFile.size > maxSize) {
        throw new Error('Image file must be less than 5MB');
      }

      console.log('🏭 Uploading manufacturer profile picture:', {
        manufacturer: manufacturerAddress,
        fileName: imageFile.name,
        size: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`
      });

      const result = await this.uploadFile(imageFile, manufacturerAddress, onProgress);

      // Store the mapping in local storage for demo purposes
      // In production, this would be stored in your backend/blockchain
      this.storeProfilePictureMapping(manufacturerAddress, result);

      // Cache the profile picture
      this.profilePictureCache.set(manufacturerAddress.toLowerCase(), result);

      return result;

    } catch (error) {
      console.error('❌ Error uploading manufacturer profile picture:', error);
      throw error;
    }
  }

  /**
   * Get manufacturer profile picture URL with caching
   * @param {string} manufacturerAddress - Ethereum address of the manufacturer
   * @returns {Object|null} - Profile picture data or null if not found
   */
  getManufacturerProfilePicture(manufacturerAddress) {
    try {
      const lowerAddress = manufacturerAddress.toLowerCase();
      
      // Check memory cache first
      if (this.profilePictureCache.has(lowerAddress)) {
        return this.profilePictureCache.get(lowerAddress);
      }

      // Check localStorage
      const stored = localStorage.getItem('medchain_profile_pictures');
      if (!stored) return null;

      const profiles = JSON.parse(stored);
      const profile = profiles[lowerAddress];
      
      if (profile) {
        // Cache in memory for faster access
        this.profilePictureCache.set(lowerAddress, profile);
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error retrieving profile picture:', error);
      return null;
    }
  }

  /**
   * Store profile picture mapping (demo implementation)
   * @param {string} manufacturerAddress - Ethereum address
   * @param {Object} fileData - File upload result
   */
  storeProfilePictureMapping(manufacturerAddress, fileData) {
    try {
      const stored = localStorage.getItem('medchain_profile_pictures') || '{}';
      const profiles = JSON.parse(stored);
      
      profiles[manufacturerAddress.toLowerCase()] = {
        ...fileData,
        uploadedAt: Date.now()
      };
      
      localStorage.setItem('medchain_profile_pictures', JSON.stringify(profiles));
      console.log('💾 Profile picture mapping stored locally');
    } catch (error) {
      console.error('❌ Error storing profile picture mapping:', error);
    }
  }

  /**
   * Get all manufacturer profile pictures
   * @returns {Object} - All stored profile pictures
   */
  getAllManufacturerProfilePictures() {
    try {
      const stored = localStorage.getItem('medchain_profile_pictures');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ Error retrieving all profile pictures:', error);
      return {};
    }
  }

  /**
   * Delete manufacturer profile picture
   * @param {string} manufacturerAddress - Ethereum address
   */
  deleteManufacturerProfilePicture(manufacturerAddress) {
    try {
      const stored = localStorage.getItem('medchain_profile_pictures');
      if (!stored) return;

      const profiles = JSON.parse(stored);
      delete profiles[manufacturerAddress.toLowerCase()];
      
      localStorage.setItem('medchain_profile_pictures', JSON.stringify(profiles));
      console.log('🗑️ Profile picture deleted for manufacturer:', manufacturerAddress);
    } catch (error) {
      console.error('❌ Error deleting profile picture:', error);
    }
  }

  /**
   * Retry upload with exponential backoff
   * @param {Function} uploadFn - Upload function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise} - Upload result
   */
  async retryUpload(uploadFn, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Upload attempt ${attempt}/${maxRetries}`);
        return await uploadFn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Clear upload cache
   */
  clearUploadCache() {
    this.uploadCache.clear();
    this.profilePictureCache.clear();
    console.log('🧹 Upload cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getCacheStats() {
    return {
      uploadCacheSize: this.uploadCache.size,
      profileCacheSize: this.profilePictureCache.size,
      activeUploads: this.uploadProgress.size
    };
  }

  /**
   * Generate a shareable link for a file
   * @param {string} ipfsHash - IPFS hash of the file
   * @returns {string} - Shareable gateway URL
   */
  getShareableUrl(ipfsHash) {
    return `https://gateway.lighthouse.storage/ipfs/${ipfsHash}`;
  }

  /**
   * Get file info from IPFS hash
   * @param {string} ipfsHash - IPFS hash
   * @returns {Promise<Object>} - File information
   */
  async getFileInfo(ipfsHash) {
    try {
      const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${ipfsHash}`, {
        method: 'HEAD'
      });
      
      return {
        size: response.headers.get('content-length'),
        type: response.headers.get('content-type'),
        lastModified: response.headers.get('last-modified')
      };
    } catch (error) {
      console.error('❌ Error getting file info:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const lighthouseService = new LighthouseService();
export default lighthouseService;