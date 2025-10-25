import { Container, Title, Text, Box, Button, Group } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import LoadingScreen from "../LoadingScreen";

export default function ArticlePage({ 
  title, 
  loadingMessage, 
  getContent, 
  loadingDelay = 1000 
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí más adelante haremos la llamada a la API para obtener el contenido
    // Por ahora simulamos contenido HTML usando la función getContent
    setTimeout(() => {
      setContent(getContent());
      setLoading(false);
    }, loadingDelay);
  }, [getContent, loadingDelay]);

  if (loading) {
    return (
      <LoadingScreen 
        message={loadingMessage}
        backHref="/"
        backText="Volver al inicio"
      />
    );
  }

  return (
    <Container size="md" py="xl">
      <Group mb="xl">
        <Button 
          component={Link} 
          href="/" 
          variant="light" 
          leftSection={<IconArrowLeft size={16} />}
          color="gray"
        >
          Volver al inicio
        </Button>
      </Group>

      <Box>
        <Title order={1} mb="xl" ta="center" c="#FF0048">
          {title}
        </Title>
        
        {/* Contenedor para el HTML que viene de la base de datos */}
        <Box
          style={{
            backgroundColor: '#FFF2F6',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #FFE8F1'
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Box>
    </Container>
  );
}
