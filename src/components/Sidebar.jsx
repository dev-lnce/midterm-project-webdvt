import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Home, PieChart, Plus, Sun, Moon } from 'lucide-react';

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="hidden lg:flex flex-col h-screen fixed left-0 top-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300 z-20 justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-10">
          <img
            src="/logo.png"
            alt="DEVit"
            className="w-10 h-10 object-contain rounded-lg shadow-sm"
          />
          <h1 className="text-2xl font-black tracking-tight text-[#328B56] leading-none">
            DEVit
          </h1>
        </div>

        {/* Main Navigation */}
        <div className="space-y-2">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-out active:scale-[0.98] font-medium ${
              isActive('/')
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
            }`}
          >
            <Home size={20} />
            Dashboard
          </Link>

          <Link
            to="/summary"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-out active:scale-[0.98] font-medium ${
              isActive('/summary')
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
            }`}
          >
            <PieChart size={20} />
            Summary
          </Link>
        </div>
      </div>

      {/* Footer Controls & CTA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Theme</span>
          <button
            onClick={toggleTheme}
            className="w-14 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center p-1 transition-colors relative"
            aria-label="Toggle theme"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 absolute ${
                theme === 'dark' ? 'translate-x-6 bg-slate-700' : 'translate-x-0 bg-white shadow-sm'
              }`}
            >
              {theme === 'dark' ? <Moon size={12} className="text-slate-300" /> : <Sun size={12} className="text-amber-500" />}
            </div>
          </button>
        </div>

        <Link
          to="/add"
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-medium py-3 rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all duration-200 ease-out active:scale-[0.98]"
        >
          <Plus size={18} />
          New Transaction
        </Link>
      </div>
    </nav>
  );
}
