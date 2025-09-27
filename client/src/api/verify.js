import { get, post } from './client';

export const verifyBatchDeep = (batchId, payload) =>
  post(`/api/verify/${batchId}`, payload);

export const getGlobalStats = () =>
  get('/api/verify/stats/global');

export const getExpiredReports = () =>
  get('/api/verify/reports/expired');
