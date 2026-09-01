import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Helper function to check if a route is active
  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex bg-background text-on-background min-h-screen overflow-hidden dark:bg-inverse-surface dark:text-inverse-on-surface">
      
      {/* Desktop SideNavBar */}
      <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 w-[280px] bg-primary-container border-r border-outline-variant shadow-md z-20 dark:bg-surface-variant dark:border-outline">
        <div className="px-6 py-8">
          <h1 className="font-headline-lg text-headline-lg text-white dark:text-on-surface">Vitality Finance</h1>
          <p className="font-label-sm text-label-sm text-primary-fixed-dim mt-1 dark:text-on-surface-variant">Midterm Project</p>
        </div>

        <div className="flex-1 px-2 mt-4 space-y-2">
          {/* Navigation Links */}
          <Link 
            to="/" 
            className={`flex items-center gap-3 px-4 py-3 font-label-md text-label-md rounded-r-lg transition-transform active:scale-[0.98] ${
              isActive('/') 
                ? 'border-l-4 border-white bg-white/10 text-white font-bold dark:border-primary dark:bg-primary/20 dark:text-primary' 
                : 'text-white/70 hover:text-white hover:bg-white/5 dark:text-on-surface-variant dark:hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={isActive('/') ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
            Dashboard
          </Link>
          
          <Link 
            to="/summary" 
            className={`flex items-center gap-3 px-4 py-3 font-label-md text-label-md rounded-r-lg transition-transform active:scale-[0.98] ${
              isActive('/summary') 
                ? 'border-l-4 border-white bg-white/10 text-white font-bold dark:border-primary dark:bg-primary/20 dark:text-primary' 
                : 'text-white/70 hover:text-white hover:bg-white/5 dark:text-on-surface-variant dark:hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={isActive('/summary') ? { fontVariationSettings: "'FILL' 1" } : {}}>query_stats</span>
            Summary
          </Link>

          <Link 
            to="/add" 
            className={`flex items-center gap-3 px-4 py-3 font-label-md text-label-md rounded-r-lg transition-transform active:scale-[0.98] ${
              isActive('/add') 
                ? 'border-l-4 border-white bg-white/10 text-white font-bold dark:border-primary dark:bg-primary/20 dark:text-primary' 
                : 'text-white/70 hover:text-white hover:bg-white/5 dark:text-on-surface-variant dark:hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={isActive('/add') ? { fontVariationSettings: "'FILL' 1" } : {}}>add_circle</span>
            Add Transaction
          </Link>
        </div>

        {/* Theme Toggle & Add Button */}
        <div className="p-6 space-y-4">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 bg-surface-container text-on-surface font-label-md text-label-md py-3 rounded-lg shadow-sm hover:bg-surface-variant transition-colors active:scale-95 dark:bg-inverse-on-surface dark:text-inverse-surface"
          >
            <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <Link 
            to="/add"
            className="w-full flex items-center justify-center gap-2 bg-primary-fixed text-on-primary-container font-label-md text-label-md py-3 rounded-lg shadow-sm hover:bg-primary-fixed-dim transition-colors active:scale-95 dark:bg-primary dark:text-on-primary"
          >
            <span className="material-symbols-outlined">add</span>
            New Transaction
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-[280px] w-full max-w-[1440px] mx-auto overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom NavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-16 bg-surface/80 backdrop-blur-md rounded-t-xl border-t border-outline-variant shadow-lg dark:bg-inverse-surface/90 dark:border-outline">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-transform duration-150 active:scale-90 ${
            isActive('/') ? 'bg-secondary-container text-on-secondary-container dark:bg-primary dark:text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant dark:text-inverse-on-surface'
          }`}
        >
          <span className="material-symbols-outlined" style={isActive('/') ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
          <span className={`font-label-sm-mobile text-[10px] mt-0.5 ${isActive('/') ? 'hidden' : 'block'}`}>Home</span>
        </Link>
        
        <Link 
          to="/summary" 
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-transform duration-150 active:scale-90 ${
            isActive('/summary') ? 'bg-secondary-container text-on-secondary-container dark:bg-primary dark:text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant dark:text-inverse-on-surface'
          }`}
        >
          <span className="material-symbols-outlined" style={isActive('/summary') ? { fontVariationSettings: "'FILL' 1" } : {}}>query_stats</span>
          <span className={`font-label-sm-mobile text-[10px] mt-0.5 ${isActive('/summary') ? 'hidden' : 'block'}`}>Summary</span>
        </Link>
        
        <Link 
          to="/add" 
          className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-transform duration-150 active:scale-90 ${
            isActive('/add') ? 'bg-secondary-container text-on-secondary-container dark:bg-primary dark:text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant dark:text-inverse-on-surface'
          }`}
        >
          <span className="material-symbols-outlined" style={isActive('/add') ? { fontVariationSettings: "'FILL' 1" } : {}}>add_circle</span>
          <span className={`font-label-sm-mobile text-[10px] mt-0.5 ${isActive('/add') ? 'hidden' : 'block'}`}>Add</span>
        </Link>
      </nav>
    </div>
  );
}
