import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Button,
  SimpleGrid,
  Card,
  Badge,
  Stack,
  Box,
  Progress,
  Divider,
  Select,
  ActionIcon,
  Loader,
  Center,
  Alert,
  Grid,
  ThemeIcon
} from '@mantine/core';
import {
  IconArrowLeft,
  IconRefresh,
  IconEye,
  IconUsers,
  IconDevices,
  IconClock,
  IconCalendar,
  IconWorldWww,
  IconTrendingUp,
  IconTrendingDown,
  IconEqual,
  IconDownload,
  IconFilter,
  IconInfoCircle,
  IconChartBar,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconActivity
} from '@tabler/icons-react';

export default function AnalyticsTrafico() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [visitStats, setVisitStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  // Verificar autenticación y permisos
  useEffect(() => {
    if (status === 'loading') return; // Aún cargando

    if (status === 'unauthenticated') {
      console.log('❌ Usuario no autenticado, redirigiendo a login');
      router.push('/login');
      return;
    }

    if (session?.user) {
      console.log('✅ Usuario autenticado:', session.user);
      
      // Verificar que sea admin o moderador
      if (session.user.role !== 1 && session.user.role !== 2) {
        console.log('⚠️ Usuario sin permisos adecuados');
        router.push('/login?error=insufficient_permissions');
        return;
      }
      
      // Usuario válido, cargar datos
      loadVisitStats();
    }
  }, [session, status]);

  // Cargar datos cuando cambie el rango de tiempo
  useEffect(() => {
    if (session?.user && (session.user.role === 1 || session.user.role === 2)) {
      loadVisitStats();
    }
  }, [timeRange]);

  const loadVisitStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/page-visits?days=${timeRange}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setVisitStats(data);
    } catch (error) {
      console.error('Error loading visit stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadVisitStats();
  };

  if (status === 'loading' || loading) {
    return (
      <Container size="lg" py="xl">
        <Center h="50vh">
          <Stack align="center" gap="md">
            <Loader size="lg" color="blue" />
            <Text c="dimmed">Cargando métricas de tráfico...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert 
          icon={<IconInfoCircle size={16} />} 
          title="Error al cargar datos" 
          color="red"
          variant="light"
        >
          {error}
          <Group mt="md">
            <Button size="sm" onClick={loadVisitStats}>
              Reintentar
            </Button>
            <Button variant="light" size="sm" onClick={() => router.push('/admin/dashboard')}>
              Volver al Tablero
            </Button>
          </Group>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Paper withBorder p="lg" mb="md">
        <Group justify="space-between" align="center">
          <Group gap="md">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => router.push('/admin/dashboard')}
            >
              <IconArrowLeft size={18} />
            </ActionIcon>
            <Box>
              <Title order={1} size="h2">Tráfico del Sitio Web</Title>
              <Text c="dimmed" size="sm">
                Análisis detallado de visitas, dispositivos y patrones temporales
              </Text>
            </Box>
          </Group>
          
          <Group gap="sm">
            <Select
              data={[
                { value: '7', label: 'Últimos 7 días' },
                { value: '30', label: 'Últimos 30 días' },
                { value: '90', label: 'Últimos 90 días' }
              ]}
              value={timeRange}
              onChange={setTimeRange}
              size="sm"
              leftSection={<IconFilter size={16} />}
            />
            <ActionIcon
              variant="light"
              loading={refreshing}
              onClick={refreshData}
              size="lg"
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>

      {visitStats && (
        <>
          {/* Métricas Principales */}
          <Paper withBorder p="lg" mb="md">
            <Title order={2} size="h3" mb="md">Resumen de Tráfico</Title>
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
              <Card shadow="sm" p="lg" radius="md" withBorder bg="blue.0">
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={600} c="blue">Total de Visitas</Text>
                  <ThemeIcon variant="light" color="blue" size="sm">
                    <IconEye size={16} />
                  </ThemeIcon>
                </Group>
                <Text fw={700} size="xl">{visitStats.totalVisits?.toLocaleString() || '0'}</Text>
                <Text size="xs" c="dimmed">En los últimos {timeRange} días</Text>
                <Group gap="xs" mt="xs">
                  <IconTrendingUp size={14} />
                  <Text size="xs" c="blue.6">
                    {visitStats.totalVisits && timeRange 
                      ? Math.round(visitStats.totalVisits / parseInt(timeRange)).toLocaleString() 
                      : '0'
                    } promedio/día
                  </Text>
                </Group>
              </Card>

              <Card shadow="sm" p="lg" radius="md" withBorder bg="green.0">
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={600} c="green">Visitantes Únicos</Text>
                  <ThemeIcon variant="light" color="green" size="sm">
                    <IconUsers size={16} />
                  </ThemeIcon>
                </Group>
                <Text fw={700} size="xl">{visitStats.uniqueVisitors?.toLocaleString() || '0'}</Text>
                <Text size="xs" c="dimmed">Sesiones diferentes</Text>
                <Group gap="xs" mt="xs">
                  <IconActivity size={14} />
                  <Text size="xs" c="green.6">
                    {visitStats.uniqueVisitors && visitStats.totalVisits
                      ? (visitStats.totalVisits / visitStats.uniqueVisitors).toFixed(1) 
                      : '0'
                    } páginas/sesión
                  </Text>
                </Group>
              </Card>

              <Card shadow="sm" p="lg" radius="md" withBorder bg="purple.0">
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={600} c="purple">Páginas Visitadas</Text>
                  <ThemeIcon variant="light" color="purple" size="sm">
                    <IconWorldWww size={16} />
                  </ThemeIcon>
                </Group>
                <Text fw={700} size="xl">{visitStats.uniquePages?.toLocaleString() || '0'}</Text>
                <Text size="xs" c="dimmed">Páginas diferentes</Text>
                <Group gap="xs" mt="xs">
                  <IconChartBar size={14} />
                  <Text size="xs" c="purple.6">
                    100% cobertura
                  </Text>
                </Group>
              </Card>

              <Card shadow="sm" p="lg" radius="md" withBorder bg="orange.0">
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={600} c="orange">Dispositivo Principal</Text>
                  <ThemeIcon variant="light" color="orange" size="sm">
                    <IconDevices size={16} />
                  </ThemeIcon>
                </Group>
                <Text fw={700} size="xl" tt="capitalize">
                  {visitStats.deviceStats?.[0]?.device_type || 'N/A'}
                </Text>
                <Text size="xs" c="dimmed">
                  {visitStats.deviceStats?.[0]?.percentage || '0'}% del tráfico
                </Text>
                <Group gap="xs" mt="xs">
                  <IconDevices size={14} />
                  <Text size="xs" c="orange.6">
                    {visitStats.deviceStats?.length || 0} tipos
                  </Text>
                </Group>
              </Card>
            </SimpleGrid>
          </Paper>

          {/* Distribución de Dispositivos Detallada */}
          <Paper withBorder p="lg" mb="md">
            <Title order={2} size="h3" mb="md">Análisis de Dispositivos</Title>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {visitStats.deviceStats && visitStats.deviceStats.map((device, index) => (
                <Card key={index} shadow="sm" p="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="lg">
                    <Group gap="md">
                      <ThemeIcon 
                        variant="light" 
                        color={device.device_type === 'mobile' ? 'orange' : 
                               device.device_type === 'desktop' ? 'blue' : 'green'}
                        size="xl"
                      >
                        {device.device_type === 'mobile' ? <IconDeviceMobile size={24} /> :
                         device.device_type === 'desktop' ? <IconDeviceDesktop size={24} /> :
                         <IconDeviceTablet size={24} />}
                      </ThemeIcon>
                      <Box>
                        <Text fw={600} size="lg" tt="capitalize">{device.device_type || 'Desconocido'}</Text>
                        <Text size="sm" c="dimmed">{device.visit_count.toLocaleString()} visitas</Text>
                      </Box>
                    </Group>
                    <Badge 
                      size="lg" 
                      variant="filled" 
                      color={device.device_type === 'mobile' ? 'orange' : 
                             device.device_type === 'desktop' ? 'blue' : 'green'}
                    >
                      {device.percentage}%
                    </Badge>
                  </Group>
                  
                  <Progress 
                    value={parseFloat(device.percentage)} 
                    color={device.device_type === 'mobile' ? 'orange' : 
                           device.device_type === 'desktop' ? 'blue' : 'green'} 
                    size="lg" 
                    radius="xl"
                  />
                  
                  <Stack gap="sm" mt="md">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Visitas únicas:</Text>
                      <Text size="sm" fw={500}>{device.unique_visitors || 0}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Promedio diario:</Text>
                      <Text size="sm" fw={500}>
                        {Math.round(device.visit_count / parseInt(timeRange)).toLocaleString()}
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>

          {/* Patrones Temporales Detallados */}
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mb="md">
            {/* Días de la Semana */}
            <Paper withBorder p="lg">
              <Group justify="space-between" mb="md">
                <Title order={3} size="h4">Días de la Semana</Title>
                <Badge variant="light" color="blue">
                  Patrón semanal
                </Badge>
              </Group>
              <Stack gap="md">
                {visitStats.dayPatterns && visitStats.dayPatterns.map((day, index) => (
                  <Card key={index} p="md" withBorder bg={index === 0 ? 'blue.0' : 'gray.0'}>
                    <Group justify="space-between" align="center" mb="sm">
                      <Group gap="md">
                        <Badge 
                          size="lg" 
                          variant={index === 0 ? "filled" : "light"} 
                          color="blue"
                        >
                          {day.day_name}
                        </Badge>
                        <Text size="sm" c="dimmed">
                          Día {day.day_number} de 7
                        </Text>
                      </Group>
                      <Box ta="right">
                        <Text fw={600} size="lg">
                          {day.visit_count.toLocaleString()}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {day.percentage}% del total
                        </Text>
                      </Box>
                    </Group>
                    <Progress 
                      value={parseFloat(day.percentage)} 
                      color="blue" 
                      size="md" 
                      radius="xl"
                    />
                    <Group justify="space-between" mt="sm">
                      <Text size="xs" c="dimmed">
                        Promedio: {Math.round(day.visit_count / (parseInt(timeRange) / 7)).toLocaleString()} visitas/día
                      </Text>
                      <Text size="xs" c="dimmed">
                        {index === 0 ? '🏆 Día más activo' : 
                         index < 3 ? '⭐ Top 3' : ''}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Paper>

            {/* Horas del Día */}
            <Paper withBorder p="lg">
              <Group justify="space-between" mb="md">
                <Title order={3} size="h4">Horas del Día</Title>
                <Badge variant="light" color="cyan">
                  Patrón horario
                </Badge>
              </Group>
              <Stack gap="md">
                {visitStats.hourPatterns && visitStats.hourPatterns.slice(0, 12).map((hour, index) => (
                  <Card key={index} p="md" withBorder bg={index === 0 ? 'cyan.0' : 'gray.0'}>
                    <Group justify="space-between" align="center" mb="sm">
                      <Group gap="md">
                        <Badge 
                          size="lg" 
                          variant={index === 0 ? "filled" : "light"} 
                          color="cyan"
                        >
                          {hour.hour_24}:00
                        </Badge>
                        <Text size="sm" c="dimmed">
                          {hour.period}
                        </Text>
                      </Group>
                      <Box ta="right">
                        <Text fw={600} size="lg">
                          {hour.visit_count.toLocaleString()}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {hour.percentage}% del total
                        </Text>
                      </Box>
                    </Group>
                    <Progress 
                      value={parseFloat(hour.percentage)} 
                      color="cyan" 
                      size="md" 
                      radius="xl"
                    />
                    <Group justify="space-between" mt="sm">
                      <Text size="xs" c="dimmed">
                        Intensidad: {hour.intensity || 'Normal'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {index === 0 ? '🕐 Hora pico' : 
                         index < 3 ? '⏰ Alta actividad' : ''}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </SimpleGrid>

          {/* Estadísticas Avanzadas */}
          <Paper withBorder p="lg">
            <Title order={2} size="h3" mb="md">Estadísticas Avanzadas</Title>
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
              <Card shadow="xs" p="md" radius="md" withBorder bg="teal.0">
                <Text size="xs" c="dimmed" mb="xs">DÍA MÁS ACTIVO</Text>
                <Text fw={700} size="lg" c="teal">
                  {visitStats.dayPatterns?.[0]?.day_name || 'N/A'}
                </Text>
                <Text size="xs" c="dimmed">
                  {visitStats.dayPatterns?.[0]?.visit_count.toLocaleString() || '0'} visitas
                </Text>
                <Progress 
                  value={parseFloat(visitStats.dayPatterns?.[0]?.percentage || 0)} 
                  color="teal" 
                  size="xs" 
                  mt="xs"
                />
              </Card>

              <Card shadow="xs" p="md" radius="md" withBorder bg="indigo.0">
                <Text size="xs" c="dimmed" mb="xs">HORA PICO</Text>
                <Text fw={700} size="lg" c="indigo">
                  {visitStats.hourPatterns?.[0]?.hour_24 || '0'}:00
                </Text>
                <Text size="xs" c="dimmed">
                  {visitStats.hourPatterns?.[0]?.visit_count.toLocaleString() || '0'} visitas
                </Text>
                <Progress 
                  value={parseFloat(visitStats.hourPatterns?.[0]?.percentage || 0)} 
                  color="indigo" 
                  size="xs" 
                  mt="xs"
                />
              </Card>

              <Card shadow="xs" p="md" radius="md" withBorder bg="gray.0">
                <Text size="xs" c="dimmed" mb="xs">VARIACIÓN SEMANAL</Text>
                <Text fw={700} size="lg" c="pink.8">
                  {visitStats.dayPatterns?.[0] && visitStats.dayPatterns?.[6]
                    ? `${(
                        ((visitStats.dayPatterns[0].visit_count - visitStats.dayPatterns[6].visit_count) / 
                         visitStats.dayPatterns[6].visit_count * 100)
                      ).toFixed(1)}%`
                    : 'N/A'
                  }
                </Text>
                <Text size="xs" c="dimmed">Máximo vs mínimo</Text>
                <Group gap="xs" mt="xs">
                  {visitStats.dayPatterns?.[0] && visitStats.dayPatterns?.[6] &&
                   visitStats.dayPatterns[0].visit_count > visitStats.dayPatterns[6].visit_count ? (
                    <IconTrendingUp size={12} color="#e64980" />
                  ) : (
                    <IconTrendingDown size={12} color="#e64980" />
                  )}
                  <Text size="xs" c="pink.8">
                    Tendencia semanal
                  </Text>
                </Group>
              </Card>

              <Card shadow="xs" p="md" radius="md" withBorder bg="yellow.0">
                <Text size="xs" c="dimmed" mb="xs">TASA DE RETORNO</Text>
                <Text fw={700} size="lg" c="orange">
                  {visitStats.uniqueVisitors && visitStats.totalVisits
                    ? `${((visitStats.totalVisits - visitStats.uniqueVisitors) / visitStats.totalVisits * 100).toFixed(1)}%`
                    : '0%'
                  }
                </Text>
                <Text size="xs" c="dimmed">Visitas recurrentes</Text>
                <Group gap="xs" mt="xs">
                  <IconUsers size={12} />
                  <Text size="xs" c="orange.6">
                    Usuario promedio
                  </Text>
                </Group>
              </Card>
            </SimpleGrid>
          </Paper>
        </>
      )}
    </Container>
  );
}