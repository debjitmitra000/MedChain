import { get, post } from './client';

export const prepareRegisterManufacturer = (payload) =>
  post('/api/manufacturer/prepare-register', payload);

export const getManufacturer = (address) =>
  get(`/api/manufacturer/${address}`);

export const getManufacturerBatches = (address) =>
  get(`/api/manufacturer/${address}/batches`);

export const getManufacturerList = (params) => {
  const queryParams = new URLSearchParams();
  if (params.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  
  const queryString = queryParams.toString();
  return get(`/api/manufacturer${queryString ? `?${queryString}` : ''}`);
};

export const getUnverifiedManufacturers = () =>
  get('/api/manufacturer?status=unverified');

export const prepareVerifyManufacturer = (payload) =>
  post('/api/manufacturer/prepare-verify', payload);

export const prepareDeactivateManufacturer = (payload) =>
  post('/api/manufacturer/prepare-deactivate', payload);
