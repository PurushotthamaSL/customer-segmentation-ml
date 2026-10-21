import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users2,
  TableProperties,
  Sparkles,
  FlaskConical,
  Database,
  Info,
  Layers,
  CircleDot,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { fetchHealth, fetchModelStatus } from '../services/api';
import { HealthStatus, ModelMetadata } from '../types';

export const Navbar: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [model, setModel] = useState<ModelMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = async () => {
    try {
      const h = await fetchHealth();
      setHealth(h);
      const m = await fetchModelStatus();
      setModel(m);
    } catch {
      // Ignore initial silent poll
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/segmentation', label: 'Segmentation', icon: Users2 },
    { to: '/customers', label: 'Explorer', icon: TableProperties },
    { to: '/profiles', label: 'Segment Profiles', icon: Layers },
    { to: '/insights', label: 'Business Insights', icon: Sparkles },
    { to: '/model-lab', label: 'Model Lab', icon: FlaskConical },
    { to: '/dataset', label: 'Dataset', icon: Database },
    { to: '/about', label: 'About Project', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070a13]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090D16] rounded-[11px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-purple-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
                  CustomerLens
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Customer Segmentation & ML Analytics</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Status Badges */}
          <div className="flex items-center gap-3">
            {health?.dataset_available ? (
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
                <CircleDot className="w-3 h-3 animate-pulse text-emerald-400" />
                <span>Kaggle Mall Data</span>
                {model && <span className="text-slate-500">• K={model.n_clusters}</span>}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400">
                <CircleDot className="w-3 h-3 text-amber-400" />
                <span>Dataset Required</span>
              </div>
            )}

            <Link
              to="/segmentation"
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Train Model</span>
            </Link>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scroll */}
        <div className="lg:hidden flex items-center gap-1 py-2 overflow-x-auto no-scrollbar border-t border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </header>
  );
};
