import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-200 dark:bg-space-dark/50 border-t border-gray-300 dark:border-space-blue/30 mt-12">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-space-text-dim">
        <p>&copy; {new Date().getFullYear()} BioNova-X. All rights reserved.</p>
        <p className="text-xs mt-1">Powered by AI and NASA's public data.</p>
      </div>
    </footer>
  );
};

export default Footer;