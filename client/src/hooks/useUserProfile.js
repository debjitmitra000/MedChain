import { useState, useEffect } from 'react';
import { getUserProfile, getUserDisplayName, getUserProfilePicture } from '../utils/profileUtils';

/**
 * Custom hook to manage user profile data with automatic updates
 * @param {string} address - User's wallet address
 * @returns {object} Profile data and refresh function
 */
export function useUserProfile(address) {
  const [profileData, setProfileData] = useState(() => {
    if (address) {
      return getUserProfile(address);
    }
    return {
      name: null,
      email: null,
      description: null,
      website: null,
      profilePicture: null
    };
  });

  const refreshProfile = () => {
    if (address) {
      const profile = getUserProfile(address);
      setProfileData(profile);
    } else {
      setProfileData({
        name: null,
        email: null,
        description: null,
        website: null,
        profilePicture: null
      });
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [address]);

  // Listen for profile updates in localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && address && e.key === `profile_${address.toLowerCase()}`) {
        refreshProfile();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom profile update events
    const handleProfileUpdate = (e) => {
      if (e.detail?.address === address) {
        refreshProfile();
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [address]);

  return {
    profile: profileData,
    displayName: profileData.name || 'Not Set',
    profilePicture: profileData.profilePicture,
    hasProfile: !!profileData.name,
    refreshProfile
  };
}