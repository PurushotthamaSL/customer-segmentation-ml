import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Sparkles,
  Database,
  CircleDot,
  User,
  Activity,
  Layers
} from 'lucide-react';

interface TopNavProps {
  onOpenSidebar: () => void;
}

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Overview Dashboard',
    subtitle: 'Real-time customer segmentation intelligence & macroeconomic KPIs',
  },
  '/segmentation': {
    title: 'Customer Segmentation',
    subtitle: 'Unsupervised K-Means clustering with feature standardization & live projections',
  },
  '/customers': {
    title: 'Customer Explorer',
    subtitle: 'Searchable customer matrix, multi-criteria filtering, and individual intelligence',
  },
  '/profiles': {
    title: 'Segment Behavioral Profiles',
    subtitle: 'Statistical centroid profiling, distinguishing traits, and editable business labels',
  },
  '/insights': {
    title: 'Strategic Business Insights',
    subtitle: 'Transparent rule-based marketing playbooks, channels, and demographic cohorts',
  },
  '/model-lab': {
    title: 'Model Evaluation Lab',
    subtitle: 'Inertia (Elbow Method) and Silhouette Score validation across K values',
  },
  '/dataset': {
    title: 'Dataset Management',
    subtitle: 'Data integrity audit, custom CSV upload, and Kaggle Mall Customers baseline',
  },
  '/about': {
    title: 'About Project & Academic Guide',
    subtitle: 'System architecture, mathematical foundations, and final-year AIML viva questions',
  },
};

export const TopNav: React.FC<TopNavProps> = ({ onOpenSidebar }) => {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || {
    title: 'CustomerLens AI',
    subtitle: 'Customer Segmentation & Intelligent Analytics Platform',
  };

  return (
    <header className="sticky top-0 z-30 h-20 w-full glass-topbar px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl glass-button-secondary text-lavender hover:text-white transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>{meta.title}</span>
          </h1>
          <p className="text-xs text-lavender hidden sm:block">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Dataset badge + Train action + Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Kaggle Dataset Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card text-xs">
          <CircleDot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Kaggle Mall Data</span>
          <span className="text-lavender">• 200 records</span>
        </div>

        {/* Quick Action Button */}
        <Link
          to="/segmentation"
          className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-button-primary text-white flex items-center gap-1.5 transition active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Train Model</span>
          <span className="sm:hidden">Train</span>
        </Link>

        {/* User / Analyst Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.1]">
          <div className="w-9 h-9 rounded-xl p-[1px] bg-gradient-to-tr from-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(139,92,246,0.25)]">
            <div className="w-full h-full bg-[#080B18] rounded-[11px] flex items-center justify-center">
              <span className="text-xs font-bold text-purple-300">ML</span>
            </div>
          </div>
          <div className="hidden xl:block text-left text-xs">
            <p className="font-semibold text-white leading-none">Analyst</p>
            <p className="text-[10px] text-lavender leading-none mt-1">Portfolio Suite</p>
          </div>
        </div>
      </div>
    </header>
  );
};
