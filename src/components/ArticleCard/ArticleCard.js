import React from 'react';
import Link from 'next/link';
import { Card, Text, Badge, Group, Button, Stack } from '@mantine/core';
import { IconEye, IconCalendar, IconUser } from '@tabler/icons-react';
import styles from './ArticleCard.module.css';

/**
 * Componente para mostrar una tarjeta de artículo
 * Usado tanto en listados como en grillas de artículos
 */
const ArticleCard = ({ 
  articulo, 
  showFullContent = false,
  showActions = false,
  onEdit,
  onDelete,
  onView,
  variant = 'default' // 'default', 'compact', 'admin'
}) => {
  if (!articulo) return null;

  const {
    id,
    titulo,
    html,
    fecha_creacion,
    fecha_actualizacion,
    usuario_nombre,
    estado
  } = articulo;

  // Extraer texto plano del HTML para preview
  const getTextPreview = (htmlContent, maxLength = 150) => {
    if (!htmlContent) return '';
    
    // Crear un elemento temporal para extraer texto
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    if (textContent.length <= maxLength) return textContent;
    return textContent.slice(0, maxLength) + '...';
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determinar el estado visual
  const getEstadoBadge = () => {
    switch (estado) {
      case 'publicado':
        return <Badge color="green" variant="light">Publicado</Badge>;
      case 'borrador':
        return <Badge color="yellow" variant="light">Borrador</Badge>;
      case 'archivado':
        return <Badge color="gray" variant="light">Archivado</Badge>;
      default:
        return <Badge color="blue" variant="light">Activo</Badge>;
    }
  };

  // Renderizar según la variante
  if (variant === 'compact') {
    return (
      <Card shadow="sm" padding="md" radius="md" withBorder className={styles.compactCard}>
        <Group justify="space-between" mb="xs">
          <Text fw={500} size="sm" lineClamp={1}>{titulo}</Text>
          {showActions && (
            <Group gap="xs">
              {onView && (
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconEye size={14} />}
                  onClick={() => onView(articulo)}
                >
                  Ver
                </Button>
              )}
            </Group>
          )}
        </Group>
        
        <Text size="xs" c="dimmed" mb="sm">
          {formatDate(fecha_creacion)}
        </Text>
        
        <Text size="sm" lineClamp={2}>
          {getTextPreview(html, 80)}
        </Text>
      </Card>
    );
  }

  if (variant === 'admin') {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.adminCard}>
        <Stack gap="md">
          <Group justify="space-between">
            <div>
              <Text fw={600} size="lg" mb={4}>{titulo}</Text>
              <Group gap="xs">
                {getEstadoBadge()}
                <Text size="xs" c="dimmed">
                  <IconCalendar size={12} style={{ marginRight: 4 }} />
                  {formatDate(fecha_actualizacion || fecha_creacion)}
                </Text>
                {usuario_nombre && (
                  <Text size="xs" c="dimmed">
                    <IconUser size={12} style={{ marginRight: 4 }} />
                    {usuario_nombre}
                  </Text>
                )}
              </Group>
            </div>
          </Group>

          <Text size="sm" lineClamp={3}>
            {getTextPreview(html, 200)}
          </Text>

          {showActions && (
            <Group justify="flex-end" gap="xs">
              {onView && (
                <Button
                  size="sm"
                  variant="light"
                  leftSection={<IconEye size={16} />}
                  onClick={() => onView(articulo)}
                >
                  Ver
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="filled"
                  onClick={() => onEdit(articulo)}
                >
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="light"
                  color="red"
                  onClick={() => onDelete(articulo)}
                >
                  Eliminar
                </Button>
              )}
            </Group>
          )}
        </Stack>
      </Card>
    );
  }

  // Variante default para usuarios finales
  return (
    <Card shadow="md" padding="lg" radius="md" withBorder className={styles.defaultCard}>
      <Stack gap="md">
        <div>
          <Text fw={600} size="xl" mb="sm">{titulo}</Text>
          
          <Group gap="md" mb="md">
            <Text size="sm" c="dimmed">
              <IconCalendar size={14} style={{ marginRight: 4 }} />
              {formatDate(fecha_creacion)}
            </Text>
            {usuario_nombre && (
              <Text size="sm" c="dimmed">
                <IconUser size={14} style={{ marginRight: 4 }} />
                Por {usuario_nombre}
              </Text>
            )}
          </Group>
        </div>

        {showFullContent ? (
          <div 
            className={styles.htmlContent}
            dangerouslySetInnerHTML={{ __html: html }} 
          />
        ) : (
          <>
            <Text size="md" mb="md">
              {getTextPreview(html, 200)}
            </Text>
            
            <Group justify="flex-end">
              <Link href={`/articulos/${id}`} passHref>
                <Button
                  variant="light"
                  rightSection={<IconEye size={16} />}
                >
                  Leer más
                </Button>
              </Link>
            </Group>
          </>
        )}
      </Stack>
    </Card>
  );
};

export default ArticleCard;