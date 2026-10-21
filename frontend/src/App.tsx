import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastProvider } from './components/ToastContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { OverviewPage } from './pages/OverviewPage';
import { SegmentationPage } from './pages/SegmentationPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { SegmentProfilesPage } from './pages/SegmentProfilesPage';
import { InsightsPage } from './pages/InsightsPage';
import { ModelLabPage } from './pages/ModelLabPage';
import { DatasetPage } from './pages/DatasetPage';
import { AboutPage } from './pages/AboutPage';
import { ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#080B18] text-white flex relative overflow-x-hidden selection:bg-purple-600 selection:text-white">
          {/* Ambient Gradient Orbs (Background Glow) */}
          <div className="ambient-orb-1" />
          <div className="ambient-orb-2" />
          <div className="ambient-orb-3" />
          <div className="ambient-orb-4" />

          {/* Frosted Glass Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main Content Area (offset by sidebar width on large screens) */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative z-10">
            {/* Frosted Glass Top Navigation */}
            <TopNav onOpenSidebar={() => setSidebarOpen(true)} />

            {/* Page Content Canvas */}
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/segmentation" element={<SegmentationPage />} />
                <Route path="/customers" element={<ExplorerPage />} />
                <Route path="/profiles" element={<SegmentProfilesPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/model-lab" element={<ModelLabPage />} />
                <Route path="/dataset" element={<DatasetPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Frosted Footer */}
            <footer className="border-t border-white/[0.08] glass-topbar py-5 px-4 sm:px-6 lg:px-8 text-xs text-lavender mt-auto">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white">CustomerLens AI</span>
                  <span>•</span>
                  <span>Customer Segmentation & Intelligent Analytics Platform</span>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="https://www.kaggle.com/datasets/vjchoudhary7/customer-segmentation-tutorial-in-python"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-purple-300 flex items-center gap-1 transition"
                  >
                    <span>Kaggle Mall Customers</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <Link to="/about" className="hover:text-purple-300 transition">
                    Academic Viva Guide
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
