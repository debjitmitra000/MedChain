// components/ManufacturerProfilePicture.jsx
import React, { useState, useRef } from 'react';
import { lighthouseService } from '../services/lighthouseService';

const ManufacturerProfilePicture = ({ 
  manufacturerAddress, 
  currentImageUrl = null, 
  onImageUpdate = () => {}, 
  size = 'large' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }

      console.log('📤 Uploading manufacturer profile picture...', {
        manufacturer: manufacturerAddress,
        fileName: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      });

      // Upload to Lighthouse
      const result = await lighthouseService.uploadManufacturerProfilePicture(
        file, 
        manufacturerAddress
      );

      setImageUrl(result.url);
      onImageUpdate(result);

      console.log('✅ Profile picture uploaded successfully:', result);

    } catch (err) {
      console.error('❌ Error uploading profile picture:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (manufacturerAddress) {
      lighthouseService.deleteManufacturerProfilePicture(manufacturerAddress);
      setImageUrl(null);
      onImageUpdate(null);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Picture Display */}
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-gray-300 dark:border-gray-600 shadow-lg relative group`}>
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={`Manufacturer ${manufacturerAddress} profile`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('❌ Error loading profile picture:', e);
                setImageUrl(null);
                setError('Failed to load image');
              }}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <button
                onClick={handleUploadClick}
                className="text-white text-sm font-medium hover:underline"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Change'}
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <svg
              className="w-1/2 h-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex space-x-2">
        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : imageUrl ? 'Change Picture' : 'Upload Picture'}
        </button>

        {imageUrl && (
          <button
            onClick={handleRemoveImage}
            disabled={uploading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            Remove
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm text-center max-w-xs">
          {error}
        </div>
      )}

      {/* IPFS info */}
      {imageUrl && imageUrl.includes('lighthouse.storage') && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
          <div className="flex items-center justify-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            <span>Stored on IPFS via Lighthouse</span>
          </div>
          <a 
            href={imageUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 hover:underline"
          >
            View on IPFS Gateway
          </a>
        </div>
      )}
    </div>
  );
};

export default ManufacturerProfilePicture;