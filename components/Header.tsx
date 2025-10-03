import React from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useSearch } from '../contexts/SearchContext';

const Header: React.FC = () => {
  const { searchResult } = useSearch();

  const linkStyle = "px-3 py-2 rounded-md text-sm font-medium text-charcoal-text dark:text-ivory-text-dim hover:text-emerald-dark dark:hover:text-white hover:bg-emerald-primary/20 dark:hover:bg-emerald-primary/60 transition-colors";
  const activeLinkStyle = "bg-emerald-primary text-white dark:text-white";
  const disabledLinkStyle = "opacity-50 cursor-not-allowed";

  return (
    <header className="bg-white/80 dark:bg-space-dark/80 backdrop-blur-sm sticky top-0 z-50 shadow-md dark:shadow-lg dark:shadow-black/20">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center text-gray-900 dark:text-white font-display">
              <span className="text-xl font-bold">BioSteller</span>
            </NavLink>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`} end>
                  Home
                </NavLink>
                <NavLink to="/explore" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>
                  Explore Data
                </NavLink>
                <NavLink
                  to="/timeline"
                  onClick={(e) => !searchResult && e.preventDefault()}
                  className={({ isActive }) => 
                    `${linkStyle} ${isActive ? activeLinkStyle : ''} ${!searchResult ? disabledLinkStyle : ''}`
                  }
                  aria-disabled={!searchResult}
                >
                  Timeline
                </NavLink>
                <NavLink to="/about" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>
                  About
                </NavLink>
              </div>
            </div>
            <div className="ml-4">
                <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;