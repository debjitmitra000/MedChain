// utils/adminUtils.js
export function getAdminAddresses() {
  const addresses = import.meta.env.VITE_ADMIN_ADDRESSES || '';
  return addresses
    .split(',')
    .map(addr => addr.trim().toLowerCase())
    .filter(addr => addr.length > 0);
}

export function isAdmin(address, contractAdminAddress = null) {
  if (!address) return false;
  
  const normalizedAddress = address.toLowerCase();
  const adminAddresses = getAdminAddresses();
  
  // Check against environment admin list
  const isEnvAdmin = adminAddresses.includes(normalizedAddress);
  
  // Check against contract admin if provided
  const isContractAdmin = contractAdminAddress && 
    contractAdminAddress.toLowerCase() === normalizedAddress;
  
  return isEnvAdmin || isContractAdmin;
}

export function getAdminCount() {
  return getAdminAddresses().length;
}