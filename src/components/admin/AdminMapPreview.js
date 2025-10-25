import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, LoadingOverlay, Title, Text, Stack, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

// Importar el mapa dinámicamente para evitar problemas con SSR
const InteractiveMap = dynamic(
  () => import('../InteractiveMap'),
  { ssr: false }
);

const AdminMapPreview = ({ refreshTrigger = 0 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simular carga cuando hay cambios
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [refreshTrigger]);

  if (error) {
    return (
      <Card withBorder>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
        >
          No se pudo cargar la vista previa del mapa: {error}
        </Alert>
      </Card>
    );
  }

  return (
    <Card withBorder style={{ position: 'relative' }}>
      <Stack gap="sm">
        <div>
          <Title order={4}>Vista Previa del Mapa</Title>
          <Text size="sm" c="dimmed">
            Visualización en tiempo real de los cambios
          </Text>
        </div>
        
        <div style={{ height: '400px', position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          <InteractiveMap />
        </div>
      </Stack>
    </Card>
  );
};

export default AdminMapPreview;