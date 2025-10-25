import React, { useState } from 'react';
import { Card, Text, Stack, Button, Group, TextInput, Code, Badge } from '@mantine/core';
import { IconMapPin, IconCopy, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const CoordinatePicker = ({ onCoordinateSelect }) => {
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [copied, setCopied] = useState(false);

  const handleCopyCoordinates = () => {
    if (coordinates.lat && coordinates.lng) {
      navigator.clipboard.writeText(`${coordinates.lat}, ${coordinates.lng}`);
      setCopied(true);
      notifications.show({
        title: 'Copiado',
        message: 'Coordenadas copiadas al portapapeles',
        color: 'green',
        icon: <IconCheck />
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUseCoordinates = () => {
    if (coordinates.lat && coordinates.lng && onCoordinateSelect) {
      onCoordinateSelect(coordinates.lat, coordinates.lng);
      notifications.show({
        title: 'Coordenadas aplicadas',
        message: 'Las coordenadas se han aplicado al formulario',
        color: 'blue',
        icon: <IconMapPin />
      });
    }
  };

  return (
    <Card withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={500}>Selector de Coordenadas</Text>
          <Badge variant="light" color="blue">
            Herramienta
          </Badge>
        </Group>
        
        <Text size="sm" c="dimmed">
          Haz clic en el mapa para obtener las coordenadas exactas
        </Text>

        <Group grow>
          <TextInput
            label="Latitud"
            placeholder="Ej: -45.8640"
            value={coordinates.lat}
            onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
          />
          <TextInput
            label="Longitud"
            placeholder="Ej: -67.4958"
            value={coordinates.lng}
            onChange={(e) => setCoordinates(prev => ({ ...prev, lng: e.target.value }))}
          />
        </Group>

        {coordinates.lat && coordinates.lng && (
          <div>
            <Text size="sm" fw={500} mb="xs">Coordenadas seleccionadas:</Text>
            <Code block>{coordinates.lat}, {coordinates.lng}</Code>
          </div>
        )}

        <Group grow>
          <Button
            variant="light"
            leftSection={<IconCopy size={16} />}
            onClick={handleCopyCoordinates}
            disabled={!coordinates.lat || !coordinates.lng}
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
          <Button
            leftSection={<IconMapPin size={16} />}
            onClick={handleUseCoordinates}
            disabled={!coordinates.lat || !coordinates.lng}
          >
            Usar en Formulario
          </Button>
        </Group>

        <Text size="xs" c="dimmed">
          💡 Tip: También puedes escribir las coordenadas manualmente
        </Text>
      </Stack>
    </Card>
  );
};

export default CoordinatePicker;