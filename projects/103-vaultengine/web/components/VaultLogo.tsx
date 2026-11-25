import React from 'react';

interface VaultLogoProps {
  className?: string;
}

export default function VaultLogo({ className = 'w-8 h-8' }: VaultLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="VaultEngine Logo"
    >
      <path
        d="M16 2.5L28 9.25V22.75L16 29.5L4 22.75V9.25L16 2.5Z"
        stroke="#FAFAFA"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16 7.5L23.5 11.75V20.25L16 24.5L8.5 20.25V11.75L16 7.5Z"
        stroke="#52525B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 2.5V7.5M28 9.25L23.5 11.75M28 22.75L23.5 20.25M16 29.5V24.5M4 22.75L8.5 20.25M4 9.25L8.5 11.75"
        stroke="#3F3F46"
        strokeWidth="1.25"
      />
      <path
        d="M12.5 14L16 18.5L19.5 14"
        stroke="#10B981"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="12" r="1.5" fill="#10B981" />
    </svg>
  );
}
