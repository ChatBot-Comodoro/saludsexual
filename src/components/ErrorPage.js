import React from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  ThemeIcon,
  Alert
} from '@mantine/core';
import {
  IconServerOff,
  IconHome,
  IconRefresh,
  IconAlertTriangle
} from '@tabler/icons-react';
import Link from 'next/link';

const ErrorPage = ({ 
  title = "Error del Servidor",
  message = "Hubo un problema al procesar tu solicitud",
  showDetails = false,
  statusCode = 500,
  hasGetInitialProps = false 
}) => {
  const getErrorIcon = () => {
    if (statusCode >= 500) return IconServerOff;
    if (statusCode === 404) return IconAlertTriangle;
    return IconAlertTriangle;
  };

  const getErrorColor = () => {
    if (statusCode >= 500) return 'red';
    if (statusCode === 404) return 'yellow';
    return 'orange';
  };

  const getErrorMessage = () => {
    if (statusCode === 404) return 'La página que buscas no existe o ha sido movida';
    if (statusCode >= 500) return 'Nuestros servidores están experimentando problemas temporales';
    return message;
  };

  const IconComponent = getErrorIcon();
  const errorColor = getErrorColor();
  const errorMessage = getErrorMessage();

  return (
    <Container size="md" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper shadow="lg" p="xl" radius="md" withBorder style={{ width: '100%' }}>
        <Stack gap="xl" align="center">
          {/* Icono del Error */}
          <ThemeIcon 
            size={80} 
            radius="50%" 
            color={errorColor}
            variant="light"
          >
            <IconComponent size={40} />
          </ThemeIcon>

          {/* Información del Error */}
          <Stack gap="md" align="center">
            <Title order={1} ta="center" c={errorColor}>
              {statusCode}
            </Title>
            
            <Title order={2} ta="center" c="dark">
              {title}
            </Title>
            
            <Text size="lg" ta="center" c="dimmed" maw={600}>
              {errorMessage}
            </Text>
          </Stack>

          {/* Sugerencias específicas por tipo de error */}
          <Alert 
            icon={<IconAlertTriangle size={16} />}
            title="¿Qué puedes hacer?"
            color="blue"
            variant="light"
            style={{ width: '100%', maxWidth: '500px' }}
          >
            <Stack gap="xs">
              {statusCode === 404 ? (
                <>
                  <Text size="sm">• Verifica que la URL esté escrita correctamente</Text>
                  <Text size="sm">• Regresa al inicio y navega desde allí</Text>
                  <Text size="sm">• Usa el menú de navegación principal</Text>
                </>
              ) : statusCode >= 500 ? (
                <>
                  <Text size="sm">• Nuestro equipo técnico ha sido notificado del problema</Text>
                  <Text size="sm">• Intenta recargar la página en unos minutos</Text>
                  <Text size="sm">• Si el problema persiste, contacta al soporte técnico</Text>
                </>
              ) : (
                <>
                  <Text size="sm">• Intenta recargar la página</Text>
                  <Text size="sm">• Verifica tu conexión a internet</Text>
                  <Text size="sm">• Contacta al soporte si el problema continúa</Text>
                </>
              )}
            </Stack>
          </Alert>

          {/* Acciones */}
          <Group gap="md">
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={() => window.location.reload()}
              variant="filled"
              color={errorColor}
            >
              Recargar Página
            </Button>

            <Button
              component={Link}
              href="/"
              leftSection={<IconHome size={16} />}
              variant="light"
              color="gray"
            >
              Ir al Inicio
            </Button>
          </Group>

          {/* Información técnica (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && showDetails && (
            <Alert
              title="Información técnica (solo desarrollo)"
              color="gray"
              variant="outline"
              style={{ width: '100%', textAlign: 'left' }}
            >
              <Stack gap="xs">
                <Text size="xs" ff="monospace">
                  <strong>Status Code:</strong> {statusCode}
                </Text>
                <Text size="xs" ff="monospace">
                  <strong>Has getInitialProps:</strong> {hasGetInitialProps.toString()}
                </Text>
              </Stack>
            </Alert>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

// Función para obtener propiedades iniciales del error
ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, hasGetInitialProps: true };
};

export default ErrorPage;