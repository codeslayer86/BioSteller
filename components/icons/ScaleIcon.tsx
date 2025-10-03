import React from 'react';

export const ScaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M16 16.5l4-4" />
    <path d="M20 16.5h-4v-4" />
    <path d="M3 7.5h4v4" />
    <path d="M7 7.5L3 11.5" />
    <path d="M14 10l-4-4" />
    <path d="M10 10l4 4" />
  </svg>
);