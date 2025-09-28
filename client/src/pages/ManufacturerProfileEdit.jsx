import React, { useState } from 'react';
import { lighthouseService } from '../services/lighthouseService';
import { useNavigate } from 'react-router-dom';

export default function ManufacturerProfileEdit() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file.');
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      // Upload to Lighthouse
      const url = await lighthouseService.uploadProfilePicture(file);
      // Save to localStorage (replace with backend call if needed)
      localStorage.setItem('manufacturer_profile_picture', url);
      setSuccess('Profile picture uploaded successfully!');
    } catch (err) {
      setError('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Profile Picture</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <div className="mt-4 text-red-500">{error}</div>}
      {success && <div className="mt-4 text-green-500">{success}</div>}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
      >
        Back
      </button>
    </div>
  );
}
