import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Box,
  Alert,
  ThemeIcon
} from '@mantine/core';
import {
  IconMail,
  IconAlertCircle,
  IconCheck,
  IconShield,
  IconArrowLeft
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Error enviando email de recuperación');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Recuperar Contraseña - Panel Administrativo</title>
        <meta name="description" content="Recuperar contraseña del panel administrativo" />
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
            {/* Header */}
            <Box ta="center">
              <ThemeIcon size={60} radius="50%" variant="light" color="#4A90E2" mb="md">
                <IconMail size={32} />
              </ThemeIcon>
              <Title order={1} c="#2c3e50" mb="xs">
                Recuperar Contraseña
              </Title>
              <Text c="#6c757d">
                Panel Administrativo - Chatbot Comodoro Salud
              </Text>
            </Box>

            {/* Forgot Password Form */}
            <Paper shadow="xl" p="xl" radius="lg" withBorder bg="white">
              {!success ? (
                <Stack gap="md">
                  <Box ta="center" mb="md">
                    <Title order={2} size="h3" mb="xs" c="#2c3e50">
                      ¿Olvidaste tu contraseña?
                    </Title>
                    <Text size="sm" c="dimmed">
                      Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
                    </Text>
                  </Box>

                  {error && (
                    <Alert 
                      icon={<IconAlertCircle size={16} />} 
                      color="red" 
                      variant="light"
                      radius="md"
                    >
                      {error}
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                      <TextInput
                        label="Correo Electrónico"
                        placeholder="correo@ejemplo.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        leftSection={<IconMail size={16} />}
                        size="md"
                        required
                      />

                      <Button
                        type="submit"
                        loading={loading}
                        leftSection={<IconMail size={16} />}
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
                        {loading ? 'Enviando...' : 'Enviar Email de Recuperación'}
                      </Button>
                    </Stack>
                  </form>

                  {/* Volver al login */}
                  <Box ta="center" mt="lg">
                    <Button 
                      variant="subtle" 
                      size="sm"
                      leftSection={<IconArrowLeft size={14} />}
                      onClick={() => router.push('/login')}
                      style={{ color: '#4A90E2' }}
                    >
                      Volver al login
                    </Button>
                  </Box>
                </Stack>
              ) : (
                <Stack gap="md" ta="center">
                  <ThemeIcon size={60} radius="50%" variant="light" color="green">
                    <IconCheck size={32} />
                  </ThemeIcon>
                  <Title order={3} c="green">
                    ¡Email Enviado!
                  </Title>
                  <Text size="sm" c="dimmed" mb="md">
                    Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                  </Text>
                  <Text size="xs" c="dimmed" mb="lg">
                    Si no recibes el email en unos minutos, revisa tu carpeta de spam.
                  </Text>
                  
                  <Stack gap="sm">
                    <Button
                      onClick={() => {
                        setSuccess(false);
                        setEmail('');
                        setError('');
                      }}
                      variant="light"
                      leftSection={<IconMail size={16} />}
                    >
                      Enviar otro email
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      leftSection={<IconArrowLeft size={16} />}
                      onClick={() => router.push('/login')}
                    >
                      Volver al login
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Paper>
          </Stack>
        </Container>
      </Box>
    </>
  );
}