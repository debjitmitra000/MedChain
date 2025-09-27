import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyBatchDeep } from '../api/verify';

export default function Verify() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [inputBatchId, setInputBatchId] = useState(batchId || '');
  const [location, setLocation] = useState('Loading location...');
  const [scannerAddress, setScannerAddress] = useState('anonymous');
  const [scanMethod, setScanMethod] = useState('manual'); // 'manual', 'camera', 'upload'
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCode = useRef(null);

  const { mutate, data, isPending, error } = useMutation({
    mutationFn: (payload) => verifyBatchDeep(payload.batchId, {
      location: payload.location,
      scannerAddress: payload.scannerAddress
    }),
  });

  // Get user location automatically
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

  const startCameraScanner = async () => {
    try {
      if (html5QrCode.current) {
        html5QrCode.current.stop();
      }

      html5QrCode.current = new Html5Qrcode("qr-reader");
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.current.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          console.log(`QR Code detected: ${decodedText}`);
          setInputBatchId(extractBatchId(decodedText));
          stopScanner();
        },
        (errorMessage) => {
          // Ignore scanning errors - they're too frequent
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error('Camera scanner failed:', error);
      alert('Camera access failed. Please check permissions.');
    }
  };

  const stopScanner = async () => {
    if (html5QrCode.current) {
      try {
        await html5QrCode.current.stop();
        html5QrCode.current = null;
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setIsScanning(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      if (!html5QrCode.current) {
        html5QrCode.current = new Html5Qrcode("qr-reader");
      }

      const result = await html5QrCode.current.scanFile(file, true);
      console.log(`QR Code from image: ${result}`);
      setInputBatchId(extractBatchId(result));
    } catch (error) {
      console.error('Image scan failed:', error);
      alert('No QR code found in the uploaded image or scan failed.');
    }
  };

  const extractBatchId = (qrText) => {
    try {
      // Try to parse as JSON first (our QR format)
      const qrData = JSON.parse(qrText);
      if (qrData.batchId) {
        return qrData.batchId;
      }
    } catch (e) {
      // If not JSON, treat as plain text (might be batch ID directly)
      return qrText.trim();
    }
    return qrText.trim();
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

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCode.current) {
        html5QrCode.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div>
      <h3>Verify Medicine Batch</h3>
      
      {/* Scan Method Selection */}
      <div style={{ marginBottom: 16 }}>
        <h4>Choose Verification Method:</h4>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button 
            onClick={() => setScanMethod('manual')}
            style={{ 
              backgroundColor: scanMethod === 'manual' ? '#0088aa' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📝 Manual Input
          </button>
          <button 
            onClick={() => setScanMethod('camera')}
            style={{ 
              backgroundColor: scanMethod === 'camera' ? '#0088aa' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📷 Camera Scanner
          </button>
          <button 
            onClick={() => setScanMethod('upload')}
            style={{ 
              backgroundColor: scanMethod === 'upload' ? '#0088aa' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📁 Upload Image
          </button>
        </div>
      </div>

      {/* Manual Input */}
      {scanMethod === 'manual' && (
        <div style={{ marginBottom: 16 }}>
          <input 
            placeholder="Enter Batch ID (e.g., BATCH-001_ABC)" 
            value={inputBatchId} 
            onChange={(e) => setInputBatchId(e.target.value)}
            style={{ width: 300, marginRight: 8, padding: '8px' }}
          />
          <button onClick={handleVerify} disabled={isPending}>
            {isPending ? 'Verifying...' : 'Verify Batch'}
          </button>
        </div>
      )}

      {/* Camera Scanner */}
      {scanMethod === 'camera' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            {!isScanning ? (
              <button 
                onClick={startCameraScanner}
                style={{ 
                  backgroundColor: '#00aa00', 
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📷 Start Camera Scanner
              </button>
            ) : (
              <button 
                onClick={stopScanner}
                style={{ 
                  backgroundColor: '#ff4444', 
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ⏹️ Stop Scanner
              </button>
            )}
          </div>
          
          <div 
            id="qr-reader" 
            style={{ 
              width: '100%', 
              maxWidth: '400px',
              border: isScanning ? '2px solid #00aa00' : '2px dashed #ccc',
              borderRadius: '8px',
              minHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f9f9f9'
            }}
          >
            {!isScanning && (
              <p style={{ color: '#666', textAlign: 'center' }}>
                Click "Start Camera Scanner" to begin scanning QR codes
              </p>
            )}
          </div>
          
          {inputBatchId && (
            <div style={{ marginTop: 12 }}>
              <p>Detected Batch ID: <strong>{inputBatchId}</strong></p>
              <button onClick={handleVerify} disabled={isPending}>
                {isPending ? 'Verifying...' : 'Verify This Batch'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image Upload */}
      {scanMethod === 'upload' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              style={{ marginBottom: 12 }}
            />
            <p style={{ fontSize: '14px', color: '#666' }}>
              Upload an image containing a QR code or barcode
            </p>
          </div>
          
          {inputBatchId && (
            <div>
              <p>Detected Batch ID: <strong>{inputBatchId}</strong></p>
              <button onClick={handleVerify} disabled={isPending}>
                {isPending ? 'Verifying...' : 'Verify This Batch'}
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: 16, fontSize: '14px', color: '#666' }}>
        <p><strong>Location:</strong> {location}</p>
        <p><strong>Scanner:</strong> {scannerAddress}</p>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          <h4>Verification Failed</h4>
          <p>{error.message}</p>
        </div>
      )}
      
      {data && (
        <div>
          <h4 style={{ color: getStatusColor(data.verification) }}>
            Verification Result
          </h4>
          
          <div style={{ 
            padding: 16, 
            border: `2px solid ${getStatusColor(data.verification)}`, 
            borderRadius: 8,
            backgroundColor: '#f9f9f9'
          }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: getStatusColor(data.verification) }}>
              {data.verification?.message || 'Unknown status'}
            </p>
            
            {data.verification?.batch && (
              <div style={{ marginTop: 12 }}>
                <p><strong>Medicine:</strong> {data.verification.batch.medicineName}</p>
                <p><strong>Manufacturer:</strong> {data.verification.batch.manufacturerName}</p>
                <p><strong>Manufacturing Date:</strong> {data.verification.batch.manufacturingDateFormatted}</p>
                <p><strong>Expiry Date:</strong> {data.verification.batch.expiryDateFormatted}</p>
                {data.verification.batch.expiredScanCount > 0 && (
                  <p><strong>Times Scanned After Expiry:</strong> {data.verification.batch.expiredScanCount}</p>
                )}
              </div>
            )}
          </div>
          
          <details style={{ marginTop: 16 }}>
            <summary>Full Verification Data</summary>
            <pre>{JSON.stringify(data.verification, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
