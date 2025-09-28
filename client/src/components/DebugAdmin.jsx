import React from 'react';

export default function DebugAdmin() {
  const address = '0x84567F4604B194DaBc502F66497D57d745752A27'; // Your connected address
  const envVar = import.meta.env.VITE_ADMIN_ADDRESSES;
  const configuredAdmins = envVar?.split(',').map(a => a.trim().toLowerCase()) || [];
  const isEnvAdmin = configuredAdmins.includes(address.toLowerCase());

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px', borderRadius: '8px' }}>
      <h3>Admin Debug Information</h3>
      <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
        {JSON.stringify({
          connectedAddress: address,
          envVar,
          configuredAdmins,
          isEnvAdmin,
          addressLower: address.toLowerCase(),
          envVarType: typeof envVar
        }, null, 2)}
      </pre>
    </div>
  );
}