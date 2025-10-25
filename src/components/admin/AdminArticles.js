// Componente principal para administración de artículos
import React from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Table,
  Badge,
  ActionIcon,
  Paper,
  Loader,
  Alert,
  Box,
  ScrollArea
} from '@mantine/core';
import {
  IconEdit,
  IconEye,
  IconAlertCircle,
  IconArticle,
  IconList,
  IconDatabase
} from '@tabler/icons-react';
import { useArticles } from '../../hooks/useArticles';
import dayjs from 'dayjs';
import Link from 'next/link';
import LoadingScreen from '../LoadingScreen';

export default function AdminArticles() {
  const { articles, loading, error } = useArticles();

  // Función para navegar a la página de edición
  const handleEdit = (article) => {
    // Usar window.location para navegación
    window.location.href = `/admin/articles/edit/${article.id}`;
  };

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'yellow';
      case 'archived': return 'red';
      default: return 'gray';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Borrador';
      case 'archived': return 'Archivado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <LoadingScreen 
        message="Cargando artículos..." 
        showBackButton={true}
        backHref="/admin/dashboard"
        backText="Volver al Dashboard"
      />
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2} size="h2" mb="xs">
              Edición de Artículos
            </Title>
            <Text size="sm" c="dimmed">
              Edita el contenido de los artículos de salud existentes
            </Text>
          </div>
          <Group gap="xs">
            <Button
              component={Link}
              href="/admin/migrate-articles"
              leftSection={<IconDatabase size={16} />}
              variant="light"
              color="green"
            >
              Migrar Artículos
            </Button>
          </Group>
        </Group>

        {/* Tabla de artículos */}
        <Paper shadow="sm" radius="md" p="md">
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Título</Table.Th>
                  <Table.Th>Slug</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Secciones</Table.Th>
                  <Table.Th>Última Actualización</Table.Th>
                  <Table.Th width={120}>Editar</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {articles.map((article) => (
                  <Table.Tr key={article.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <IconArticle size={16} color="var(--mantine-color-blue-6)" />
                        <Text fw={500}>{article.title}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" ff="monospace">
                        {article.slug}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        color={getStatusColor(article.status)} 
                        variant="light"
                        size="sm"
                      >
                        {getStatusText(article.status)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconList size={14} />
                        <Text size="sm">{article.sections_count}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {dayjs(article.updated_at).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          size="sm"
                          onClick={() => handleEdit(article)}
                          title="Editar contenido"
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="green"
                          size="sm"
                          component="a"
                          href={`/${article.slug}`}
                          target="_blank"
                          title="Ver página pública"
                        >
                          <IconEye size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          {articles.length === 0 && (
            <Box ta="center" py="xl">
              <Text c="dimmed" size="lg">
                No hay artículos disponibles
              </Text>
              <Text c="dimmed" size="sm" mt="xs">
                Usa &quot;Migrar Artículos&quot; para importar contenido desde los archivos estáticos
              </Text>
            </Box>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}