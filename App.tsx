import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import AboutPage from './pages/AboutPage';
import TimelinePage from './pages/TimelinePage';
import { ThemeProvider } from './contexts/ThemeContext';
import { SearchProvider, useSearch } from './contexts/SearchContext';
import AiChatAssistant from './components/AiChatAssistant';

// This component contains the main layout and can access the SearchContext
const MainAppLayout: React.FC = () => {
  const { searchResult, currentQuery } = useSearch();

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-ivory-bg dark:bg-charcoal-deep font-sans transition-colors duration-300">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
        {searchResult && currentQuery && (
          <AiChatAssistant searchResult={searchResult} query={currentQuery} />
        )}
      </div>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SearchProvider>
        <MainAppLayout />
      </SearchProvider>
    </ThemeProvider>
  );
};

export default App;