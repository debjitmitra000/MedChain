// Import React and necessary libraries
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig } from 'wagmi';
import { http } from 'viem';
import { mainnet, sepolia } from 'viem/chains'; // Import chains from viem/chains

// Import styles at the top level
import './index.css';

// Filecoin Calibration chain definition (viem-compatible shape)
const filecoinCalibration = {
  id: 314159,
  name: 'Filecoin Calibration Testnet',
  network: 'filecoin-calibration',
  nativeCurrency: { name: 'tFIL', symbol: 'tFIL', decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_FILECOIN_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1'] },
    public: { http: [import.meta.env.VITE_FILECOIN_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1'] }
  },
  blockExplorers: {
    default: { name: 'Filfox Calibration', url: import.meta.env.VITE_FILECOIN_EXPLORER_URL || 'https://calibration.filfox.info' }
  }
};
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { ThemeProvider } from './contexts/ThemeContext'
import { GeoConnectProvider } from './contexts/GeoConnectContext.jsx';
import App from './App.jsx';
import LandingPage from './LandingPage.jsx'; // Add this import
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Home from './pages/Home.jsx';
import Verify from './pages/Verify.jsx';
import ManufacturerRegister from './pages/ManufacturerRegister.jsx';
import ManufacturerDetail from './pages/ManufacturerDetail.jsx';
import ManufacturerList from './pages/ManufacturerList.jsx';
import ManufacturerVerify from './pages/ManufacturerVerify.jsx';
import MyManufacturer from './pages/MyManufacturer.jsx';
import MyBatches from './pages/MyBatches.jsx';
import BatchRegister from './pages/BatchRegister.jsx';
import BatchDetail from './pages/BatchDetail.jsx';
import RecallBatch from './pages/RecallBatch.jsx';
import ExpiredReports from './pages/ExpiredReports.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProfileEdit from './pages/ProfileEdit.jsx';
import HypergraphDemo from './pages/HypergraphDemo.jsx';
import SubgraphDemo from './pages/SubgraphDemo.jsx';
import Onboarding from './pages/Onboarding.jsx';

// Wagmi and QueryClient setup
const chainId = Number(import.meta.env.VITE_CHAIN_ID || 314159);
let chains;
if (chainId === sepolia.id) chains = [sepolia];
else if (chainId === mainnet.id) chains = [mainnet];
else if (chainId === filecoinCalibration.id) chains = [filecoinCalibration];
else chains = [filecoinCalibration];

// Wagmi v2 configuration with proper parameters
const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id' }),
    coinbaseWallet({ appName: 'MedChain' })
  ],
  transports: {
    [filecoinCalibration.id]: http(import.meta.env.VITE_FILECOIN_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1'),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  }
});
const queryClient = new QueryClient();

// Completely restructured router configuration
const router = createBrowserRouter([
  // The landing page route at the root level
  {
    path: '/',
    element: <LandingPage />,
    index: true,
  },
  // Onboarding route
  {
    path: '/onboarding',
    element: <Onboarding />,
  },
  // App routes under /app prefix
  {
    path: '/app',
    element: <App />,
    children: [
      { path: '', element: <Home /> }, // Default route when accessing /app
      { path: 'home', element: <Home /> },
      { path: 'dashboard', element: <Verify /> },
      { path: 'verify', element: <Verify /> },
      { path: 'verify/:batchId', element: <Verify /> },
      { path: 'manufacturer/register', element: <ManufacturerRegister /> },
      { path: 'manufacturer/list', element: <ManufacturerList /> },
      { path: 'manufacturer/verify', element: <ManufacturerVerify /> },
      { path: 'manufacturer/me', element: <MyManufacturer /> },
      { path: 'manufacturer/me/batches', element: <MyBatches /> },
      { path: 'manufacturer/:address', element: <ManufacturerDetail /> },
      { path: 'batch/register', element: <BatchRegister /> },
      { path: 'batch/:batchId', element: <BatchDetail /> },
      { path: 'batch/:batchId/recall', element: <RecallBatch /> },
      { path: 'reports/expired', element: <ExpiredReports /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'profile/edit', element: <ProfileEdit /> },
      { path: 'hypergraph-demo', element: <HypergraphDemo /> },
      { path: 'subgraph-demo', element: <SubgraphDemo /> },
    ],
  },
  // Redirect legacy routes
  {
    path: '/home',
    element: <Navigate to="/app/home" replace />,
  },
  {
    path: '/verify',
    element: <Navigate to="/app/verify" replace />,
  },
  {
    path: '/admin',
    element: <Navigate to="/app/admin" replace />,
  },
]);

// Debug logs
console.log('Initializing app');
console.log('Router config:', router);

// Render the app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <GeoConnectProvider>
            <ThemeProvider>
              <RouterProvider router={router} />
            </ThemeProvider>
          </GeoConnectProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </StrictMode>
);
