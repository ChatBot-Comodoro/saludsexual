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
  Modal,
  Select,
  TextInput,
  Textarea,
  NumberInput,
  MultiSelect,
  Switch,
  Notification,
  ScrollArea,
  Grid,
  Tabs
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconMapPin,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconRefresh,
  IconMap,
  IconList,
  IconSearch
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import AdminMapPreview from './AdminMapPreview';
import CoordinatePicker from './CoordinatePicker';

const AdminMapas = () => {
  // Estados para datos
  const [centros, setCentros] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [servicios, setServicios] = useState([]);
  
  // Estados para UI
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCentro, setSelectedCentro] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [refreshMapTrigger, setRefreshMapTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('lista');
  
  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCentros, setFilteredCentros] = useState([]);

  // Form para crear/editar
  const form = useForm({
    initialValues: {
      nombre: '',
      direccion: '',
      latitud: '',
      longitud: '',
      telefono: '',
      dias_horas: '',
      tipo: '',
      categoria: '',
      descripcion: '',
      servicios: []
    },
    validate: {
      nombre: (value) => (!value ? 'El nombre es requerido' : null),
      direccion: (value) => (!value ? 'La dirección es requerida' : null),
      latitud: (value) => (!value ? 'La latitud es requerida' : null),
      longitud: (value) => (!value ? 'La longitud es requerida' : null),
      tipo: (value) => (!value ? 'El tipo es requerido' : null),
      categoria: (value) => (!value ? 'La categoría es requerida' : null)
    }
  });

  // Cargar todos los datos iniciales
  useEffect(() => {
    loadAllData();
  }, []);

  // Filtrar centros cuando cambie la búsqueda o los centros
  useEffect(() => {
    filterCentros();
  }, [searchQuery, centros]);

  // Función para filtrar centros
  const filterCentros = () => {
    if (!searchQuery.trim()) {
      setFilteredCentros(centros);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = centros.filter(centro => {
      // Buscar en nombre
      const nombre = (centro.nombre || centro.name || '').toLowerCase();
      if (nombre.includes(query)) return true;

      // Buscar en dirección
      const direccion = (centro.direccion || centro.address || '').toLowerCase();
      if (direccion.includes(query)) return true;

      // Buscar en servicios
      const servicios = procesarServicios(centro.servicios);
      const serviciosTexto = servicios.join(' ').toLowerCase();
      if (serviciosTexto.includes(query)) return true;

      return false;
    });

    setFilteredCentros(filtered);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCentros(),
        loadCategorias(),
        loadTipos(),
        loadServicios()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      notifications.show({
        title: 'Error',
        message: 'Error al cargar los datos del sistema',
        color: 'red',
        icon: <IconX />
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCentros = async () => {
    try {
      const response = await fetch('/api/admin/centros-salud?type=centros');
      const data = await response.json();
      if (response.ok) {
        console.log('🔍 Debug - Primer centro completo:', JSON.stringify(data.data[0], null, 2)); // Para debugging
        console.log('🔍 Debug - Campos disponibles:', Object.keys(data.data[0] || {})); // Para ver todos los campos
        
        // Debug específico para coordenadas
        if (data.data[0]) {
          const centro = data.data[0];
          console.log('🌍 Debug coordenadas:', {
            latitud: centro.latitud,
            lat: centro.lat,
            longitud: centro.longitud,
            lng: centro.lng,
            tipos: {
              latitud: typeof centro.latitud,
              lat: typeof centro.lat,
              longitud: typeof centro.longitud,
              lng: typeof centro.lng
            }
          });
        }
        
        setCentros(data.data);
        setFilteredCentros(data.data); // Inicializar filtros
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error cargando centros:', error);
      throw error;
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await fetch('/api/admin/centros-salud?type=categorias');
      const data = await response.json();
      if (response.ok) {
        setCategorias(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      throw error;
    }
  };

  const loadTipos = async () => {
    try {
      const response = await fetch('/api/admin/centros-salud?type=tipos');
      const data = await response.json();
      if (response.ok) {
        setTipos(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error cargando tipos:', error);
      throw error;
    }
  };

  const loadServicios = async () => {
    try {
      const response = await fetch('/api/admin/centros-salud?type=servicios');
      const data = await response.json();
      if (response.ok) {
        setServicios(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error cargando servicios:', error);
      throw error;
    }
  };

  // Función para manejar coordenadas seleccionadas
  const handleCoordinateSelect = (lat, lng) => {
    form.setFieldValue('latitud', lat.toString());
    form.setFieldValue('longitud', lng.toString());
  };

  // Funciones para el modal
  const openCreateModal = () => {
    console.log('🔓 Abriendo modal crear'); // Debug
    setEditMode(false);
    setSelectedCentro(null);
    form.reset();
    setModalOpen(true);
  };

  const openEditModal = (centro) => {
    console.log('✏️ Abriendo modal editar para:', centro.nombre || centro.name); // Debug
    console.log('Modal state antes:', modalOpen); // Debug adicional
    setEditMode(true);
    setSelectedCentro(centro);
    
    // Preparar servicios para el multiselect usando la función auxiliar
    let serviciosSeleccionados = [];
    
    if (centro.servicios) {
      const serviciosProcesados = procesarServicios(centro.servicios);
      serviciosSeleccionados = servicios.filter(s => serviciosProcesados.includes(s.tipo)).map(s => s.id.toString());
    }

    form.setValues({
      nombre: centro.nombre || centro.name || '',
      direccion: centro.direccion || centro.address || '',
      latitud: (centro.latitud || centro.lat) ? String(centro.latitud || centro.lat) : '',
      longitud: (centro.longitud || centro.lng) ? String(centro.longitud || centro.lng) : '',
      telefono: centro.telefono || centro.phone || '',
      dias_horas: centro.hours || '',
      tipo: centro.tipo_id?.toString() || '',
      categoria: centro.categoria_id?.toString() || '',
      descripcion: centro.description || '',
      servicios: serviciosSeleccionados
    });
    
    setModalOpen(true);
    console.log('Modal state después:', true); // Debug adicional
  };

  const closeModal = () => {
    console.log('❌ Cerrando modal'); // Debug
    setModalOpen(false);
    setSelectedCentro(null);
    form.reset();
  };

  // Función para guardar (crear o actualizar)
  const handleSave = async (values) => {
    try {
      const url = '/api/admin/centros-salud';
      const method = editMode ? 'PUT' : 'POST';
      
      const payload = {
        ...values,
        servicios: values.servicios.map(id => parseInt(id))
      };

      if (editMode) {
        payload.id = selectedCentro.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Éxito',
          message: data.message,
          color: 'green',
          icon: <IconCheck />
        });
        
        closeModal();
        await loadCentros(); // Recargar la lista
        setRefreshMapTrigger(prev => prev + 1); // Actualizar vista previa del mapa
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error guardando:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Error al guardar el centro',
        color: 'red',
        icon: <IconX />
      });
    }
  };

  // Función para eliminar
  const handleDelete = async (centro) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${centro.name}"?`)) {
      return;
    }

    setDeleting(centro.id);
    try {
      const response = await fetch(`/api/admin/centros-salud?id=${centro.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Éxito',
          message: data.message,
          color: 'green',
          icon: <IconCheck />
        });
        
        await loadCentros(); // Recargar la lista
        setRefreshMapTrigger(prev => prev + 1); // Actualizar vista previa del mapa
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error eliminando:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Error al eliminar el centro',
        color: 'red',
        icon: <IconX />
      });
    } finally {
      setDeleting(null);
    }
  };

  // Funciones auxiliares para mostrar datos
  const getTipoName = (tipoId) => {
    const tipo = tipos.find(t => t.id === tipoId);
    return tipo ? tipo.tipo : 'N/A';
  };

  const getCategoriaName = (categoriaId) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.categoria : 'N/A';
  };

  // Función auxiliar para formatear coordenadas
  const formatCoordenadas = (lat, lng) => {
    const latitud = parseFloat(lat);
    const longitud = parseFloat(lng);
    
    // Verificar que sean números válidos
    if (isNaN(latitud) || isNaN(longitud)) {
      return 'Coordenadas no válidas';
    }
    
    return `${latitud.toFixed(4)}, ${longitud.toFixed(4)}`;
  };

  // Función auxiliar para procesar servicios de diferentes formatos
  const procesarServicios = (serviciosData) => {
    console.log('🔧 Procesando servicios:', serviciosData, 'Tipo:', typeof serviciosData);
    
    if (!serviciosData) return [];
    
    // Si es una cadena, intentar parsearla
    if (typeof serviciosData === 'string') {
      if (serviciosData === 'null' || serviciosData === 'undefined' || serviciosData === '') {
        return [];
      }
      try {
        const parsed = JSON.parse(serviciosData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        // Si no se puede parsear, tratarlo como un servicio único
        return [serviciosData];
      }
    }
    
    // Si ya es un array, devolverlo
    if (Array.isArray(serviciosData)) {
      return serviciosData;
    }
    
    // Para cualquier otro tipo, devolver array vacío
    return [];
  };

  const formatServicios = (serviciosArray) => {
    // Usar la función auxiliar para procesar los servicios
    const serviciosProcesados = procesarServicios(serviciosArray);
    
    if (serviciosProcesados.length === 0) {
      return 'Sin servicios';
    }
    
    // Formatear el array
    return serviciosProcesados.slice(0, 3).join(', ') + (serviciosProcesados.length > 3 ? '...' : '');
  };

  // Preparar datos para los selects
  const tiposData = tipos.map(tipo => ({
    value: tipo.id.toString(),
    label: tipo.tipo
  }));

  const categoriasData = categorias.map(categoria => ({
    value: categoria.id.toString(),
    label: categoria.categoria
  }));

  const serviciosData = servicios.map(servicio => ({
    value: servicio.id.toString(),
    label: servicio.tipo
  }));

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Cargando panel de administración...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Administración de Mapas</Title>
            <Text c="dimmed">Gestión de centros de salud y puntos en el mapa</Text>
          </div>
          <Button
            leftSection={<IconPlus />}
            onClick={openCreateModal}
          >
            Nuevo Centro
          </Button>
        </Group>

        {/* Estadísticas */}
        <Group grow>
          <Card withBorder>
            <Text size="sm" c="dimmed">Total Centros</Text>
            <Text size="xl" fw={700}>{centros.length}</Text>
          </Card>
          <Card withBorder>
            <Text size="sm" c="dimmed">Categorías</Text>
            <Text size="xl" fw={700}>{categorias.length}</Text>
          </Card>
          <Card withBorder>
            <Text size="sm" c="dimmed">Tipos</Text>
            <Text size="xl" fw={700}>{tipos.length}</Text>
          </Card>
          <Card withBorder>
            <Text size="sm" c="dimmed">Servicios</Text>
            <Text size="xl" fw={700}>{servicios.length}</Text>
          </Card>
        </Group>

        {/* Buscador */}
        <Group justify="space-between" align="end">
          <TextInput
            placeholder="Buscar por nombre, dirección o servicios..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            rightSection={
              searchQuery && (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => setSearchQuery('')}
                >
                  <IconX size={14} />
                </ActionIcon>
              )
            }
            size="md"
            style={{ maxWidth: '500px', flex: 1 }}
          />
          
          {searchQuery && (
            <Text size="sm" c="dimmed">
              {filteredCentros.length} de {centros.length} centros
            </Text>
          )}
        </Group>

        {/* Tabs para diferentes vistas */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="lista" leftSection={<IconList size={16} />}>
              Lista de Centros
            </Tabs.Tab>
            <Tabs.Tab value="mapa" leftSection={<IconMap size={16} />}>
              Vista del Mapa
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="lista" pt="md">
            {/* Tabla de centros */}
            <Card withBorder>
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Nombre</Table.Th>
                      <Table.Th>Dirección</Table.Th>
                      <Table.Th>Tipo</Table.Th>
                      <Table.Th>Categoría</Table.Th>
                      <Table.Th>Servicios</Table.Th>
                      <Table.Th>Coordenadas</Table.Th>
                      <Table.Th>Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredCentros.map((centro) => (
                      <Table.Tr key={centro.id}>
                        <Table.Td>
                          <Text fw={500}>{centro.nombre || centro.name || 'Sin nombre'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{centro.direccion || centro.address || 'Sin dirección'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="blue">
                            {getTipoName(centro.tipo_id)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="green">
                            {getCategoriaName(centro.categoria_id)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{formatServicios(centro.servicios)}</Text>
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
                              onClick={() => openEditModal(centro)}
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
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              {filteredCentros.length === 0 && (
                <Stack align="center" py="xl">
                  <IconMapPin size={48} color="gray" />
                  <Text c="dimmed">
                    {searchQuery ? 'No se encontraron centros con esos criterios' : 'No hay centros registrados'}
                  </Text>
                  {!searchQuery && (
                    <Button variant="light" onClick={openCreateModal}>
                      Crear el primer centro
                    </Button>
                  )}
                  {searchQuery && (
                    <Button variant="light" onClick={() => setSearchQuery('')}>
                      Limpiar búsqueda
                    </Button>
                  )}
                </Stack>
              )}
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="mapa" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <AdminMapPreview refreshTrigger={refreshMapTrigger} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Stack gap="md">
                  <CoordinatePicker onCoordinateSelect={handleCoordinateSelect} />
                  
                  <Card withBorder>
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text fw={500}>Acciones Rápidas</Text>
                        <ActionIcon
                          variant="light"
                          onClick={() => setRefreshMapTrigger(prev => prev + 1)}
                        >
                          <IconRefresh size={16} />
                        </ActionIcon>
                      </Group>
                      <Button
                        fullWidth
                        leftSection={<IconPlus size={16} />}
                        onClick={openCreateModal}
                      >
                        Nuevo Centro
                      </Button>
                      <Button
                        fullWidth
                        variant="light"
                        leftSection={<IconList size={16} />}
                        onClick={() => setActiveTab('lista')}
                      >
                        Ver Lista Completa
                      </Button>
                    </Stack>
                  </Card>

                  <Card withBorder>
                    <Stack gap="sm">
                      <Text fw={500}>Últimos Centros</Text>
                      {centros.slice(0, 5).map((centro) => (
                        <Group key={centro.id} justify="space-between">
                          <div>
                            <Text size="sm" fw={500}>{centro.nombre || centro.name || 'Sin nombre'}</Text>
                            <Text size="xs" c="dimmed">{getTipoName(centro.tipo_id)}</Text>
                          </div>
                          <ActionIcon
                            size="sm"
                            variant="light"
                            onClick={() => openEditModal(centro)}
                          >
                            <IconEdit size={12} />
                          </ActionIcon>
                        </Group>
                      ))}
                      {centros.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center">
                          No hay centros para mostrar
                        </Text>
                      )}
                    </Stack>
                  </Card>
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
        </Tabs>

        {/* Modal para crear/editar */}
        <Modal
          opened={modalOpen}
          onClose={closeModal}
          title={editMode ? 'Editar Centro' : 'Nuevo Centro'}
          size="lg"
          centered
        >
          <form onSubmit={form.onSubmit(handleSave)}>
            <Stack gap="md">
              <TextInput
                label="Nombre"
                placeholder="Nombre del centro de salud"
                required
                {...form.getInputProps('nombre')}
              />

              <TextInput
                label="Dirección"
                placeholder="Dirección completa"
                required
                {...form.getInputProps('direccion')}
              />

              <Group grow>
                <TextInput
                  label="Latitud"
                  placeholder="-45.8640"
                  required
                  {...form.getInputProps('latitud')}
                />
                <TextInput
                  label="Longitud"
                  placeholder="-67.4958"
                  required
                  {...form.getInputProps('longitud')}
                />
              </Group>

              <Group grow>
                <Select
                  label="Tipo"
                  placeholder="Selecciona un tipo"
                  data={tiposData}
                  required
                  {...form.getInputProps('tipo')}
                />
                <Select
                  label="Categoría"
                  placeholder="Selecciona una categoría"
                  data={categoriasData}
                  required
                  {...form.getInputProps('categoria')}
                />
              </Group>

              <TextInput
                label="Teléfono"
                placeholder="0297-123-4567"
                {...form.getInputProps('telefono')}
              />

              <TextInput
                label="Horarios de Atención"
                placeholder="Lunes a Viernes: 8:00-18:00"
                {...form.getInputProps('dias_horas')}
              />

              <MultiSelect
                label="Servicios"
                placeholder="Selecciona servicios disponibles"
                data={serviciosData}
                {...form.getInputProps('servicios')}
              />

              <Textarea
                label="Descripción"
                placeholder="Descripción del centro de salud"
                {...form.getInputProps('descripcion')}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editMode ? 'Actualizar' : 'Crear'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Container>
  );
};

export default AdminMapas;