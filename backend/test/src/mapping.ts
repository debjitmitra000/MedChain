import type { Mapping } from '@graphprotocol/hypergraph/mapping';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  Manufacturer: {
    typeIds: [Id("8ab7a0ea-a674-4244-83b3-d327da5e0c92")],
    properties: {
      name: Id("e6d72fe5-0d3f-4c7c-acf4-7378ce4a347e"),
      license: Id("377230f3-46bd-4880-a60a-74de9e59539a"),
      email: Id("81a821ba-0474-4209-b193-f8264afaeeca"),
      isVerified: Id("e7bdfb42-4e22-4fe9-aa91-27f96dc2fe5b"),
      isActive: Id("4d597b45-632e-4e16-89d2-29c9e848641b"),
      registeredAt: Id("0c0f5ab0-b6bf-44fc-a6dc-0266dffd6539")
    },
  },
  MedicineBatch: {
    typeIds: [Id("57750420-1d30-4b08-a8b6-a28570e0c309")],
    properties: {
      medicineName: Id("ba3631b3-b5a1-4df7-a386-5f67c2acd9ac"),
      manufacturer: Id("f052718d-abbc-4c07-8246-551b10b9768e"),
      manufacturingDate: Id("c5dc504f-659f-4106-bde6-57f5cda1a8fe"),
      expiryDate: Id("2c84c18e-c50b-4eb6-8241-e8c91e1e7c45"),
      isActive: Id("e97c8c03-101e-45e4-a13a-b082f0dbf24c"),
      createdAt: Id("39d64b21-1495-4d7f-b85e-782081212d56")
    },
  },
}