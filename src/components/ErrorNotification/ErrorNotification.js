import React from 'react';
import {
  Alert,
  Button,
  Group,
  Stack,
  Text,
  ActionIcon,
  Box
} from '@mantine/core';
import {
  IconAlertCircle,
  IconX,
  IconRefresh,
  IconHome
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
 
const ErrorNotification = ({ 
  error, 
  onClose, 
  showHomeButton = true, 
  showRefreshButton = true,
  customMessage = null 
}) => {
  const router = useRouter();

  const getErrorMessage = (error) => {
    if (customMessage) return customMessage;
    
    if (typeof error === 'string') return error;
    
    if (error?.message) return error.message;
    
    return 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (!error) return null;

  return (
    <Box p="md" style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999, maxWidth: 400 }}>
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error"
        color="red"
        radius="md"
        withCloseButton={false}
        styles={{
          root: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #fecaca'
          }
        }}
      >
        <Stack gap="sm">
          <Text size="sm">
            {getErrorMessage(error)}
          </Text>
          
          <Group gap="xs" justify="space-between">
            <Group gap="xs">
              {showRefreshButton && (
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconRefresh size={14} />}
                  onClick={handleRefresh}
                >
                  Recargar
                </Button>
              )}
              
              {showHomeButton && (
                <Button
                  size="xs"
                  variant="outline"
                  leftSection={<IconHome size={14} />}
                  onClick={handleGoHome}
                >
                  Inicio
                </Button>
              )}
            </Group>
            
            {onClose && (
              <ActionIcon
                size="sm"
                variant="subtle"
                color="red"
                onClick={onClose}
              >
                <IconX size={14} />
              </ActionIcon>
            )}
          </Group>
        </Stack>
      </Alert>
    </Box>
  );
};

export default ErrorNotification;
