import React from 'react';

export const RocketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.1S5.21 15.66 4.5 16.5z" />
    <path d="M12.5 10.5c.78-3.9-6.7-6.5-9.5-5.5s3.55 10.28 9.5 5.5" />
    <path d="M14.5 9.5L9.5 14.5" />
    <path d="M16 2.5c4.5 4.5 7 11.5 7 11.5s-7-2.5-11.5-7C7 2.5 11.5 2.5 16 2.5z" />
  </svg>
);
