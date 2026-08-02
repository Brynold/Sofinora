import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from './router';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ToolGrid from './components/ToolGrid';
import HomeHero from './components/HomeHero';
import Seo from './components/Seo';
import ScrollToTopOnNavigation from './components/ScrollToTopOnNavigation';
import FeedbackLauncher from './components/FeedbackLauncher';
import CookieConsent from './components/CookieConsent';
import InvestmentVideo from './components/InvestmentVideo';

const CAGRCalculator = lazy(() => import('./pages/CAGRCalculator'));
const IRRCalculator = lazy(() => import('./pages/IRRCalculator'));
const RDCalculator = lazy(() => import('./pages/RDCalculator'));
const SIPCalculator = lazy(() => import('./pages/SIPCalculator'));
const NSCCalculator = lazy(() => import('./pages/NSCCalculator'));
const FDCalculator = lazy(() => import('./pages/FDCalculator'));
const HRACalculator = lazy(() => import('./pages/HRACalculator'));
const MFCalculator = lazy(() => import('./pages/MFCalculator'));
const GoalSIPCalculator = lazy(() => import('./pages/GoalSIPCalculator'));
const SSYCalculator = lazy(() => import('./pages/SSYCalculator'));
const RetirementCalculator = lazy(() => import('./pages/RetirementCalculator'));
const NPSCalculator = lazy(() => import('./pages/NPSCalculator'));
const EMICalculator = lazy(() => import('./pages/EMICalculator'));
const PPFCalculator = lazy(() => import('./pages/PPFCalculator'));
const InflationCalculator = lazy(() => import('./pages/InflationCalculator'));
const EmergencyFundCalculator = lazy(() => import('./pages/EmergencyFundCalculator'));
const NetWorthTracker = lazy(() => import('./pages/NetWorthTracker'));
const SecureYourFuture = lazy(() => import('./pages/SecureYourFuture'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const StarterPackPage = lazy(() => import('./pages/StarterPackPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const IncomeTaxCalculator = lazy(() => import('./pages/IncomeTaxCalculator'));
const StepUpSIPCalculator = lazy(() => import('./pages/StepUpSIPCalculator'));
const HomeLoanPrepaymentCalculator = lazy(() => import('./pages/HomeLoanPrepaymentCalculator'));
const SWPCalculator = lazy(() => import('./pages/SWPCalculator'));
const YouTubeEarningsCalculator = lazy(() => import('./pages/YouTubeEarningsCalculator'));

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="relative min-h-screen overflow-x-clip bg-slate-100 dark:bg-slate-950">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(45,212,191,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(15,118,110,0.14),_transparent_26%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:44px_44px] dark:[background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]" />

          <div className="relative z-10 flex min-h-screen flex-col">
            <Seo />
            <ScrollToTopOnNavigation />
            <Header />
            <main className="mx-auto flex min-w-0 w-full max-w-7xl flex-grow px-3 pb-8 pt-[4.5rem] sm:px-6 sm:pb-10 sm:pt-20 lg:px-8 lg:pt-24">
              <Suspense fallback={<div className="flex min-h-[55vh] w-full items-center justify-center" role="status"><div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">Loading your planning tool…</div></div>}>
              <Routes>
                <Route path="/" element={
                  <div className="w-full space-y-10">
                    <HomeHero />
                    <InvestmentVideo />
                    <ToolGrid />
                  </div>
                } />
                <Route path="/secure-your-future" element={<SecureYourFuture />} />
                <Route path="/starter-pack" element={<StarterPackPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/calculators/cagr" element={<CAGRCalculator />} />
                <Route path="/calculators/irr" element={<IRRCalculator />} />
                <Route path="/calculators/rd" element={<RDCalculator />} />
                <Route path="/calculators/sip" element={<SIPCalculator />} />
                <Route path="/calculators/nsc" element={<NSCCalculator />} />
                <Route path="/calculators/fd" element={<FDCalculator />} />
                <Route path="/calculators/hra" element={<HRACalculator />} />
                <Route path="/calculators/mf" element={<MFCalculator />} />
                <Route path="/calculators/goal-sip" element={<GoalSIPCalculator />} />
                <Route path="/calculators/ssy" element={<SSYCalculator />} />
                <Route path="/calculators/retirement" element={<RetirementCalculator />} />
                <Route path="/calculators/nps" element={<NPSCalculator />} />
                <Route path="/calculators/emi" element={<EMICalculator />} />
                <Route path="/calculators/ppf" element={<PPFCalculator />} />
                <Route path="/calculators/inflation" element={<InflationCalculator />} />
                <Route path="/calculators/emergency-fund" element={<EmergencyFundCalculator />} />
                <Route path="/calculators/net-worth" element={<NetWorthTracker />} />
                <Route path="/calculators/income-tax" element={<IncomeTaxCalculator />} />
                <Route path="/calculators/step-up-sip" element={<StepUpSIPCalculator />} />
                <Route path="/calculators/home-loan-prepayment" element={<HomeLoanPrepaymentCalculator />} />
                <Route path="/calculators/swp" element={<SWPCalculator />} />
                <Route path="/calculators/youtube-earnings" element={<YouTubeEarningsCalculator />} />
                <Route path="/about" element={<InfoPage type="about" />} />
                <Route path="/methodology" element={<InfoPage type="methodology" />} />
                <Route path="/privacy" element={<InfoPage type="privacy" />} />
                <Route path="/terms" element={<InfoPage type="terms" />} />
                <Route path="/disclosure" element={<InfoPage type="disclosure" />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </main>
            <Footer />
            <FeedbackLauncher />
            <CookieConsent />
            
            {/* Scroll to top button */}
            <ScrollToTop threshold={400} />
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
