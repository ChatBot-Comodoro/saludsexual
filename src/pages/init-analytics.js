import React, { useState } from 'react';
import { Button, Container, Title, Text, Alert, Code } from '@mantine/core';

export default function InitAnalyticsTable() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const initializeTable = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/init-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <Container size="md" py="xl">
      <Title order={1}>Inicializar la tabla de Métricas</Title>
      <Text mb="md">Haga clic en el botón a continuación para crear la tabla de métricas y los datos de muestra.</Text>
      
      <Button onClick={initializeTable} loading={loading} mb="md">
        Inicializar Tabla de Métricas
      </Button>
      
      {result && (
        <Alert color={result.error ? 'red' : 'green'} mb="md">
          <Text fw={500}>{result.error ? 'Error:' : 'Éxito:'}</Text>
          <Code block mt="sm">
            {JSON.stringify(result, null, 2)}
          </Code>
        </Alert>
      )}
    </Container>
  );
}