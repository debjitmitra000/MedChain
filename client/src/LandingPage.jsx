import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useRole } from './hooks/useRole';
import WalletConnect from './components/WalletConnect.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './contexts/ThemeContext';

// Adding a console log to debug rendering
console.log("LandingPage component loaded");
import {
  Sun,
  Moon,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  ChevronDown,
  Users,
  Award,
  TrendingUp,
  Database,
  Lock,
  Activity,
  Smartphone,
  Cloud,
  CheckCircle,
  Server,
  FileText,
  Globe2,
  GitBranch,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { role, isAdmin, isManufacturer } = useRole();

  const { darkMode, toggleTheme } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const stackRef = useRef(null);
  const aboutRef = useRef(null);
  const ctaRef = useRef(null);
  const qrRef = useRef(null);

  // Handle navigation after wallet connection
  useEffect(() => {
    if (isConnected) {
      // Small delay to ensure role is properly detected
      const timer = setTimeout(() => {
        if (isAdmin) {
          navigate('/app/admin');
        } else if (isManufacturer) {
          navigate('/app/manufacturer/me');
        } else {
          navigate('/app/verify');
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isConnected, isAdmin, isManufacturer, navigate]);

  // Scroll progress logic
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse movement for QR character eyes
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (qrRef.current) {
        const qrRect = qrRef.current.getBoundingClientRect();
        const qrCenterX = qrRect.left + qrRect.width / 2;
        const qrCenterY = qrRect.top + qrRect.height / 2;

        setMousePosition({
          x: e.clientX - qrCenterX,
          y: e.clientY - qrCenterY,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);


  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  // Calculate eye movement based on mouse position
  const getEyeMovement = (maxMovement = 8) => {
    const distance = Math.sqrt(mousePosition.x ** 2 + mousePosition.y ** 2);
    const maxDistance = 300; // Max distance to consider for eye movement
    const normalizedDistance = Math.min(distance / maxDistance, 1);

    const eyeX =
      (mousePosition.x / maxDistance) * maxMovement * normalizedDistance;
    const eyeY =
      (mousePosition.y / maxDistance) * maxMovement * normalizedDistance;

    return { x: eyeX, y: eyeY };
  };

  const eyeMovement = getEyeMovement();

  return (
    <div
      className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-500 ${darkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900"
        }`}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-105 ${darkMode
          ? "bg-slate-800/80 hover:bg-slate-700/80 text-cyan-400 shadow-lg shadow-cyan-400/20"
          : "bg-white/80 hover:bg-slate-50/80 text-slate-700 shadow-lg shadow-slate-300/30"
          }`}
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-200/20 z-50">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
          style={{
            width: `${Math.min(
              (scrollY / (document.body.scrollHeight - window.innerHeight)) *
              100,
              100
            )}%`,
          }}
        />
      </div>

      {/* Hero Section with Animated Capsule and QR Character */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div
            className={`absolute inset-0 opacity-20 ${darkMode ? "" : "opacity-30"
              }`}
            style={{
              backgroundImage: darkMode
                ? "url('https://www.transparenttextures.com/patterns/concrete-wall.png')"
                : "url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')",
            }}
          ></div>

          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-cyan-500/10 rounded-full animate-pulse"></div>
          <div
            className="absolute top-40 right-20 w-8 h-8 bg-emerald-500/20 rotate-45 animate-spin"
            style={{ animationDuration: "8s" }}
          ></div>
          <div
            className="absolute bottom-32 left-20 w-12 h-12 bg-blue-500/10 rounded-full animate-bounce"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-40 right-10 w-6 h-6 bg-purple-500/20 rotate-12 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>

          {/* Additional floating shapes for better coverage */}
          <div
            className="absolute top-16 left-1/4 w-10 h-10 bg-indigo-500/15 rounded-full animate-pulse"
            style={{ animationDelay: "3s" }}
          ></div>
          <div
            className="absolute top-60 right-1/4 w-14 h-14 bg-pink-500/10 rotate-12 animate-spin"
            style={{ animationDuration: "12s", animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-60 left-1/3 w-8 h-8 bg-yellow-500/15 rotate-45 animate-bounce"
            style={{ animationDelay: "2.5s" }}
          ></div>
          <div
            className="absolute top-32 right-1/3 w-6 h-6 bg-teal-500/20 animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
          <div
            className="absolute bottom-20 right-1/5 w-12 h-12 bg-orange-500/12 rounded-full animate-spin"
            style={{ animationDuration: "10s" }}
          ></div>
          <div
            className="absolute top-72 left-1/6 w-7 h-7 bg-violet-500/18 rotate-45 animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div
            className="absolute bottom-48 right-2/3 w-9 h-9 bg-rose-500/14 rounded-full animate-bounce"
            style={{ animationDelay: "3.5s" }}
          ></div>
          <div
            className="absolute top-48 left-2/3 w-5 h-5 bg-lime-500/16 rotate-12 animate-spin"
            style={{ animationDuration: "6s", animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-72 left-1/5 w-11 h-11 bg-sky-500/12 rounded-full animate-pulse"
            style={{ animationDelay: "5s" }}
          ></div>
          <div
            className="absolute top-80 right-1/6 w-4 h-4 bg-amber-500/20 rotate-45 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute bottom-16 left-2/5 w-13 h-13 bg-emerald-400/8 rounded-full animate-spin"
            style={{ animationDuration: "15s" }}
          ></div>
        </div>

        {/* Main Content */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Animated QR Code Character */}
          <div
            ref={qrRef}
            className="absolute top-[15%] left-1/2 -translate-x-1/2 z-10 animate-qrFloat flex justify-center"
          >
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 p-2 rounded-lg ${darkMode ? "bg-white" : "bg-slate-900"
                } shadow-lg hover:scale-110 transition-all duration-300`}
            >
              {/* QR Code Pattern */}
              <div className="w-full h-full grid grid-cols-8 gap-[1px]">
                {Array.from({ length: 64 }, (_, i) => {
                  const isCornerSquare =
                    (i < 21 && i % 8 < 3) || // Top-left
                    (i < 21 && i % 8 > 4) || // Top-right
                    (i > 42 && i % 8 < 3); // Bottom-left
                  const isRandomPattern =
                    Math.random() > 0.4 && !isCornerSquare;

                  return (
                    <div
                      key={i}
                      className={`aspect-square ${isCornerSquare || isRandomPattern
                        ? darkMode
                          ? "bg-slate-900"
                          : "bg-white"
                        : darkMode
                          ? "bg-white"
                          : "bg-slate-900"
                        }`}
                    />
                  );
                })}
              </div>

              {/* Animated Eyes (centered properly) */}
              <div className="absolute inset-0 flex items-center justify-center gap-6 -top-6">
                {/* Left Eye */}
                <div
                  className={`w-8 h-8 rounded-full ${darkMode ? "bg-slate-900" : "bg-white"
                    } border-2 ${darkMode ? "border-white" : "border-slate-900"
                    } flex items-center justify-center animate-qrBlink overflow-hidden`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${darkMode ? "bg-white" : "bg-slate-900"
                      } transition-transform duration-100`}
                    style={{
                      transform: `translate(${Math.max(
                        -1.5,
                        Math.min(1.5, eyeMovement.x * 0.8)
                      )}px, ${Math.max(
                        -1.5,
                        Math.min(1.5, eyeMovement.y * 0.8)
                      )}px)`,
                    }}
                  />
                </div>

                {/* Right Eye */}
                <div
                  className={`w-8 h-8 rounded-full ${darkMode ? "bg-slate-900" : "bg-white"
                    } border-2 ${darkMode ? "border-white" : "border-slate-900"
                    } flex items-center justify-center animate-qrBlink overflow-hidden`}
                  style={{ animationDelay: "0.1s" }}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${darkMode ? "bg-white" : "bg-slate-900"
                      } transition-transform duration-100`}
                    style={{
                      transform: `translate(${Math.max(
                        -1.5,
                        Math.min(1.5, eyeMovement.x * 0.8)
                      )}px, ${Math.max(
                        -1.5,
                        Math.min(1.5, eyeMovement.y * 0.8)
                      )}px)`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MEDCHAIN Title */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <h1
              className={`text-[12vmin] sm:text-[15vmin] md:text-[18vmin] lg:text-[22vmin] xl:text-[25vmin] font-extrabold font-sans transition-colors duration-500 select-none ${darkMode ? "text-white" : "text-slate-900"
                }`}
              style={{
                textShadow: darkMode
                  ? "0 0 30px rgba(6, 182, 212, 0.3)"
                  : "0 0 30px rgba(6, 182, 212, 0.2)",
              }}
            >
              MEDCHAIN
            </h1>
          </div>

          {/* Medicine Capsule Animation */}
          <div className="relative w-[6vmin] sm:w-[7vmin] md:w-[8vmin] h-[15vmin] sm:h-[17vmin] md:h-[20vmin] opacity-90 mix-blend-exclusion animate-capsuleMove z-20">
            <div className="absolute top-0 w-full h-1/2 bg-red-500 rounded-t-full"></div>
            <div className="absolute bottom-0 w-full h-1/2 bg-white rounded-b-full border-4 border-red-500 border-t-0"></div>
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[0.6vmin] sm:w-[0.7vmin] md:w-[0.8vmin] h-[0.6vmin] sm:h-[0.7vmin] md:h-[0.8vmin] bg-red-300 rounded-full animate-pulse"></div>
            <div
              className="absolute top-[65%] left-[30%] w-[0.4vmin] sm:w-[0.5vmin] md:w-[0.6vmin] h-[0.4vmin] sm:h-[0.5vmin] md:h-[0.6vmin] bg-red-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute top-[75%] left-[70%] w-[0.5vmin] sm:w-[0.6vmin] md:w-[0.7vmin] h-[0.5vmin] sm:h-[0.6vmin] md:h-[0.7vmin] bg-red-300 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-[85%] left-[45%] w-[0.4vmin] sm:w-[0.5vmin] md:w-[0.6vmin] h-[0.4vmin] sm:h-[0.5vmin] md:h-[0.6vmin] bg-red-500 rounded-full animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>
            <div className="absolute top-[7.5%] left-[12.5%] w-[25%] h-[25%] bg-white opacity-40 rounded-full blur-[1px]"></div>
            <div className="absolute top-[57.5%] left-[12.5%] w-[25%] h-[25%] bg-white opacity-30 rounded-full blur-[1px]"></div>
          </div>

          {/* Floating particles */}
          <div className="absolute w-[0.5vmin] h-[0.5vmin] bg-red-300 rounded-full animate-floatParticle1 opacity-60 z-20"></div>
          <div className="absolute w-[0.3vmin] h-[0.3vmin] bg-blue-400 rounded-full animate-floatParticle2 opacity-60 z-20"></div>
          <div className="absolute w-[0.4vmin] h-[0.4vmin] bg-green-400 rounded-full animate-floatParticle3 opacity-60 z-20"></div>
          <div className="absolute w-[0.2vmin] h-[0.2vmin] bg-yellow-400 rounded-full animate-floatParticle4 opacity-60 z-20"></div>
        </div>

        {/* Hero Content */}
        <div
          ref={heroRef}
          className="absolute inset-x-0 bottom-16 md:bottom-20 flex flex-col items-center justify-center text-center px-4 md:px-6 z-30 max-w-5xl mx-auto"
        >
          <div className="mb-6 md:mb-8 space-y-3 md:space-y-4">
            <p
              className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl transition-colors duration-500 leading-tight ${darkMode ? "text-slate-300" : "text-slate-600"
                }`}
            >
              Decentralized Medicine Authentication & Expiry Tracking
            </p>

          </div>

          {/* Connect Wallet Button - Centered */}
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <div className="flex justify-center">
              <WalletConnect />
            </div>

            {/* Info text */}
            <p className={`text-xs md:text-sm transition-colors duration-500 ${darkMode ? 'text-slate-500' : 'text-slate-600'
              }`}>
              Connect your wallet to access the dashboard
            </p>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div
          onClick={() => scrollToSection("stack")}
          className="absolute bottom-1 left-1/2 transform -translate-x-1/2 cursor-pointer group z-40"
        >
          <div
            className={`relative flex flex-col items-center mt-4 transition-colors duration-500 ${darkMode ? "text-slate-400" : "text-slate-600"
              }`}
          >
            <div
              className={`w-6 h-10 border-2 rounded-full flex justify-center relative group-hover:border-emerald-400 transition-colors ${darkMode ? "border-slate-400" : "border-slate-600"
                }`}
            >
              <div className="absolute top-2 w-1 h-3 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full animate-scrollIndicator"></div>
            </div>
            <ChevronDown
              className="mt-1 animate-bounce group-hover:text-emerald-400 transition-colors"
              size={16}
            />
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <motion.section
        id="stack"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className={`py-20 px-6 ${darkMode ? "bg-slate-900/50" : "bg-slate-50/50"
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Powered by <span className="text-emerald-400">Web3 Infrastructure</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                icon: FileText,
                title: "Lighthouse Storage",
                description: "Permanent decentralized storage powered by Filecoin and IPFS for immutable medicine records",
                color: "text-blue-400",
                bgGradient: "from-blue-500/10 to-blue-600/10",
              },
              {
                icon: Globe2,
                title: "ENS Integration",
                description: "Human-readable names for manufacturers and healthcare providers using Ethereum Name Service",
                color: "text-purple-400",
                bgGradient: "from-purple-500/10 to-purple-600/10",
              },
              {
                icon: GitBranch,
                title: "The Graph Protocol",
                description: "Decentralized indexing for fast queries and real-time analytics of medicine supply chain data",
                color: "text-cyan-400",
                bgGradient: "from-cyan-500/10 to-cyan-600/10",
              },
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-8 rounded-2xl shadow-lg hover:scale-105 group ${darkMode
                  ? `bg-gradient-to-br ${tech.bgGradient} backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50`
                  : `bg-gradient-to-br ${tech.bgGradient} backdrop-blur-sm border border-slate-200/50 hover:border-slate-300/50`
                  }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-full ${darkMode ? 'bg-slate-800/60' : 'bg-white/60'} mb-4 group-hover:scale-110 transition-transform`}>
                    <tech.icon
                      className={`${tech.color}`}
                      size={32}
                    />
                  </div>
                  <h3
                    className={`text-xl font-semibold mb-4 transition-colors duration-500 ${darkMode ? "text-white" : "text-slate-900"
                      }`}
                  >
                    {tech.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed transition-colors duration-500 ${darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                  >
                    {tech.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className={`py-24 px-6 md:px-16 ${darkMode ? "bg-slate-900" : "bg-slate-50"
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className={`text-3xl md:text-5xl font-bold text-center mb-16 transition-colors duration-500 ${darkMode ? "text-white" : "text-slate-900"
              }`}
          >
            Why <span className="text-emerald-400">MedChain?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                icon: Shield,
                title: "Verified Medicines",
                description:
                  "Every medicine batch is recorded on-chain, ensuring authenticity and transparency through immutable blockchain records.",
                color: "text-emerald-400",
              },
              {
                icon: Zap,
                title: "Real-Time Alerts",
                description:
                  "Expired or fake detections trigger instant alerts to manufacturers, regulators, and healthcare providers worldwide.",
                color: "text-cyan-400",
              },
              {
                icon: Globe,
                title: "Global Transparency",
                description:
                  "Public dashboard visualizes fake medicine hotspots, expired stocks, and high-risk batches in real-time.",
                color: "text-blue-400",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-6 md:p-8 rounded-2xl shadow-lg hover:scale-105 group ${darkMode
                  ? "bg-slate-800 hover:bg-slate-700 shadow-slate-900/50"
                  : "bg-white hover:bg-slate-50 shadow-slate-300/30"
                  }`}
              >
                <div className="flex items-start mb-4">
                  <feature.icon
                    className={`${feature.color} mr-3 mt-1 group-hover:scale-110 transition-transform flex-shrink-0`}
                    size={28}
                  />
                  <h3
                    className={`text-lg md:text-xl font-semibold transition-colors duration-500 ${darkMode ? "text-white" : "text-slate-900"
                      }`}
                  >
                    {feature.title}
                  </h3>
                </div>
                <p
                  className={`text-sm md:text-base leading-relaxed transition-colors duration-500 ${darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Technology Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className={`py-24 px-6 md:px-16 ${darkMode ? "bg-slate-950" : "bg-white"
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Built with{" "}
            <span className="text-emerald-400">Advanced Technology</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Lock,
                title: "Blockchain Security",
                desc: "Immutable ledger technology for trust",
              },
              {
                icon: Activity,
                title: "Real-time Monitoring",
                desc: "Continuous supply chain tracking",
              },
              {
                icon: Smartphone,
                title: "Mobile Access",
                desc: "Scan and verify medicines anywhere",
              },
              {
                icon: Cloud,
                title: "Cloud Infrastructure",
                desc: "Scalable and reliable global systems",
              },
              {
                icon: Database,
                title: "Big Data Analytics",
                desc: "Pattern recognition and deep insights",
              },
              {
                icon: CheckCircle,
                title: "Quality Assurance",
                desc: "Multi-layer verification process",
              },
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`p-5 md:p-6 rounded-xl border group hover:scale-105 ${darkMode
                  ? "bg-slate-800/60 border-slate-600 hover:border-emerald-500/50"
                  : "bg-white border-slate-300 hover:border-emerald-500/50 shadow-sm"
                  }`}
              >
                <tech.icon
                  className="text-emerald-400 mb-3 md:mb-4 group-hover:scale-110 transition-transform"
                  size={28}
                />
                <h3
                  className={`text-base md:text-lg font-semibold mb-2 leading-tight ${darkMode ? "text-white" : "text-slate-900"
                    }`}
                >
                  {tech.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                >
                  {tech.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section - Fixed Button Alignment */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className={`py-24 px-6 ${darkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-slate-100 to-slate-200"
          }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className={`text-3xl md:text-5xl font-bold mb-8 ${darkMode ? "text-white" : "text-slate-900"
              }`}
          >
            Ready to <span className="text-emerald-400">Secure</span>{" "}
            Healthcare?
          </h2>
          <p
            className={`text-lg md:text-xl mb-12 ${darkMode ? "text-slate-300" : "text-slate-700"
              }`}
          >
            Join thousands of healthcare providers, manufacturers, and
            regulators who trust MedChain for medicine authentication.
          </p>

          {/* Fixed Button Container with Proper Centering */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Connect Wallet Button */}
            <div className="flex justify-center">
              <WalletConnect />
            </div>

            {/* Learn More Button with Consistent Styling */}
            <button
              onClick={() => scrollToSection("features")}
              className={`px-8 py-4 border-2 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 ${darkMode
                ? "border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white shadow-lg shadow-emerald-500/20"
                : "border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-lg shadow-emerald-500/20"
                }`}
            >
              Learn More
            </button>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer
        className={`py-16 px-6 transition-colors duration-500 ${darkMode
          ? "text-slate-400 bg-slate-950 border-t border-slate-800"
          : "text-slate-600 bg-white border-t border-slate-200"
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3
                className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-slate-900"
                  }`}
              >
                MedChain
              </h3>
              <p className="text-sm">
                Securing global healthcare with blockchain technology.
              </p>
            </div>
            <div>
              <h4
                className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-slate-900"
                  }`}
              >
                Product
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Mobile App
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-slate-900"
                  }`}
              >
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-slate-900"
                  }`}
              >
                Support
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 text-center text-sm">
            © {new Date().getFullYear()} MedChain — Built at ETHGlobal Hackathon
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style>{`
        @keyframes capsuleMove {
          0% { 
            transform: translateX(28em) rotateZ(-90deg) scale(1);
            filter: hue-rotate(0deg);
          }
          25% { 
            transform: translateX(14em) rotateZ(-90deg) scale(1.1);
            filter: hue-rotate(90deg);
          }
          50% { 
            transform: translateX(0em) rotateZ(-90deg) scale(1);
            filter: hue-rotate(180deg);
          }
          75% { 
            transform: translateX(-14em) rotateZ(-90deg) scale(1.1);
            filter: hue-rotate(270deg);
          }
          100% { 
            transform: translateX(-28em) rotateZ(-90deg) scale(1);
            filter: hue-rotate(360deg);
          }
        }
        
        @keyframes floatParticle1 {
          0% { transform: translate(25em, 5em) scale(0); opacity: 0; }
          20% { opacity: 0.6; }
          50% { transform: translate(0em, -2em) scale(1); opacity: 0.8; }
          80% { opacity: 0.4; }
          100% { transform: translate(-30em, 3em) scale(0); opacity: 0; }
        }
        
        @keyframes floatParticle2 {
          0% { transform: translate(28em, -3em) scale(0); opacity: 0; }
          25% { opacity: 0.6; }
          50% { transform: translate(2em, 4em) scale(1); opacity: 0.8; }
          75% { opacity: 0.4; }
          100% { transform: translate(-32em, -1em) scale(0); opacity: 0; }
        }
        
        @keyframes floatParticle3 {
          0% { transform: translate(26em, 1em) scale(0); opacity: 0; }
          30% { opacity: 0.6; }
          50% { transform: translate(-1em, -3em) scale(1); opacity: 0.8; }
          70% { opacity: 0.4; }
          100% { transform: translate(-33em, 2em) scale(0); opacity: 0; }
        }
        
        @keyframes floatParticle4 {
          0% { transform: translate(29em, -1em) scale(0); opacity: 0; }
          35% { opacity: 0.6; }
          50% { transform: translate(1em, 2em) scale(1); opacity: 0.8; }
          65% { opacity: 0.4; }
          100% { transform: translate(-31em, -2em) scale(0); opacity: 0; }
        }
        
        @keyframes scrollIndicator {
          0% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.5; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes qrFloat {
          0% { transform: translateX(-50%) translateY(0px) rotate(0deg); }
          25% { transform: translateX(-50%) translateY(-8px) rotate(1deg); }
          50% { transform: translateX(-50%) translateY(0px) rotate(0deg); }
          75% { transform: translateX(-50%) translateY(-8px) rotate(-1deg); }
          100% { transform: translateX(-50%) translateY(0px) rotate(0deg); }
        }

        @keyframes qrBlink {
          0%, 85%, 100% { transform: scaleY(1); }
          87%, 93% { transform: scaleY(0.1); }
        }

        @keyframes qrSparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        .animate-capsuleMove {
          animation: capsuleMove 4s ease-out infinite;
        }
        
        .animate-floatParticle1 {
          animation: floatParticle1 4s ease-out infinite;
          animation-delay: 0.5s;
        }
        
        .animate-floatParticle2 {
          animation: floatParticle2 4s ease-out infinite;
          animation-delay: 0.8s;
        }
        
        .animate-floatParticle3 {
          animation: floatParticle3 4s ease-out infinite;
          animation-delay: 1.2s;
        }
        
        .animate-floatParticle4 {
          animation: floatParticle4 4s ease-out infinite;
          animation-delay: 1.6s;
        }
        
        .animate-scrollIndicator {
          animation: scrollIndicator 2s ease-in-out infinite;
        }

        .animate-qrFloat {
          animation: qrFloat 6s ease-in-out infinite;
        }

        .animate-qrBlink {
          animation: qrBlink 4s ease-in-out infinite;
        }

        .animate-qrSparkle {
          animation: qrSparkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
