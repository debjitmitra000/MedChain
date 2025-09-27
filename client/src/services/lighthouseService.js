// Lighthouse Storage Service for MedChain
import lighthouse from '@lighthouse-web3/sdk';

const LIGHTHOUSE_API_KEY = import.meta.env.VITE_LIGHTHOUSE_API_KEY || 'your-lighthouse-api-key';

class LighthouseService {
  constructor() {
    this.apiKey = LIGHTHOUSE_API_KEY;
  }

  /**
   * Upload a file to Lighthouse (IPFS)
   * @param {File} file - The file to upload
   * @param {string} manufacturerAddress - Ethereum address of the manufacturer
   * @returns {Promise<{hash: string, url: string}>} - IPFS hash and gateway URL
   */
  async uploadFile(file, manufacturerAddress) {
    try {
      console.log('📤 Uploading file to Lighthouse:', { 
        fileName: file.name, 
        size: file.size,
        manufacturer: manufacturerAddress 
      });

      // Upload file to Lighthouse
      const uploadResponse = await lighthouse.upload([file], this.apiKey);
      
      if (!uploadResponse.data.Hash) {
        throw new Error('Failed to upload file to Lighthouse');
      }

      const ipfsHash = uploadResponse.data.Hash;
      const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${ipfsHash}`;

      console.log('✅ File uploaded successfully:', { ipfsHash, gatewayUrl });

      return {
        hash: ipfsHash,
        url: gatewayUrl,
        size: file.size,
        type: file.type,
        name: file.name
      };

    } catch (error) {
      console.error('❌ Error uploading file to Lighthouse:', error);
      throw new Error(`Lighthouse upload failed: ${error.message}`);
    }
  }

  /**
   * Upload manufacturer profile picture
   * @param {File} imageFile - The image file to upload
   * @param {string} manufacturerAddress - Ethereum address of the manufacturer
   * @returns {Promise<{hash: string, url: string}>} - IPFS hash and gateway URL
   */
  async uploadManufacturerProfilePicture(imageFile, manufacturerAddress) {
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

      const result = await this.uploadFile(imageFile, manufacturerAddress);

      // Store the mapping in local storage for demo purposes
      // In production, this would be stored in your backend/blockchain
      this.storeProfilePictureMapping(manufacturerAddress, result);

      return result;

    } catch (error) {
      console.error('❌ Error uploading manufacturer profile picture:', error);
      throw error;
    }
  }

  /**
   * Get manufacturer profile picture URL
   * @param {string} manufacturerAddress - Ethereum address of the manufacturer
   * @returns {string|null} - Profile picture URL or null if not found
   */
  getManufacturerProfilePicture(manufacturerAddress) {
    try {
      const stored = localStorage.getItem('medchain_profile_pictures');
      if (!stored) return null;

      const profiles = JSON.parse(stored);
      const profile = profiles[manufacturerAddress.toLowerCase()];
      
      return profile ? profile.url : null;
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