import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, User, LogOut, Settings, WifiOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { logoutThunk } from '../../store/authSlice';

export default function Navbar({ user, isConnected, onSearch, onToggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initials = (user?.display_name || user?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  return (
    <div className="relative z-30">
      <header className="glass animate-fade-in flex items-center gap-4 rounded-2xl px-4 py-3">
        {/* Mobile menu toggle */}
        <button
          id="sidebar-toggle"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link to="/" className="hidden items-center gap-2 lg:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
            <span className="text-xs font-bold text-white">D</span>
          </div>
          <span className="text-sm font-bold gradient-text">DakX</span>
        </Link>

        {/* Search */}
        <div className="relative flex-1 lg:max-w-md lg:mx-auto">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            id="search-input"
            type="search"
            placeholder="Search mail..."
            onChange={(event) => onSearch(event.target.value)}
            className="glass-input w-full rounded-xl py-2.5 pl-10 text-sm"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="hidden items-center gap-1.5 sm:flex" title={isConnected ? 'Realtime active' : 'Reconnecting...'}>
            {isConnected ? (
              <>
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                </div>
                <span className="text-xs text-emerald-400">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs text-amber-400">Offline</span>
              </>
            )}
          </div>

          {/* User avatar — triggers dropdown positioned OUTSIDE the glass header */}
          <button
            id="user-menu-button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white transition-shadow hover:shadow-glow"
          >
            {initials}
          </button>
        </div>
      </header>

      {/* Dropdown rendered OUTSIDE the glass header so backdrop-filter doesn't clip it */}
      {dropdownOpen && (
        <div ref={dropdownRef} className="absolute right-4 top-full mt-2 z-50">
          <div className="glass-card animate-slide-down w-56 rounded-xl p-2 shadow-glass">
            <div className="mb-2 border-b border-white/5 px-3 py-2">
              <p className="text-sm font-medium text-white">{user?.display_name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <Link
              to="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <Link
              to="/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              id="logout-button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
