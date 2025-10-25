import React, { useState } from 'react';
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
  Modal,
  TextInput,
  Select,
  PasswordInput
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconUser,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconUserCheck,
  IconUserX,
  IconUserExclamation
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import NotificationManager from '@/utils/notifications';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useUsuarios, useRoles, useEstados, useUsuarioOperations } from '../../hooks/useUsuarios';

const AdminUsuarios = () => {
  const { handleApiError, clearError } = useErrorHandler();
  
  // Estados principales
  const { usuarios, loading: loadingUsuarios, error: errorUsuarios, refetch: refetchUsuarios } = useUsuarios();
  const { roles, loading: loadingRoles } = useRoles();
  const { estados, loading: loadingEstados } = useEstados();
  const { loading: operationLoading, crearUsuario, cambiarEstadoUsuario, eliminarUsuario } = useUsuarioOperations();

  // Estados de UI
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [estadoModalOpened, setEstadoModalOpened] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState(null);

  // Estado para overlay
  const [overlayState, setOverlayState] = useState({
    visible: false,
    type: null, // 'loading', 'success', 'error'
    message: '',
    action: null // 'create', 'delete', 'changeState'
  });

  // Formulario para crear usuario
  const form = useForm({
    initialValues: {
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: ''
    },
    validate: {
      nombre: (value) => (!value.trim() ? 'El nombre es obligatorio' : null),
      apellido: (value) => (!value.trim() ? 'El apellido es obligatorio' : null),
      correo: (value) => {
        if (!value.trim()) return 'El correo es obligatorio';
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
          return 'Formato de correo inválido';
        }
        return null;
      },
      contrasena: (value) => {
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return null;
      }
    }
  });

  // ID del admin actual (esto debería venir de un contexto de autenticación)
  const ADMIN_ID = 1; // Temporal - en producción esto vendría del contexto de usuario

  // Funciones de manejo
  const handleCreateUser = async (values) => {
    // Mostrar overlay de carga
    setOverlayState({
      visible: true,
      type: 'loading',
      message: '',
      action: 'create'
    });

    setCreateModalOpened(false);
    clearError();

    const result = await handleApiError(
      async () => {
        return await crearUsuario(values);
      },
      'No se pudo crear el usuario. Verifica los datos e intenta nuevamente.'
    );

    if (result.success) {
      // Mostrar overlay de éxito
      setOverlayState({
        visible: true,
        type: 'success',
        message: 'Usuario creado exitosamente',
        action: 'create'
      });

      // Recargar datos
      await refetchUsuarios();
      form.reset();

      // Ocultar overlay después de 2 segundos
      setTimeout(() => {
        setOverlayState({ visible: false, type: null, message: '', action: null });
      }, 2000);
    } else {
      // Mostrar overlay de error
      setOverlayState({
        visible: true,
        type: 'error',
        message: result.error?.userMessage || 'No se pudo crear el usuario',
        action: 'create'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!usuarioSeleccionado) return;

    // Mostrar overlay de carga
    setOverlayState({
      visible: true,
      type: 'loading',
      message: '',
      action: 'delete'
    });

    setDeleteModalOpened(false);
    clearError();

    const result = await handleApiError(
      async () => {
        return await eliminarUsuario(usuarioSeleccionado.id, ADMIN_ID);
      },
      'No se pudo eliminar el usuario. Intenta nuevamente.'
    );

    if (result.success) {
      // Mostrar overlay de éxito
      setOverlayState({
        visible: true,
        type: 'success',
        message: 'Usuario eliminado exitosamente',
        action: 'delete'
      });

      // Recargar datos
      await refetchUsuarios();

      // Ocultar overlay después de 2 segundos
      setTimeout(() => {
        setOverlayState({ visible: false, type: null, message: '', action: null });
      }, 2000);
    } else {
      // Mostrar overlay de error
      setOverlayState({
        visible: true,
        type: 'error',
        message: result.error?.userMessage || 'No se pudo eliminar el usuario',
        action: 'delete'
      });
    }
    
    setUsuarioSeleccionado(null);
  };

  const handleChangeEstado = async () => {
    if (!usuarioSeleccionado || !nuevoEstado) return;

    // Mostrar overlay de carga
    setOverlayState({
      visible: true,
      type: 'loading',
      message: '',
      action: 'changeState'
    });

    setEstadoModalOpened(false);
    clearError();

    const result = await handleApiError(
      async () => {
        return await cambiarEstadoUsuario(usuarioSeleccionado.id, nuevoEstado, ADMIN_ID);
      },
      'No se pudo cambiar el estado del usuario. Intenta nuevamente.'
    );

    if (result.success) {
      // Mostrar overlay de éxito
      setOverlayState({
        visible: true,
        type: 'success',
        message: 'Estado del usuario actualizado exitosamente',
        action: 'changeState'
      });

      // Recargar datos
      await refetchUsuarios();

      // Ocultar overlay después de 2 segundos
      setTimeout(() => {
        setOverlayState({ visible: false, type: null, message: '', action: null });
      }, 2000);
    } else {
      // Mostrar overlay de error
      setOverlayState({
        visible: true,
        type: 'error',
        message: result.error?.userMessage || 'No se pudo cambiar el estado del usuario',
        action: 'changeState'
      });
    }

    setUsuarioSeleccionado(null);
    setNuevoEstado(null);
  };

  // Funciones auxiliares
  const getRolBadgeColor = (rolId) => {
    switch (rolId) {
      case 1: return 'red'; // Admin
      case 2: return 'blue'; // Moderador
      default: return 'gray';
    }
  };

  const getEstadoBadgeColor = (estadoId) => {
    switch (estadoId) {
      case 1: return 'green'; // Activo
      case 2: return 'gray'; // Inactivo
      case 3: return 'orange'; // Suspendido
      default: return 'gray';
    }
  };

  const getEstadoIcon = (estadoId) => {
    switch (estadoId) {
      case 1: return IconUserCheck; // Activo
      case 2: return IconUserX; // Inactivo
      case 3: return IconUserExclamation; // Suspendido
      default: return IconUser;
    }
  };

  if (loadingUsuarios || loadingRoles || loadingEstados) {
    return (
      <Container size="xl">
        <Stack align="center" mt={50}>
          <Loader size="lg" />
          <Text>Cargando datos de usuarios...</Text>
        </Stack>
      </Container>
    );
  }

  if (errorUsuarios) {
    return (
      <Container size="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" mt="md">
          Error al cargar usuarios: {errorUsuarios}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Administración de Usuarios</Title>
            <Text size="sm" c="dimmed">
              Gestiona usuarios moderadores del sistema
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpened(true)}
          >
            Nuevo Usuario
          </Button>
        </Group>

        {/* Estadísticas básicas */}
        <Group grow>
          <Card withBorder>
            <Text size="sm" c="dimmed">Total Usuarios</Text>
            <Text size="xl" fw={700}>{usuarios.length}</Text>
          </Card>
          <Card withBorder>
            <Text size="sm" c="dimmed">Usuarios Activos</Text>
            <Text size="xl" fw={700} c="green">
              {usuarios.filter(u => u.estado === 1).length}
            </Text>
          </Card>
          <Card withBorder>
            <Text size="sm" c="dimmed">Usuarios Suspendidos</Text>
            <Text size="xl" fw={700} c="orange">
              {usuarios.filter(u => u.estado === 3).length}
            </Text>
          </Card>
        </Group>

        {/* Tabla de usuarios */}
        <Card withBorder>
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Usuario</Table.Th>
                  <Table.Th>Correo</Table.Th>
                  <Table.Th>Rol</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Fecha Creación</Table.Th>
                  <Table.Th>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {usuarios.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text ta="center" c="dimmed">
                        No se encontraron usuarios
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  usuarios.map((usuario) => {
                    const EstadoIcon = getEstadoIcon(usuario.estado);
                    return (
                      <Table.Tr key={usuario.id}>
                        <Table.Td>
                          <Group gap="sm">
                            <EstadoIcon size={20} />
                            <div>
                              <Text fw={500}>{usuario.nombre} {usuario.apellido}</Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{usuario.correo}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            variant="light" 
                            color={getRolBadgeColor(usuario.rol)}
                          >
                            {usuario.rol_descripcion}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            variant="light" 
                            color={getEstadoBadgeColor(usuario.estado)}
                          >
                            {usuario.estado_descripcion}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {new Date(usuario.fecha_creacion).toLocaleDateString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              onClick={() => {
                                setUsuarioSeleccionado(usuario);
                                setEstadoModalOpened(true);
                              }}
                              disabled={usuario.rol === 1} // No permitir cambiar estado de admin
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => {
                                setUsuarioSeleccionado(usuario);
                                setDeleteModalOpened(true);
                              }}
                              disabled={usuario.rol === 1} // No permitir eliminar admin
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      </Stack>

      {/* Modal para crear usuario */}
      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title="Crear Nuevo Usuario Moderador"
        size="md"
        zIndex={10000}
        centered
      >
        <form onSubmit={form.onSubmit(handleCreateUser)}>
          <Stack gap="md">
            <TextInput
              label="Nombre"
              placeholder="Ingresa el nombre"
              {...form.getInputProps('nombre')}
              required
            />
            <TextInput
              label="Apellido"
              placeholder="Ingresa el apellido"
              {...form.getInputProps('apellido')}
              required
            />
            <TextInput
              label="Correo Electrónico"
              placeholder="correo@ejemplo.com"
              {...form.getInputProps('correo')}
              required
            />
            <PasswordInput
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              {...form.getInputProps('contrasena')}
              required
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="outline" onClick={() => setCreateModalOpened(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={operationLoading}>
                Crear Usuario
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal para cambiar estado */}
      <Modal
        opened={estadoModalOpened}
        onClose={() => setEstadoModalOpened(false)}
        title="Cambiar Estado de Usuario"
        size="sm"
        zIndex={10000}
        centered
      >
        <Stack gap="md">
          <Text>
            ¿Deseas cambiar el estado del usuario <strong>{usuarioSeleccionado?.nombre} {usuarioSeleccionado?.apellido}</strong>?
          </Text>
          <Select
            label="Nuevo Estado"
            placeholder="Selecciona un estado"
            data={estados.map(estado => ({
              value: estado.id.toString(),
              label: estado.descripcion
            }))}
            value={nuevoEstado?.toString()}
            onChange={(value) => setNuevoEstado(parseInt(value))}
            comboboxProps={{ zIndex: 10001 }}
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={() => setEstadoModalOpened(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleChangeEstado}
              loading={operationLoading}
              disabled={!nuevoEstado}
            >
              Cambiar Estado
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Confirmar Eliminación"
        size="sm"
        zIndex={10000}
        centered
      >
        <Stack gap="md">
          <Group gap="sm">
            <IconAlertCircle size={24} color="red" />
            <Text size="md" fw={500}>
              ¿Está seguro de eliminar este usuario?
            </Text>
          </Group>
          
          {usuarioSeleccionado && (
            <Card p="sm" withBorder bg="gray.1">
              <Text fw={500} c="dark">
                {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
              </Text>
              <Text size="sm" c="dimmed">
                {usuarioSeleccionado.correo}
              </Text>
            </Card>
          )}
          
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            Esta acción no se puede deshacer. Se eliminará permanentemente el usuario.
          </Alert>
          
          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpened(false)}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={handleDeleteUser}
              loading={operationLoading}
              leftSection={<IconTrash size={16} />}
            >
              Eliminar Usuario
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Overlay para mostrar el resultado de las operaciones */}
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
            zIndex: 9999,
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
                  {overlayState.action === 'create' && 'Creando usuario...'}
                  {overlayState.action === 'delete' && 'Eliminando usuario...'}
                  {overlayState.action === 'changeState' && 'Cambiando estado...'}
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
                  ¡Operación exitosa!
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
                  Error en la operación
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  {overlayState.message}
                </Text>
                <Button
                  mt="md"
                  variant="outline"
                  onClick={() => setOverlayState({ visible: false, type: null, message: '', action: null })}
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

export default AdminUsuarios;