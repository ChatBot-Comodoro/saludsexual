import React from 'react';

const BalanzaIcon = ({ size = 24, color = '#FF0048', ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill={color}
      {...props}
    >
      {/* Base de la balanza */}
      <rect x="45" y="80" width="10" height="15" />
      <rect x="35" y="92" width="30" height="4" />
      
      {/* Columna central */}
      <rect x="48" y="20" width="4" height="65" />
      
      {/* Brazo horizontal */}
      <rect x="20" y="20" width="60" height="3" />
      
      {/* Plato izquierdo */}
      <circle cx="25" cy="35" r="2" fill="none" stroke={color} strokeWidth="1"/>
      <path d="M15 35 Q15 42 25 42 Q35 42 35 35 L30 35 L20 35 Z" />
      <line x1="25" y1="23" x2="25" y2="35" stroke={color} strokeWidth="1"/>
      
      {/* Plato derecho */}
      <circle cx="75" cy="35" r="2" fill="none" stroke={color} strokeWidth="1"/>
      <path d="M65 35 Q65 42 75 42 Q85 42 85 35 L80 35 L70 35 Z" />
      <line x1="75" y1="23" x2="75" y2="35" stroke={color} strokeWidth="1"/>
      
      {/* Punto de equilibrio */}
      <circle cx="50" cy="20" r="3" />
    </svg>
  );
};

export default BalanzaIcon;