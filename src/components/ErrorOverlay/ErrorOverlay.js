import React from 'react';
import { Modal, Paper, Stack, Title, Text, Button, Group, ThemeIcon, Box } from '@mantine/core';
import { IconDatabase, IconWifiOff, IconServerOff, IconAlertTriangle, IconRefresh, IconHome } from '@tabler/icons-react';
import Link from 'next/link';

const ErrorOverlay = ({ 
  opened, 
  onClose, 
  errorType = 'general', 
  title = null, 
  message = null,
  showRetryButton = true,
  showHomeButton = true,
  onRetry = null 
}) => {
  const getErrorConfig = (type) => {
    const configs = {
      database: {
        title: 'Problema de Conexión a la Base de Datos',
        defaultMessage: 'No podemos acceder a la información en este momento. Esto puede deberse a mantenimiento del sistema o problemas temporales de conectividad.',
        icon: IconDatabase,
        color: '#FF6B6B',
        bgColor: '#FFF5F5'
      },
      network: {
        title: 'Problema de Conexión a Internet',
        defaultMessage: 'Parece que hay un problema con tu conexión a internet. Verifica tu conexión y vuelve a intentar.',
        icon: IconWifiOff,
        color: '#FF922B',
        bgColor: '#FFF8F1'
      },
      server: {
        title: 'El Servidor no Responde',
        defaultMessage: 'Nuestros servidores están experimentando dificultades técnicas. El equipo técnico ha sido notificado automáticamente.',
        icon: IconServerOff,
        color: '#FF6B6B',
        bgColor: '#FFF5F5'
      },
      general: {
        title: 'Algo Salió Mal',
        defaultMessage: 'Ocurrió un error inesperado. Puedes intentar recargar la página o regresar al inicio.',
        icon: IconAlertTriangle,
        color: '#868E96',
        bgColor: '#F8F9FA'
      }
    };

    return configs[type] || configs.general;
  };

  const config = getErrorConfig(errorType);
  const Icon = config.icon;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null}
      centered
      size="md"
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
      radius="lg"
      padding={0}
      withCloseButton={false}
    >
      <Paper p={40} radius="lg" style={{ backgroundColor: config.bgColor }}>
        <Stack align="center" spacing="xl">
          {/* Icono principal */}
          <ThemeIcon
            size={80}
            radius="50%"
            variant="filled"
            style={{ 
              backgroundColor: config.color,
              color: 'white'
            }}
          >
            <Icon size={40} />
          </ThemeIcon>

          {/* Título */}
          <Title 
            order={2} 
            size="h3" 
            ta="center" 
            c={config.color}
            fw={600}
          >
            {title || config.title}
          </Title>

          {/* Mensaje */}
          <Text 
            size="md" 
            ta="center" 
            c="dimmed"
            maw={400}
            lh={1.6}
          >
            {message || config.defaultMessage}
          </Text>

          {/* Mensaje adicional para errores de DB */}
          {errorType === 'database' && (
            <Box 
              p="md" 
              style={{ 
                backgroundColor: '#FFF0F0', 
                borderRadius: 8,
                border: '1px solid #FFE0E0',
                width: '100%'
              }}
            >
              <Text size="sm" c="dimmed" ta="center">
                <strong>¿Qué puedes hacer?</strong>
                <br />
                • Esperar unos minutos y volver a intentar
                <br />
                • Verificar tu conexión a internet
                <br />
                • Contactar al soporte si el problema persiste
              </Text>
            </Box>
          )}

          {/* Botones de acción */}
          <Group justify="center" gap="md" mt="md">
            {showRetryButton && (
              <Button
                variant="filled"
                color={config.color}
                leftSection={<IconRefresh size={16} />}
                onClick={handleRetry}
                size="md"
                radius="md"
              >
                Reintentar
              </Button>
            )}

            {showHomeButton && (
              <Button
                variant="outline"
                color={config.color}
                leftSection={<IconHome size={16} />}
                component={Link}
                href="/"
                size="md"
                radius="md"
              >
                Ir al Inicio
              </Button>
            )}

            <Button
              variant="light"
              color="gray"
              onClick={onClose}
              size="md"
              radius="md"
            >
              Cerrar
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Modal>
  );
};

export default ErrorOverlay;