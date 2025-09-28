// pages/ManufacturerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import ManufacturerProfilePicture from '../components/ManufacturerProfilePicture';
import { lighthouseService } from '../services/lighthouseService';

const ManufacturerProfile = () => {
  const { address, isConnected } = useAccount();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    license: '',
    description: '',
    website: '',
    profilePicture: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isConnected && address) {
      loadManufacturerProfile();
    }
  }, [isConnected, address]);

  const loadManufacturerProfile = async () => {
    try {
      setIsLoading(true);
      
      // Load profile picture from Lighthouse
      const profilePictureUrl = lighthouseService.getManufacturerProfilePicture(address);
      
      // Load other profile data from localStorage (in production, this would come from your backend/blockchain)
      const savedProfile = localStorage.getItem(`manufacturer_profile_${address.toLowerCase()}`);
      
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfileData({
          ...parsed,
          profilePicture: profilePictureUrl
        });
      } else {
        setProfileData(prev => ({
          ...prev,
          profilePicture: profilePictureUrl
        }));
      }
    } catch (error) {
      console.error('❌ Error loading manufacturer profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureUpdate = (result) => {
    if (result) {
      setProfileData(prev => ({
        ...prev,
        profilePicture: result.url
      }));
      setMessage({ type: 'success', text: 'Profile picture uploaded successfully!' });
    } else {
      setProfileData(prev => ({
        ...prev,
        profilePicture: null
      }));
      setMessage({ type: 'info', text: 'Profile picture removed' });
    }

    // Auto-clear message after 3 seconds
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' });
      return;
    }

    try {
      setIsSaving(true);

      // Save profile data to localStorage (in production, this would be saved to your backend/blockchain)
      const profileToSave = { ...profileData };
      delete profileToSave.profilePicture; // Don't save URL in profile data as it's stored separately

      localStorage.setItem(`manufacturer_profile_${address.toLowerCase()}`, JSON.stringify(profileToSave));

      setMessage({ type: 'success', text: 'Profile saved successfully!' });

      // Auto-clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      console.error('❌ Error saving manufacturer profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Wallet Not Connected
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please connect your wallet to manage your manufacturer profile.
          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manufacturer Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your pharmaceutical manufacturing profile and credentials
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Wallet Address</div>
              <div className="font-mono text-sm text-gray-900 dark:text-white">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' :
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' :
            'bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          {/* Profile Picture Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Profile Picture
            </h2>
            <div className="flex justify-center">
              <ManufacturerProfilePicture
                manufacturerAddress={address}
                currentImageUrl={profileData.profilePicture}
                onImageUpdate={handleProfilePictureUpdate}
                size="xl"
              />
            </div>
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Upload a profile picture to represent your pharmaceutical manufacturing company.</p>
              <p className="mt-1">Images are stored securely on IPFS via Lighthouse storage.</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Manufacturing License
                </label>
                <input
                  type="text"
                  name="license"
                  value={profileData.license}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your license number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://your-company-website.com"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Description
              </label>
              <textarea
                name="description"
                value={profileData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your pharmaceutical manufacturing company..."
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Profile...
                </>
              ) : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManufacturerProfile;