import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { lighthouseService } from '../services/lighthouseService';
import { useNavigate } from 'react-router-dom';

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
      if (savedProfile) {
        setProfileData(JSON.parse(savedProfile));
      }
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
      // Upload to Lighthouse
      const url = await lighthouseService.uploadProfilePicture(file);
      setProfileData(prev => ({ ...prev, profilePicture: url }));
      setMessage('Profile picture uploaded successfully!');
    } catch (err) {
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
    localStorage.setItem(`profile_${address.toLowerCase()}`, JSON.stringify(profileData));
    setMessage('Profile saved successfully!');
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
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Profile</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {profileData.profilePicture && (
          <img src={profileData.profilePicture} alt="Profile" className="mt-4 w-24 h-24 rounded-full object-cover" />
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Name</label>
        <input type="text" name="name" value={profileData.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Email</label>
        <input type="email" name="email" value={profileData.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Website</label>
        <input type="url" name="website" value={profileData.website} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea name="description" value={profileData.description} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border rounded" />
      </div>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Save Profile
      </button>
      {message && <div className="mt-4 text-blue-600">{message}</div>}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
      >
        Back
      </button>
    </div>
  );
}
