import React, { useState, useEffect } from "react";
import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import { useRole } from "./hooks/useRole";
import { useTheme } from "./contexts/ThemeContext";
import WalletConnect from "./components/WalletConnect.jsx";
import {
  Shield,
  User,
  Building,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Search,
  Factory,
  Settings,
  Package,
  UserPlus,
  BarChart3,
  CheckCircle2,
  Clock,
  ChevronDown,
  Wallet,
  LogOut,
} from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastProvider } from "./components/Toast.jsx";

export default function App() {
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Enhanced nav link styling function
  const navLinkClassName = ({ isActive }) => {
    const baseClasses =
      "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 relative";

    if (isActive) {
      return `${baseClasses} ${
        darkMode
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
          : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
      } transform scale-105`;
    }

    return `${baseClasses} ${
      darkMode
        ? "text-slate-300 hover:text-white hover:bg-slate-700/60 hover:scale-105"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:scale-105"
    }`;
  };

  // Mobile nav link styling
  const mobileNavLinkClassName = ({ isActive }) => {
    const baseClasses =
      "flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300";

    if (isActive) {
      return `${baseClasses} ${
        darkMode
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
          : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
      }`;
    }

    return `${baseClasses} ${
      darkMode
        ? "text-slate-300 hover:text-white hover:bg-slate-700/60"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;
  };

  const getNavigationItems = () => {
    const items = [];

    if (isAdmin) {
      items.push(
        { to: "/admin", icon: Settings, label: "Admin Dashboard" },
        { to: "/verify", icon: Search, label: "Verify" },
        { to: "/manufacturer/list", icon: Factory, label: "Manufacturers" },
        { to: "/hypergraph-demo", icon: BarChart3, label: "Hypergraph Demo" },
      );
    } else if (isManufacturer) {
      items.push(
        { to: "/manufacturer/me", icon: User, label: "My Profile", end: true },
        { to: "/verify", icon: Search, label: "Verify" },
        { to: "/manufacturer/me/batches", icon: Package, label: "My Batches" },
      );

      if (canRegisterBatch) {
        items.splice(3, 0, {
          to: "/batch/register",
          icon: UserPlus,
          label: "Register Batch",
        });
      }
    } else {
      items.push(
        { to: "/home", icon: Home, label: "User Dashboard" },
        { to: "/verify", icon: Search, label: "Verify" },
        { to: "/manufacturer/list", icon: Factory, label: "Manufacturers" }
      );

      if (canRegisterAsManufacturer && isConnected) {
        items.push({
          to: "/manufacturer/register",
          icon: UserPlus,
          label: "Register as Manufacturer",
        });
      }
    }

    return items;
  };

  const renderNavigation = () => {
    return getNavigationItems().map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={navLinkClassName}
        onClick={closeMobileMenu}
      >
        <item.icon className="w-4 h-4" />
        <span className="whitespace-nowrap">{item.label}</span>
      </NavLink>
    ));
  };

  const renderMobileNavigation = () => {
    return getNavigationItems().map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={mobileNavLinkClassName}
        onClick={closeMobileMenu}
      >
        <item.icon className="w-5 h-5" />
        <span>{item.label}</span>
      </NavLink>
    ));
  };

  const getRoleInfo = () => {
    if (isAdmin) {
      return {
        text: "Admin",
        icon: Shield,
        color: darkMode ? "text-purple-400" : "text-purple-600",
        bgColor: darkMode
          ? "bg-purple-500/20 border-purple-500/30"
          : "bg-purple-50 border-purple-200",
      };
    }

    if (isManufacturer) {
      return {
        text: manufacturer?.isVerified
          ? "Verified Manufacturer"
          : "Pending Manufacturer",
        icon: Building,
        color: manufacturer?.isVerified
          ? darkMode
            ? "text-emerald-400"
            : "text-emerald-600"
          : darkMode
          ? "text-amber-400"
          : "text-amber-600",
        bgColor: manufacturer?.isVerified
          ? darkMode
            ? "bg-emerald-500/20 border-emerald-500/30"
            : "bg-emerald-50 border-emerald-200"
          : darkMode
          ? "bg-amber-500/20 border-amber-500/30"
          : "bg-amber-50 border-amber-200",
      };
    }

    return {
      text: "User",
      icon: User,
      color: darkMode ? "text-slate-400" : "text-slate-600",
      bgColor: darkMode
        ? "bg-slate-500/20 border-slate-500/30"
        : "bg-slate-100 border-slate-300",
    };
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div
          className={`min-h-screen font-sans transition-colors duration-500 ${
            darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
          }`}
        >
          {/* Modern Header */}
          <header
            className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-500 ${
              darkMode
                ? "bg-slate-900/80 border-slate-800"
                : "bg-white/80 border-slate-200"
            }`}
          >
            <nav className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-between h-20">
                {/* Logo Section */}
                <Link
                  to="/"
                  className={`flex items-center gap-3 text-2xl font-bold transition-all duration-300 hover:scale-105 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                    MedChain
                  </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-2">
                  {renderNavigation()}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                      darkMode
                        ? "bg-slate-800 hover:bg-slate-700 text-cyan-400"
                        : "bg-white hover:bg-slate-50 text-slate-700 shadow-lg"
                    }`}
                  >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>

                  {/* User Info - Desktop */}
                  {isConnected && (
                    <div className="hidden md:block relative">
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 border ${roleInfo.bgColor}`}
                      >
                        <RoleIcon className={`w-4 h-4 ${roleInfo.color}`} />
                        <div className="text-left">
                          <div
                            className={`text-sm font-semibold ${roleInfo.color}`}
                          >
                            {roleInfo.text}
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Wallet Connect */}
                  <WalletConnect darkMode={darkMode} />

                  {/* Mobile Menu Button */}
                  <button
                    onClick={toggleMobileMenu}
                    className={`lg:hidden p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                      darkMode
                        ? "bg-slate-800 hover:bg-slate-700 text-white"
                        : "bg-white hover:bg-slate-50 text-slate-900 shadow-lg"
                    }`}
                  >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </div>
              </div>
            </nav>

            {/* Mobile Navigation Menu */}
            <div
              className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${
                mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div
                className={`border-t ${
                  darkMode ? "border-slate-800" : "border-slate-200"
                }`}
              >
                <div className="px-6 py-6 space-y-2">
                  {renderMobileNavigation()}

                  {/* Mobile User Info */}
                  {isConnected && (
                    <div
                      className={`mt-6 pt-6 border-t ${
                        darkMode ? "border-slate-800" : "border-slate-200"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-3 px-6 py-4 rounded-xl border ${roleInfo.bgColor}`}
                      >
                        <RoleIcon className={`w-5 h-5 ${roleInfo.color}`} />
                        <div>
                          <div className={`font-semibold ${roleInfo.color}`}>
                            {roleInfo.text}
                          </div>
                          <div
                            className={`text-sm font-mono ${
                              darkMode ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {address?.slice(0, 10)}...{address?.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Floating Geometric Shapes Background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-16 h-16 bg-emerald-500/5 rounded-full animate-pulse"></div>
            <div
              className="absolute top-40 right-20 w-8 h-8 bg-blue-500/10 rotate-45 animate-spin"
              style={{ animationDuration: "8s" }}
            ></div>
            <div
              className="absolute bottom-32 left-20 w-12 h-12 bg-purple-500/5 rounded-full animate-bounce"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-40 right-10 w-6 h-6 bg-amber-500/10 rotate-12 animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          {/* Main Content Area */}
          <main className="relative max-w-7xl mx-auto px-6 py-8">
            <Outlet />
          </main>

          {/* Overlay for mobile menu */}
          {mobileMenuOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={closeMobileMenu}
            />
          )}
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
}
