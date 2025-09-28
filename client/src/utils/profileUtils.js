import { lighthouseService } from '../services/lighthouseService';

/**
 * Get user profile data combining localStorage and Lighthouse IPFS data
 * @param {string} address - User's wallet address
 * @returns {object} Profile data with name, email, description, website, and profilePicture
 */
export function getUserProfile(address) {
  if (!address) {
    return {
      name: null,
      email: null,
      description: null,
      website: null,
      profilePicture: null
    };
  }

  // Get profile data from localStorage
  const savedProfile = localStorage.getItem(`profile_${address.toLowerCase()}`);
  let profile = savedProfile ? JSON.parse(savedProfile) : {};

  // Get profile picture from Lighthouse service
  const picObj = lighthouseService.getManufacturerProfilePicture(address);
  if (picObj && picObj.url) {
    profile.profilePicture = picObj.url;
  }

  return {
    name: profile.name || null,
    email: profile.email || null,
    description: profile.description || null,
    website: profile.website || null,
    profilePicture: profile.profilePicture || null
  };
}

/**
 * Get user display name with fallback
 * @param {string} address - User's wallet address
 * @returns {string} User's name or "Not Set" if no name is available
 */
export function getUserDisplayName(address) {
  const profile = getUserProfile(address);
  return profile.name || 'Not Set';
}

/**
 * Get user profile picture URL
 * @param {string} address - User's wallet address
 * @returns {string|null} Profile picture URL or null if not available
 */
export function getUserProfilePicture(address) {
  const profile = getUserProfile(address);
  return profile.profilePicture;
}