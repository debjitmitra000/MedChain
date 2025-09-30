import { useRole } from '../hooks/useRole';
import { Link } from 'react-router-dom';

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireVerified = false,
  fallback = null 
}) {
  const { 
    role, 
    isConnected, 
    manufacturer, 
    isVerified 
  } = useRole();

  // Check wallet connection
  if (!isConnected) {
    return fallback || (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Wallet Connection Required</h3>
        <p>Please connect your MetaMask wallet to access this page.</p>
      </div>
    );
  }

  // Check role requirement
  if (requiredRole && role !== requiredRole) {
    const roleNames = {
      admin: 'Admin',
      manufacturer: 'Manufacturer', 
      user: 'User'
    };
    
    return fallback || (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Access Denied</h3>
        <p>This page requires {roleNames[requiredRole]} access.</p>
        <p>Your current role: {roleNames[role] || 'Guest'}</p>
        {requiredRole === 'manufacturer' && role === 'user' && (
          <Link to="/app/manufacturer/register">
            <button style={{ backgroundColor: '#0088aa', color: 'white', padding: '12px 24px' }}>
              Register as Manufacturer
            </button>
          </Link>
        )}
      </div>
    );
  }

  // Check verification requirement for manufacturers
  if (requireVerified && role === 'manufacturer' && !isVerified) {
    return fallback || (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Verification Required</h3>
        <p>This action requires admin verification of your manufacturer account.</p>
        <p>Status: <span style={{ color: '#ff8800' }}>Pending Verification</span></p>
        <Link to="/app/manufacturer/me">
          <button style={{ backgroundColor: '#0088aa', color: 'white', padding: '12px 24px' }}>
            View My Profile
          </button>
        </Link>
      </div>
    );
  }

  return children;
}
