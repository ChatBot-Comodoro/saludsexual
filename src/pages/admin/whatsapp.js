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
  Alert,
  ThemeIcon,
  ActionIcon,
  Table,
  ScrollArea,
  Modal,
  TextInput,
  Textarea,
  Code,
  Divider,
  Timeline,
  Avatar
} from '@mantine/core';
import {
  IconArrowLeft,
  IconRefresh,
  IconMessageCircle,
  IconUsers,
  IconSend,
  IconPhone,
  IconCheck,
  IconX,
  IconClock,
  IconBrandWhatsapp,
  IconDatabase,
  IconSettings,
  IconExternalLink,
  IconMessage,
  IconUser,
  IconCalendar
} from '@tabler/icons-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function WhatsAppAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const [sendMessageModal, setSendMessageModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Verificar autenticación y permisos
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      console.log('❌ Usuario no autenticado, redirigiendo a login');
      router.push('/login');
      return;
    }

    if (session?.user) {
      console.log('✅ Usuario autenticado:', session.user);
      
      if (session.user.role !== 1 && session.user.role !== 2) {
        console.log('⚠️ Usuario sin permisos adecuados');
        router.push('/login?error=insufficient_permissions');
        return;
      }
      
      loadData();
    }
  }, [session, status]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar estadísticas de WhatsApp
      const response = await fetch('/api/whatsapp/stats?days=30');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data.stats);
          setConversations(result.data.conversations);
        } else {
          throw new Error(result.error || 'Error desconocido');
        }
      } else {
        // Si las tablas no existen aún, usar datos en cero
        if (response.status === 500) {
          setStats({
            total_users: 0,
            total_messages: 0,
            inbound_messages: 0,
            outbound_messages: 0,
            delivered_messages: 0,
            avg_message_length: 0
          });
          setConversations([]);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }
      
    } catch (error) {
      console.error('Error loading WhatsApp data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeTables = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/whatsapp/init-tables', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Tablas inicializadas:', result);
        await loadData();
      } else {
        throw new Error('Error inicializando tablas');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const sendTestMessage = async () => {
    if (!newMessage.trim() || !targetPhone.trim()) return;

    try {
      console.log('Enviando mensaje de prueba:', { to: targetPhone, message: newMessage });
      
      const response = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: targetPhone,
          message: newMessage
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Mensaje enviado correctamente:', result);
        setSendMessageModal(false);
        setNewMessage('');
        setTargetPhone('');
        
        // Recargar datos después de enviar
        await loadData();
      } else {
        throw new Error(result.details || result.error || 'Error desconocido');
      }
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setError(error.message);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <LoadingScreen
        message="Cargando administración de WhatsApp..."
        backHref="/admin/dashboard"
        backText="Volver al Dashboard"
      />
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert 
          icon={<IconX size={16} />} 
          title="Error al cargar datos de WhatsApp" 
          color="red"
          variant="light"
        >
          {error}
          <Group mt="md">
            <Button size="sm" onClick={loadData}>
              Reintentar
            </Button>
            <Button variant="light" size="sm" onClick={() => router.push('/admin/dashboard')}>
              Volver al Dashboard
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
              <Title order={1} size="h2">
                <IconBrandWhatsapp size={32} style={{ marginRight: 8, color: '#25D366' }} />
                Administración WhatsApp
              </Title>
              <Text c="dimmed" size="sm">
                Gestión del chatbot de WhatsApp Business
              </Text>
            </Box>
          </Group>
          
          <Group gap="sm">
            <Button
              variant="light"
              leftSection={<IconDatabase size={16} />}
              onClick={initializeTables}
              loading={refreshing}
            >
              Inicializar BD
            </Button>
            <Button
              variant="filled"
              leftSection={<IconSend size={16} />}
              onClick={() => setSendMessageModal(true)}
            >
              Enviar Mensaje
            </Button>
            <ActionIcon
              variant="light"
              loading={refreshing}
              onClick={loadData}
              size="lg"
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>

      {/* Estadísticas */}
      <Paper withBorder p="lg" mb="md">
        <Title order={2} size="h3" mb="md">📊 Estadísticas de WhatsApp</Title>
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
          <Card shadow="sm" p="lg" radius="md" withBorder bg="green.0">
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={600} c="green">Usuarios Totales</Text>
              <ThemeIcon variant="light" color="green" size="sm">
                <IconUsers size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{stats?.total_users || 0}</Text>
            <Text size="xs" c="dimmed">Conversaciones únicas</Text>
          </Card>

          <Card shadow="sm" p="lg" radius="md" withBorder bg="blue.0">
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={600} c="blue">Mensajes Totales</Text>
              <ThemeIcon variant="light" color="blue" size="sm">
                <IconMessageCircle size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{stats?.total_messages || 0}</Text>
            <Text size="xs" c="dimmed">Enviados y recibidos</Text>
          </Card>

          <Card shadow="sm" p="lg" radius="md" withBorder bg="orange.0">
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={600} c="orange">Mensajes Entrantes</Text>
              <ThemeIcon variant="light" color="orange" size="sm">
                <IconMessage size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{stats?.inbound_messages || 0}</Text>
            <Text size="xs" c="dimmed">De usuarios</Text>
          </Card>

          <Card shadow="sm" p="lg" radius="md" withBorder bg="grape.0">
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={600} c="grape">Entregados</Text>
              <ThemeIcon variant="light" color="grape" size="sm">
                <IconCheck size={16} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">{stats?.delivered_messages || 0}</Text>
            <Text size="xs" c="dimmed">Confirmados</Text>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* Configuración del Webhook */}
      <Paper withBorder p="lg" mb="md">
        <Title order={2} size="h3" mb="md">⚙️ Configuración del Webhook</Title>
        
        <Alert icon={<IconSettings size={16} />} title="URL del Webhook" mb="md">
          <Text size="sm" mb="xs">Configura esta URL en tu Meta App Dashboard:</Text>
          <Code block>
            {typeof window !== 'undefined' 
              ? `${window.location.origin}/api/whatsapp/webhook`
              : 'https://tu-dominio.com/api/whatsapp/webhook'
            }
          </Code>
          <Text size="xs" c="dimmed" mt="xs">
            Asegúrate de configurar las variables de entorno correctamente
          </Text>
        </Alert>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Card withBorder p="md">
            <Title order={4} size="h5" mb="sm">🔐 Variables Requeridas</Title>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">WHATSAPP_ACCESS_TOKEN</Text>
                <Badge color={process.env.WHATSAPP_ACCESS_TOKEN ? 'green' : 'red'} size="sm">
                  {process.env.WHATSAPP_ACCESS_TOKEN ? 'Configurado' : 'Faltante'}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">WHATSAPP_PHONE_NUMBER_ID</Text>
                <Badge color={process.env.WHATSAPP_PHONE_NUMBER_ID ? 'green' : 'red'} size="sm">
                  {process.env.WHATSAPP_PHONE_NUMBER_ID ? 'Configurado' : 'Faltante'}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">WHATSAPP_VERIFY_TOKEN</Text>
                <Badge color={process.env.WHATSAPP_VERIFY_TOKEN ? 'green' : 'red'} size="sm">
                  {process.env.WHATSAPP_VERIFY_TOKEN ? 'Configurado' : 'Faltante'}
                </Badge>
              </Group>
            </Stack>
          </Card>

          <Card withBorder p="md">
            <Title order={4} size="h5" mb="sm">📚 Guía de Configuración</Title>
            <Stack gap="xs">
              <Text size="sm">1. Ve a Meta App Dashboard</Text>
              <Text size="sm">2. Agrega WhatsApp Product</Text>
              <Text size="sm">3. Configura el webhook</Text>
              <Text size="sm">4. Agrega las variables de entorno</Text>
              <Button 
                size="xs" 
                variant="light" 
                leftSection={<IconExternalLink size={14} />}
                onClick={() => window.open('https://developers.facebook.com/docs/whatsapp/cloud-api/get-started', '_blank')}
              >
                Ver Documentación
              </Button>
            </Stack>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* Conversaciones Recientes */}
      <Paper withBorder p="lg">
        <Group justify="space-between" mb="md">
          <Title order={2} size="h3">💬 Conversaciones Recientes</Title>
          <Badge variant="light" color="blue">
            {conversations.length} conversaciones
          </Badge>
        </Group>

        {conversations.length > 0 ? (
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Usuario</Table.Th>
                  <Table.Th>Teléfono</Table.Th>
                  <Table.Th>Último Mensaje</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Fecha</Table.Th>
                  <Table.Th>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {conversations.map((conversation, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar color="green" radius="xl">
                          <IconUser size={16} />
                        </Avatar>
                        <Text size="sm" fw={500}>
                          {conversation.user_name || 'Usuario Anónimo'}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" ff="monospace">
                        {conversation.phone_number}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={1}>
                        {conversation.last_message || 'Sin mensajes'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        size="sm" 
                        color={conversation.is_active ? 'green' : 'gray'}
                      >
                        {conversation.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {new Date(conversation.updated_at).toLocaleDateString('es-ES')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Button 
                        size="xs" 
                        variant="light"
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        Ver Historial
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        ) : (
          <Box ta="center" py="xl">
            <IconMessageCircle size={48} color="gray" />
            <Title order={4} c="dimmed" mt="md">No hay conversaciones aún</Title>
            <Text size="sm" c="dimmed">
              Las conversaciones de WhatsApp aparecerán aquí una vez que los usuarios comiencen a chatear
            </Text>
          </Box>
        )}
      </Paper>

      {/* Modal para enviar mensaje */}
      <Modal
        opened={sendMessageModal}
        onClose={() => setSendMessageModal(false)}
        title="Enviar Mensaje de Prueba"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Número de Teléfono"
            placeholder="+54 9 11 1234-5678"
            value={targetPhone}
            onChange={(e) => setTargetPhone(e.target.value)}
            leftSection={<IconPhone size={16} />}
          />
          <Textarea
            label="Mensaje"
            placeholder="Escribe tu mensaje aquí..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            minRows={3}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setSendMessageModal(false)}>
              Cancelar
            </Button>
            <Button onClick={sendTestMessage} disabled={!newMessage.trim() || !targetPhone.trim()}>
              Enviar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}