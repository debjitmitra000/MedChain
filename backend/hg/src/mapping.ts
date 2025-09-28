import type { Mapping } from '@graphprotocol/hypergraph';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping.Mapping = {
  Manufacturer: {
    typeIds: [Id('manufacturer-001')],
    properties: {
      address: Id('manufacturer-address'),
      name: Id('manufacturer-name'),
      license: Id('manufacturer-license'),
      email: Id('manufacturer-email'),
      isVerified: Id('manufacturer-verified'),
      isActive: Id('manufacturer-active'),
      registeredAt: Id('manufacturer-registered'),
    },
  },
  MedicineBatch: {
    typeIds: [Id('batch-001')],
    properties: {
      batchId: Id('batch-id'),
      medicineName: Id('batch-medicine-name'),
      manufacturingDate: Id('batch-manufacturing-date'),
      expiryDate: Id('batch-expiry-date'),
      isActive: Id('batch-active'),
      isRecalled: Id('batch-recalled'),
      createdAt: Id('batch-created'),
      expiredScanCount: Id('batch-expired-scans'),
    },
    relations: {
      manufacturer: Id('batch-manufacturer-relation'),
    },
  },
  KYCDocument: {
    typeIds: [Id('kyc-doc-001')],
    properties: {
      documentHash: Id('kyc-doc-hash'),
      documentType: Id('kyc-doc-type'),
      uploadedAt: Id('kyc-doc-uploaded'),
      isVerified: Id('kyc-doc-verified'),
    },
    relations: {
      manufacturer: Id('kyc-doc-manufacturer-relation'),
    },
  },
  ManufacturerRegisteredEvent: {
    typeIds: [Id('event-manufacturer-registered')],
    properties: {
      name: Id('event-manufacturer-name'),
      email: Id('event-manufacturer-email'),
      timestamp: Id('event-timestamp'),
      blockNumber: Id('event-block-number'),
      transactionHash: Id('event-tx-hash'),
    },
    relations: {
      manufacturer: Id('event-manufacturer-relation'),
    },
  },
  ManufacturerVerifiedEvent: {
    typeIds: [Id('event-manufacturer-verified')],
    properties: {
      timestamp: Id('event-timestamp'),
      blockNumber: Id('event-block-number'),
      transactionHash: Id('event-tx-hash'),
    },
    relations: {
      manufacturer: Id('event-manufacturer-relation'),
    },
  },
  MedicineBatchRegisteredEvent: {
    typeIds: [Id('event-batch-registered')],
    properties: {
      batchId: Id('event-batch-id'),
      medicineName: Id('event-batch-medicine-name'),
      expiryDate: Id('event-batch-expiry-date'),
      timestamp: Id('event-timestamp'),
      blockNumber: Id('event-block-number'),
      transactionHash: Id('event-tx-hash'),
    },
    relations: {
      manufacturer: Id('event-manufacturer-relation'),
    },
  },
  BatchVerifiedEvent: {
    typeIds: [Id('event-batch-verified')],
    properties: {
      batchId: Id('event-batch-id'),
      verifier: Id('event-verifier'),
      timestamp: Id('event-timestamp'),
      blockNumber: Id('event-block-number'),
      transactionHash: Id('event-tx-hash'),
    },
  },
  BatchRecalledEvent: {
    typeIds: [Id('event-batch-recalled')],
    properties: {
      batchId: Id('event-batch-id'),
      timestamp: Id('event-timestamp'),
      blockNumber: Id('event-block-number'),
      transactionHash: Id('event-tx-hash'),
    },
    relations: {
      manufacturer: Id('event-manufacturer-relation'),
    },
  },
  FakeBatchDetectedEvent: {
    typeIds: [Id('event-fake-batch-detected')],
    properties: {
      batchId: Id('event-batch-id'),
      detector: Id('event-detector'),
      timestamp: Id('event-timestamp'),
      blockNumber: Id('event-block-number'),
      transactionHash: Id('event-tx-hash'),
    },
  },
  ExpiredBatchScannedEvent: {
    typeIds: [Id('event-expired-batch-scanned')],
    properties: {
      batchId: Id('event-batch-id'),
      scanner: Id('event-scanner'),
      scanCount: Id('event-scan-count'),
      timestamp: Id('event-timestamp'),
      blockNumber: Id('event-block-number'),
      transactionHash: Id('event-tx-hash'),
    },
  },
  KYCDocumentUploadedEvent: {
    typeIds: [Id('event-kyc-doc-uploaded')],
    properties: {
      documentHash: Id('event-kyc-doc-hash'),
      documentType: Id('event-kyc-doc-type'),
      timestamp: Id('event-timestamp'),
      blockNumber: Id('event-block-number'),
      transactionHash: Id('event-tx-hash'),
    },
    relations: {
      manufacturer: Id('event-manufacturer-relation'),
    },
  },
};