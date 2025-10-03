import React from 'react';

export const TelescopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m6 21 6-6" />
    <path d="M8 3.54C7.59 3.2 7.1 3 6.5 3 4.57 3 3 4.57 3 6.5c0 .59.2 1.09.54 1.5" />
    <path d="M12 21H3" />
    <path d="M17.5 3c-1.12 0-2.16.3-3.08.8A5 5 0 0 0 8.8 8.8 5 5 0 0 0 15.2 15.2a5 5 0 0 0 5-5.55C19.7 9.16 18.66 8.5 17.5 8.5c-.71 0-1.38.2-1.95.54" />
    <path d="M21 21 15 15" />
  </svg>
);
