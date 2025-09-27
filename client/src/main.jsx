import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './style.css'

// Import your pages
import App from './App.jsx';
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
import './index.css';

// Wagmi and QueryClient setup
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

// Single unified router
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> }, // This will be handled by App.jsx to show LandingPage
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
    ],
  },
]);

// Render the app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </StrictMode>
);