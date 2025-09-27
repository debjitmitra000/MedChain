// Hypergraph configuration for MedChain contracts
import {
  handleManufacturerRegistered,
  handleManufacturerVerified,
  handleMedicineBatchRegistered,
  handleBatchVerified,
  handleBatchRecalled,
  handleFakeBatchDetected,
  handleExpiredBatchScanned,
  handleKYCDocumentUploaded,
} from './src/eventHandlers';

export default {
  contracts: [
    {
      name: 'MedChain',
      address: '0x8018fBf212d88d0b537e6EeBcc836A29f9f45Eed', // Update with your contract address
      abi: [
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "manufacturer",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "email",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "name": "ManufacturerRegistered",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "manufacturer",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "name": "ManufacturerVerified",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "string",
              "name": "batchId",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "medicineName",
              "type": "string"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "manufacturer",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "expiryDate",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "name": "MedicineBatchRegistered",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "string",
              "name": "batchId",
              "type": "string"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "verifier",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "name": "BatchVerified",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "string",
              "name": "batchId",
              "type": "string"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "manufacturer",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "name": "BatchRecalled",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "string",
              "name": "batchId",
              "type": "string"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "detector",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "name": "FakeBatchDetected",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "string",
              "name": "batchId",
              "type": "string"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "scanner",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "scanCount",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "name": "ExpiredBatchScanned",
          "type": "event"
        }
      ],
      events: {
        ManufacturerRegistered: handleManufacturerRegistered,
        ManufacturerVerified: handleManufacturerVerified,
        MedicineBatchRegistered: handleMedicineBatchRegistered,
        BatchVerified: handleBatchVerified,
        BatchRecalled: handleBatchRecalled,
        FakeBatchDetected: handleFakeBatchDetected,
        ExpiredBatchScanned: handleExpiredBatchScanned,
      },
    },
    {
      name: 'ManufacturerRegistry',
      address: '0xf65ad44B50497A6B888C7F617f4e9Cba102d4A4a', // Update with your registry address
      abi: [
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "manufacturer",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "documentHash",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "documentType",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "name": "KYCDocumentUploaded",
          "type": "event"
        }
      ],
      events: {
        KYCDocumentUploaded: handleKYCDocumentUploaded,
      },
    },
  ],
};