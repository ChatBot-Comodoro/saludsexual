import React from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Alert,
  ThemeIcon,
  Box
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconRefresh,
  IconHome,
  IconServerOff,
  IconWifiOff,
  IconDatabase
} from '@tabler/icons-react';
import Link from 'next/link';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log del error en consola para desarrollo
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  getErrorType(error) {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorStack = error?.stack?.toLowerCase() || '';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      return 'network';
    }
    
    if (errorMessage.includes('database') || errorMessage.includes('postgresql') || errorMessage.includes('db')) {
      return 'database';
    }
    
    if (errorMessage.includes('server') || errorMessage.includes('500') || errorMessage.includes('internal')) {
      return 'server';
    }
    
    if (errorStack.includes('loadtipos') || errorStack.includes('loadalldata')) {
      return 'database';
    }
    
    return 'general';
  }

  getErrorDetails(errorType) {
    switch (errorType) {
      case 'network':
        return {
          icon: IconWifiOff,
          color: 'orange',
          title: 'Problema de Conexión',
          message: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
          suggestions: [
            'Revisa tu conexión a internet',
            'Verifica que el servidor esté funcionando',
            'Intenta recargar la página en unos momentos'
          ]
        };
      
      case 'database':
        return {
          icon: IconDatabase,
          color: 'red',
          title: 'Error de Base de Datos',
          message: 'Hubo un problema al conectar con la base de datos.',
          suggestions: [
            'El servicio está temporalmente no disponible',
            'Nuestro equipo técnico ha sido notificado',
            'Intenta nuevamente en unos minutos'
          ]
        };
      
      case 'server':
        return {
          icon: IconServerOff,
          color: 'red',
          title: 'Error del Servidor',
          message: 'El servidor está experimentando problemas técnicos.',
          suggestions: [
            'El problema es temporal',
            'Nuestro equipo está trabajando en la solución',
            'Intenta acceder más tarde'
          ]
        };
      
      default:
        return {
          icon: IconAlertTriangle,
          color: 'yellow',
          title: 'Error Inesperado',
          message: 'Ocurrió un error inesperado en la aplicación.',
          suggestions: [
            'Intenta recargar la página',
            'Si el problema persiste, contacta al soporte técnico',
            'Verifica que tengas una conexión estable'
          ]
        };
    }
  }

  render() {
    if (this.state.hasError) {
      const errorType = this.getErrorType(this.state.error);
      const errorDetails = this.getErrorDetails(errorType);
      const IconComponent = errorDetails.icon;

      return (
        <Container size="md" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <Paper shadow="lg" p="xl" radius="md" withBorder style={{ width: '100%' }}>
            <Stack gap="xl" align="center">
              {/* Icono del Error */}
              <ThemeIcon 
                size={80} 
                radius="50%" 
                color={errorDetails.color}
                variant="light"
              >
                <IconComponent size={40} />
              </ThemeIcon>

              {/* Información del Error */}
              <Stack gap="md" align="center">
                <Title order={2} ta="center" c={errorDetails.color}>
                  {errorDetails.title}
                </Title>
                
                <Text size="lg" ta="center" c="dimmed">
                  {errorDetails.message}
                </Text>
              </Stack>

              {/* Sugerencias */}
              <Alert 
                icon={<IconAlertTriangle size={16} />}
                title="¿Qué puedes hacer?"
                color="blue"
                variant="light"
                style={{ width: '100%', maxWidth: '500px' }}
              >
                <Stack gap="xs">
                  {errorDetails.suggestions.map((suggestion, index) => (
                    <Text key={index} size="sm">
                      • {suggestion}
                    </Text>
                  ))}
                </Stack>
              </Alert>

              {/* Acciones */}
              <Group gap="md">
                <Button
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => window.location.reload()}
                  variant="filled"
                  color={errorDetails.color}
                >
                  Recargar Página
                </Button>

                <Button
                  component={Link}
                  href="/admin/dashboard"
                  leftSection={<IconHome size={16} />}
                  variant="light"
                  color="gray"
                >
                  Ir al Dashboard
                </Button>
              </Group>

              {/* Información técnica (solo en desarrollo) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert
                  title="Información técnica (solo desarrollo)"
                  color="gray"
                  variant="outline"
                  style={{ width: '100%', textAlign: 'left' }}
                >
                  <Stack gap="xs">
                    <Text size="xs" ff="monospace">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </Text>
                    {this.state.errorInfo && (
                      <Text size="xs" ff="monospace" style={{ whiteSpace: 'pre-wrap' }}>
                        <strong>Stack:</strong> {this.state.errorInfo.componentStack}
                      </Text>
                    )}
                  </Stack>
                </Alert>
              )}
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;