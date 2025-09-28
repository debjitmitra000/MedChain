import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { lighthouseService } from '../services/lighthouseService';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

export default function ProfileEdit() {
  const { address, isConnected } = useAccount();
  const [role, setRole] = useState('user'); // You can set this from your role hook
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    description: '',
    website: '',
    profilePicture: null
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && address) {
      // Load profile from localStorage (replace with backend if needed)
      const savedProfile = localStorage.getItem(`profile_${address.toLowerCase()}`);
      let profile = savedProfile ? JSON.parse(savedProfile) : {};
      // Try to get profile picture from lighthouseService
      const picObj = lighthouseService.getManufacturerProfilePicture(address);
      if (picObj && picObj.url) {
        profile.profilePicture = picObj.url;
      }
      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        description: profile.description || '',
        website: profile.website || '',
        profilePicture: profile.profilePicture || null
      });
    }
  }, [isConnected, address]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file.');
      return;
    }
    setUploading(true);
    setMessage('');
    try {
      // Use lighthouseService for profile picture upload with progress callback
      const result = await lighthouseService.uploadManufacturerProfilePicture(
        file, 
        address, 
        (progress) => {
          // Optional: You can add a progress indicator here
          console.log(`Upload progress: ${progress}%`);
        }
      );
      setProfileData(prev => ({ ...prev, profilePicture: result.url }));
      setMessage('Profile picture uploaded successfully!');
      setFile(null); // Clear the file input
      
      // Dispatch custom event to notify other components about profile picture update
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: { address: address.toLowerCase() } 
      }));
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!isConnected || !address) {
      setMessage('Please connect your wallet first');
      return;
    }
    try {
      // Save profile data to localStorage (excluding profilePicture as it's stored via Lighthouse)
      const profileToSave = { ...profileData };
      delete profileToSave.profilePicture; // Don't save URL in profile data
      localStorage.setItem(`profile_${address.toLowerCase()}`, JSON.stringify(profileToSave));
      setMessage('Profile saved successfully!');
      
      // Dispatch custom event to notify other components about profile update
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: { address: address.toLowerCase() } 
      }));
      
      // Auto-clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setMessage('Failed to save profile. Please try again.');
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
            Please connect your wallet to edit your profile.
          </p>
          <a href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            Connect Wallet
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Profile</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Update your profile information and upload a profile picture to IPFS
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('failed') || message.includes('error') 
                ? 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                : 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            }`}>
              {message}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h3>
            <div className="flex items-center gap-6">
              {/* Current Picture Display */}
              <div className="flex-shrink-0">
                {profileData.profilePicture ? (
                  <img 
                    src={profileData.profilePicture} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-lg" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
              
              {/* Upload Controls */}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="mb-3 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                />
                <button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading to IPFS...
                    </>
                  ) : (
                    'Upload to Lighthouse IPFS'
                  )}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Images are stored securely on IPFS via Lighthouse. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input 
                type="text" 
                name="name" 
                value={profileData.name} 
                onChange={handleInputChange} 
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input 
                type="email" 
                name="email" 
                value={profileData.email} 
                onChange={handleInputChange} 
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
                placeholder="Enter your email address"
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
                placeholder="https://your-website.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea 
                name="description" 
                value={profileData.description} 
                onChange={handleInputChange} 
                rows="4" 
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              Save Profile
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 font-medium"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
