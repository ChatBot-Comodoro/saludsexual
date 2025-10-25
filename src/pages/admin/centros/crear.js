import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Select,
  MultiSelect,
  Textarea,
  NumberInput,
  Button,
  Group,
  Stack,
  Alert,
  Divider,
  Anchor,
  Breadcrumbs,
  Loader
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { IconArrowLeft, IconCheck, IconX, IconHome, IconSettings, IconAlertCircle } from '@tabler/icons-react';
import LoadingScreen from '../../../components/LoadingScreen';

const CrearCentro = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [overlayState, setOverlayState] = useState({ show: false, type: 'loading', message: '' });
  const [categorias, setCategorias] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [servicios, setServicios] = useState([]);

  // Verificar autenticación con NextAuth
  useEffect(() => {
    if (status === 'loading') return; // Aún cargando

    if (status === 'unauthenticated') {
      console.log('❌ Usuario no autenticado, redirigiendo a login');
      router.push('/login');
      return;
    }

    if (session?.user) {
      console.log('✅ Usuario autenticado en crear centro:', session.user);
      
      // Verificar que sea admin o moderador
      if (session.user.role !== 1 && session.user.role !== 2) {
        console.log('⚠️ Usuario sin permisos adecuados para crear centros');
        router.push('/admin/dashboard?error=insufficient_permissions');
        return;
      }
      
      setAuthLoading(false);
    }
  }, [session, status, router]);

  // Configurar formulario con validaciones (solo campos que tenemos)
  const form = useForm({
    initialValues: {
      nombre: '',
      direccion: '',
      telefono: '',
      descripcion: '',
      dias_horas: '',
      latitud: '',
      longitud: '',
      categoria_id: '',
      tipo_id: '',
      servicios_ids: []
    },
    validate: {
      nombre: (value) => {
        if (!value || value.trim() === '') return 'El nombre es requerido';
        if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
        return null;
      },
      direccion: (value) => {
        if (!value || value.trim() === '') return 'La dirección es requerida';
        if (value.trim().length < 5) return 'La dirección debe tener al menos 5 caracteres';
        return null;
      },
      telefono: (value) => {
        if (!value || value.trim() === '') return 'El teléfono es requerido';
        return null;
      },
      categoria_id: (value) => (!value ? 'La categoría es requerida' : null),
      tipo_id: (value) => (!value ? 'El tipo es requerido' : null),
      servicios_ids: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Debe seleccionar al menos un servicio';
        }
        return null;
      },
      latitud: (value) => {
        if (!value) return 'La latitud es requerida';
        const lat = parseFloat(value);
        if (isNaN(lat) || lat < -90 || lat > 90) return 'La latitud debe estar entre -90 y 90';
        return null;
      },
      longitud: (value) => {
        if (!value) return 'La longitud es requerida';
        const lng = parseFloat(value);
        if (isNaN(lng) || lng < -180 || lng > 180) return 'La longitud debe estar entre -180 y 180';
        return null;
      }
    }
  });

  // Cargar datos de categorías, tipos y servicios
  useEffect(() => {
    if (authLoading || status === 'loading') return; // Esperar a que termine la autenticación
    
    const loadData = async () => {
      try {
        const [categoriasRes, tiposRes, serviciosRes] = await Promise.all([
          fetch('/api/categorias'),
          fetch('/api/tipos'),
          fetch('/api/servicios')
        ]);

        console.log('Respuestas de APIs:', {
          categorias: categoriasRes.status,
          tipos: tiposRes.status,
          servicios: serviciosRes.status
        });

        if (!categoriasRes.ok) {
          throw new Error(`Error al obtener categorías: ${categoriasRes.status}`);
        }

        if (!tiposRes.ok) {
          throw new Error(`Error al obtener tipos: ${tiposRes.status}`);
        }

        if (!serviciosRes.ok) {
          throw new Error(`Error al obtener servicios: ${serviciosRes.status}`);
        }

        const [categoriasData, tiposData, serviciosResponse] = await Promise.all([
          categoriasRes.json(),
          tiposRes.json(),
          serviciosRes.json()
        ]);

        console.log('Datos obtenidos:', {
          categorias: categoriasData?.length,
          tipos: tiposData?.length,
          servicios: serviciosResponse?.data?.length || serviciosResponse?.length
        });

        setCategorias(categoriasData || []);
        setTipos(tiposData || []);
        // La API de servicios retorna { data: [...] } o un array directo
        setServicios(serviciosResponse?.data || serviciosResponse || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setLoadingError(error.message);
        notifications.show({
          title: 'Error',
          message: `Error al cargar los datos necesarios: ${error.message}`,
          color: 'red',
          icon: <IconX size={16} />
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [authLoading, status]);

  // Manejar envío del formulario
  const handleSubmit = async (values) => {
    setLoading(true);
    setOverlayState({ 
      show: true, 
      type: 'loading', 
      message: 'Creando centro de salud...' 
    });

    try {
      const response = await fetch('/api/centros-salud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        // Mostrar estado de éxito
        setOverlayState({ 
          show: true, 
          type: 'success', 
          message: 'Centro de salud creado correctamente' 
        });
        
        // Redirigir después de mostrar el éxito
        setTimeout(() => {
          router.push('/admin/mapas');
        }, 2000);
        
      } else {
        const errorData = await response.json();
        
        // Determinar el tipo de error basado en el status
        let errorMessage = 'Error al crear el centro de salud';
        
        if (errorData.errores && Array.isArray(errorData.errores)) {
          const erroresTexto = errorData.errores.join('\n• ');
          errorMessage = `Se encontraron errores:\n• ${erroresTexto}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Mostrar error con overlay
        setOverlayState({ 
          show: true, 
          type: 'error', 
          message: errorMessage 
        });
        
        // Cerrar overlay después de un tiempo
        setTimeout(() => {
          setOverlayState({ show: false, type: '', message: '' });
        }, 4000);
      }
    } catch (error) {
      console.error('Error creando centro:', error);
      
      // Mostrar error de conexión con overlay
      setOverlayState({ 
        show: true, 
        type: 'error', 
        message: 'Error de conexión. No se pudo conectar al servidor.' 
      });
      
      // Cerrar overlay después de un tiempo
      setTimeout(() => {
        setOverlayState({ show: false, type: '', message: '' });
      }, 4000);
      
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para los selects
  const categoriasData = Array.isArray(categorias) ? categorias.map(categoria => ({
    value: categoria.id.toString(),
    label: categoria.categoria
  })) : [];

  const tiposData = Array.isArray(tipos) ? tipos.map(tipo => ({
    value: tipo.id.toString(),
    label: tipo.tipo
  })) : [];

  const serviciosData = Array.isArray(servicios) ? servicios.map(servicio => ({
    value: servicio.id?.toString() || servicio.value,
    label: servicio.tipo || servicio.label
  })) : [];

  if (status === 'loading' || authLoading || loadingData) {
    return (
      <LoadingScreen 
        message={authLoading ? "Verificando autenticación..." : "Cargando datos..."}
        backHref="/admin/mapas"
        backText="Volver a gestión de mapas"
      />
    );
  }

  // Si no hay sesión, no mostrar nada (el useEffect redirigirá)
  if (!session) {
    return null;
  }

  // Mostrar error si hay problemas cargando datos
  if (loadingError) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" withBorder>
          <Stack align="center" gap="md" style={{ minHeight: "400px" }}>
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error al cargar datos"
              color="red"
              style={{ width: '100%' }}
            >
              <Text mb="md">{loadingError}</Text>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setLoadingError(null);
                  setLoadingData(true);
                  // Recargar la página
                  window.location.reload();
                }}
              >
                Reintentar
              </Button>
            </Alert>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      {/* Overlay de carga/éxito/error durante procesos */}
      {overlayState.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper p="xl" withBorder style={{ maxWidth: '400px', textAlign: 'center' }}>
            <Stack gap="md" align="center">
              {overlayState.type === 'loading' && (
                <>
                  <Loader size="lg" color="#FF0048" />
                  <Title order={4}>{overlayState.message}</Title>
                  <Text size="sm" c="dimmed">
                    Por favor espere mientras se crea el nuevo centro de salud
                  </Text>
                </>
              )}
              {overlayState.type === 'success' && (
                <>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    backgroundColor: '#28a745', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '32px',
                    color: 'white'
                  }}>
                    ✓
                  </div>
                  <Title order={4} c="green">{overlayState.message}</Title>
                  <Text size="sm" c="dimmed">
                    Redirigiendo a la gestión de mapas...
                  </Text>
                </>
              )}
              {overlayState.type === 'error' && (
                <>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    backgroundColor: '#dc3545', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '32px',
                    color: 'white'
                  }}>
                    ✕
                  </div>
                  <Title order={4} c="red">Error al crear centro</Title>
                  <Text size="sm" c="dimmed">
                    {overlayState.message}
                  </Text>
                </>
              )}
            </Stack>
          </Paper>
        </div>
      )}

      <Container size="md" py="xl">
      {/* Breadcrumb de navegación */}
        <Breadcrumbs mb="md">
          <Anchor 
            onClick={() => router.push('/admin/dashboard')}
            style={{ cursor: 'pointer' }}
          >
            <Group gap={5}>
              <IconHome size={16} />
              <span>Admin Dashboard</span>
            </Group>
          </Anchor>
          <Anchor 
            onClick={() => router.push('/admin/mapas')}
            style={{ cursor: 'pointer' }}
          >
            <Group gap={5}>
              <IconSettings size={16} />
              <span>Gestión de Mapas</span>
            </Group>
          </Anchor>
          <Text>Crear Centro</Text>
        </Breadcrumbs>

        <Paper p="xl" withBorder>
          <Stack gap="md">
          {/* Header */}
          <Group justify="space-between" w="100%">
            <Stack gap={5}>
              <Title order={2}>Crear Centro de Salud</Title>
              <Text size="sm" c="dimmed">
                Complete la información del nuevo centro de salud
              </Text>
            </Stack>
            <Button
              variant="light"
              color="blue"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.push('/admin/mapas')}
              size="md"
            >
              Volver
            </Button>
          </Group>

          <Divider />

          {/* Formulario */}
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {/* Información básica */}
              <Title order={4}>Información Básica</Title>
              
              <TextInput
                label="Nombre del Centro"
                placeholder="Ingrese el nombre del centro"
                required
                {...form.getInputProps('nombre')}
              />

              <TextInput
                label="Dirección"
                placeholder="Ingrese la dirección completa"
                required
                {...form.getInputProps('direccion')}
              />

              <Group grow>
                <Select
                  label="Categoría"
                  placeholder="Seleccione una categoría"
                  data={categoriasData}
                  required
                  searchable
                  {...form.getInputProps('categoria_id')}
                />

                <Select
                  label="Tipo"
                  placeholder="Seleccione un tipo"
                  data={tiposData}
                  required
                  searchable
                  {...form.getInputProps('tipo_id')}
                />
              </Group>

              <MultiSelect
                label="Servicios"
                placeholder="Seleccione los servicios disponibles"
                data={serviciosData}
                searchable
                required
                {...form.getInputProps('servicios_ids')}
              />

              <Divider />

              {/* Información de contacto */}
              <Title order={4}>Información de Contacto</Title>

              <TextInput
                label="Teléfono"
                placeholder="Ej: +595 21 123456"
                required
                {...form.getInputProps('telefono')}
              />

              <Textarea
                label="Descripción"
                placeholder="Descripción del centro de salud"
                minRows={2}
                {...form.getInputProps('descripcion')}
              />

              <Textarea
                label="Días y Horarios"
                placeholder="Ej: Lunes a Viernes: 7:00 - 17:00"
                minRows={2}
                {...form.getInputProps('dias_horas')}
              />

              <Divider />

              {/* Ubicación */}
              <Title order={4}>Ubicación</Title>
              
              <Alert color="blue" variant="light">
                <Text size="sm">
                  Puede obtener las coordenadas exactas desde Google Maps haciendo clic derecho en la ubicación
                  y seleccionando las coordenadas que aparecen en el menú contextual.
                </Text>
              </Alert>

              <Group grow>
                <NumberInput
                  label="Latitud"
                  placeholder="-25.2637"
                  precision={6}
                  required
                  {...form.getInputProps('latitud')}
                />

                <NumberInput
                  label="Longitud"
                  placeholder="-57.5759"
                  precision={6}
                  required
                  {...form.getInputProps('longitud')}
                />
              </Group>

              {/* Botones de acción */}
              <Group justify="flex-end" gap="md" mt="xl">
                <Button
                  variant="outline"
                  c="gray"
                  onClick={() => router.push('/admin/mapas')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  leftSection={loading ? undefined : <IconCheck size={16} />}
                  color="green"
                  disabled={loading}
                >
                  {loading ? 'Creando centro...' : 'Crear Centro'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>

      {/* Overlay para mostrar el resultado */}
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
            zIndex: 1000,
          }}
        >
          <Paper
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
                  Creando centro de salud...
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
                  ¡Centro creado exitosamente!
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  Redirigiendo...
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
                  Error al crear el centro
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  {overlayState.message}
                </Text>
                <Button
                  mt="md"
                  variant="outline"
                  onClick={() => setOverlayState({ visible: false, type: null, message: '' })}
                >
                  Intentar nuevamente
                </Button>
              </>
            )}
          </Paper>
        </div>
      )}
    </Container>
    </>
  );
};

export default CrearCentro;