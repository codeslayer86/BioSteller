import React from 'react';

export const DnaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M4 14.5A3.5 3.5 0 0 1 7.5 11H12v3H7.5A3.5 3.5 0 0 1 4 14.5z" />
    <path d="M20 9.5A3.5 3.5 0 0 0 16.5 6H12v3h4.5A3.5 3.5 0 0 0 20 9.5z" />
    <path d="M12 6v12" />
  </svg>
);
