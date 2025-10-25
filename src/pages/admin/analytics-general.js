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
  Alert,
  Grid,
  ThemeIcon
} from '@mantine/core';
import LoadingScreen from '../../components/LoadingScreen';
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
  IconChartBar
} from '@tabler/icons-react';

export default function AnalyticsGeneral() {
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
      <LoadingScreen
        message="Cargando métricas generales de visitas..."
        backHref="/admin/dashboard"
        backText="Volver al Dashboard"
      />
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
              <Title order={1} size="h2">Métricas Generales de Visitas</Title>
              <Text c="dimmed" size="sm">
                Análisis completo del tráfico y comportamiento de usuarios
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
            <Title order={2} size="h3" mb="md">Resumen General</Title>
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
              </Card>

              <Card shadow="sm" p="lg" radius="md" withBorder bg="orange.0">
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={600} c="orange">Promedio Diario</Text>
                  <ThemeIcon variant="light" color="orange" size="sm">
                    <IconChartBar size={16} />
                  </ThemeIcon>
                </Group>
                <Text fw={700} size="xl">
                  {visitStats.totalVisits && timeRange 
                    ? Math.round(visitStats.totalVisits / parseInt(timeRange)).toLocaleString() 
                    : '0'
                  }
                </Text>
                <Text size="xs" c="dimmed">Visitas por día</Text>
              </Card>
            </SimpleGrid>
          </Paper>

          {/* Distribución de Dispositivos */}
          <Paper withBorder p="lg" mb="md">
            <Title order={2} size="h3" mb="md">Distribución por Dispositivos</Title>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {visitStats.deviceStats && visitStats.deviceStats.map((device, index) => (
                <Card key={index} shadow="sm" p="md" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <Group gap="sm">
                      <ThemeIcon 
                        variant="light" 
                        color={device.device_type === 'mobile' ? 'orange' : 
                               device.device_type === 'desktop' ? 'blue' : 'green'}
                        size="lg"
                      >
                        <IconDevices size={20} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={600} tt="capitalize">{device.device_type || 'Desconocido'}</Text>
                        <Text size="xs" c="dimmed">{device.visit_count} visitas</Text>
                      </Box>
                    </Group>
                    <Badge 
                      variant="light" 
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
                    size="md" 
                    radius="xl"
                  />
                </Card>
              ))}
            </SimpleGrid>
          </Paper>

          {/* Páginas Más Visitadas */}
          {visitStats.popularPages && visitStats.popularPages.length > 0 && (
            <Paper withBorder p="lg" mb="md">
              <Title order={2} size="h3" mb="md">Páginas Más Visitadas</Title>
              <Grid>
                {visitStats.popularPages.slice(0, 12).map((page, index) => (
                  <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
                    <Card 
                      shadow="sm" 
                      p="md" 
                      radius="md" 
                      withBorder 
                      bg={index < 3 ? 'grape.0' : 'gray.0'}
                    >
                      <Group justify="space-between" mb="xs">
                        <Badge 
                          size="lg" 
                          variant="filled" 
                          color={index === 0 ? 'gold' : index === 1 ? 'gray' : index === 2 ? 'orange' : 'grape'}
                        >
                          #{index + 1}
                        </Badge>
                        <Badge size="sm" variant="light" color="grape">
                          {page.percentage}%
                        </Badge>
                      </Group>
                      
                      <Box mb="md">
                        <Text fw={600} size="sm" lineClamp={2} mb="xs">
                          {page.page_title || page.page_path}
                        </Text>
                        <Text size="xs" c="dimmed" ff="monospace">
                          {page.page_path}
                        </Text>
                      </Box>

                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconEye size={14} />
                            <Text size="xs" fw={500}>
                              {page.visit_count.toLocaleString()} visitas
                            </Text>
                          </Group>
                          <Group gap="xs">
                            <IconUsers size={14} />
                            <Text size="xs" c="dimmed">
                              {page.unique_visitors} únicos
                            </Text>
                          </Group>
                        </Group>

                        <Group justify="space-between" gap="xs">
                          <Badge size="xs" color="cyan" variant="light">
                            📱 {page.mobile_visits || 0}
                          </Badge>
                          <Badge size="xs" color="blue" variant="light">
                            💻 {page.desktop_visits || 0}
                          </Badge>
                        </Group>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Patrones Temporales Detallados */}
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mb="md">
            {/* Días de la Semana */}
            <Paper withBorder p="lg">
              <Title order={3} size="h4" mb="md">Análisis por Días de la Semana</Title>
              <Stack gap="sm">
                {visitStats.dayPatterns && visitStats.dayPatterns.map((day, index) => (
                  <Card key={index} p="sm" withBorder bg={index === 0 ? 'blue.0' : 'gray.0'}>
                    <Group justify="space-between" align="center" mb="xs">
                      <Group gap="sm">
                        <Badge 
                          size="lg" 
                          variant={index === 0 ? "filled" : "light"} 
                          color="blue"
                        >
                          {day.day_name}
                        </Badge>
                        <Text size="sm" c="dimmed">
                          Día {day.day_number}
                        </Text>
                      </Group>
                      <Box ta="right">
                        <Text fw={600} size="sm">
                          {day.visit_count.toLocaleString()}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {day.percentage}%
                        </Text>
                      </Box>
                    </Group>
                    <Progress 
                      value={parseFloat(day.percentage)} 
                      color="blue" 
                      size="sm" 
                    />
                  </Card>
                ))}
              </Stack>
            </Paper>

            {/* Horas del Día */}
            <Paper withBorder p="lg">
              <Title order={3} size="h4" mb="md">Análisis por Horas del Día</Title>
              <Stack gap="sm">
                {visitStats.hourPatterns && visitStats.hourPatterns.slice(0, 12).map((hour, index) => (
                  <Card key={index} p="sm" withBorder bg={index === 0 ? 'cyan.0' : 'gray.0'}>
                    <Group justify="space-between" align="center" mb="xs">
                      <Group gap="sm">
                        <Badge 
                          size="lg" 
                          variant={index === 0 ? "filled" : "light"} 
                          color="cyan"
                        >
                          {hour.hour_24}:00
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {hour.period}
                        </Text>
                      </Group>
                      <Box ta="right">
                        <Text fw={600} size="sm">
                          {hour.visit_count.toLocaleString()}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {hour.percentage}%
                        </Text>
                      </Box>
                    </Group>
                    <Progress 
                      value={parseFloat(hour.percentage)} 
                      color="cyan" 
                      size="sm" 
                    />
                  </Card>
                ))}
              </Stack>
            </Paper>
          </SimpleGrid>

          {/* Estadísticas Adicionales */}
          <Paper withBorder p="lg">
            <Title order={2} size="h3" mb="md">Métricas Detalladas</Title>
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
              <Card shadow="xs" p="md" radius="md" withBorder bg="teal.0">
                <Text size="xs" c="dimmed" mb="xs">DÍA MÁS ACTIVO</Text>
                <Text fw={700} size="lg" c="teal">
                  {visitStats.dayPatterns?.[0]?.day_name || 'N/A'}
                </Text>
                <Text size="xs" c="dimmed">
                  {visitStats.dayPatterns?.[0]?.visit_count.toLocaleString() || '0'} visitas
                </Text>
              </Card>

              <Card shadow="xs" p="md" radius="md" withBorder bg="indigo.0">
                <Text size="xs" c="dimmed" mb="xs">HORA PICO</Text>
                <Text fw={700} size="lg" c="indigo">
                  {visitStats.hourPatterns?.[0]?.hour_24 || '0'}:00
                </Text>
                <Text size="xs" c="dimmed">
                  {visitStats.hourPatterns?.[0]?.visit_count.toLocaleString() || '0'} visitas
                </Text>
              </Card>

              <Card shadow="xs" p="md" radius="md" withBorder bg="gray.0">
                <Text size="xs" c="dimmed" mb="xs">DISPOSITIVO PRINCIPAL</Text>
                <Text fw={700} size="lg" c="pink.8" tt="capitalize">
                  {visitStats.deviceStats?.[0]?.device_type || 'N/A'}
                </Text>
                <Text size="xs" c="dimmed">
                  {visitStats.deviceStats?.[0]?.percentage || '0'}% del tráfico
                </Text>
              </Card>

              <Card shadow="xs" p="md" radius="md" withBorder bg="yellow.0">
                <Text size="xs" c="dimmed" mb="xs">PÁGINA TOP</Text>
                <Text fw={700} size="sm" c="orange" lineClamp={1}>
                  {visitStats.popularPages?.[0]?.page_title || 'N/A'}
                </Text>
                <Text size="xs" c="dimmed">
                  {visitStats.popularPages?.[0]?.visit_count.toLocaleString() || '0'} visitas
                </Text>
              </Card>
            </SimpleGrid>
          </Paper>
        </>
      )}
    </Container>
  );
}