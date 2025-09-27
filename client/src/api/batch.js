import { get, post } from './client';

export const prepareRegisterBatch = (payload) =>
  post('/api/batch/prepare-registration', payload);

export const getBatch = (batchId) =>
  get(`/api/batch/${batchId}`);

export const getBatchQR = (batchId) =>
  get(`/api/batch/${batchId}/qr`);

export const prepareRecall = (batchId, payload) =>
  post(`/api/batch/${batchId}/prepare-recall`, payload);