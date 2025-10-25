import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Container,
  Text,
  Group,
  Button,
  Avatar,
  Menu,
  Box,
  UnstyledButton,
  Breadcrumbs,
  Anchor
} from '@mantine/core';
import {
  IconDashboard,
  IconUsers,
  IconMapPin,
  IconSettings,
  IconLogout,
  IconChevronRight
} from '@tabler/icons-react';
import Link from 'next/link';
import AdminUsuarios from '../../components/admin/AdminUsuarios';
import LoadingScreen from '../../components/LoadingScreen';

export default function UsuariosAdmin() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  // Verificar autenticación con NextAuth
  useEffect(() => {
    if (status === 'loading') return; // Aún cargando

    if (status === 'unauthenticated') {
      console.log('❌ Usuario no autenticado, redirigiendo a login');
      router.push('/login');
      return;
    }

    if (session?.user) {
      console.log('✅ Usuario autenticado en gestión de usuarios:', session.user);
      
      // Verificar que sea solo admin (role = 1) para gestión de usuarios
      if (session.user.role !== 1) {
        console.log('⚠️ Usuario sin permisos de admin para gestión de usuarios');
        router.push('/admin/dashboard?error=admin_required');
        return;
      }
      
      setLoading(false);
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    console.log('🚪 Cerrando sesión desde gestión de usuarios...');
    await signOut({ 
      callbackUrl: '/login',
      redirect: true 
    });
  };

  // Mostrar loading mientras se verifica la sesión
  if (status === 'loading' || loading) {
    return (
      <LoadingScreen 
        message="Verificando permisos de administrador..."
        backHref="/admin/dashboard"
        backText="Volver al dashboard"
      />
    );
  }

  // Si no hay sesión, no mostrar nada (el useEffect redirigirá)
  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Administración de Usuarios - Panel Admin</title>
        <meta name="description" content="Panel de administración para gestión de usuarios del sistema" />
      </Head>

      {/* Header similar al dashboard */}
      <Box bg="white" style={{ borderBottom: '1px solid #e9ecef' }}>
        <Container size="xl">
          <Group h={70} justify="space-between">
            <Group>
              <IconUsers size={28} color="#1B436B" />
              <div>
                <Text fw={700} size="lg" c="brand.5">Administración de Usuarios</Text>
                <Text size="sm" c="dimmed">Panel de gestión de usuarios del sistema</Text>
              </div>
            </Group>

            <Group>
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <UnstyledButton>
                    <Group gap={7}>
                      <Avatar size={36} radius="xl" color="brand" variant="filled">
                        {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>
                          {session.user.name} ({session.user.roleName})
                        </Text>
                        <Text size="xs" c="dimmed">
                          {session.user.email}
                        </Text>
                      </Box>
                      <IconChevronRight size={14} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item 
                    leftSection={<IconDashboard size={14} />}
                    component={Link}
                    href="/admin/dashboard"
                  >
                    Tablero
                  </Menu.Item>
                  
                  <Menu.Divider />
                  <Menu.Item 
                    leftSection={<IconLogout size={14} />}
                    color="red"
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Breadcrumbs */}
      <Box bg="gray.0" py="sm">
        <Container size="xl">
          <Breadcrumbs>
            <Anchor component={Link} href="/admin/dashboard" c="brand.5">
              Tablero
            </Anchor>
            <Text c="dimmed">Administración de Usuarios</Text>
          </Breadcrumbs>
        </Container>
      </Box>

      {/* Contenido principal */}
      <Box bg="gray.0" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <AdminUsuarios />
      </Box>
    </>
  );
}
