// src/main.jsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import your custom hook and all pages
import { useRole } from './hooks/useRole';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Home from './pages/Home.jsx';
import LandingPage from './pages/LandingPage.jsx'; // Import the new landing page
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
import './index.css';

// Your Wagmi and QueryClient setup (no changes needed here)
const chainId = Number(import.meta.env.VITE_CHAIN_ID || 11155111);
const chains = chainId === sepolia.id ? [sepolia] : [mainnet];
const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id' }),
    coinbaseWallet({ appName: 'MedChain' })
  ],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});
const queryClient = new QueryClient();

// This is the component that will handle the routing logic
const AppRouter = () => {
  const { isConnected } = useRole();

  const connectedRouter = createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <Home /> },
        { path: 'verify/:batchId?', element: <Verify /> },
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
        // Redirect any other path to home if connected
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ]);

  const disconnectedRouter = createBrowserRouter([
    {
      path: '/landing',
      element: <LandingPage />,
    },
    // Redirect any other path to the landing page if not connected
    {
      path: '*',
      element: <Navigate to="/landing" replace />,
    },
  ]);

  return <RouterProvider router={isConnected ? connectedRouter : disconnectedRouter} />;
};

// Render the main AppRouter component
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </StrictMode>
);