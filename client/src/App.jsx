import LandingPage from "./LandingPage";
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { useRole } from './hooks/useRole';
import WalletConnect from './components/WalletConnect.jsx';
import { Shield, User, Building } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastProvider } from './components/Toast.jsx';

export default function App() {
  const location = useLocation();
  const {
    role,
    isAdmin,
    isManufacturer,
    isConnected,
    address,
    manufacturer,
    canRegisterBatch,
    canRegisterAsManufacturer,
  } = useRole();

  // If we're on the home page, show the landing page
  if (location.pathname === '/') {
    return <LandingPage />;
  }

  // This function adds styling to the currently active navigation link
  const navLinkClassName = ({ isActive }) =>
    isActive
      ? 'text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-lg shadow-md transform scale-105 transition-all duration-200 whitespace-nowrap'
      : 'text-gray-700 font-medium hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap hover:shadow-sm hover:scale-105';

  const renderNavigation = () => {
    // We use NavLink instead of Link to style the active page
    if (isAdmin) {
      return (
        <>
          <NavLink to="/" className={navLinkClassName}>Home</NavLink>
          <NavLink to="/verify" className={navLinkClassName}>Verify</NavLink>
          <NavLink to="/manufacturer/list" className={navLinkClassName}>Manufacturers</NavLink>
          <NavLink to="/admin" className={navLinkClassName}>Admin Dashboard</NavLink>
        </>
      );
    }

    if (isManufacturer) {
      return (
        <>
          <NavLink to="/" className={navLinkClassName}>Home</NavLink>
          <NavLink to="/verify" className={navLinkClassName}>Verify</NavLink>
          <NavLink to="/manufacturer/me/batches" className={navLinkClassName}>My Batches</NavLink>
          {canRegisterBatch && (
            <NavLink to="/batch/register" className={navLinkClassName}>Register Batch</NavLink>
          )}
          <NavLink to="/manufacturer/me" className={navLinkClassName}>My Profile</NavLink>
        </>
      );
    }

    // Default User navigation
    return (
      <>
        <NavLink to="/" className={navLinkClassName}>Home</NavLink>
        <NavLink to="/verify" className={navLinkClassName}>Verify</NavLink>
        <NavLink to="/manufacturer/list" className={navLinkClassName}>Manufacturers</NavLink>
        {canRegisterAsManufacturer && isConnected && (
            <NavLink to="/manufacturer/register" className={navLinkClassName}>Register as Manufacturer</NavLink>
        )}
      </>
    );
  };

  const renderUserInfo = () => {
    if (!isConnected) return null;

    let roleInfo = { text: 'User', icon: User, color: 'text-gray-500', bgColor: 'bg-gray-100' };
    if (isAdmin) {
      roleInfo = { text: 'Admin', icon: Shield, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (isManufacturer) {
      roleInfo = { 
        text: `Manufacturer ${manufacturer?.isVerified ? '' : '(Pending)'}`, 
        icon: Building, 
        color: manufacturer?.isVerified ? 'text-blue-600' : 'text-orange-600',
        bgColor: manufacturer?.isVerified ? 'bg-blue-50' : 'bg-orange-50'
      };
    }
    const RoleIcon = roleInfo.icon;

    return (
      <div className={`flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700 ${roleInfo.bgColor} px-2 py-1 rounded-md border`}>
        <RoleIcon className={`h-4 w-4 ${roleInfo.color}`} />
        <span className={`${roleInfo.color} hidden sm:inline`}>{roleInfo.text}</span>
        <span className="text-gray-400 hidden md:inline">|</span>
        <span className="font-mono text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
      </div>
    );
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* HEADER / NAVIGATION BAR */}
        <header className="bg-white shadow-md sticky top-0 z-10">
          <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
            {/* Left Side: Logo and Navigation Links */}
            <div className="flex items-center gap-4 md:gap-8">
              <Link to="/" className="text-xl md:text-2xl font-bold text-indigo-600 flex items-center gap-2">
                <Shield className="h-6 w-6 md:h-8 md:w-8" />
                <span className="hidden sm:inline">MedChain</span>
                <span className="sm:hidden">MC</span>
              </Link>
              <div className="hidden lg:flex items-center gap-6">
                {renderNavigation()}
              </div>
            </div>

            {/* Right Side: User Info and Wallet Button */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:block">
                {renderUserInfo()}
              </div>
              <WalletConnect />
            </div>
          </nav>
          
          {/* Mobile Navigation */}
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-x-auto">
                  {renderNavigation()}
                </div>
                <div className="md:hidden">
                  {renderUserInfo()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="container mx-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}