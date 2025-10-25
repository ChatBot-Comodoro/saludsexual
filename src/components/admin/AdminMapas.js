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
  Alert,
  ScrollArea,
  Tabs,
  TextInput,
  Modal,
  Portal
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconMap,
  IconList,
  IconSearch,
  IconCheck,
  IconX,
  IconAlertCircle
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const AdminMapas = () => {
  const router = useRouter();
  const { handleApiError, clearError } = useErrorHandler();
  
  // Estados principales
  const [centros, setCentros] = useState([]);
  const [filteredCentros, setFilteredCentros] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tipos, setTipos] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [activeTab, setActiveTab] = useState('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshMapTrigger, setRefreshMapTrigger] = useState(0);
  
  // Estados para modal de confirmación
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [centroToDelete, setCentroToDelete] = useState(null);
  
  // Estado para overlay de eliminación
  const [overlayState, setOverlayState] = useState({
    visible: false,
    type: null, // 'loading', 'success', 'error'
    message: ''
  });

  // Cargar todos los datos al inicializar
  useEffect(() => {
    loadAllData();
  }, []);

  // Filtrar centros cuando cambie la búsqueda
  useEffect(() => {
    filterCentros();
  }, [searchQuery, centros]);

  // Función para cargar todos los datos
  const loadAllData = async () => {
    setLoading(true);
    clearError();
    
    const result = await handleApiError(async () => {
      await Promise.all([
        loadCentros(),
        loadCategorias(),
        loadTipos()
      ]);
    }, 'Error al cargar los datos iniciales del sistema');
    
    if (!result.success) {
      // El error ya fue manejado por handleApiError
      console.error('Error cargando datos:', result.error);
    }
    
    setLoading(false);
  };

  // Cargar centros de salud
  const loadCentros = async () => {
    const response = await fetch('/api/admin/centros-salud?type=centros');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo cargar la lista de centros de salud`);
    }
    
    const data = await response.json();
    if (!data.data) {
      throw new Error('Los datos recibidos no tienen el formato esperado');
    }
    
    setCentros(data.data);
    setFilteredCentros(data.data);
  };

  // Cargar categorías
  const loadCategorias = async () => {
    const response = await fetch('/api/admin/centros-salud?type=categorias');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo cargar las categorías`);
    }
    
    const data = await response.json();
    if (!data.data) {
      throw new Error('Los datos de categorías no tienen el formato esperado');
    }
    
    setCategorias(data.data);
  };

  // Cargar tipos
  const loadTipos = async () => {
    const response = await fetch('/api/admin/centros-salud?type=tipos');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo cargar los tipos de centros`);
    }
    
    const data = await response.json();
    if (!data.data) {
      throw new Error('Los datos de tipos no tienen el formato esperado');
    }
    
    setTipos(data.data);
  };

  // Filtrar centros por búsqueda
  const filterCentros = () => {
    if (!searchQuery.trim()) {
      setFilteredCentros(centros);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = centros.filter(centro => {
      const nombre = (centro.nombre || centro.name || '').toLowerCase();
      const direccion = (centro.direccion || centro.address || '').toLowerCase();
      
      return nombre.includes(query) || direccion.includes(query);
    });
    
    setFilteredCentros(filtered);
  };

  // Funciones de navegación
  const handleCreate = () => {
    router.push('/admin/centros/crear');
  };

  const handleEdit = (centro) => {
    router.push(`/admin/centros/editar/${centro.id}`);
  };

  // Abrir modal de confirmación para eliminar
  const handleDelete = (centro) => {
    setCentroToDelete(centro);
    setDeleteModalOpened(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!centroToDelete) return;

    console.log('🔍 DEBUGGING - Centro a eliminar:', centroToDelete);
    console.log('🔍 DEBUGGING - ID del centro:', centroToDelete.id, 'Tipo:', typeof centroToDelete.id);

    // Asegurar que el ID sea un número entero
    const centroId = parseInt(centroToDelete.id);
    if (isNaN(centroId)) {
      console.error('❌ ID del centro no es válido:', centroToDelete.id);
      notifications.show({
        title: 'Error',
        message: 'ID del centro no válido',
        color: 'red',
        icon: <IconX />
      });
      return;
    }

    // Cerrar modal y mostrar overlay de carga
    setDeleteModalOpened(false);
    setOverlayState({
      visible: true,
      type: 'loading',
      message: ''
    });

    setDeleting(centroId);
    
    const result = await handleApiError(async () => {
      const deletePayload = { id: centroId };
      console.log('🔍 DEBUGGING - Payload enviado:', deletePayload);

      // Enviar ID tanto en URL como en body para mayor compatibilidad
      const response = await fetch(`/api/admin/centros-salud?id=${centroId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deletePayload),
      });

      console.log('🔍 DEBUGGING - Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: No se pudo eliminar el centro`);
      }
      
      const data = await response.json();
      console.log('🔍 DEBUGGING - Response data:', data);
      
      return data;
    }, 'No se pudo eliminar el centro de salud. Intenta nuevamente.');

    if (result.success) {
      // Mostrar estado de éxito
      setOverlayState({
        visible: true,
        type: 'success',
        message: 'Centro eliminado exitosamente'
      });

      // Recargar datos
      await loadCentros();
      setRefreshMapTrigger(prev => prev + 1);

      // Ocultar overlay después de 2 segundos
      setTimeout(() => {
        setOverlayState({ visible: false, type: null, message: '' });
      }, 2000);
    } else {
      // Mostrar estado de error
      setOverlayState({
        visible: true,
        type: 'error',
        message: result.error?.userMessage || 'No se pudo eliminar el centro. Inténtelo nuevamente'
      });
    }
    
    setDeleting(null);
    setCentroToDelete(null);
  };

  // Funciones auxiliares
  const getTipoName = (tipoId) => {
    const tipo = tipos.find(t => t.id === tipoId);
    return tipo ? tipo.tipo : 'N/A';
  };

  const getCategoriaName = (categoriaId) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.categoria : 'N/A';
  };

  const formatCoordenadas = (lat, lng) => {
    const latitud = parseFloat(lat);
    const longitud = parseFloat(lng);
    
    if (isNaN(latitud) || isNaN(longitud)) {
      return 'Coordenadas no válidas';
    }
    
    return `${latitud.toFixed(4)}, ${longitud.toFixed(4)}`;
  };

  if (loading) {
    return (
      <Container size="xl">
        <Stack align="center" mt={50}>
          <Loader size="lg" />
          <Text>Cargando datos...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={2}>Administración de Mapas</Title>
          <Button
            leftSection={<IconPlus />}
            onClick={handleCreate}
          >
            Nuevo Centro
          </Button>
        </Group>

        {/* Estadísticas básicas */}
        <Group grow>
          <Card withBorder>
            <Text size="sm" c="dimmed">Total Centros</Text>
            <Text size="xl" fw={700}>{centros.length}</Text>
          </Card>
        </Group>

        {/* Búsqueda */}
        <TextInput
          placeholder="Buscar por nombre o dirección..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
        />

        {/* Tabs para Lista y Mapa */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="lista" leftSection={<IconList size={16} />}>
              Lista
            </Tabs.Tab>
            <Tabs.Tab value="mapa" leftSection={<IconMap size={16} />}>
              Mapa
            </Tabs.Tab>
          </Tabs.List>

          {/* Panel de Lista */}
          <Tabs.Panel value="lista" pt="md">
            <Card withBorder>
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Nombre</Table.Th>
                      <Table.Th>Dirección</Table.Th>
                      <Table.Th>Tipo</Table.Th>
                      <Table.Th>Categoría</Table.Th>
                      <Table.Th>Coordenadas</Table.Th>
                      <Table.Th>Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredCentros.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Text ta="center" c="dimmed">
                            No se encontraron centros
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filteredCentros.map((centro) => (
                        <Table.Tr key={centro.id}>
                          <Table.Td>
                            <Text fw={500}>{centro.nombre || centro.name}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{centro.direccion || centro.address}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light">
                              {getTipoName(centro.tipo_id)}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="outline">
                              {getCategoriaName(centro.categoria_id)}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="dimmed">
                              {formatCoordenadas(centro.latitud || centro.lat, centro.longitud || centro.lng)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                onClick={() => handleEdit(centro)}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="red"
                                loading={deleting === centro.id}
                                onClick={() => handleDelete(centro)}
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
              </ScrollArea>
            </Card>
          </Tabs.Panel>

          {/* Panel de Mapa */}
          <Tabs.Panel value="mapa" pt="md">
            <Card withBorder style={{ height: '600px' }}>
              <Stack align="center" justify="center" h="100%">
                <Text>Vista de Mapa (próximamente)</Text>
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>
      
      {/* Modal de confirmación para eliminar */}
      <Portal>
        <Modal
          opened={deleteModalOpened}
          onClose={() => setDeleteModalOpened(false)}
          title="Confirmar Eliminación"
          centered
          size="md"
          zIndex={9999}
          closeOnClickOutside={true}
          closeOnEscape={true}
          trapFocus={true}
          classNames={{
            inner: 'delete-confirmation-modal',
            modal: 'delete-confirmation-modal',
            overlay: 'delete-confirmation-modal',
            header: 'delete-confirmation-modal',
            body: 'delete-confirmation-modal'
          }}
          overlayProps={{
            opacity: 0.55,
            blur: 3,
            zIndex: 9998,
          }}
          styles={{
            modal: {
              zIndex: 10000,
              position: 'relative',
            },
            overlay: {
              zIndex: 9999,
              position: 'fixed',
            },
            inner: {
              zIndex: 9999,
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            },
            header: {
              zIndex: 10001,
            },
            body: {
              zIndex: 10000,
            }
          }}
        >
        <Stack gap="md">
          <Group gap="sm">
            <IconAlertCircle size={24} color="red" />
            <Text size="md" fw={500}>
              ¿Está seguro de eliminar este centro?
            </Text>
          </Group>
          
          {centroToDelete && (
            <Card p="sm" withBorder bg="gray.1">
              <Text fw={500} c="dark">
                {centroToDelete.nombre || centroToDelete.name}
              </Text>
              <Text size="sm" c="dimmed">
                {centroToDelete.direccion || centroToDelete.address}
              </Text>
            </Card>
          )}
          
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            Esta acción no se puede deshacer. Se eliminará permanentemente el centro de salud.
          </Alert>
          
          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpened(false)}
              disabled={deleting === parseInt(centroToDelete?.id)}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={confirmDelete}
              loading={deleting === parseInt(centroToDelete?.id)}
              leftSection={<IconTrash size={16} />}
            >
              Eliminar Centro
            </Button>
          </Group>
        </Stack>
      </Modal>
      </Portal>

      {/* Overlay para mostrar el resultado de la eliminación */}
      {overlayState.visible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
          }}
        >
          <Card
            shadow="xl"
            p="xl"
            radius="md"
            style={{
              textAlign: 'center',
              minWidth: '300px',
              position: 'relative',
            }}
          >
            {overlayState.type === 'loading' && (
              <>
                <Loader size="xl" style={{ margin: '0 auto 20px' }} />
                <Text size="lg" fw={500}>
                  Eliminando centro de salud...
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  Por favor espere
                </Text>
              </>
            )}

            {overlayState.type === 'success' && (
              <>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#51cf66',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <IconCheck size={40} color="white" />
                </div>
                <Text size="lg" fw={500} c="green">
                  ¡Centro eliminado exitosamente!
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  {overlayState.message}
                </Text>
              </>
            )}

            {overlayState.type === 'error' && (
              <>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#ff6b6b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <IconX size={40} color="white" />
                </div>
                <Text size="lg" fw={500} c="red">
                  Error al eliminar el centro
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  {overlayState.message}
                </Text>
                <Button
                  mt="md"
                  variant="outline"
                  onClick={() => setOverlayState({ visible: false, type: null, message: '' })}
                >
                  Cerrar
                </Button>
              </>
            )}
          </Card>
        </div>
      )}
    </Container>
  );
};

export default AdminMapas;