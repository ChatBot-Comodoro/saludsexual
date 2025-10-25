import React from 'react';
import {
  Container,
  Stack,
  Loader,
  Text,
  Button,
  Paper,
  Center,
  Group
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

export default function LoadingScreen({ 
  message = "Cargando...", 
  backHref = "/", 
  backText = "Volver" 
}) {
  return (
    <Container size="sm" py="xl">
      <Center style={{ minHeight: '60vh' }}>
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Stack align="center" gap="lg">
            <Loader size="lg" />
            <Text size="lg" fw={500} ta="center">
              {message}
            </Text>
            
            {backHref && (
              <Group justify="center" mt="md">
                <Button
                  component={Link}
                  href={backHref}
                  variant="light"
                  leftSection={<IconArrowLeft size={16} />}
                >
                  {backText}
                </Button>
              </Group>
            )}
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
}
