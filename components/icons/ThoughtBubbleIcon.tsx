import React from 'react';

export const ThoughtBubbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M20.5 12.5C20.5 7.8 16.9 4 12.5 4S4.5 7.8 4.5 12.5c0 3.1 1.7 5.8 4.2 7.2 0 .1.1.2.1.3v2l2.3-1.2c.6.1 1.2.2 1.9.2 4.4 0 8-3.8 8-8z" />
    <circle cx="10" cy="18" r="1" />
    <circle cx="7" cy="20" r="1" />
  </svg>
);