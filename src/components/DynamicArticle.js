// Componente reutilizable para mostrar artículos dinámicos con acordeones
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Box,
  Breadcrumbs,
  Anchor,
  Button,
  Group,
  Stack,
  Loader,
  Alert
} from '@mantine/core';
import { IconChevronRight, IconMap, IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';
import Head from 'next/head';
import { usePublicArticle } from '../hooks/useArticles';
import LoadingScreen from './LoadingScreen';

// Componente acordeón personalizado
const DynamicAccordion = ({ sections, slug }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <Box mt={25}>
      {/* Solo mostrar título y descripción si NO es ITS */}
      {slug !== 'its' && (
        <>
          <Title 
            order={3} 
            size="h3" 
            ta="center" 
            mb={12} 
            c="#FF0048"
          >
            Información Detallada
          </Title>
          
          <Text 
            ta="center" 
            mb={20} 
            c="#666" 
            size="sm"
          >
            Haz clic en cada sección para conocer información completa:
          </Text>
        </>
      )}
      
      <Stack gap="xs">
        {sections.map((section) => (
          <Paper 
            key={section.id || section.section_key} 
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
                onClick={() => setExpandedSection(
                  expandedSection === section.section_key ? null : section.section_key
                )}
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
                  {section.description && (
                    <Text size="xs" c="#666" lh={1.3}>
                      {section.description}
                    </Text>
                  )}
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
                  backgroundColor: expandedSection === section.section_key ? '#FF0048' : '#FFF8FA',
                  borderLeft: '1px solid #FFB3CC',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setExpandedSection(
                  expandedSection === section.section_key ? null : section.section_key
                )}
              >
                <Text 
                  size="lg" 
                  fw={700} 
                  c={expandedSection === section.section_key ? '#FFFFFF' : '#FF0048'}
                  style={{ lineHeight: 1 }}
                >
                  {expandedSection === section.section_key ? '−' : '+'}
                </Text>
              </Box>
            </Box>
            
            {expandedSection === section.section_key && (
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
                  '& ol': { 
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
};

// Componente principal de artículo dinámico
export default function DynamicArticle({ 
  slug, 
  showMapButton = false, 
  mapButtonText = "¿Dónde puedo Testearme?",
  breadcrumbText = null 
}) {
  const { article, loading, error } = usePublicArticle(slug);

  if (loading) {
    return (
      <LoadingScreen 
        message="Cargando artículo..." 
        showBackButton={true}
        backHref="/"
        backText="Volver al inicio"
      />
    );
  }

  if (error || !article) {
    return (
      <Container size="md" py={60}>
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
        >
          {error || 'Artículo no encontrado'}
        </Alert>
      </Container>
    );
  }

  const { article: articleData, sections, metadata } = article;

  return (
    <>
      <Head>
        <title>{articleData.title} - Comodoro Salud</title>
        <meta 
          name="description" 
          content={articleData.meta_description || `Información completa sobre ${articleData.title} verificada por la Secretaría de Salud del Municipio de Comodoro Rivadavia.`} 
        />
        <meta 
          name="keywords" 
          content={articleData.meta_keywords || `${articleData.title}, salud sexual, Comodoro Rivadavia`} 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Container size="md" py={60}>
        <Box mb={30}>
          <Breadcrumbs separator={<IconChevronRight size={14} />} mb={20}>
            <Anchor component={Link} href="/">
              Inicio
            </Anchor>
            <Text size="sm" c="#666">
              {breadcrumbText || articleData.title}
            </Text>
          </Breadcrumbs>
        </Box>

        <Paper p={{ base: 20, sm: 40 }} shadow="xs" radius="md">
          <Title order={1} size="h1" mb={30} c="#FF0048">
            {articleData.title}
          </Title>
          
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
              '& h4': { 
                color: '#FF0048', 
                marginTop: 15, 
                marginBottom: 8,
                fontSize: 18,
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
              '& ol': { 
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
            {/* Contenido principal del artículo */}
            <div dangerouslySetInnerHTML={{ __html: articleData.content }} />
            
            {/* Secciones acordeón dinámicas */}
            <DynamicAccordion sections={sections} slug={slug} />
            
            {/* Botón del mapa después de los acordeones */}
            {showMapButton && (
              <Group justify="center" gap="md" pt={30} mt={20}>
                <Button 
                  component={Link} 
                  href="/mapa" 
                  size="md"
                  variant="outline"
                  leftSection={<IconMap size={18} />}
                  radius="xl"
                  styles={{
                    root: {
                      '@media (max-width: 768px)': {
                        fontSize: '13px',
                        padding: '8px 12px',
                        height: '38px'
                      },
                      '@media (min-width: 769px)': {
                        fontSize: '15px',
                        padding: '10px 16px',
                        height: '42px'
                      }
                    }
                  }}
                >
                  {mapButtonText}
                </Button>
              </Group>
            )}
          </Box>
        </Paper>
      </Container>
    </>
  );
}