// components/ManufacturerCard.jsx
import React, { useState, useEffect } from 'react';
import { lighthouseService } from '../services/lighthouseService';
import ManufacturerProfilePicture from './ManufacturerProfilePicture';

const ManufacturerCard = ({ 
  manufacturer, 
  showProfilePicture = true, 
  size = 'medium',
  onClick = null 
}) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadManufacturerProfile();
  }, [manufacturer.address]);

  const loadManufacturerProfile = async () => {
    try {
      setLoading(true);
      
      // Load profile picture from Lighthouse
      const profilePictureUrl = lighthouseService.getManufacturerProfilePicture(manufacturer.address);
      
      // Load other profile data from localStorage (in production, this would come from your backend/blockchain)
      const savedProfile = localStorage.getItem(`manufacturer_profile_${manufacturer.address.toLowerCase()}`);
      
      let profileInfo = {
        profilePicture: profilePictureUrl,
        description: '',
        website: ''
      };

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        profileInfo = {
          ...profileInfo,
          ...parsed,
          profilePicture: profilePictureUrl
        };
      }

      setProfileData(profileInfo);
    } catch (error) {
      console.error('❌ Error loading manufacturer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(manufacturer);
    }
  };

  const getStatusBadge = () => {
    if (manufacturer.isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          Verified
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
        </svg>
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        {showProfilePicture && (
          <div className="flex-shrink-0">
            {profileData?.profilePicture ? (
              <img
                src={profileData.profilePicture}
                alt={`${manufacturer.name} profile`}
                className={`${
                  size === 'small' ? 'w-12 h-12' : 
                  size === 'medium' ? 'w-16 h-16' : 'w-20 h-20'
                } rounded-full object-cover border-2 border-gray-200 dark:border-gray-600`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`${
                size === 'small' ? 'w-12 h-12' : 
                size === 'medium' ? 'w-16 h-16' : 'w-20 h-20'
              } rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center ${
                profileData?.profilePicture ? 'hidden' : 'flex'
              }`}
            >
              <svg
                className={`${
                  size === 'small' ? 'w-6 h-6' : 
                  size === 'medium' ? 'w-8 h-8' : 'w-10 h-10'
                } text-gray-400 dark:text-gray-500`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m5 0v-4a1 1 0 011-1h2a1 1 0 011 1v4M7 7h10M7 11h6"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Manufacturer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {manufacturer.name}
            </h3>
            {getStatusBadge()}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {manufacturer.email}
          </p>

          {manufacturer.license && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              License: {manufacturer.license}
            </p>
          )}

          {profileData?.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
              {profileData.description}
            </p>
          )}

          {/* Address */}
          <div className="flex items-center mt-3 space-x-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Address:</span>{' '}
              {manufacturer.address || manufacturer.wallet || manufacturer.id ? (
                <span className="font-mono">
                  {(manufacturer.address || manufacturer.wallet || manufacturer.id).slice(0, 6)}...{(manufacturer.address || manufacturer.wallet || manufacturer.id).slice(-4)}
                </span>
              ) : (
                <span className="text-red-500">Invalid Ethereum address format<br/>This manufacturer may not be registered in the system.</span>
              )}
            </div>

            {profileData?.website && (
              <a
                href={profileData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Visit Website
              </a>
            )}
          </div>

          {/* Registration Date */}
          {manufacturer.registeredAt && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Registered: {new Date(manufacturer.registeredAt * 1000).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Lighthouse Storage Badge */}
      {profileData?.profilePicture && profileData.profilePicture.includes('lighthouse.storage') && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            Profile picture stored on IPFS via Lighthouse
          </div>
        </div>
      )}
    </div>
  );
};

export default ManufacturerCard;