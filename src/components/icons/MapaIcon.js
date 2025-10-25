import React from 'react';
import { IconMap } from '@tabler/icons-react';

const MapaIcon = ({ size = 42, color = '#FF0048', ...props }) => {
  return (
    <IconMap
      size={size}
      color={color}
      stroke={1.5}
      {...props}
    />
  );
};

export default MapaIcon;