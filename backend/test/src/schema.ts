import { Entity, Type } from '@graphprotocol/hypergraph';

export class Manufacturer extends Entity.Class<Manufacturer>('Manufacturer')({
  name: Type.String,
  license: Type.String,
  email: Type.String,
  isVerified: Type.Boolean,
  isActive: Type.Boolean,
  registeredAt: Type.Number
}) {}

export class MedicineBatch extends Entity.Class<MedicineBatch>('MedicineBatch')({
  medicineName: Type.String,
  manufacturer: Type.String,
  manufacturingDate: Type.Number,
  expiryDate: Type.Number,
  isActive: Type.Boolean,
  createdAt: Type.Number
}) {}