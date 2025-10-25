import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Card,
  Stack,
  Group,
  Button,
  Table,
  ActionIcon,
  Text,
  Badge,
  Loader,
  Modal,
  TextInput
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconRefresh
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useApiWithErrorHandling } from '@/hooks/useApiWithErrorHandling';

/**
 * Ejemplo de componente usando el nuevo sistema de manejo de errores
 */
const SimpleAdminComponent = ({ 
  title = "Administración",
  apiEndpoint = "/api/admin/items",
  itemName = "elemento",
  itemNamePlural = "elementos"
}) => {
  // Estados
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);

  // Hook para manejo de errores y API
  const { 
    isLoading, 
    create, 
    update, 
    remove, 
    fetch,
    clearError 
  } = useApiWithErrorHandling();

  // Formulario
  const form = useForm({
    initialValues: {
      name: '',
      description: ''
    },
    validate: {
      name: (value) => (!value.trim() ? 'El nombre es obligatorio' : null)
    }
  });

  // Cargar datos al inicializar
  useEffect(() => {
    loadItems();
  }, []);

  // Funciones de API
  const loadItems = async () => {
    const result = await fetch(
      async () => {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudieron cargar los ${itemNamePlural}`);
        }
        const data = await response.json();
        return data.items || data.data || [];
      },
      itemNamePlural
    );

    if (result.success) {
      setItems(result.data);
    }
  };

  const handleCreate = async (values) => {
    const result = await create(
      async () => {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Error ${response.status}`);
        }
        
        return response.json();
      },
      itemName
    );

    if (result.success) {
      setCreateModalOpened(false);
      form.reset();
      await loadItems();
    }
  };

  const handleUpdate = async (values) => {
    if (!selectedItem) return;

    const result = await update(
      async () => {
        const response = await fetch(`${apiEndpoint}/${selectedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Error ${response.status}`);
        }
        
        return response.json();
      },
      itemName
    );

    if (result.success) {
      setEditModalOpened(false);
      setSelectedItem(null);
      form.reset();
      await loadItems();
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    const result = await remove(
      async () => {
        const response = await fetch(`${apiEndpoint}/${selectedItem.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Error ${response.status}`);
        }
        
        return response.json();
      },
      itemName
    );

    if (result.success) {
      setDeleteModalOpened(false);
      setSelectedItem(null);
      await loadItems();
    }
  };

  // Handlers de UI
  const openCreateModal = () => {
    clearError();
    form.reset();
    setCreateModalOpened(true);
  };

  const openEditModal = (item) => {
    clearError();
    setSelectedItem(item);
    form.setValues({
      name: item.name || '',
      description: item.description || ''
    });
    setEditModalOpened(true);
  };

  const openDeleteModal = (item) => {
    clearError();
    setSelectedItem(item);
    setDeleteModalOpened(true);
  };

  if (isLoading && items.length === 0) {
    return (
      <Container size="xl">
        <Stack align="center" mt={50}>
          <Loader size="lg" />
          <Text>Cargando {itemNamePlural}...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={2}>{title}</Title>
          <Group>
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={loadItems}
              loading={isLoading}
            >
              Actualizar
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openCreateModal}
            >
              Nuevo {itemName}
            </Button>
          </Group>
        </Group>

        {/* Tabla */}
        <Card withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Descripción</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text ta="center" c="dimmed">
                      No se encontraron {itemNamePlural}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                items.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Text fw={500}>{item.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{item.description || 'Sin descripción'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => openEditModal(item)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => openDeleteModal(item)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Card>
      </Stack>

      {/* Modal Crear */}
      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title={`Crear ${itemName}`}
        centered
      >
        <form onSubmit={form.onSubmit(handleCreate)}>
          <Stack gap="md">
            <TextInput
              label="Nombre"
              placeholder={`Nombre del ${itemName}`}
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Descripción"
              placeholder="Descripción opcional"
              {...form.getInputProps('description')}
            />
            <Group justify="flex-end" gap="sm">
              <Button
                variant="outline"
                onClick={() => setCreateModalOpened(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isLoading}
              >
                Crear
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title={`Editar ${itemName}`}
        centered
      >
        <form onSubmit={form.onSubmit(handleUpdate)}>
          <Stack gap="md">
            <TextInput
              label="Nombre"
              placeholder={`Nombre del ${itemName}`}
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Descripción"
              placeholder="Descripción opcional"
              {...form.getInputProps('description')}
            />
            <Group justify="flex-end" gap="sm">
              <Button
                variant="outline"
                onClick={() => setEditModalOpened(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isLoading}
              >
                Actualizar
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={`Eliminar ${itemName}`}
        centered
      >
        <Stack gap="md">
          <Text>
            ¿Estás seguro de que deseas eliminar &quot;{selectedItem?.name}&quot;?
          </Text>
          <Text size="sm" c="dimmed">
            Esta acción no se puede deshacer.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpened(false)}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={isLoading}
            >
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default SimpleAdminComponent;