import React from 'react';
import { Link } from 'react-router-dom';
import { DnaIcon } from '../components/icons/DnaIcon';
import { HeartPulseIcon } from '../components/icons/HeartPulseIcon';
import { GlobeIcon } from '../components/icons/GlobeIcon';
import { LayoutGridIcon } from '../components/icons/LayoutGridIcon';
import { ScaleIcon } from '../components/icons/ScaleIcon';
import { CompassIcon } from '../components/icons/CompassIcon';
import { ChatIcon } from '../components/icons/ChatIcon';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30 text-center flex flex-col items-center h-full">
    <div className="flex-shrink-0 bg-emerald-primary/10 dark:bg-emerald-accent-bright/20 p-4 rounded-full text-emerald-primary dark:text-emerald-accent-bright mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-ivory-text text-base leading-relaxed">{children}</p>
  </div>
);

const FeatureShowcaseCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-100 dark:bg-space-dark p-6 rounded-lg shadow-inner flex items-start gap-6 h-full">
        <div className="flex-shrink-0 bg-emerald-primary/10 dark:bg-emerald-accent-bright/20 p-4 rounded-full text-emerald-primary dark:text-emerald-accent-bright mt-1">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold font-display text-space-light-blue mb-2">{title}</h3>
            <p className="text-gray-700 dark:text-space-text leading-relaxed">
                {children}
            </p>
        </div>
    </div>
);

const HomePage: React.FC = () => {
  return (
    <div className="-my-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Hero Section */}
      <div className="relative h-[calc(80vh)] min-h-[500px] flex items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 max-w-4xl px-4 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display leading-tight tracking-tight text-gray-900 dark:text-white">
            Explore Biology Beyond Earth
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-ivory-text-dim max-w-3xl mx-auto">
            BioNova-X is your interactive portal into NASA's Space Biology research, making complex data accessible and understandable through the power of AI.
          </p>
          <div className="mt-8">
            <Link
              to="/explore"
              className="inline-block px-8 py-4 bg-gradient-to-r from-space-blue to-space-light-blue text-white font-bold text-lg rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Start Exploring
            </Link>
          </div>
        </div>
      </div>

      {/* "Feature Showcase" Section */}
      <section className="pb-16 md:pb-24 bg-white dark:bg-space-dark/70" aria-labelledby="features-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold font-display text-gray-900 dark:text-white">
              An All-in-One Research Platform
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-ivory-text-dim">
              BioNova-X transforms raw data into actionable knowledge with a suite of powerful, AI-driven tools designed for discovery.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FeatureShowcaseCard
              icon={<LayoutGridIcon className="w-8 h-8" />}
              title="AI Search & Interactive Visuals"
            >
              Leverage AI to search and summarize complex topics. Visualize data through dynamic knowledge graphs and dashboards to uncover hidden connections and trends.
            </FeatureShowcaseCard>
            <FeatureShowcaseCard
              icon={<ScaleIcon className="w-8 h-8" />}
              title="Deeper AI Analysis Tools"
            >
              Go beyond search with tools that compare multiple reports side-by-side or generate novel, testable research hypotheses based on the available data.
            </FeatureShowcaseCard>
            <FeatureShowcaseCard
              icon={<CompassIcon className="w-8 h-8" />}
              title="Timeline & Learning Hub"
            >
              Explore research chronologically with an interactive timeline. Deepen your understanding with a built-in AI glossary and guided learning paths for key topics.
            </FeatureShowcaseCard>
            <FeatureShowcaseCard
              icon={<ChatIcon className="w-8 h-8" />}
              title="Conversational AI Assistant"
            >
              Engage in a dialogue with your data. Ask follow-up questions about your search results to get nuanced explanations and clarifications in real-time.
            </FeatureShowcaseCard>
          </div>
        </div>
      </section>

      {/* "Why It Matters" Section */}
      <section className="py-16 md:py-24 bg-gray-100 dark:bg-space-dark" aria-labelledby="frontier-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 id="frontier-heading" className="text-3xl md:text-4xl font-bold font-display text-gray-900 dark:text-white">
              The Frontier of Life Sciences
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-ivory-text-dim">
              Space biology isn't just about growing plants on the ISS. It's fundamental research that pushes the boundaries of our knowledge and has profound impacts back on Earth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<HeartPulseIcon className="w-8 h-8" />}
              title="Safeguarding Astronauts"
            >
              Protecting human health on long-duration missions to the Moon and Mars is critical. This research helps us understand and counteract the effects of microgravity and radiation.
            </FeatureCard>
            <FeatureCard
              icon={<DnaIcon className="w-8 h-8" />}
              title="Unlocking Basic Biology"
            >
              By studying life in an extreme environment, we gain unique insights into fundamental biological processes, from gene expression to cellular adaptation.
            </FeatureCard>
            <FeatureCard
              icon={<GlobeIcon className="w-8 h-8" />}
              title="Benefiting Life on Earth"
            >
              Discoveries in space lead to tangible benefits on our home planet, driving innovations in medicine, agriculture, and biotechnology.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gray-100 dark:bg-space-dark" aria-labelledby="dive-in-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="dive-in-heading" className="text-3xl font-bold font-display text-gray-900 dark:text-white">Ready to Dive In?</h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-ivory-text-dim">
                Your journey into the cosmos of biological data starts here.
            </p>
            <div className="mt-8">
                <Link
                  to="/explore"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-space-blue to-space-light-blue text-white font-bold text-lg rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Explore the Data
                </Link>
            </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;