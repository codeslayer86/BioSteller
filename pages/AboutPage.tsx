import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <h1 className="text-4xl font-bold font-display text-gray-900 dark:text-white mb-6">About the Project</h1>

      <div className="space-y-8 text-gray-700 dark:text-space-text leading-relaxed">
        <section className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30">
          <h2 className="text-2xl font-display text-space-light-blue mb-3">What is Space Biology?</h2>
          <p>
            Space Biology is a field of science dedicated to understanding how spaceflight affects living organisms. Researchers study everything from single-celled bacteria to complex organisms like plants and humans to see how they adapt to the unique environment of space, which includes microgravity, radiation, and isolation.
          </p>
        </section>

        <section className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30">
          <h2 className="text-2xl font-display text-space-light-blue mb-3">Why Does It Matter?</h2>
          <p>
            This research is crucial for two main reasons. First, it helps us protect the health of astronauts on long-duration missions to the Moon, Mars, and beyond. Understanding how bodies change in space allows us to develop effective countermeasures against negative health effects. Second, studying life in an extreme environment like space can reveal fundamental insights into biological processes that are applicable to life on Earth, leading to advancements in medicine and agriculture.
          </p>
        </section>

        <section className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30">
          <h2 className="text-2xl font-display text-space-light-blue mb-3">About BioSteller</h2>
          <p>
            BioSteller is a tool designed to make NASA's vast repository of bioscience data more accessible and understandable. By leveraging AI-powered search, interactive visualizations, and a user-friendly interface, we aim to empower researchers, students, and space enthusiasts to explore the fascinating world of biology beyond Earth.
          </p>
        </section>
        
        <section className="text-center pt-4">
            <a 
                href="https://www.nasa.gov/space-biology/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 border border-space-accent text-base font-medium rounded-md text-space-accent bg-transparent hover:bg-space-accent/10 dark:hover:bg-space-accent/20 transition-colors"
            >
                Visit NASA Space Biology
            </a>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;