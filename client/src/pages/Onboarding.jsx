import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight, Check, Shield, Factory, Building } from 'lucide-react';
import { lighthouseService } from '../services/lighthouseService';

export default function Onboarding() {
    const { address, isConnected } = useAccount();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        description: '',
        website: '',
        profilePicture: null
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isConnected) {
            navigate('/');
        }
    }, [isConnected, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleNext = async () => {
        if (step === 2) {
            if (!profileData.name) {
                setError('Name is required');
                return;
            }

            try {
                setUploading(true);
                let pictureUrl = profileData.profilePicture;

                if (file) {
                    const result = await lighthouseService.uploadManufacturerProfilePicture(
                        file,
                        address,
                        (progress) => console.log(progress)
                    );
                    pictureUrl = result.url;
                }

                const profileToSave = { ...profileData, profilePicture: pictureUrl };
                // Don't save URL in localStorage profile data as per utils
                const storageProfile = { ...profileData };
                localStorage.setItem(`profile_${address.toLowerCase()}`, JSON.stringify(storageProfile));

                window.dispatchEvent(new CustomEvent('profileUpdated', {
                    detail: { address: address.toLowerCase() }
                }));

                setUploading(false);
                setStep(3);
            } catch (err) {
                console.error(err);
                setError('Failed to save profile');
                setUploading(false);
            }
        } else {
            setStep(prev => prev + 1);
        }
    };

    const handleComplete = () => {
        navigate('/app/home');
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="p-8 md:p-12">
                    <div className="mb-8 flex justify-between items-center">
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-200 dark:bg-slate-700'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="text-sm font-medium text-slate-500">
                            Step {step} of 3
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Shield className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                    Welcome to MedChain
                                </h1>
                                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                                    The secure, blockchain-powered supply chain solution for the pharmaceutical industry. Let's get you set up.
                                </p>
                                <div className="flex flex-col gap-3 items-center mt-8">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center gap-2"
                                    >
                                        Get Started <ArrowRight size={20} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const defaultProfile = {
                                                name: 'Anonymous User',
                                                email: '',
                                                description: '',
                                                website: '',
                                                profilePicture: null
                                            };
                                            localStorage.setItem(`profile_${address.toLowerCase()}`, JSON.stringify(defaultProfile));
                                            // Dispatch event to update state in App.jsx
                                            window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { address: address.toLowerCase() } }));

                                            // Small delay to allow App.jsx to process the event and update state
                                            // before we navigate to a protected route
                                            setTimeout(() => {
                                                navigate('/app/home');
                                            }, 100);
                                        }}
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Your Profile</h2>
                                    <p className="text-slate-600 dark:text-slate-400">Tell us a bit about yourself</p>
                                </div>

                                <div className="flex justify-center mb-8">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors">
                                            {file ? (
                                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-10 h-10 text-slate-400" />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                                            <User size={12} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email (Optional)</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                                <button
                                    onClick={handleNext}
                                    disabled={uploading}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Saving...' : 'Continue'} <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">You're All Set!</h2>
                                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                                        Choose how you want to use MedChain
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-emerald-500 transition-colors cursor-pointer group">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Consumer</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Verify medicines, track supply chains, and ensure authenticity.
                                        </p>
                                    </div>

                                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-emerald-500 transition-colors cursor-pointer group">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Factory className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Manufacturer</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Register products, manage batches, and build trust.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleComplete}
                                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] shadow-lg"
                                >
                                    Go to Dashboard
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
