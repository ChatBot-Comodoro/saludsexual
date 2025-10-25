import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  PasswordInput,
  Button,
  Stack,
  Box,
  Alert,
  ThemeIcon
} from '@mantine/core';
import {
  IconLock,
  IconAlertCircle,
  IconCheck,
  IconShield
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { hashPassword, validatePassword } from '../utils/passwordUtils';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    if (router.query.token) {
      setToken(router.query.token);
    }
  }, [router.query.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar contraseña usando la utilidad
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Primero necesitamos obtener el email del usuario para hacer el hash
      // Vamos a hacer una petición especial que incluya el token
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          newPassword: password, // El backend se encargará del hash usando el email del token
          hashOnBackend: true // Flag para que el backend sepa que debe hashear
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Error actualizando la contraseña');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <Head>
          <title>Token Inválido - Panel Administrativo</title>
        </Head>
        <Container size="xs" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            Token de recuperación no válido o expirado
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Restablecer Contraseña - Panel Administrativo</title>
        <meta name="description" content="Restablecer contraseña del panel administrativo" />
      </Head>

      <Box
        style={{
          minHeight: '70vh',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <Container size="xs">
          <Stack gap="xl">
            <Box ta="center">
              <ThemeIcon size={60} radius="50%" variant="light" color="#4A90E2" mb="md">
                <IconShield size={32} />
              </ThemeIcon>
              <Title order={1} c="#2c3e50" mb="xs">
                Restablecer Contraseña
              </Title>
              <Text c="#6c757d">
                Panel Administrativo - Chatbot Comodoro Salud
              </Text>
            </Box>

            <Paper shadow="xl" p="xl" radius="lg" withBorder bg="white">
              {!success ? (
                <Stack gap="md">
                  <Box ta="center" mb="md">
                    <Title order={2} size="h3" mb="xs" c="#2c3e50">
                      Nueva Contraseña
                    </Title>
                    <Text size="sm" c="dimmed">
                      Ingresa tu nueva contraseña
                    </Text>
                  </Box>

                  {error && (
                    <Alert 
                      icon={<IconAlertCircle size={16} />} 
                      color="red" 
                      variant="light"
                    >
                      {error}
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                      <PasswordInput
                        label="Nueva Contraseña"
                        placeholder="Ingresa tu nueva contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        leftSection={<IconLock size={16} />}
                        size="md"
                        required
                      />

                      <PasswordInput
                        label="Confirmar Contraseña"
                        placeholder="Confirma tu nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        leftSection={<IconLock size={16} />}
                        size="md"
                        required
                      />

                      <Button
                        type="submit"
                        loading={loading}
                        leftSection={<IconCheck size={16} />}
                        size="lg"
                        radius="md"
                        fullWidth
                        mt="md"
                        color="#4A90E2"
                        style={{
                          backgroundColor: '#4A90E2',
                          '&:hover': {
                            backgroundColor: '#357abd'
                          }
                        }}
                      >
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                      </Button>
                    </Stack>
                  </form>
                </Stack>
              ) : (
                <Stack gap="md" ta="center">
                  <ThemeIcon size={60} radius="50%" variant="light" color="green">
                    <IconCheck size={32} />
                  </ThemeIcon>
                  <Title order={3} c="green">
                    ¡Contraseña Actualizada!
                  </Title>
                  <Text size="sm" c="dimmed">
                    Tu contraseña ha sido actualizada exitosamente. 
                    Serás redirigido al login en unos segundos.
                  </Text>
                </Stack>
              )}
            </Paper>
          </Stack>
        </Container>
      </Box>
    </>
  );
}