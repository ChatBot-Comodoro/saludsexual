import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Container,
  Grid,
  Card,
  Title,
  Text,
  Stack,
  Group,
  Button,
  ThemeIcon,
  Badge,
  Box,
  SimpleGrid,
  Paper,
  Select,
  Breadcrumbs,
  Anchor,
  Divider,
  ActionIcon,
  Tooltip,
  LoadingOverlay
} from '@mantine/core';
import LoadingScreen from '../../components/LoadingScreen';
import {
  IconUsers,
  IconEye,
  IconSearch,
  IconExternalLink,
  IconFilter,
  IconCalendar,
  IconActivity,
  IconMapPin,
  IconChevronLeft,
  IconDownload,
  IconRefresh,
  IconTrendingUp,
  IconClock,
  IconDeviceDesktop
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import DateRangeFilter from '../../components/admin/DateRangeFilter';

export default function MapasAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mapStats, setMapStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isDateRangeActive, setIsDateRangeActive] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // Cargar estadísticas del mapa
  const loadMapStats = async () => {
    try {
      setLoading(true);
      
      let url = '/api/analytics/map-stats';
      const params = new URLSearchParams();
      
      if (isDateRangeActive && startDate && endDate) {
        params.append('startDate', startDate.toISOString().split('T')[0]);
        params.append('endDate', endDate.toISOString().split('T')[0]);
      } else {
        params.append('days', timeframe);
      }
      
      url += '?' + params.toString();
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMapStats(data.data);
      } else {
        setMapStats(null);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setMapStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapStats();
  }, [timeframe, isDateRangeActive, startDate, endDate]);

  // Manejar cambio de rango de fechas
  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setIsDateRangeActive(true);
    // Desactivar timeframe cuando se usa rango personalizado
    setTimeframe('');
  };

  // Limpiar filtro de fechas
  const handleClearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
    setIsDateRangeActive(false);
    // Volver al timeframe por defecto
    setTimeframe('30');
  };

  // Función de exportación (placeholder)
  const exportData = () => {
    // TODO: Implementar exportación de datos
    console.log('Exportar datos del mapa');
  };

  // Loading state
  if (status === 'loading') {
    return (
      <LoadingScreen 
        message="Verificando autenticación..."
        showBackButton={false}
      />
    );
  }
  
  if (!session) {
    return (
      <LoadingScreen 
        message="Redirigiendo al login..."
        showBackButton={true}
        backHref="/login"
        backText="Ir al login"
      />
    );
  }

  return (
    <Container size="xl" py="xl">
      {/* Breadcrumbs y Header */}
      <Group justify="space-between" mb="xl">
        <Box>
          <Breadcrumbs separator=">" mb="sm">
            <Anchor onClick={() => router.push('/admin/dashboard')}>
              Tablero
            </Anchor>
            <Text>étricas del Mapa</Text>
          </Breadcrumbs>
          <Group gap="xs" mb="xs">
            <ActionIcon 
              variant="subtle" 
              size="lg"
              onClick={() => router.push('/admin/dashboard')}
            >
              <IconChevronLeft size={20} />
            </ActionIcon>
            <Title order={1} size="h2">Métricas Avanzadas del Mapa</Title>
          </Group>
          <Text size="sm" c="dimmed">
            Análisis detallado de todas las interacciones con el mapa interactivo de centros de salud
          </Text>
        </Box>

        <Group gap="xs">
          <Select
            data={[
              { value: '1', label: 'Último día' },
              { value: '7', label: 'Última semana' },
              { value: '30', label: 'Últimos 30 días' },
              { value: '90', label: 'Últimos 3 meses' },
            ]}
            value={timeframe}
            onChange={(value) => {
              setTimeframe(value);
              if (value) {
                handleClearDateRange();
              }
            }}
            leftSection={<IconCalendar size={16} />}
            w={180}
            disabled={isDateRangeActive}
          />
          
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateRangeChange}
            onClear={handleClearDateRange}
            disabled={loading}
          />
          <Tooltip label="Refrescar datos">
            <ActionIcon 
              variant="light" 
              size="lg"
              onClick={loadMapStats}
              loading={loading}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          {/* <Button 
            variant="outline" 
            leftSection={<IconDownload size={16} />}
            onClick={exportData}
            disabled={!mapStats}
          >
            Exportar
          </Button> */}
        </Group>
      </Group>

      {loading ? (
        <LoadingScreen 
          message="Cargando métricas del mapa..."
          showBackButton={false}
        />
      ) : mapStats ? (
        <>
          {/* Resumen General Expandido */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg" mb="xl">
            <Paper p="lg" radius="md" bg="blue.0" withBorder>
              <Group gap="xs" mb="md">
                <ThemeIcon color="blue" variant="light" size="xl">
                  <IconEye size={24} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">Total Interacciones</Text>
                  <Text size="xl" fw={700} c="blue.7">
                    {mapStats.generalStats.total_interactions || 0}
                  </Text>
                </Box>
              </Group>
              <Text size="sm" c="dimmed">clicks en centros de salud</Text>
              <Group gap="xs" mt="xs">
                <IconTrendingUp size={14} />
                <Text size="xs" c="blue.6">
                  {mapStats.generalStats.total_interactions && mapStats.generalStats.unique_users 
                    ? Math.round((mapStats.generalStats.total_interactions / mapStats.generalStats.unique_users) * 100) / 100
                    : 0
                  } promedio por usuario
                </Text>
              </Group>
            </Paper>

            <Paper p="lg" radius="md" bg="grape.0" withBorder>
              <Group gap="xs" mb="md">
                <ThemeIcon color="grape" variant="light" size="xl">
                  <IconSearch size={24} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">Total Búsquedas</Text>
                  <Text size="xl" fw={700} c="grape.7">
                    {mapStats.generalStats.total_searches || 0}
                  </Text>
                </Box>
              </Group>
              <Text size="sm" c="dimmed">búsquedas realizadas</Text>
              <Group gap="xs" mt="xs">
                <IconTrendingUp size={14} />
                <Text size="xs" c="grape.6">
                  {mapStats.generalStats.total_searches && mapStats.generalStats.unique_users
                    ? Math.round((mapStats.generalStats.total_searches / mapStats.generalStats.unique_users) * 100)
                    : 0
                  }% de usuarios buscan
                </Text>
              </Group>
            </Paper>

            <Paper p="lg" radius="md" bg="teal.0" withBorder>
              <Group gap="xs" mb="md">
                <ThemeIcon color="teal" variant="light" size="xl">
                  <IconExternalLink size={24} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">Direcciones Solicitadas</Text>
                  <Text size="xl" fw={700} c="teal.7">
                    {mapStats.generalStats.total_direction_requests || 0}
                  </Text>
                </Box>
              </Group>
              <Text size="sm" c="dimmed">solicitudes de rutas</Text>
              <Group gap="xs" mt="xs">
                <IconTrendingUp size={14} />
                <Text size="xs" c="teal.6">
                  {mapStats.generalStats.total_direction_requests && mapStats.generalStats.total_interactions
                    ? Math.round((mapStats.generalStats.total_direction_requests / mapStats.generalStats.total_interactions) * 100)
                    : 0
                  }% de conversión
                </Text>
              </Group>
            </Paper>

            <Paper p="lg" radius="md" bg="orange.0" withBorder>
              <Group gap="xs" mb="md">
                <ThemeIcon color="orange" variant="light" size="xl">
                  <IconUsers size={24} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">Usuarios Únicos</Text>
                  <Text size="xl" fw={700} c="orange.7">
                    {mapStats.generalStats.unique_users || 0}
                  </Text>
                </Box>
              </Group>
              <Text size="sm" c="dimmed">sesiones diferentes</Text>
              <Group gap="xs" mt="xs">
                <IconDeviceDesktop size={14} />
                <Text size="xs" c="orange.6">
                  {mapStats?.period || 'Período no definido'}
                </Text>
              </Group>
            </Paper>
          </SimpleGrid>

          {/* Tablas Detalladas */}
          <Grid>
            {/* Centros Más Visitados */}
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Card shadow="sm" p="xl" radius="md" withBorder>
                <Group justify="space-between" mb="xl">
                  <Title order={3}>Centros Más Visitados</Title>
                  <Badge variant="light" color="blue" size="lg">
                    {mapStats.mostClickedCenters.length} centros
                  </Badge>
                </Group>
                <Stack gap="lg">
                  {mapStats.mostClickedCenters.map((center, index) => (
                    <Box key={index} p="md" bg={index === 0 ? 'blue.0' : 'gray.0'} radius="md">
                      <Group justify="space-between" align="center">
                        <Box style={{ flex: 1 }}>
                          <Group gap="sm" mb="sm">
                            <Badge size="md" variant="filled" color={index === 0 ? 'blue' : 'gray'}>
                              #{index + 1}
                            </Badge>
                            <Text size="md" fw={600}>{center.center_name}</Text>
                          </Group>
                          <Group gap="xl">
                            <Group gap="xs">
                              <IconMapPin size={16} />
                              <Text size="sm" c="dimmed">{center.center_type}</Text>
                            </Group>
                            <Group gap="xs">
                              <IconUsers size={16} />
                              <Text size="sm" c="dimmed">{center.unique_sessions} usuarios únicos</Text>
                            </Group>
                          </Group>
                        </Box>
                        <Box ta="right">
                          <Text size="xl" fw={700} c="blue">
                            {center.total_clicks}
                          </Text>
                          <Text size="sm" c="dimmed">clicks</Text>
                        </Box>
                      </Group>
                    </Box>
                  ))}
                  {mapStats.mostClickedCenters.length === 0 && (
                    <Text size="md" c="dimmed" ta="center" py="xl">
                      No hay datos de interacciones disponibles
                    </Text>
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Direcciones Más Solicitadas */}
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Card shadow="sm" p="xl" radius="md" withBorder>
                <Group justify="space-between" mb="xl">
                  <Title order={3}>Direcciones Más Solicitadas</Title>
                  <Badge variant="light" color="teal" size="lg">
                    {mapStats.mostRequestedDirections.length} centros
                  </Badge>
                </Group>
                <Stack gap="lg">
                  {mapStats.mostRequestedDirections.map((direction, index) => (
                    <Box key={index} p="md" bg={index === 0 ? 'teal.0' : 'gray.0'} radius="md">
                      <Group justify="space-between" align="center">
                        <Box style={{ flex: 1 }}>
                          <Group gap="sm" mb="sm">
                            <Badge size="md" variant="filled" color={index === 0 ? 'teal' : 'gray'}>
                              #{index + 1}
                            </Badge>
                            <Text size="md" fw={600}>{direction.center_name}</Text>
                          </Group>
                          <Group gap="xl">
                            <Group gap="xs">
                              <IconMapPin size={16} />
                              <Text size="sm" c="dimmed">{direction.center_type}</Text>
                            </Group>
                            <Group gap="xs">
                              <IconUsers size={16} />
                              <Text size="sm" c="dimmed">{direction.unique_users} usuarios únicos</Text>
                            </Group>
                          </Group>
                        </Box>
                        <Box ta="right">
                          <Text size="xl" fw={700} c="teal">
                            {direction.direction_requests}
                          </Text>
                          <Text size="sm" c="dimmed">direcciones</Text>
                        </Box>
                      </Group>
                    </Box>
                  ))}
                  {mapStats.mostRequestedDirections.length === 0 && (
                    <Text size="md" c="dimmed" ta="center" py="xl">
                      No hay solicitudes de direcciones registradas
                    </Text>
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Búsquedas Más Populares */}
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Card shadow="sm" p="xl" radius="md" withBorder>
                <Group justify="space-between" mb="xl">
                  <Title order={3}>Búsquedas Más Populares</Title>
                  <Badge variant="light" color="grape" size="lg">
                    {mapStats.topSearches.length} búsquedas
                  </Badge>
                </Group>
                <Stack gap="lg">
                  {mapStats.topSearches.map((search, index) => (
                    <Box key={index} p="md" bg={index === 0 ? 'grape.0' : 'gray.0'} radius="md">
                      <Group justify="space-between" align="center">
                        <Box style={{ flex: 1 }}>
                          <Group gap="sm" mb="sm">
                            <Badge size="md" variant="filled" color={index === 0 ? 'grape' : 'gray'}>
                              #{index + 1}
                            </Badge>
                            <Text size="md" fw={600}>&quot;{search.search_query}&quot;</Text>
                          </Group>
                          <Group gap="xl">
                            <Group gap="xs">
                              <IconUsers size={16} />
                              <Text size="sm" c="dimmed">{search.unique_users} usuarios</Text>
                            </Group>
                            <Group gap="xs">
                              <IconActivity size={16} />
                              <Text size="sm" c="dimmed">
                                {search.avg_results ? Math.round(search.avg_results) : 0} resultados promedio
                              </Text>
                            </Group>
                          </Group>
                        </Box>
                        <Box ta="right">
                          <Text size="xl" fw={700} c="grape">
                            {search.search_count}
                          </Text>
                          <Text size="sm" c="dimmed">búsquedas</Text>
                        </Box>
                      </Group>
                    </Box>
                  ))}
                  {mapStats.topSearches.length === 0 && (
                    <Text size="md" c="dimmed" ta="center" py="xl">
                      No hay búsquedas registradas
                    </Text>
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Filtros Más Utilizados */}
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Card shadow="sm" p="xl" radius="md" withBorder>
                <Group justify="space-between" mb="xl">
                  <Title order={3}>Filtros Más Utilizados</Title>
                  <Badge variant="light" color="orange" size="lg">
                    {mapStats.popularFilters.length} filtros
                  </Badge>
                </Group>
                <Stack gap="lg">
                  {mapStats.popularFilters.map((filter, index) => (
                    <Box key={index} p="md" bg={index === 0 ? 'orange.0' : 'gray.0'} radius="md">
                      <Group justify="space-between" align="center">
                        <Box style={{ flex: 1 }}>
                          <Group gap="sm" mb="sm">
                            <Badge size="md" variant="filled" color={index === 0 ? 'orange' : 'gray'}>
                              #{index + 1}
                            </Badge>
                            <Text size="md" fw={600}>{filter.filter_value}</Text>
                          </Group>
                          <Group gap="xl">
                            <Group gap="xs">
                              <IconFilter size={16} />
                              <Text size="sm" c="dimmed">{filter.filter_type}</Text>
                            </Group>
                            <Group gap="xs">
                              <IconUsers size={16} />
                              <Text size="sm" c="dimmed">{filter.unique_users} usuarios</Text>
                            </Group>
                          </Group>
                        </Box>
                        <Box ta="right">
                          <Text size="xl" fw={700} c="orange">
                            {filter.usage_count}
                          </Text>
                          <Text size="sm" c="dimmed">usos</Text>
                        </Box>
                      </Group>
                    </Box>
                  ))}
                  {mapStats.popularFilters.length === 0 && (
                    <Text size="md" c="dimmed" ta="center" py="xl">
                      No hay uso de filtros registrado
                    </Text>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Estadísticas de Rendimiento */}
          <Card shadow="sm" p="xl" radius="md" withBorder mt="xl">
            <Title order={3} mb="xl">Métricas de Rendimiento</Title>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
              <Box ta="center" p="lg" bg="blue.0" radius="md">
                <ThemeIcon size="xl" variant="light" color="blue" mb="md">
                  <IconActivity size={24} />
                </ThemeIcon>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">
                  Tasa de Interacción
                </Text>
                <Text size="2xl" fw={700} c="blue">
                  {mapStats.generalStats.total_interactions && mapStats.generalStats.unique_users 
                    ? Math.round((mapStats.generalStats.total_interactions / mapStats.generalStats.unique_users) * 100) / 100
                    : 0
                  }
                </Text>
                <Text size="sm" c="dimmed">clicks por usuario</Text>
              </Box>

              <Box ta="center" p="lg" bg="grape.0" radius="md">
                <ThemeIcon size="xl" variant="light" color="grape" mb="md">
                  <IconSearch size={24} />
                </ThemeIcon>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">
                  Tasa de Búsqueda
                </Text>
                <Text size="2xl" fw={700} c="grape">
                  {mapStats.generalStats.total_searches && mapStats.generalStats.unique_users
                    ? Math.round((mapStats.generalStats.total_searches / mapStats.generalStats.unique_users) * 100)
                    : 0
                  }%
                </Text>
                <Text size="sm" c="dimmed">usuarios que buscan</Text>
              </Box>

              <Box ta="center" p="lg" bg="teal.0" radius="md">
                <ThemeIcon size="xl" variant="light" color="teal" mb="md">
                  <IconExternalLink size={24} />
                </ThemeIcon>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">
                  Tasa de Conversión
                </Text>
                <Text size="2xl" fw={700} c="teal">
                  {mapStats.generalStats.total_direction_requests && mapStats.generalStats.total_interactions
                    ? Math.round((mapStats.generalStats.total_direction_requests / mapStats.generalStats.total_interactions) * 100)
                    : 0
                  }%
                </Text>
                <Text size="sm" c="dimmed">conversión a direcciones</Text>
              </Box>

              <Box ta="center" p="lg" bg="green.0" radius="md">
                <ThemeIcon size="xl" variant="light" color="green" mb="md">
                  <IconTrendingUp size={24} />
                </ThemeIcon>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">
                  Engagement Score
                </Text>
                <Text size="2xl" fw={700} c="green">
                  {mapStats.generalStats.total_interactions && mapStats.generalStats.unique_users
                    ? Math.min(100, Math.round(
                        ((mapStats.generalStats.total_interactions + mapStats.generalStats.total_searches + mapStats.generalStats.total_direction_requests) 
                        / mapStats.generalStats.unique_users) * 10
                      ))
                    : 0
                  }
                </Text>
                <Text size="sm" c="dimmed">de 100 puntos</Text>
              </Box>
            </SimpleGrid>
          </Card>

          {/* Información adicional */}
          <Card shadow="xs" p="md" radius="md" withBorder mt="lg" bg="gray.0">
            <Group gap="xs">
              <IconClock size={16} />
              <Text size="xs" c="dimmed">
                Datos actualizados para el período: {mapStats?.period || 'Período no definido'} - 
                Última actualización: {mapStats?.lastUpdated ? new Date(mapStats.lastUpdated).toLocaleString('es-AR') : 'No disponible'}
              </Text>
            </Group>
          </Card>
        </>
      ) : (
        <Paper p="xl" ta="center" withBorder>
          <Text size="lg" c="dimmed" mb="md">
            No hay datos disponibles para el período seleccionado
          </Text>
          <Button variant="light" onClick={loadMapStats}>
            Reintentar carga
          </Button>
        </Paper>
      )}
    </Container>
  );
}