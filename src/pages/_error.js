import React from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Box,
  ThemeIcon,
  Card
} from '@mantine/core';
import {
  IconHome,
  IconRefresh,
  IconAlertCircle,
  IconMessageCircle
} from '@tabler/icons-react';
import Link from 'next/link';
import Head from 'next/head';

function Error({ statusCode, hasGetInitialPropsRun, err }) {
  const getErrorMessage = (statusCode) => {
    switch (statusCode) {
      case 404:
        return {
          title: "Página no encontrada",
          description: "La página que buscas no existe o ha sido movida."
        };
      case 500:
        return {
          title: "Error interno del servidor",
          description: "Algo salió mal en nuestros servidores. Estamos trabajando para solucionarlo."
        };
      case 403:
        return {
          title: "Acceso denegado",
          description: "No tienes permisos para acceder a esta página."
        };
      default:
        return {
          title: "Ha ocurrido un error",
          description: "Algo inesperado ha sucedido. Por favor, intenta nuevamente."
        };
    }
  };

  const errorInfo = getErrorMessage(statusCode);
  const isClientError = !statusCode || statusCode < 500;

  return (
    <>
      <Head>
        <title>{`Error ${statusCode || 'del Cliente'} - Comodoro Salud`}</title>
        <meta name="description" content="Ha ocurrido un error. Servicios de salud en Comodoro Rivadavia." />
      </Head>
      
      <Container size="md" py="xl">
        <Stack gap="xl" align="center" ta="center">
          {/* Error Icon */}
          <ThemeIcon
            size={120}
            radius="xl"
            variant="light"
            color={isClientError ? "orange" : "red"}
            style={{ 
              background: isClientError 
                ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' 
                : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: isClientError 
                ? '2px solid #fcd34d' 
                : '2px solid #fecaca'
            }}
          >
            <IconAlertCircle size={60} />
          </ThemeIcon>

          {/* Error Message */}
          <Stack gap="md" align="center">
            <Title order={1} size="3rem" c={isClientError ? "orange.6" : "red.6"}>
              {statusCode || "Error"}
            </Title>
            <Title order={2} size="1.8rem" fw={600}>
              {errorInfo.title}
            </Title>
            <Text size="lg" c="dimmed" maw={500} mx="auto">
              {errorInfo.description}
            </Text>
          </Stack>

          {/* Action Buttons */}
          <Group gap="md" justify="center">
            <Button
              component={Link}
              href="/"
              size="lg"
              leftSection={<IconHome size={20} />}
              radius="xl"
            >
              Ir al Inicio
            </Button>
            <Button
              variant="outline"
              size="lg"
              leftSection={<IconRefresh size={20} />}
              radius="xl"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </Button>
          </Group>

          {/* Error Details for Development */}
          {process.env.NODE_ENV === 'development' && err && (
            <Card w="100%" mt="xl" padding="lg" radius="md" withBorder bg="gray.0">
              <Stack gap="sm">
                <Title order={4} c="red.7">
                  Detalles del Error (Solo en Desarrollo)
                </Title>
                <Text size="sm" c="dimmed" style={{ fontFamily: 'monospace' }}>
                  {err.message}
                </Text>
                {err.stack && (
                  <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {err.stack}
                  </Text>
                )}
              </Stack>
            </Card>
          )}

          {/* Help Section */}
          <Card 
            w="100%" 
            mt="xl" 
            padding="xl" 
            radius="md" 
            withBorder
            bg="blue.0"
          >
            <Stack align="center" ta="center" gap="md">
              <ThemeIcon size="lg" radius="50%" variant="light" color="blue">
                <IconMessageCircle size={24} />
              </ThemeIcon>
              <Title order={4} c="blue.7">
                ¿El problema persiste?
              </Title>
              <Text size="md" c="dimmed" maw={400} mx="auto">
                Si continúas experimentando problemas, puedes contactarnos a través 
                de nuestro chat o volver a la página principal.
              </Text>
              <Group gap="md">
                <Button
                  component={Link}
                  href="/chat"
                  variant="light"
                  color="blue"
                  leftSection={<IconMessageCircle size={16} />}
                >
                  Obtener ayuda
                </Button>
                <Button
                  component={Link}
                  href="/contactos"
                  variant="outline"
                  color="blue"
                >
                  Contactanos
                </Button>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
