const QRCode = require('qrcode');
const moment = require('moment');

class QRService {
  constructor() {
    console.log('🏷️ QR Service initialized');
  }

  async generateBatchQR(batchId, additionalData = {}) {
    try {
      // Fix: Added missing quotes around the URL template literals
      const backendBase = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';

      const qrData = {
        type: 'medchain_batch',
        version: '1.0',
        batchId: batchId,
        verifyUrl: `${frontendBase}/verify/${batchId}`,
        apiUrl: `${backendBase}/api/verify/${batchId}`,
        timestamp: Date.now(),
        generated: moment().format('DD/MM/YYYY HH:mm:ss'),
        network: process.env.NETWORK,
        chainId: process.env.CHAIN_ID,
        ...additionalData
      };

      const qrString = JSON.stringify(qrData);

      console.log(`🏷️ Generating QR for batch: ${batchId}`);

      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 2,
        color: {
          dark: '#1a202c',
          light: '#ffffff'
        },
        width: 512
      });

      console.log(`✅ QR code generated for batch: ${batchId}`);

      return {
        success: true,
        qrCode: qrCodeDataURL,
        qrData: qrString,
        batchId: batchId,
        size: qrString.length,
        format: 'data:image/png;base64'
      };
    } catch (error) {
      console.error('❌ QR generation failed:', error.message);
      throw new Error(`QR generation failed: ${error.message}`);
    }
  }

  decodeQRData(qrString) {
    try {
      const data = JSON.parse(qrString);

      if (!data.type || data.type !== 'medchain_batch') {
        throw new Error('Invalid QR type');
      }
      if (!data.batchId) {
        throw new Error('Missing batch ID in QR data');
      }

      console.log(`🔍 QR data decoded for batch: ${data.batchId}`);

      return {
        isValid: true,
        data: data,
        batchId: data.batchId,
        timestamp: data.timestamp,
        network: data.network || 'unknown'
      };
    } catch (error) {
      console.error('❌ QR decode failed:', error.message);
      throw new Error(`Invalid QR data format: ${error.message}`);
    }
  }
}

module.exports = new QRService();