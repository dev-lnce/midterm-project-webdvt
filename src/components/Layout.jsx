import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Home, PieChart, Plus, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const hideBottomNav = location.pathname === '/add' || location.pathname.startsWith('/transaction');

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
      
      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-40 flex items-center justify-between px-4 border-b border-slate-200/50 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DEVit" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
          <h1 className="text-2xl font-black tracking-tight text-[#328B56] leading-none">DEVit</h1>
        </div>
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} className="text-emerald-400" /> : <Moon size={18} className="text-emerald-700" />}
        </button>
      </header>

      {/* Desktop SideNavBar (lg and up) */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 w-full flex flex-col min-h-screen">
        <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8 lg:p-10 pt-20 lg:pt-10 pb-28 lg:pb-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom NavBar */}
      {!hideBottomNav && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-around z-50 transition-colors duration-300 pb-safe">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 active:scale-[0.98] ${
            isActive('/') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className={`flex items-center justify-center w-10 h-8 rounded-full transition-colors ${isActive('/') ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''}`}>
            <Home size={22} className={isActive('/') ? 'fill-emerald-600/20 dark:fill-emerald-400/20' : ''} />
          </div>
          <span className="text-[10px] font-medium mt-1">Home</span>
        </Link>
        
        <Link 
          to="/add" 
          className="flex flex-col items-center justify-center -mt-6"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-all active:scale-[0.98] border-4 border-slate-50 dark:border-slate-950">
            <Plus size={24} />
          </div>
        </Link>
        
        <Link 
          to="/summary" 
          className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 active:scale-[0.98] ${
            isActive('/summary') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className={`flex items-center justify-center w-10 h-8 rounded-full transition-colors ${isActive('/summary') ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''}`}>
            <PieChart size={22} className={isActive('/summary') ? 'fill-emerald-600/20 dark:fill-emerald-400/20' : ''} />
          </div>
          <span className="text-[10px] font-medium mt-1">Summary</span>
        </Link>
      </nav>
      )}
    </div>
  );
}
