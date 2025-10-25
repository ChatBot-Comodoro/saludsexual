import { Container, Box, Button, Group, Loader, Center, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function LoadingScreen({ 
  message = "Cargando información...", 
  showBackButton = true, 
  backHref = "/",
  backText = "Volver al inicio" 
}) {
  return (
    <Container size="md" py="xl">
      {showBackButton && (
        <Group mb="lg">
          <Link href={backHref} passHref>
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}>
              {backText}
            </Button>
          </Link>
        </Group>
      )}
      
      <Center style={{ height: '70vh' }}>
        <Box ta="center">
          <Loader size="lg" color="#FF0048" />
          <Text mt="md" c="dimmed">
            {message}
          </Text>
        </Box>
      </Center>
    </Container>
  );
}
