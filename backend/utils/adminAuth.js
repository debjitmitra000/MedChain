// utils/adminAuth.js
const crypto = require('crypto');

class AdminAuth {
  constructor() {
    this.adminAddresses = this.parseAdminAddresses();
    this.adminEmails = this.parseAdminEmails();
  }

  // Parse admin addresses from environment variable
  parseAdminAddresses() {
    const addresses = process.env.ADMIN_ADDRESSES || '';
    return addresses
      .split(',')
      .map(addr => addr.trim().toLowerCase())
      .filter(addr => addr.length > 0);
  }

  // Parse admin emails from environment variable
  parseAdminEmails() {
    const emails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
    return emails
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);
  }

  // Check if an address is an admin
  isAdmin(address) {
    if (!address) return false;
    
    const normalizedAddress = address.toLowerCase();
    
    // Check against environment admin list
    const isEnvAdmin = this.adminAddresses.includes(normalizedAddress);
    
    // Log for debugging
    if (isEnvAdmin) {
      console.log(`✅ Admin verification successful for address: ${address}`);
    } else {
      console.log(`❌ Admin verification failed for address: ${address}`);
      console.log(`📝 Configured admins: ${this.adminAddresses.join(', ')}`);
    }
    
    return isEnvAdmin;
  }

  // Check if an address is an admin (async for future blockchain integration)
  async isAdminAsync(address, contractAdminAddress = null) {
    // Check environment admin list first
    if (this.isAdmin(address)) {
      return true;
    }

    // If contract admin address is provided, check against it too
    if (contractAdminAddress && address && contractAdminAddress.toLowerCase() === address.toLowerCase()) {
      console.log(`✅ Contract admin verification successful for address: ${address}`);
      return true;
    }

    return false;
  }

  // Get all admin addresses
  getAdminAddresses() {
    return [...this.adminAddresses];
  }

  // Get all admin emails
  getAdminEmails() {
    return [...this.adminEmails];
  }

  // Get primary admin email (first in the list)
  getPrimaryAdminEmail() {
    return this.adminEmails[0] || process.env.ADMIN_EMAIL || 'admin@medchain.com';
  }

  // Add a new admin address (runtime addition, not persisted)
  addAdmin(address, email = null) {
    const normalizedAddress = address.toLowerCase();
    if (!this.adminAddresses.includes(normalizedAddress)) {
      this.adminAddresses.push(normalizedAddress);
      console.log(`➕ Added admin address: ${address}`);
    }

    if (email && !this.adminEmails.includes(email.toLowerCase())) {
      this.adminEmails.push(email.toLowerCase());
      console.log(`➕ Added admin email: ${email}`);
    }

    return true;
  }

  // Remove an admin address (runtime removal, not persisted)
  removeAdmin(address) {
    const normalizedAddress = address.toLowerCase();
    const index = this.adminAddresses.indexOf(normalizedAddress);
    if (index > -1) {
      this.adminAddresses.splice(index, 1);
      console.log(`➖ Removed admin address: ${address}`);
      return true;
    }
    return false;
  }

  // Express middleware for admin authentication
  requireAdmin() {
    return async (req, res, next) => {
      try {
        const adminAddress = req.body.adminAddress || req.headers['x-admin-address'];
        
        if (!adminAddress) {
          return res.status(401).json({
            success: false,
            error: 'Admin address required',
            code: 'MISSING_ADMIN_ADDRESS'
          });
        }

        // Check if the provided address is an admin
        const isValidAdmin = await this.isAdminAsync(adminAddress, req.contractAdminAddress);
        
        if (!isValidAdmin) {
          return res.status(403).json({
            success: false,
            error: 'Unauthorized. Admin access required.',
            code: 'UNAUTHORIZED_ADMIN',
            providedAddress: adminAddress,
            configuredAdmins: this.adminAddresses.length
          });
        }

        // Add admin info to request object
        req.adminAddress = adminAddress;
        req.isAdmin = true;
        
        next();
      } catch (error) {
        console.error('❌ Admin auth middleware error:', error);
        return res.status(500).json({
          success: false,
          error: 'Admin authentication failed',
          code: 'ADMIN_AUTH_ERROR'
        });
      }
    };
  }

  // Validate admin signature (for future use with wallet signing)
  async validateAdminSignature(address, message, signature) {
    // This would integrate with web3 signature verification
    // For now, just check if address is admin
    return this.isAdmin(address);
  }

  // Get admin statistics
  getStats() {
    return {
      totalAdmins: this.adminAddresses.length,
      adminAddresses: this.getAdminAddresses(),
      adminEmails: this.getAdminEmails(),
      primaryEmail: this.getPrimaryAdminEmail(),
      lastUpdated: new Date().toISOString()
    };
  }
}

// Create singleton instance
const adminAuth = new AdminAuth();

module.exports = {
  AdminAuth,
  adminAuth,
  isAdmin: (address) => adminAuth.isAdmin(address),
  requireAdmin: () => adminAuth.requireAdmin(),
  getAdminAddresses: () => adminAuth.getAdminAddresses(),
  getAdminEmails: () => adminAuth.getAdminEmails(),
  getPrimaryAdminEmail: () => adminAuth.getPrimaryAdminEmail()
};