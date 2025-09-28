import { Entity, Type } from '@graphprotocol/hypergraph';

// MedChain Entities
export class Manufacturer extends Entity.Class<Manufacturer>('Manufacturer')({
  address: Type.String,
  name: Type.String,
  license: Type.String,
  email: Type.String,
  isVerified: Type.Boolean,
  isActive: Type.Boolean,
  registeredAt: Type.Number,
}) {}

export class MedicineBatch extends Entity.Class<MedicineBatch>('MedicineBatch')({
  batchId: Type.String,
  medicineName: Type.String,
  manufacturer: Type.Relation(Manufacturer),
  manufacturingDate: Type.Number,
  expiryDate: Type.Number,
  isActive: Type.Boolean,
  isRecalled: Type.Boolean,
  createdAt: Type.Number,
  expiredScanCount: Type.Number,
}) {}

export class KYCDocument extends Entity.Class<KYCDocument>('KYCDocument')({
  documentHash: Type.String,
  documentType: Type.String,
  uploadedAt: Type.Number,
  isVerified: Type.Boolean,
  manufacturer: Type.Relation(Manufacturer),
}) {}

// Event Entities
export class ManufacturerRegisteredEvent extends Entity.Class<ManufacturerRegisteredEvent>('ManufacturerRegisteredEvent')({
  manufacturer: Type.Relation(Manufacturer),
  name: Type.String,
  email: Type.String,
  timestamp: Type.Number,
  blockNumber: Type.Number,
  transactionHash: Type.String,
}) {}

export class ManufacturerVerifiedEvent extends Entity.Class<ManufacturerVerifiedEvent>('ManufacturerVerifiedEvent')({
  manufacturer: Type.Relation(Manufacturer),
  timestamp: Type.Number,
  blockNumber: Type.Number,
  transactionHash: Type.String,
}) {}

export class MedicineBatchRegisteredEvent extends Entity.Class<MedicineBatchRegisteredEvent>('MedicineBatchRegisteredEvent')({
  batchId: Type.String,
  medicineName: Type.String,
  manufacturer: Type.Relation(Manufacturer),
  expiryDate: Type.Number,
  timestamp: Type.Number,
  blockNumber: Type.Number,
  transactionHash: Type.String,
}) {}

export class BatchVerifiedEvent extends Entity.Class<BatchVerifiedEvent>('BatchVerifiedEvent')({
  batchId: Type.String,
  verifier: Type.String,
  timestamp: Type.Number,
  blockNumber: Type.Number,
  transactionHash: Type.String,
}) {}

export class BatchRecalledEvent extends Entity.Class<BatchRecalledEvent>('BatchRecalledEvent')({
  batchId: Type.String,
  manufacturer: Type.Relation(Manufacturer),
  timestamp: Type.Number,
  blockNumber: Type.Number,
  transactionHash: Type.String,
}) {}

export class FakeBatchDetectedEvent extends Entity.Class<FakeBatchDetectedEvent>('FakeBatchDetectedEvent')({
  batchId: Type.String,
  detector: Type.String,
  timestamp: Type.Number,
  blockNumber: Type.Number,
  transactionHash: Type.String,
}) {}

export class ExpiredBatchScannedEvent extends Entity.Class<ExpiredBatchScannedEvent>('ExpiredBatchScannedEvent')({
  batchId: Type.String,
  scanner: Type.String,
  scanCount: Type.Number,
  timestamp: Type.Number,
  blockNumber: Type.Number,
  transactionHash: Type.String,
}) {}

export class KYCDocumentUploadedEvent extends Entity.Class<KYCDocumentUploadedEvent>('KYCDocumentUploadedEvent')({
  manufacturer: Type.Relation(Manufacturer),
  documentHash: Type.String,
  documentType: Type.String,
  timestamp: Type.Number,
  blockNumber: Type.Number,
  transactionHash: Type.String,
}) {}