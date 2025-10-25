import React from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Box
} from '@mantine/core';
import {
  IconHome,
  IconArrowLeft
} from '@tabler/icons-react';
import Link from 'next/link';
import Head from 'next/head';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Página no encontrada - Comodoro Salud</title>
        <meta name="description" content="La página que buscas no existe." />
      </Head>
      
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}
      >
        <Container size="md">
          <Stack gap="xl" align="center" style={{ textAlign: 'center' }}>
            <Title order={1} size="4rem" c="red.6" fw={700}>
              404
            </Title>
            <Title order={2} size="2rem" fw={600}>
              ¡Oops! Página no encontrada
            </Title>
            <Text size="lg" c="dimmed" style={{ maxWidth: 500 }}>
              La página que estás buscando no existe o ha sido movida. 
              No te preocupes, podemos ayudarte a encontrar lo que necesitas.
            </Text>
            
            <Group gap="md" justify="center">
              <Button
                component={Link}
                href="/"
                size="lg"
                leftSection={<IconHome size={20} />}
                radius="xl"
                style={{
                  background: 'linear-gradient(45deg, #339af0 0%, #228be6 100%)',
                  border: 'none'
                }}
              >
                Ir al Inicio
              </Button>
              <Button
                variant="outline"
                size="lg"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => window.history.back()}
                radius="xl"
                c="gray.7"
                style={{ borderColor: '#ced4da' }}
              >
                Volver
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
