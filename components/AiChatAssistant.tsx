import React, { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { AiSearchResult, ChatHistoryItem } from '../types';
import { getAiChatResponseStream } from '../services/aiService';
import { ChatIcon } from './icons/ChatIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';

interface AiChatAssistantProps {
  searchResult: AiSearchResult;
  query: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  isError?: boolean;
}

const SUGGESTED_PROMPTS = [
  "Explain the key findings in simple terms.",
  "What was the main organism studied?",
  "Compare findings from different missions.",
];

const renderMarkdown = (text: string) => {
    const processedText = text.split('\n').map(line => {
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return '• ' + line.substring(2);
      }
      if (/^\d+\.\s/.test(line)) {
        return line;
      }
      return line;
    }).join('\n');

    const html = processedText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-space-dark px-1 py-0.5 rounded text-sm font-mono">$1</code>');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const AiChatAssistant: React.FC<AiChatAssistantProps> = ({ searchResult, query }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const initializeChat = useCallback(() => {
    setMessages([{ role: 'model', content: `Hi! I'm your AI assistant. Ask me anything about the search results for "${query}". I can even compare findings for you.` }]);
  }, [query]);

  useEffect(() => {
    if (searchResult && query) {
        initializeChat();
    }
  }, [searchResult, query, initializeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      const focusableElements = chatContainerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        firstElement.focus();
        
        const trapFocus = (e: KeyboardEvent) => {
          if (e.key !== 'Tab') return;
          
          if (e.shiftKey) { // shift + tab
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else { // tab
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        };

        const currentChatContainer = chatContainerRef.current;
        currentChatContainer?.addEventListener('keydown', trapFocus);
        
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
          currentChatContainer?.removeEventListener('keydown', trapFocus);
          triggerButtonRef.current?.focus();
        };
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: messageText };
    const newMessagesWithUser = [...messages, userMessage];
    setMessages(newMessagesWithUser);
    setIsLoading(true);

    const history: ChatHistoryItem[] = newMessagesWithUser
        .slice(1, -1) // Remove initial greeting and current user message
        .filter(msg => !msg.isError)
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        }));

    try {
      const stream = await getAiChatResponseStream({
        query: messageText,
        initialSearchQuery: query,
        searchResultContext: searchResult,
        history: history,
      });

      if (!stream) {
          throw new Error("Failed to get response stream from backend.");
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let currentModelMessage = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        currentModelMessage += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.content = currentModelMessage;
          }
          return newMessages;
        });
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage = error.message || "Sorry, I encountered an error. This could be due to a network issue or a problem with the AI service. Please try again.";
      setMessages(prev => [...prev, { role: 'model', content: errorMessage, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearChat = () => {
    if (isLoading) return; // Prevent clearing while a response is being generated
    initializeChat();
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await sendMessage(userInput);
    setUserInput('');
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    }).catch(err => console.error('Failed to copy text: ', err));
  };

  return (
    <>
      <button ref={triggerButtonRef} onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-space-blue to-space-light-blue text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 active:scale-100 transition-transform duration-300" aria-label="Toggle AI Assistant" aria-haspopup="dialog" aria-expanded={isOpen}>
        <ChatIcon className="w-8 h-8" />
      </button>

      <div ref={chatContainerRef} role="dialog" aria-modal="true" aria-labelledby="chat-heading" className={`fixed bottom-24 right-6 z-50 w-full max-w-md bg-white dark:bg-space-dark shadow-2xl rounded-lg border border-gray-200 dark:border-space-blue/50 flex flex-col transition-all duration-300 ease-in-out transform ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`} style={{ height: '60vh' }}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-space-blue/50 flex-shrink-0">
          <h3 id="chat-heading" className="text-lg font-bold font-display text-gray-900 dark:text-white">AI Research Assistant</h3>
          <div className="flex items-center gap-2">
            <button
                onClick={handleClearChat}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-space-blue/50"
                aria-label="Clear chat history"
                disabled={isLoading}
            >
                <RefreshCwIcon className={`w-5 h-5 text-gray-600 dark:text-space-text-dim ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-space-blue/50" aria-label="Close chat">
              <CloseIcon className="w-5 h-5 text-gray-600 dark:text-space-text-dim" />
            </button>
          </div>
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
          <ul className="space-y-6">
            {messages.map((msg, index) => (
              <li key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-chat-bubble-in`}>
                {msg.role === 'model' && (
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${msg.isError ? 'bg-red-500' : 'bg-space-blue'}`}>
                    {msg.isError ? <ErrorIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
                  </div>
                )}
                <div className={`group relative max-w-xs md:max-w-sm px-4 py-3 rounded-xl whitespace-pre-wrap text-sm ${
                    msg.isError 
                    ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-bl-none'
                    : msg.role === 'user' 
                        ? 'bg-space-light-blue text-white rounded-br-none' 
                        : 'bg-gray-100 dark:bg-space-dark border border-gray-200 dark:border-space-blue/50 text-gray-800 dark:text-space-text rounded-bl-none'
                }`}>
                  {renderMarkdown(msg.content)}
                  {msg.role === 'model' && msg.content && !isLoading && !msg.isError && (
                    <button onClick={() => handleCopy(msg.content, index)} aria-label="Copy message" className="absolute top-1 right-1 p-1 rounded-full text-gray-500 dark:text-space-text-dim bg-white/50 dark:bg-space-dark/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedMessageIndex === index ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-space-text-dim flex items-center justify-center text-space-dark dark:text-white"><UserIcon className="w-5 h-5" /></div>}
              </li>
            ))}
            {isLoading && (
              <li className="flex items-start gap-3 justify-start" role="status" aria-label="AI assistant is typing">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-space-blue flex items-center justify-center text-white"><BotIcon className="w-5 h-5" /></div>
                <div className="bg-gray-200 dark:bg-space-blue/50 rounded-xl rounded-bl-none p-4 inline-flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-gray-500 dark:bg-space-text-dim rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-500 dark:bg-space-text-dim rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-500 dark:bg-space-text-dim rounded-full animate-pulse"></div>
                </div>
              </li>
            )}
            <div ref={messagesEndRef} />
          </ul>
          {messages.length <= 1 && !isLoading && (
            <div className="flex flex-col items-start gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-space-blue/30">
                <p className="text-xs font-semibold text-gray-500 dark:text-space-text-dim">SUGGESTIONS</p>
                {SUGGESTED_PROMPTS.map(prompt => (
                    <button key={prompt} onClick={() => sendMessage(prompt)} className="px-3 py-1.5 text-sm rounded-full transition-colors bg-blue-100 text-blue-800 dark:bg-space-blue/50 dark:text-space-text-dim hover:bg-blue-200 dark:hover:bg-space-blue" disabled={isLoading}>
                        {prompt}
                    </button>
                ))}
            </div>
           )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-space-blue/50 flex-shrink-0">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ask a follow-up question..." className="w-full bg-gray-100 dark:bg-space-dark/80 border border-gray-300 dark:border-space-blue/50 rounded-lg py-2 px-4 focus:ring-2 focus:ring-space-light-blue focus:outline-none text-base text-gray-900 dark:text-space-text placeholder-gray-500 dark:placeholder-space-text-dim" disabled={isLoading} aria-label="Chat input" />
            <button type="submit" className="flex-shrink-0 p-3 rounded-full bg-space-light-blue text-white disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100 transition-all" disabled={isLoading || !userInput.trim()} aria-label="Send message">
              <SendIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AiChatAssistant;