import React, { useState, useEffect } from 'react';
import { Container, Paper, Title, Text, Box, Breadcrumbs, Anchor, Button, Group, Stack, Alert, Loader } from '@mantine/core';
import Link from 'next/link';
import Head from 'next/head';
import { IconChevronRight, IconMap, IconAlertCircle } from '@tabler/icons-react';
import LoadingScreen from '../components/LoadingScreen';

// Componente para mostrar el artículo de VIH consumido desde el backend
export default function VIHDinamicoPage() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');

  // Cargar el artículo desde el backend
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch('/api/public/articles/vih');
        if (!response.ok) {
          throw new Error('Error al cargar el artículo');
        }
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, []);

  // Función para scroll suave con offset para el navbar
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80; // Altura aproximada del navbar
      const elementPosition = element.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // Componente acordeón para temas avanzados de VIH (usando datos del backend)
  const VIHAccordion = ({ sections }) => (
    <Box mt={25}>
      <Title 
        order={3} 
        size="h3" 
        ta="center" 
        mb={12} 
        c="#FF0048"
      >
        Información Avanzada sobre VIH
      </Title>
      
      <Text 
        ta="center" 
        mb={20} 
        c="#666" 
        size="sm"
      >
        Haz clic en cada sección para conocer información detallada:
      </Text>
      
      <Stack gap="xs">
        {sections.map((section) => (
          <Paper 
            key={section.section_key} 
            bg="#FFFFFF"
            style={{
              border: '1px solid #FFB3CC',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Button
                variant="subtle"
                onClick={() => setSelectedTopic(selectedTopic === section.section_key ? null : section.section_key)}
                styles={{
                  root: {
                    height: 'auto',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: 0,
                    flex: 1,
                    '&:hover': {
                      backgroundColor: '#FFF8FA',
                    },
                  },
                  inner: {
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                  },
                }}
              >
                <Box ta="left" w="100%">
                  <Text size="md" fw={600} c="#FF0048" mb={2}>
                    {section.title}
                  </Text>
                  <Text size="xs" c="#666" lh={1.3}>
                    {section.description}
                  </Text>
                </Box>
              </Button>
              
              <Box
                style={{
                  width: '32px',
                  height: '100%',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selectedTopic === section.section_key ? '#FF0048' : '#FFF8FA',
                  borderLeft: '1px solid #FFB3CC',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setSelectedTopic(selectedTopic === section.section_key ? null : section.section_key)}
              >
                <Text 
                  size="lg" 
                  fw={700} 
                  c={selectedTopic === section.section_key ? '#FFFFFF' : '#FF0048'}
                  style={{ lineHeight: 1 }}
                >
                  {selectedTopic === section.section_key ? '−' : '+'}
                </Text>
              </Box>
            </Box>
            
            {selectedTopic === section.section_key && (
              <Box 
                p={16}
                style={{
                  borderTop: '1px solid #FFE0E8',
                  backgroundColor: '#FEFBFC'
                }}
                sx={{
                  '& h3': { 
                    color: '#FF0048', 
                    marginTop: 16, 
                    marginBottom: 8,
                    fontSize: 18,
                    fontWeight: 600
                  },
                  '& h4': { 
                    color: '#FF0048', 
                    marginTop: 12, 
                    marginBottom: 6,
                    fontSize: 15,
                    fontWeight: 600
                  },
                  '& p': { 
                    marginBottom: 10, 
                    lineHeight: 1.5,
                    textAlign: 'left',
                    fontSize: 14,
                    color: 'black'
                  },
                  '& ul': { 
                    marginBottom: 10,
                    paddingLeft: 18,
                    '& li': { 
                      marginBottom: 4,
                      lineHeight: 1.4,
                      fontSize: 14,
                      color: 'black'
                    }
                  },
                  '& strong': { 
                    color: '#FF0048',
                    fontWeight: 600
                  }
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              </Box>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );

  // Función para renderizar el contenido HTML con el acordeón insertado
  const renderContentWithAccordion = () => {
    if (!article) return null;

    const content = article.content;
    const placeholder = '<div id="advanced-navigation-placeholder"></div>';
    
    if (content.includes(placeholder)) {
      const parts = content.split(placeholder);
      return (
        <div>
          <div dangerouslySetInnerHTML={{ __html: parts[0] }} />
          {article.sections && article.sections.length > 0 && (
            <VIHAccordion sections={article.sections} />
          )}
        </div>
      );
    }
    
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        {article.sections && article.sections.length > 0 && (
          <VIHAccordion sections={article.sections} />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Cargando VIH - Comodoro Salud</title>
        </Head>
        <LoadingScreen 
          message="Cargando artículo desde el backend..." 
          showBackButton={true}
          backHref="/"
          backText="Volver al inicio"
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Comodoro Salud</title>
        </Head>
        <Container size="md" py={60}>
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error al cargar el artículo" 
            color="red"
          >
            {error}
          </Alert>
          <Group justify="center" mt="md">
            <Button component={Link} href="/vih" variant="light">
              Ver versión estática
            </Button>
          </Group>
        </Container>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Head>
          <title>Artículo no encontrado - Comodoro Salud</title>
        </Head>
        <Container size="md" py={60}>
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Artículo no encontrado" 
            color="yellow"
          >
            El artículo de VIH no se encontró en la base de datos. Asegúrate de haberlo migrado correctamente.
          </Alert>
          <Group justify="center" mt="md" gap="md">
            <Button component={Link} href="/admin/migrate-articles" variant="light">
              Ir a Migración
            </Button>
            <Button component={Link} href="/vih" variant="light">
              Ver versión estática
            </Button>
          </Group>
        </Container>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} - Comodoro Salud (Dinámico)</title>
        <meta name="description" content={article.meta_description} />
        <meta name="keywords" content={article.meta_keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Container size="md" py={60}>
        <Box mb={30}>
          <Breadcrumbs separator={<IconChevronRight size={14} />} mb={20}>
            <Anchor component={Link} href="/">
              Inicio
            </Anchor>
            <Anchor component={Link} href="/vih">
              VIH (Estático)
            </Anchor>
            <Text size="sm" c="#666">VIH (Dinámico)</Text>
          </Breadcrumbs>
        </Box>

        {/* Indicador de que es contenido dinámico */}
        <Alert icon={<IconAlertCircle size={16} />} color="blue" mb="md">
          <Group justify="space-between">
            <div>
              <Text fw={500} size="sm">📡 Contenido Dinámico</Text>
              <Text size="xs" c="dimmed">
                Este artículo se está cargando desde la base de datos. 
                Tiene {article.sections?.length || 0} secciones de acordeón.
              </Text>
            </div>
            <Group gap="xs">
              <Button size="xs" variant="light" component={Link} href="/vih">
                Ver Estático
              </Button>
              <Button size="xs" variant="light" component={Link} href="/admin/articles">
                Editar
              </Button>
            </Group>
          </Group>
        </Alert>

        <Paper p={{ base: 20, sm: 40 }} shadow="xs" radius="md">
          <Title order={1} size="h1" mb={30} c="#FF0048">
            {article.title}
          </Title>

          <Group justify="center" gap="md" pt={10}>
            <Button 
              component={Link} 
              href="/mapa" 
              size="lg" 
              variant="outline"
              leftSection={<IconMap size={20} />}
              radius="xl"
            >
              ¿Dónde puedo Testearme?
            </Button>
          </Group>
          
          <Box 
            sx={{ 
              '& h2': { 
                color: '#FF0048', 
                marginTop: 30, 
                marginBottom: 15,
                fontSize: 28,
                fontWeight: 600
              },
              '& h3': { 
                color: '#FF0048', 
                marginTop: 20, 
                marginBottom: 10,
                fontSize: 22,
                fontWeight: 500
              },
              '& p': { 
                marginBottom: 15, 
                textAlign: 'left',
                lineHeight: 1.6 
              },
              '& ul': { 
                textAlign: 'left',
                '& li': { 
                  marginBottom: 8 
                }
              },
              '& strong': { 
                color: '#FF0048' 
              }
            }}
          >
            {renderContentWithAccordion()}
          </Box>

          {/* Información adicional del artículo desde el backend */}
          <Box 
            mt="xl" 
            p="md" 
            style={{ 
              borderTop: '1px solid #e9ecef',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}
          >
            <Text size="xs" c="dimmed" ta="center">
              <strong>Estado:</strong> {article.status} | 
              <strong> Última actualización:</strong> {new Date(article.updated_at).toLocaleDateString('es-AR')} | 
              <strong> Secciones:</strong> {article.sections?.length || 0}
            </Text>
          </Box>
        </Paper>
      </Container>
    </>
  );
}