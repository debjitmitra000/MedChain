import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Scanner } from '@yudiel/react-qr-scanner';
import { verifyBatchDeep } from '../api/verify';
import { useTheme } from '../contexts/ThemeContext';
import {
  Search,
  Camera,
  Upload,
  MapPin,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Zap,
  QrCode,
  Play,
  Square,
  Image as ImageIcon,
  FileText,
  ChevronDown,
  Loader2,
  Activity,
  Globe,
  Target,
} from 'lucide-react';

export default function Verify() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [inputBatchId, setInputBatchId] = useState(batchId || '');
  const [location, setLocation] = useState('Loading location...');
  const [scannerAddress, setScannerAddress] = useState('anonymous');
  const [scanMethod, setScanMethod] = useState('manual'); // 'manual', 'camera', 'upload'
  const [showCamera, setShowCamera] = useState(false);

  const { mutate, data, isPending, error } = useMutation({
    mutationFn: (payload) => verifyBatchDeep(payload.batchId, {
      location: payload.location,
      scannerAddress: payload.scannerAddress
    }),
  });

  // Get user location automatically - ORIGINAL LOGIC PRESERVED
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const locationData = await response.json();
            const readable = `${locationData.city || locationData.locality || 'Unknown'}, ${locationData.countryName || 'Unknown'}`;
            setLocation(`${readable} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          } catch (e) {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocation('Location unavailable');
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      setLocation('Geolocation not supported');
    }
  }, []);

  // ORIGINAL QR SCAN LOGIC PRESERVED EXACTLY
  const handleQrScan = (scanResult) => {
    if (scanResult) {
      console.log('QR Code detected:', scanResult);
      
      // Handle different result formats from the scanner
      let qrText = '';
      
      // Check if it's an array first (common with @yudiel/react-qr-scanner)
      if (Array.isArray(scanResult) && scanResult.length > 0) {
        const firstResult = scanResult[0];
        console.log('First result from array:', firstResult);
        
        if (typeof firstResult === 'string') {
          qrText = firstResult;
        } else if (firstResult.rawValue) {
          qrText = firstResult.rawValue;
        } else if (firstResult.text) {
          qrText = firstResult.text;
        } else if (firstResult.data) {
          qrText = firstResult.data;
        } else {
          console.warn('Unable to extract text from array result:', firstResult);
          return;
        }
      } else if (typeof scanResult === 'string') {
        qrText = scanResult;
      } else if (scanResult.rawValue) {
        qrText = scanResult.rawValue;
      } else if (scanResult.text) {
        qrText = scanResult.text;
      } else if (scanResult.data) {
        qrText = scanResult.data;
      } else {
        console.warn('Unable to extract text from QR result:', scanResult);
        return;
      }
      
      console.log('Extracted QR text:', qrText);
      
      if (!qrText) {
        console.warn('No QR text extracted');
        return;
      }
      
      try {
        // Parse the MedChain QR format
        const qrData = JSON.parse(qrText);
        
        // Validate it's a MedChain QR code
        if (qrData.type === 'medchain_batch' && qrData.batchId && qrData.verifyUrl) {
          console.log('Valid MedChain QR detected, navigating to:', qrData.verifyUrl);
          console.log('Batch ID:', qrData.batchId);
          
          // Stop camera before navigation
          setShowCamera(false);
          setScanMethod('manual'); // Switch to manual mode
          
          // Extract batch ID and navigate
          const batchId = qrData.batchId;
          console.log('Navigating to batch:', batchId);
          
          // Use navigate with the batch ID directly
          navigate(`/verify/${batchId}`, { replace: true });
          
          // Also set the input field
          setInputBatchId(batchId);
          
        } else {
          console.warn('Invalid MedChain QR format:', qrData);
          alert('Invalid QR code format. Please scan a valid MedChain batch QR code.');
        }
      } catch (error) {
        console.warn('Failed to parse QR code JSON:', error);
        alert('Invalid QR code. Please scan a valid MedChain batch QR code.');
      }
    }
  };

  const handleScanError = (error) => {
    // Only log errors, don't show them to user as they're frequent during scanning
    console.info('QR Scan error:', error);
  };

  // ORIGINAL IMAGE UPLOAD LOGIC PRESERVED EXACTLY
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    try {
      console.log('Processing uploaded image:', file.name);
      
      // Create a file reader to read the image
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Create an image element
          const img = new Image();
          
          img.onload = async () => {
            // Create canvas to process the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw image on canvas
            ctx.drawImage(img, 0, 0);
            
            // Try to use jsQR if available, otherwise fallback to manual entry
            try {
              // Get image data for QR detection
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              
              // Try to dynamically load jsQR if not available
              let jsQRFunction = null;
              
              if (typeof jsQR !== 'undefined') {
                jsQRFunction = jsQR;
              } else if (typeof window !== 'undefined' && window.jsQR) {
                jsQRFunction = window.jsQR;
              } else {
                // Try to load jsQR dynamically
                try {
                  const script = document.createElement('script');
                  script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
                  document.head.appendChild(script);
                  
                  await new Promise((resolve, reject) => {
                    script.onload = () => {
                      if (window.jsQR) {
                        jsQRFunction = window.jsQR;
                        resolve();
                      } else {
                        reject(new Error('jsQR failed to load'));
                      }
                    };
                    script.onerror = () => reject(new Error('Failed to load jsQR'));
                    
                    // Timeout after 5 seconds
                    setTimeout(() => reject(new Error('jsQR load timeout')), 5000);
                  });
                } catch (loadError) {
                  console.log('Failed to dynamically load jsQR:', loadError);
                  throw new Error('jsQR not available');
                }
              }
              
              if (jsQRFunction) {
                const code = jsQRFunction(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                  console.log('QR code found in image:', code.data);
                  
                  try {
                    // Parse the MedChain QR format
                    const qrData = JSON.parse(code.data);
                    
                    // Validate it's a MedChain QR code
                    if (qrData.type === 'medchain_batch' && qrData.batchId) {
                      console.log('Valid MedChain QR detected from image, batch:', qrData.batchId);
                      
                      // Set the batch ID and switch to manual mode
                      setInputBatchId(qrData.batchId);
                      setScanMethod('manual');
                      
                      alert(`✅ QR code successfully scanned from image!\nBatch ID: ${qrData.batchId}\n\nClick "Verify Batch" to continue.`);
                      
                    } else {
                      alert('❌ Invalid MedChain QR code format in image.');
                    }
                  } catch (error) {
                    console.warn('Failed to parse QR code JSON from image:', error);
                    alert('❌ Invalid QR code format in image.');
                  }
                } else {
                  // No QR code found, try inverted image
                  const invertedData = new Uint8ClampedArray(imageData.data);
                  for (let i = 0; i < invertedData.length; i += 4) {
                    invertedData[i] = 255 - invertedData[i];         // Red
                    invertedData[i + 1] = 255 - invertedData[i + 1]; // Green  
                    invertedData[i + 2] = 255 - invertedData[i + 2]; // Blue
                  }
                  
                  const invertedCode = jsQRFunction(invertedData, canvas.width, canvas.height);
                  if (invertedCode) {
                    console.log('QR code found in inverted image:', invertedCode.data);
                    
                    try {
                      // Parse the MedChain QR format
                      const qrData = JSON.parse(invertedCode.data);
                      
                      // Validate it's a MedChain QR code
                      if (qrData.type === 'medchain_batch' && qrData.batchId) {
                        console.log('Valid MedChain QR detected from inverted image, batch:', qrData.batchId);
                        
                        // Set the batch ID and switch to manual mode
                        setInputBatchId(qrData.batchId);
                        setScanMethod('manual');
                        
                        alert(`✅ QR code successfully scanned from inverted image!\nBatch ID: ${qrData.batchId}\n\nClick "Verify Batch" to continue.`);
                        
                      } else {
                        alert('❌ Invalid MedChain QR code format in inverted image.');
                      }
                    } catch (error) {
                      console.warn('Failed to parse QR code JSON from inverted image:', error);
                      alert('❌ Invalid QR code format in inverted image.');
                    }
                  } else {
                    alert('❌ No QR code found in the uploaded image.\n\nPlease ensure:\n• Image is clear and well-lit\n• QR code is fully visible\n• Try using camera scanning instead');
                  }
                }
              } else {
                // jsQR not available, use manual fallback
                throw new Error('jsQR library not available - using manual input');
              }
              
            } catch (error) {
              console.log('QR detection failed, using enhanced manual fallback:', error.message);
              
              // Enhanced fallback: Show image preview and better guidance
              const imagePreview = document.createElement('div');
              imagePreview.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 90vw;
                max-height: 90vh;
                overflow: auto;
              `;
              
              imagePreview.innerHTML = `
                <h3>🔍 QR Code Image Analysis</h3>
                <p><strong>Image uploaded successfully!</strong> Please help us extract the Batch ID:</p>
                <div style="margin: 15px 0;">
                  <img src="${img.src}" style="max-width: 300px; max-height: 300px; border: 1px solid #ccc; border-radius: 4px;" />
                </div>
                <p><strong>Instructions:</strong></p>
                <ol>
                  <li>Look at the QR code in the image above</li>
                  <li>If you can see the QR code clearly, try scanning it with your phone's camera</li>
                  <li>Look for text like: <code>{"type":"medchain_batch","batchId":"YOUR_BATCH_ID"}</code></li>
                  <li>Enter just the Batch ID part in the field below:</li>
                </ol>
                <input type="text" id="manualBatchId" placeholder="Enter Batch ID (e.g., CIP-PAR500-240901-001)" 
                  style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px;" />
                <div style="margin-top: 15px; text-align: right;">
                  <button id="cancelBtn" style="margin-right: 10px; padding: 8px 16px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                  <button id="submitBtn" style="padding: 8px 16px; background: #00aa00; color: white; border: none; border-radius: 4px; cursor: pointer;">Use This Batch ID</button>
                </div>
                <p style="font-size: 12px; color: #666; margin-top: 15px;">
                  💡 <strong>Tip:</strong> For automatic scanning, add jsQR to your project:<br/>
                  • NPM: <code>npm install jsqr</code><br/>
                  • CDN: Add <code>&lt;script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"&gt;&lt;/script&gt;</code> to your HTML
                </p>
              `;
              
              document.body.appendChild(imagePreview);
              
              // Handle buttons
              const cancelBtn = imagePreview.querySelector('#cancelBtn');
              const submitBtn = imagePreview.querySelector('#submitBtn');
              const input = imagePreview.querySelector('#manualBatchId');
              
              cancelBtn.onclick = () => {
                document.body.removeChild(imagePreview);
              };
              
              submitBtn.onclick = () => {
                const userInput = input.value.trim();
                if (userInput) {
                  console.log('User entered batch ID from image:', userInput);
                  
                  // Set the batch ID and switch to manual mode
                  setInputBatchId(userInput);
                  setScanMethod('manual');
                  
                  document.body.removeChild(imagePreview);
                  alert(`✅ Batch ID "${userInput}" extracted from image.\n\nClick "Verify Batch" to continue.`);
                } else {
                  alert('❌ Please enter a valid Batch ID.');
                  input.focus();
                }
              };
              
              // Focus the input
              input.focus();
            }
          };
          
          img.onerror = () => {
            alert('❌ Failed to load the uploaded image.');
          };
          
          // Set image source to the uploaded file
          img.src = e.target.result;
          
        } catch (error) {
          console.error('Error processing image:', error);
          alert('❌ Failed to process the uploaded image.');
        }
      };
      
      reader.onerror = () => {
        alert('❌ Failed to read the uploaded file.');
      };
      
      // Read the file as data URL
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Image upload error:', error);
      alert(`❌ Failed to upload image: ${error.message}`);
    }
    
    // Clear the file input
    event.target.value = '';
  };

  // ORIGINAL HELPER FUNCTIONS PRESERVED
  const extractBatchId = (qrText) => {
    if (!qrText || typeof qrText !== 'string') {
      console.warn('Invalid QR text:', qrText);
      return null;
    }

    try {
      // Parse the MedChain QR format
      const qrData = JSON.parse(qrText);
      
      // Validate it's a MedChain QR code
      if (qrData.type === 'medchain_batch' && qrData.batchId) {
        return {
          batchId: qrData.batchId,
          verifyUrl: qrData.verifyUrl || null,
          qrData: qrData // Return full QR data for additional info if needed
        };
      }
      
      return null;
    } catch (e) {
      console.warn('Failed to parse QR as MedChain format:', e);
      return null;
    }
  };

  const handleVerify = () => {
    if (!inputBatchId.trim()) {
      alert('Please enter a batch ID or scan QR code');
      return;
    }
    
    mutate({ 
      batchId: inputBatchId.trim(),
      location, 
      scannerAddress 
    });
    
    // Update URL if different
    if (inputBatchId !== batchId) {
      navigate(`/verify/${inputBatchId}`, { replace: true });
    }
  };

  const getStatusColor = (verification) => {
    if (!verification) return '#666';
    if (verification.isFake) return '#ff4444';
    if (verification.isExpired) return '#ff8800';
    if (verification.isRecalled) return '#ff4444';
    if (verification.isValid) return '#00aa00';
    return '#666';
  };

  const startCameraScanner = () => {
    setShowCamera(true);
  };

  const stopCameraScanner = () => {
    setShowCamera(false);
  };

  // Helper function for status display
  const getStatusInfo = (verification) => {
    if (!verification) {
      return {
        icon: Clock,
        text: 'Unknown',
        color: 'slate',
        bgColor: darkMode ? 'bg-slate-500/20 border-slate-500/30' : 'bg-slate-50 border-slate-200'
      };
    }
    if (verification.isFake) {
      return {
        icon: XCircle,
        text: 'FAKE DETECTED',
        color: 'red',
        bgColor: darkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200'
      };
    }
    if (verification.isRecalled) {
      return {
        icon: XCircle,
        text: 'RECALLED',
        color: 'red',
        bgColor: darkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200'
      };
    }
    if (verification.isExpired) {
      return {
        icon: AlertTriangle,
        text: 'EXPIRED',
        color: 'amber',
        bgColor: darkMode ? 'bg-amber-500/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'
      };
    }
    if (verification.isValid) {
      return {
        icon: CheckCircle2,
        text: 'VALID',
        color: 'emerald',
        bgColor: darkMode ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
      };
    }
    return {
      icon: Clock,
      text: 'UNKNOWN',
      color: 'slate',
      bgColor: darkMode ? 'bg-slate-500/20 border-slate-500/30' : 'bg-slate-50 border-slate-200'
    };
  };

  const scanMethodOptions = [
    { value: 'manual', icon: Search, label: 'Manual Input', desc: 'Type batch ID manually' },
    { value: 'camera', icon: Camera, label: 'Camera Scanner', desc: 'Scan QR code with camera' },
    { value: 'upload', icon: Upload, label: 'Upload Image', desc: 'Upload QR code image' },
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
    }`}>
      {/* Floating Geometric Shapes Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-emerald-500/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-8 h-8 bg-blue-500/10 rotate-45 animate-spin" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-purple-500/5 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-10 w-6 h-6 bg-amber-500/10 rotate-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-8">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 border ${
            darkMode 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}>
            <Shield className="w-5 h-5" />
            <span className="font-medium">Medicine Verification</span>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent`}>
            Verify Medicine Batch
          </h1>
          
          <p className={`text-xl max-w-2xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Ensure medicine authenticity with our advanced blockchain verification system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Verification Panel */}
          <div className="lg:col-span-2 space-y-8">
            {/* Method Selection */}
            <div className={`p-8 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3 mb-8">
                <Target className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Choose Verification Method
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scanMethodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setScanMethod(option.value);
                      setShowCamera(false);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      scanMethod === option.value
                        ? (darkMode 
                            ? 'bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/25' 
                            : 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/25')
                        : (darkMode
                            ? 'bg-slate-700/60 border-slate-600 hover:border-slate-500'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl')
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <option.icon className={`w-8 h-8 ${
                        scanMethod === option.value
                          ? 'text-emerald-500'
                          : (darkMode ? 'text-slate-400' : 'text-slate-500')
                      }`} />
                      <div className="text-center">
                        <h3 className={`font-bold mb-1 ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {option.label}
                        </h3>
                        <p className={`text-sm ${
                          darkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {option.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Methods */}
            <div className={`p-8 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              {/* Manual Input */}
              {scanMethod === 'manual' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Search className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h3 className={`text-xl font-bold ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      Manual Input
                    </h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      placeholder="Enter Batch ID (e.g., CIP-PAR500-240901-001)" 
                      value={inputBatchId} 
                      onChange={(e) => setInputBatchId(e.target.value)}
                      className={`flex-1 px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500'
                      } border focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                    />
                    <button 
                      onClick={handleVerify} 
                      disabled={isPending}
                      className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                        isPending
                          ? (darkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-300 text-slate-500 cursor-not-allowed')
                          : (darkMode
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25')
                      }`}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          Verify Batch
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Camera Scanner */}
              {scanMethod === 'camera' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Camera className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h3 className={`text-xl font-bold ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      Camera Scanner
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      {!showCamera ? (
                        <button 
                          onClick={startCameraScanner}
                          className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                            darkMode
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                          }`}
                        >
                          <Play className="w-5 h-5" />
                          Start Camera Scanner
                        </button>
                      ) : (
                        <button 
                          onClick={stopCameraScanner}
                          className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                            darkMode
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25'
                              : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25'
                          }`}
                        >
                          <Square className="w-5 h-5" />
                          Stop Scanner
                        </button>
                      )}
                    </div>
                    
                    <div className={`rounded-2xl overflow-hidden ${
                      showCamera ? 'border-2 border-emerald-500' : 'border-2 border-dashed border-slate-300'
                    } ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      {showCamera ? (
                        <Scanner
                          onScan={handleQrScan}
                          onError={handleScanError}
                          constraints={{
                            facingMode: 'environment' // Use back camera
                          }}
                          styles={{
                            container: {
                              width: '100%',
                              maxWidth: '500px',
                              margin: '0 auto'
                            },
                            video: {
                              width: '100%',
                              height: 'auto'
                            }
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center py-20">
                          <div className="text-center">
                            <QrCode className={`w-16 h-16 mx-auto mb-4 ${
                              darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`} />
                            <p className={`text-lg ${
                              darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              Click "Start Camera Scanner" to begin
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {inputBatchId && (
                      <div className={`p-6 rounded-2xl border-2 ${
                        darkMode
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-emerald-50 border-emerald-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-bold mb-2 ${
                              darkMode ? 'text-emerald-400' : 'text-emerald-600'
                            }`}>
                              Detected Batch ID
                            </p>
                            <p className={`font-mono ${
                              darkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                              {inputBatchId}
                            </p>
                          </div>
                          <button 
                            onClick={handleVerify} 
                            disabled={isPending}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                              isPending
                                ? (darkMode ? 'bg-slate-600 text-slate-400' : 'bg-slate-300 text-slate-500')
                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                            }`}
                          >
                            {isPending ? 'Verifying...' : 'Verify This Batch'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Image Upload */}
              {scanMethod === 'upload' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <ImageIcon className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h3 className={`text-xl font-bold ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      Upload QR Code Image
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                      darkMode
                        ? 'border-slate-600 hover:border-slate-500'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}>
                      <ImageIcon className={`w-16 h-16 mx-auto mb-4 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`} />
                      <p className={`text-lg font-semibold mb-2 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        Upload QR Code Image
                      </p>
                      <p className={`mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Select an image containing a MedChain QR code
                      </p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label 
                        htmlFor="image-upload"
                        className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold cursor-pointer transition-all duration-300 hover:scale-105 ${
                          darkMode
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                        }`}
                      >
                        <Upload className="w-5 h-5" />
                        Choose Image
                      </label>
                    </div>
                    
                    
                    
                    {inputBatchId && (
                      <div className={`p-6 rounded-2xl border-2 ${
                        darkMode
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-emerald-50 border-emerald-200'
                      }`}>
                        <p className={`font-bold mb-2 ${
                          darkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`}>
                          ✅ Detected Batch ID: {inputBatchId}
                        </p>
                        <button 
                          onClick={handleVerify} 
                          disabled={isPending}
                          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                            isPending
                              ? (darkMode ? 'bg-slate-600 text-slate-400' : 'bg-slate-300 text-slate-500')
                              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                          }`}
                        >
                          {isPending ? 'Verifying...' : 'Verify This Batch'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className={`p-8 rounded-3xl border-2 ${
                darkMode 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-4">
                  <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                  <div>
                    <h4 className={`text-xl font-bold mb-3 ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      ❌ Verification Failed
                    </h4>
                    <p className={`text-lg ${
                      darkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {error.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {data && (
              <div className="space-y-6">
                {(() => {
                  const statusInfo = getStatusInfo(data.verification);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div className={`p-8 rounded-3xl border-2 ${statusInfo.bgColor}`}>
                      <div className="flex items-start gap-6 mb-6">
                        <StatusIcon className={`w-12 h-12 text-${statusInfo.color}-500`} />
                        <div>
                          <h3 className={`text-2xl font-bold mb-2 text-${statusInfo.color}-500`}>
                            {statusInfo.text}
                          </h3>
                          <p className={`text-xl ${
                            darkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {data.verification?.message || 'Verification complete'}
                          </p>
                        </div>
                      </div>
                      
                      {data.verification?.batch && (
                        <div className={`p-6 rounded-2xl ${
                          darkMode ? 'bg-slate-700/60' : 'bg-white'
                        }`}>
                          <h4 className={`text-lg font-bold mb-4 ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            Batch Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className={`text-sm font-semibold mb-1 ${
                                darkMode ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                Medicine
                              </p>
                              <p className={`font-semibold ${
                                darkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {data.verification.batch.medicineName}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm font-semibold mb-1 ${
                                darkMode ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                Manufacturer
                              </p>
                              <p className={`font-semibold ${
                                darkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {data.verification.batch.manufacturerName}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm font-semibold mb-1 ${
                                darkMode ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                Manufacturing Date
                              </p>
                              <p className={`font-semibold ${
                                darkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {data.verification.batch.manufacturingDateFormatted}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm font-semibold mb-1 ${
                                darkMode ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                Expiry Date
                              </p>
                              <p className={`font-semibold ${
                                darkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {data.verification.batch.expiryDateFormatted}
                              </p>
                            </div>
                            {data.verification.batch.expiredScanCount > 0 && (
                              <div className="md:col-span-2">
                                <p className={`text-sm font-semibold mb-1 ${
                                  darkMode ? 'text-amber-400' : 'text-amber-600'
                                }`}>
                                  Times Scanned After Expiry
                                </p>
                                <p className="text-2xl font-bold text-amber-500">
                                  {data.verification.batch.expiredScanCount}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Sidebar - System Info */}
          <div className="space-y-8">
            <div className={`p-8 rounded-3xl border ${
              darkMode
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <Activity className={`w-8 h-8 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <h3 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Session Info
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl ${
                  darkMode ? 'bg-slate-700/60' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={`text-sm font-semibold ${
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Location
                    </span>
                  </div>
                  <p className={`text-sm font-mono ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {location}
                  </p>
                </div>
                
                <div className={`p-4 rounded-2xl ${
                  darkMode ? 'bg-slate-700/60' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <User className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={`text-sm font-semibold ${
                      darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Scanner
                    </span>
                  </div>
                  <p className={`text-sm font-mono ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {scannerAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className={`p-8 rounded-3xl border ${
              darkMode
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-blue-500" />
                <h3 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  How It Works
                </h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { step: '1', text: 'Choose your preferred verification method' },
                  { step: '2', text: 'Enter batch ID or scan QR code' },
                  { step: '3', text: 'Get instant verification results' },
                  { step: '4', text: 'View detailed batch information' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      darkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {item.step}
                    </div>
                    <p className={`text-sm ${
                      darkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
