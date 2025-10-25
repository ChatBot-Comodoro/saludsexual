// Página dedicada para editar un artículo específico
import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Paper,
  Loader,
  Alert,
  Breadcrumbs,
  Anchor
} from '@mantine/core';
import {
  IconArrowLeft,
  IconAlertCircle,
  IconDeviceFloppy,
  IconX
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useArticles } from '../../../../hooks/useArticles';
import LoadingScreen from '../../../../components/LoadingScreen';
import ArticleEditor from '../../../../components/admin/ArticleEditor';
import { notifications } from '@mantine/notifications';

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const { updateArticle } = useArticles();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.role !== 1) {
      router.push('/admin/login');
      return;
    }
  }, [session, status, router]);

  // Cargar artículo cuando tenemos el ID
  useEffect(() => {
    if (!id || status === 'loading') return;

    const loadArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Hacer la llamada directa a la API en lugar de usar el hook
        const response = await fetch(`/api/admin/articles?id=${id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Para incluir cookies de sesión
        });
        
        const data = await response.json();
        
        if (data.success) {
          setArticle(data.data);
        } else {
          throw new Error(data.message || 'Error al obtener artículo');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
    // Solo depender del id, no de getArticleById para evitar bucles infinitos
  }, [id, status]);

  // Función para guardar cambios del artículo
  const handleSave = async (articleData) => {
    try {
      setSaving(true);
      await updateArticle({ ...articleData, id: article.id });
      notifications.show({
        title: 'Éxito',
        message: 'Artículo actualizado correctamente',
        color: 'green'
      });
      // Actualizar los datos locales
      setArticle(prev => ({ ...prev, ...articleData }));
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };

  // Función para cancelar y volver
  const handleCancel = () => {
    router.push('/admin/dashboard');
  };

  // Mostrar loader mientras se verifica la sesión
  if (status === 'loading') {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Verificando permisos...</Text>
        </Stack>
      </Container>
    );
  }

  // Redirigir si no está autenticado
  if (!session || session.role !== 1) {
    return null;
  }

  // Mostrar loader mientras carga el artículo
  if (loading) {
    return (
      <LoadingScreen 
        message="Cargando artículo..." 
        showBackButton={true}
        backHref="/admin/dashboard"
        backText="Volver al Dashboard"
      />
    );
  }

  // Mostrar error si hay problemas
  if (error) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg">
          <Button
            component={Link}
            href="/admin/dashboard"
            leftSection={<IconArrowLeft size={16} />}
            variant="light"
          >
            Volver al Dashboard
          </Button>
          
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error al cargar el artículo" 
            color="red"
          >
            {error}
          </Alert>
        </Stack>
      </Container>
    );
  }

  // Mostrar mensaje si no se encuentra el artículo
  if (!article) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg">
          <Button
            component={Link}
            href="/admin/dashboard"
            leftSection={<IconArrowLeft size={16} />}
            variant="light"
          >
            Volver al Dashboard
          </Button>
          
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Artículo no encontrado" 
            color="yellow"
          >
            No se pudo encontrar el artículo con ID: {id}
          </Alert>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor component={Link} href="/admin/dashboard">
            Dashboard
          </Anchor>
          <Text>Editar Artículo</Text>
        </Breadcrumbs>

        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} size="h2" mb="xs">
              Editar Artículo
            </Title>
            <Text size="lg" fw={500} c="blue.6">
              {article.title}
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              Slug: {article.slug} • {article.sections_count} secciones
            </Text>
          </div>
          
          <Group gap="xs">
            <Button
              leftSection={<IconX size={16} />}
              variant="light"
              color="gray"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              leftSection={<IconArrowLeft size={16} />}
              component={Link}
              href="/admin/dashboard"
              variant="light"
            >
              Volver al Dashboard
            </Button>
          </Group>
        </Group>

        {/* Editor de artículo */}
        <Paper shadow="sm" radius="md" p="lg">
          <ArticleEditor
            article={article}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
        </Paper>
      </Stack>
    </Container>
  );
}