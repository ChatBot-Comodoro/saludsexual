import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Table,
  Button,
  Group,
  Modal,
  TextInput,
  Textarea,
  Alert,
  ActionIcon,
  Badge,
  Text,
  Stack,
  Card,
  ScrollArea,
  Notification,
} from '@mantine/core';
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconAlertCircle,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import LoadingScreen from '../LoadingScreen';

export default function AdminArticulos() {
  // Estados principales
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para modales
  const [modalVerAbrir, setModalVerAbrir] = useState(false);
  const [modalEditarAbrir, setModalEditarAbrir] = useState(false);
  const [modalEliminarAbrir, setModalEliminarAbrir] = useState(false);
  const [modalCrearAbrir, setModalCrearAbrir] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

  // Estados para el formulario de edición
  const [formData, setFormData] = useState({
    titulo: '',
    html: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Cargar artículos al montar el componente
  useEffect(() => {
    cargarArticulos();
  }, []);

  // Función para cargar todos los artículos
  const cargarArticulos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/articulos');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setArticulos(data.data || data);
      
    } catch (err) {
      console.error('Error cargando artículos:', err);
      setError(err.message);
      notifications.show({
        title: 'Error',
        message: 'No se pudieron cargar los artículos',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para ver un artículo
  const verArticulo = (articulo) => {
    setArticuloSeleccionado(articulo);
    setModalVerAbrir(true);
  };

  // Función para editar un artículo
  const editarArticulo = (articulo) => {
    console.log('🖊️ Iniciando edición de artículo:', articulo);
    setArticuloSeleccionado(articulo);
    setFormData({
      titulo: articulo.titulo,
      html: articulo.html,
    });
    console.log('📝 Datos del formulario establecidos:', {
      titulo: articulo.titulo,
      html: articulo.html?.substring(0, 100) + '...'
    });
    setModalEditarAbrir(true);
  };

  // Función para preparar creación de nuevo artículo
  const crearNuevoArticulo = () => {
    setFormData({
      titulo: '',
      html: '',
    });
    setModalCrearAbrir(true);
  };

  // Función para guardar nuevo artículo
  const guardarNuevoArticulo = async () => {
    try {
      setGuardando(true);
      
      const response = await fetch('/api/articulos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          html: formData.html,
          usuario: 1, // ID del usuario admin
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Recargar artículos y cerrar modal
      await cargarArticulos();
      setModalCrearAbrir(false);
      
      notifications.show({
        title: 'Éxito',
        message: 'Artículo creado correctamente',
        color: 'green',
        icon: <IconCheck />,
      });
      
    } catch (err) {
      console.error('Error creando artículo:', err);
      notifications.show({
        title: 'Error',
        message: 'No se pudo crear el artículo',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setGuardando(false);
    }
  };

  // Función para guardar cambios
  const guardarCambios = async () => {
    try {
      setGuardando(true);
      
      console.log('🔄 Enviando datos de edición:', {
        id: articuloSeleccionado.id,
        titulo: formData.titulo,
        html: formData.html,
        usuario: 1
      });
      
      const response = await fetch(`/api/articulos/${articuloSeleccionado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          html: formData.html,
          usuario: 1, // ID del usuario admin
        }),
      });
      
      console.log('📡 Respuesta del servidor:', response.status, response.statusText);
      
      const responseData = await response.json();
      console.log('📄 Datos de respuesta:', responseData);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${responseData.message || response.statusText}`);
      }
      
      // Recargar artículos y cerrar modal
      console.log('✅ Artículo actualizado, recargando lista...');
      await cargarArticulos();
      setModalEditarAbrir(false);
      
      notifications.show({
        title: 'Éxito',
        message: 'Artículo actualizado correctamente',
        color: 'green',
        icon: <IconCheck />,
      });
      
    } catch (err) {
      console.error('❌ Error guardando artículo:', err);
      notifications.show({
        title: 'Error',
        message: err.message || 'No se pudo guardar el artículo',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setGuardando(false);
    }
  };

  // Función para preparar eliminación
  const prepararEliminar = (articulo) => {
    setArticuloSeleccionado(articulo);
    setModalEliminarAbrir(true);
  };

  // Función para eliminar artículo
  const eliminarArticulo = async () => {
    try {
      setEliminando(true);
      
      const response = await fetch(`/api/articulos/${articuloSeleccionado.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Recargar artículos y cerrar modal
      await cargarArticulos();
      setModalEliminarAbrir(false);
      
      notifications.show({
        title: 'Éxito',
        message: 'Artículo eliminado correctamente',
        color: 'green',
        icon: <IconCheck />,
      });
      
    } catch (err) {
      console.error('Error eliminando artículo:', err);
      notifications.show({
        title: 'Error',
        message: 'No se pudo eliminar el artículo',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setEliminando(false);
    }
  };

  // Función para manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
        <Alert icon={<IconAlertCircle />} title="Error" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Gestión de Artículos</Title>
        <Button 
          leftSection={<IconPlus />} 
          color="green"
          onClick={crearNuevoArticulo}
        >
          Nuevo Artículo
        </Button>
      </Group>

      {/* Tabla de artículos */}
      <Card withBorder>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Título</Table.Th>
                <Table.Th>Fecha Creación</Table.Th>
                <Table.Th>Fecha Actualización</Table.Th>
                <Table.Th>Usuario</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {articulos.map((articulo) => (
                <Table.Tr key={articulo.id}>
                  <Table.Td>
                    <Badge variant="light" color="blue">
                      {articulo.id}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500} truncate="end" maw={300}>
                      {articulo.titulo}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(articulo.fecha_creacion).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(articulo.fecha_actualizacion).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="gray">
                      Usuario {articulo.usuario}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => verArticulo(articulo)}
                        title="Ver artículo"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="orange"
                        onClick={() => editarArticulo(articulo)}
                        title="Editar artículo"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => prepararEliminar(articulo)}
                        title="Eliminar artículo"
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
        
        {articulos.length === 0 && (
          <Text ta="center" py="xl" c="dimmed">
            No hay artículos registrados
          </Text>
        )}
      </Card>

      {/* Modal para ver artículo */}
      <Modal
        opened={modalVerAbrir}
        onClose={() => setModalVerAbrir(false)}
        title={<Text fw={600}>Ver Artículo</Text>}
        size="xl"
      >
        {articuloSeleccionado && (
          <Stack>
            <TextInput
              label="Título"
              value={articuloSeleccionado.titulo}
              readOnly
            />
            <Text size="sm" fw={500}>Contenido HTML:</Text>
            <ScrollArea h={400}>
              <Card withBorder p="sm">
                <Text size="sm" ff="monospace">
                  {articuloSeleccionado.html}
                </Text>
              </Card>
            </ScrollArea>
            <Text size="sm" fw={500}>Vista previa:</Text>
            <ScrollArea h={300}>
              <Card withBorder p="md" style={{ backgroundColor: '#FFF2F6' }}>
                <div dangerouslySetInnerHTML={{ __html: articuloSeleccionado.html }} />
              </Card>
            </ScrollArea>
          </Stack>
        )}
      </Modal>

      {/* Modal para editar artículo */}
      <Modal
        opened={modalEditarAbrir}
        onClose={() => setModalEditarAbrir(false)}
        title={<Text fw={600}>Editar Artículo</Text>}
        size="xl"
      >
        {articuloSeleccionado && (
          <Stack>
            <TextInput
              label="Título"
              value={formData.titulo}
              onChange={(event) => handleFormChange('titulo', event.currentTarget.value)}
              required
            />
            <Textarea
              label="Contenido HTML"
              value={formData.html}
              onChange={(event) => handleFormChange('html', event.currentTarget.value)}
              minRows={10}
              maxRows={20}
              required
            />
            <Text size="sm" fw={500}>Vista previa:</Text>
            <ScrollArea h={200}>
              <Card withBorder p="md" style={{ backgroundColor: '#FFF2F6' }}>
                <div dangerouslySetInnerHTML={{ __html: formData.html }} />
              </Card>
            </ScrollArea>
            <Group justify="flex-end">
              <Button
                variant="light"
                onClick={() => setModalEditarAbrir(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarCambios}
                loading={guardando}
              >
                Guardar Cambios
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal
        opened={modalEliminarAbrir}
        onClose={() => setModalEliminarAbrir(false)}
        title={<Text fw={600} c="red">Confirmar Eliminación</Text>}
        size="md"
      >
        {articuloSeleccionado && (
          <Stack>
            <Alert icon={<IconAlertCircle />} color="red">
              ¿Estás seguro de que quieres eliminar el artículo &quot;{articuloSeleccionado.titulo}&quot;?
              Esta acción no se puede deshacer.
            </Alert>
            <Group justify="flex-end">
              <Button
                variant="light"
                onClick={() => setModalEliminarAbrir(false)}
              >
                Cancelar
              </Button>
              <Button
                color="red"
                onClick={eliminarArticulo}
                loading={eliminando}
              >
                Eliminar
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Modal para crear nuevo artículo */}
      <Modal
        opened={modalCrearAbrir}
        onClose={() => setModalCrearAbrir(false)}
        title={<Text fw={600}>Crear Nuevo Artículo</Text>}
        size="xl"
      >
        <Stack>
          <TextInput
            label="Título"
            placeholder="Ingrese el título del artículo"
            value={formData.titulo}
            onChange={(event) => handleFormChange('titulo', event.currentTarget.value)}
            required
          />
          <Textarea
            label="Contenido HTML"
            placeholder="Ingrese el contenido HTML del artículo"
            value={formData.html}
            onChange={(event) => handleFormChange('html', event.currentTarget.value)}
            minRows={10}
            maxRows={20}
            required
          />
          <Text size="sm" fw={500}>Vista previa:</Text>
          <ScrollArea h={200}>
            <Card withBorder p="md" style={{ backgroundColor: '#FFF2F6' }}>
              {formData.html ? (
                <div dangerouslySetInnerHTML={{ __html: formData.html }} />
              ) : (
                <Text c="dimmed" ta="center">Ingrese contenido HTML para ver la vista previa</Text>
              )}
            </Card>
          </ScrollArea>
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => setModalCrearAbrir(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={guardarNuevoArticulo}
              loading={guardando}
              disabled={!formData.titulo.trim() || !formData.html.trim()}
            >
              Crear Artículo
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}