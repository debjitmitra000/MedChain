import React, { useEffect } from 'react';
import { useRole } from '../hooks/useRole';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ShieldCheck, Layers, FileText, Activity, Check } from 'lucide-react';

// --- Global Styles Component ---
// This component injects a <style> tag with all the necessary CSS for the page.
const PageStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    .landing-page-container {
      background-color: #f8fafc;
      font-family: 'Inter', sans-serif;
      color: #1e293b;
    }

    .container {
      width: 100%;
      max-width: 80rem; /* 1280px */
      margin-left: auto;
      margin-right: auto;
      padding-left: 1.5rem; /* 24px */
      padding-right: 1.5rem; /* 24px */
    }

    /* Header */
    .header {
      position: sticky;
      top: 0;
      z-index: 50;
      background-color: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #e2e8f0;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
    .header-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }
    .header-nav {
      display: none; /* Hidden on mobile */
    }
    @media (min-width: 768px) {
      .header-nav {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        color: #475569;
        font-weight: 500;
      }
      .header-nav a:hover {
        color: #4f46e5;
        transition: color 0.2s;
      }
    }
    .connect-wallet-btn {
      background-color: #4f46e5;
      color: white;
      font-weight: 600;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      transition: all 0.2s;
    }
    .connect-wallet-btn:hover {
      background-color: #4338ca;
    }

    /* Hero Section */
    .hero-section {
      background-image: radial-gradient(circle at top, rgba(79, 70, 229, 0.05), transparent 40%);
    }
    .hero-content {
      padding-top: 6rem;
      padding-bottom: 5rem;
      text-align: center;
    }
    .hero-title {
      font-size: 2.25rem; /* 36px */
      line-height: 2.5rem; /* 40px */
      font-weight: 800;
      color: #0f172a;
    }
    @media (min-width: 768px) {
      .hero-title {
        font-size: 3.75rem; /* 60px */
        line-height: 1;
      }
    }
    .hero-title .text-gradient {
      background: linear-gradient(to right, #4f46e5, #0ea5e9);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .hero-description {
      margin-top: 1.5rem;
      max-width: 48rem;
      margin-left: auto;
      margin-right: auto;
      font-size: 1.125rem; /* 18px */
      line-height: 1.75rem; /* 28px */
      color: #475569;
    }
    .hero-button {
      margin-top: 2.5rem;
    }
    .hero-button button {
      background-color: #4f46e5;
      color: white;
      font-weight: 700;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-size: 1.125rem;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      transition: all 0.2s;
    }
    .hero-button button:hover {
      background-color: #4338ca;
    }

    /* Sections */
    .section {
      padding-top: 5rem;
      padding-bottom: 5rem;
    }
    .section-white {
      background-color: white;
    }
    .section-header {
      text-align: center;
    }
    .section-header .tagline {
      font-size: 0.875rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #4f46e5;
      letter-spacing: 0.05em;
    }
    .section-header .title {
      margin-top: 0.5rem;
      font-size: 2.25rem;
      font-weight: 700;
      color: #0f172a;
    }
    @media (min-width: 768px) {
      .section-header .title {
        font-size: 3rem;
      }
    }
    .section-header .description {
      margin-top: 1rem;
      max-width: 42rem;
      margin-left: auto;
      margin-right: auto;
      color: #475569;
    }
    
    /* Stat Cards */
    .stats-grid {
      margin-top: 3rem;
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 2rem;
    }
    @media (min-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .stat-card {
      background-color: white;
      padding: 2rem;
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      border: 1px solid #f1f5f9;
      text-align: center;
    }
    .stat-card .value {
      font-size: 3rem;
      font-weight: 800;
      color: #ef4444;
    }
    .stat-card .title {
      margin-top: 0.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }
    .stat-card .description {
      margin-top: 0.25rem;
      color: #475569;
    }

    /* Solution Cards */
    .solution-grid {
      margin-top: 4rem;
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 2.5rem;
    }
    @media (min-width: 768px) {
      .solution-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .solution-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    .solution-card .icon-wrapper {
      background-color: #e0e7ff;
      color: #4f46e5;
      padding: 0.75rem;
      border-radius: 0.5rem;
      flex-shrink: 0;
    }
    .solution-card .title {
      font-weight: 700;
      font-size: 1.125rem;
      color: #0f172a;
    }
    .solution-card .description {
      margin-top: 0.25rem;
      color: #475569;
    }

    /* Features Section */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 4rem;
      align-items: center;
    }
    @media (min-width: 1024px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .feature-list {
      margin-top: 2rem;
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .feature-list-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    .feature-list-item .icon-wrapper {
      background-color: #dcfce7;
      color: #16a34a;
      padding: 0.5rem;
      border-radius: 9999px;
      margin-top: 0.25rem;
      flex-shrink: 0;
    }
    .feature-list-item .title {
      font-weight: 600;
      color: #1e293b;
    }
    .feature-list-item .description {
      color: #475569;
    }
    .features-image-wrapper {
      background-color: #f1f5f9;
      padding: 2rem;
      border-radius: 1rem;
      display: none;
    }
    @media (min-width: 1024px) {
      .features-image-wrapper {
        display: block;
      }
    }
    .features-image-wrapper img {
      border-radius: 0.75rem;
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    }
    
    /* Footer */
    .footer {
      background-color: #0f172a;
      color: #94a3b8;
    }
    .footer-content {
      padding-top: 3rem;
      padding-bottom: 3rem;
      text-align: center;
    }
    .footer .copyright {
      font-size: 1rem;
    }
    .footer .tagline {
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }
  `}</style>
);

// --- Animation Component ---
const FadeInWhenVisible = ({ children, className = '' }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.6, ease: 'easeOut' }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 20 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// --- Sub-Components for the Landing Page ---

const Header = ({ onConnect }) => (
  <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e2e8f0' }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', paddingBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <ShieldCheck style={{ color: '#4f46e5', height: '2rem', width: '2rem' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>MedChain</h1>
      </div>
      <nav style={{ display: 'none' }} className="md-nav">
        <a href="#problem" style={{ color: '#475569', fontWeight: 500, transition: 'color 0.2s' }}>The Problem</a>
        <a href="#solution" style={{ color: '#475569', fontWeight: 500, transition: 'color 0.2s' }}>Our Solution</a>
        <a href="#features" style={{ color: '#475569', fontWeight: 500, transition: 'color 0.2s' }}>Features</a>
      </nav>
      <motion.button
        onClick={onConnect}
        className="connect-wallet-btn"
        whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(79, 70, 229, 0.5)" }}
        whileTap={{ scale: 0.95 }}
      >
        Connect Wallet
      </motion.button>
    </div>
    <style>{`
      @media (min-width: 768px) {
        .md-nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .md-nav a:hover {
          color: #4f46e5;
        }
      }
    `}</style>
  </header>
);

const HeroSection = ({ onConnect }) => (
  <main className="hero-section">
    <section className="container hero-content">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hero-title"
      >
        Trust in Every Dose. <br style={{ display: 'none' }} className="md-br"/>
        <span className="text-gradient">
          Verified on the Blockchain.
        </span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hero-description"
      >
        MedChain is a revolutionary platform ensuring the authenticity of pharmaceuticals from manufacturer to patient. We leverage blockchain technology and the power of Yellow Network for instant, gasless, and secure medicine verification.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="hero-button"
      >
        <motion.button
          onClick={onConnect}
          whileHover={{ boxShadow: "0 0 20px rgba(79, 70, 229, 0.6)", transform: 'scale(1.05)' }}
          whileTap={{ scale: 0.95 }}
        >
          Enter Application & Verify Medicine
        </motion.button>
      </motion.div>
    </section>
    <style>{`
      @media (min-width: 768px) {
        .md-br { display: inline; }
      }
    `}</style>
  </main>
);

const StatCard = ({ value, title, description }) => (
    <div className="stat-card">
        <h4 className="value">{value}</h4>
        <p className="title">{title}</p>
        <p className="description">{description}</p>
    </div>
);

const SolutionCard = ({ icon: Icon, title, children }) => (
    <div className="solution-card">
        <div className="icon-wrapper"><Icon size={24} /></div>
        <div>
            <h4 className="title">{title}</h4>
            <p className="description">{children}</p>
        </div>
    </div>
);

const FeatureListItem = ({ children, title }) => (
    <li className="feature-list-item">
        <div className="icon-wrapper"><Check size={20} /></div>
        <div>
            <h4 className="title">{title}</h4>
            <p className="description">{children}</p>
        </div>
    </li>
);


// --- Main Landing Page Component ---
export default function LandingPage() {
  const { connectWallet } = useRole();

  return (
    <div className="landing-page-container">
      <PageStyles />
      <Header onConnect={connectWallet} />
      <HeroSection onConnect={connectWallet} />

      <FadeInWhenVisible>
        <section id="problem" className="container section">
          <div className="section-header">
            <h2 className="tagline">THE PROBLEM</h2>
            <h3 className="title">A Critical Threat to Global Health</h3>
            <p className="description">Counterfeit medicines are a silent pandemic, causing irreparable harm and eroding trust in our healthcare systems.</p>
          </div>
          <div className="stats-grid">
            <StatCard value="1M+" title="Lives Lost Annually" description="Fake and substandard drugs are a leading cause of preventable deaths worldwide." />
            <StatCard value="$200B" title="Global Black Market" description="An industry built on fraud, funding criminal networks and endangering patients." />
            <StatCard value="42%" title="Of Medicines in Africa" description="Are estimated to be counterfeit, creating a massive public health crisis." />
          </div>
        </section>
      </FadeInWhenVisible>
      
      <FadeInWhenVisible>
        <section id="solution" className="section section-white">
          <div className="container">
            <div className="section-header">
              <h2 className="tagline">OUR SOLUTION</h2>
              <h3 className="title">A Hybrid Approach to Certainty</h3>
              <p className="description">MedChain combines the immutable security of the blockchain with the lightning-fast performance of state channels to create a verification system built for the real world.</p>
            </div>
            <div className="solution-grid">
              <SolutionCard icon={Layers} title="On-Chain Registry">
                Every medicine batch is registered as a unique asset on the Ethereum blockchain, creating a permanent, tamper-proof record of authenticity.
              </SolutionCard>
              <SolutionCard icon={FileText} title="Powered by Yellow Network">
                For day-to-day verification, we use Yellow Network's state channels. This allows for instant, gasless transactions, making verification fast and free for users.
              </SolutionCard>
              <SolutionCard icon={Activity} title="Real-Time Traceability">
                Gain unprecedented visibility into the supply chain. Track verification patterns, receive alerts for expired scans, and optimize distribution with confidence.
              </SolutionCard>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>
      
      <FadeInWhenVisible>
        <section id="features" className="container section">
          <div className="features-grid">
            <div>
              <h2 className="tagline">BUILT FOR EVERYONE</h2>
              <h3 className="title" style={{ marginTop: '0.5rem' }}>A Safer Supply Chain for All</h3>
              <p style={{ marginTop: '1rem', color: '#475569' }}>MedChain provides tailored benefits for every stakeholder, from global manufacturers to individual patients.</p>
              <ul className="feature-list">
                <FeatureListItem title="For Manufacturers">
                  Protect your brand, prevent revenue loss from counterfeits, and manage batch lifecycles with an easy-to-use dashboard and instant recall capabilities.
                </FeatureListItem>
                <FeatureListItem title="For Pharmacies & Hospitals">
                  Verify authenticity at the point of care in less than a second. Eliminate doubt, ensure compliance, and protect patients with zero operational costs.
                </FeatureListItem>
                <FeatureListItem title="For Patients & Regulators">
                  Empower yourself with the ability to verify your own medicine using a simple QR scan. Provide regulators with a transparent and auditable trail.
                </FeatureListItem>
              </ul>
            </div>
            <div className="features-image-wrapper">
              <motion.img 
                src="https://placehold.co/600x500/e0e7ff/4f46e5?text=MedChain+Dashboard" 
                alt="MedChain Dashboard UI" 
                style={{ borderRadius: '0.75rem', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              />
            </div>
          </div>
        </section>
      </FadeInWhenVisible>
    
      <footer className="footer">
        <div className="container footer-content">
          <p className="copyright">&copy; 2025 MedChain. All rights reserved.</p>
          <p className="tagline">Securing the future of medicine, powered by blockchain technology.</p>
        </div>
      </footer>
    </div>
  );
}

