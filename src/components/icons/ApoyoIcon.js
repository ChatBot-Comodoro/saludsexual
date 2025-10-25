import React from 'react';

const ApoyoIcon = ({ size = 24, color = '#FF0048', ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill={color}
      {...props}
    >
      {/* Persona 1 */}
      <circle cx="30" cy="25" r="8" />
      <path d="M30 35 C25 35 22 38 22 42 L22 55 L38 55 L38 42 C38 38 35 35 30 35 Z" />
      
      {/* Persona 2 */}
      <circle cx="70" cy="25" r="8" />
      <path d="M70 35 C65 35 62 38 62 42 L62 55 L78 55 L78 42 C78 38 75 35 70 35 Z" />
      
      {/* Brazos extendidos hacia el centro (apoyo) */}
      <path d="M38 45 L50 40 L62 45" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"/>
      
      {/* Corazón en el centro */}
      <path d="M50 38 C48 36 45 36 45 39 C45 36 42 36 40 39 C40 42 45 47 50 50 C55 47 60 42 60 39 C60 36 57 36 55 39 C55 36 52 36 50 38 Z" />
      
      {/* Base/suelo */}
      <rect x="20" y="75" width="60" height="3" rx="1.5" />
      
      {/* Texto simbólico "+" */}
      <text x="30" y="70" fontSize="12" textAnchor="middle" fill={color}>+</text>
      <text x="70" y="70" fontSize="12" textAnchor="middle" fill={color}>+</text>
    </svg>
  );
};

export default ApoyoIcon;