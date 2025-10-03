import React, { useMemo } from 'react';
import { categories } from '../constants';

interface SuggestedTopicsProps {
  onTopicClick: (topic: string) => void;
}

const TopicButton: React.FC<{ topic: string, onTopicClick: (topic: string) => void }> = ({ topic, onTopicClick }) => (
    <button
        onClick={() => onTopicClick(topic)}
        className="flex-shrink-0 mx-2 px-5 py-2 text-base rounded-full transition-all duration-300 bg-emerald-primary/10 text-emerald-primary dark:bg-emerald-light dark:text-white hover:bg-emerald-primary hover:text-white hover:scale-105 transform"
        aria-label={`Search for ${topic}`}
    >
        {topic}
    </button>
);

const ScrollingRow: React.FC<{ topics: string[], onTopicClick: (topic: string) => void, animationClass: string }> = ({ topics, onTopicClick, animationClass }) => {
    // Duplicate the topics array to create a seamless looping effect.
    const duplicatedTopics = [...topics, ...topics]; 

    return (
        <div className={`flex ${animationClass}`}>
            {duplicatedTopics.map((item, index) => (
                <TopicButton key={`${item}-${index}`} topic={item} onTopicClick={onTopicClick} />
            ))}
        </div>
    );
};


const SuggestedTopics: React.FC<SuggestedTopicsProps> = ({ onTopicClick }) => {
    const allTopics = useMemo(() => categories.flatMap(cat => cat.items), []);

    // Create three independently shuffled lists for more variety and a better visual effect.
    const row1Topics = useMemo(() => [...allTopics].sort(() => 0.5 - Math.random()), [allTopics]);
    const row2Topics = useMemo(() => [...allTopics].sort(() => 0.5 - Math.random()), [allTopics]);
    const row3Topics = useMemo(() => [...allTopics].sort(() => 0.5 - Math.random()), [allTopics]);

    return (
        <div className="bg-white dark:bg-space-dark/50 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-space-blue/30">
            <div className="relative group overflow-hidden space-y-4 py-4 [mask-image:_linear_gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
                <ScrollingRow topics={row1Topics} onTopicClick={onTopicClick} animationClass="animate-scroll-slow group-hover:[animation-play-state:paused]" />
                <ScrollingRow topics={row2Topics} onTopicClick={onTopicClick} animationClass="animate-scroll group-hover:[animation-play-state:paused]" />
                <ScrollingRow topics={row3Topics} onTopicClick={onTopicClick} animationClass="animate-scroll-fast group-hover:[animation-play-state:paused]" />
            </div>
        </div>
    );
};

export default SuggestedTopics;