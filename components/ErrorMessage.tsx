import React from 'react';
import { ErrorIcon } from './icons/ErrorIcon';
import { InfoIcon } from './icons/InfoIcon';

interface ErrorMessageProps {
  title: string;
  message: string;
  type: 'error' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title, message, type }) => {
  const isError = type === 'error';

  const containerClasses = isError
    ? 'bg-red-50 dark:bg-red-900/50 border-red-500 dark:border-red-400'
    : 'bg-blue-50 dark:bg-blue-900/50 border-blue-500 dark:border-blue-400';

  const iconClasses = isError
    ? 'text-red-500 dark:text-red-400'
    : 'text-blue-500 dark:text-blue-400';
    
  const titleClasses = isError
    ? 'text-red-800 dark:text-red-200'
    : 'text-blue-800 dark:text-blue-200';

  const messageClasses = isError
    ? 'text-red-700 dark:text-red-300'
    : 'text-blue-700 dark:text-blue-300';


  return (
    <div role={isError ? "alert" : "status"} className={`mt-6 rounded-lg border-l-4 p-4 ${containerClasses}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {isError ? (
            <ErrorIcon className={`h-6 w-6 ${iconClasses}`} />
          ) : (
            <InfoIcon className={`h-6 w-6 ${iconClasses}`} />
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-lg font-bold ${titleClasses}`}>
            {title}
          </h3>
          <div className={`mt-2 text-sm ${messageClasses}`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
