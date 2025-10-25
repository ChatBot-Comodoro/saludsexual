import React from "react";
import { useSession } from "next-auth/react";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Breadcrumbs,
  Anchor,
  UnstyledButton,
  Avatar,
  Menu,
} from "@mantine/core";
import {
  IconChevronRight,
  IconDashboard,
  IconUsers,
  IconMapPin,
  IconArticle,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Head from "next/head";
import LoadingScreen from "../../components/LoadingScreen";
import { AdminArticulos } from "../../components/admin";

export default function ArticlesAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redireccionar si no está autenticado
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <LoadingScreen
        message="Cargando panel de administración..."
        backHref="/admin/dashboard"
        backText="Volver al dashboard"
      />
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <Head>
        <title>Gestión de Artículos - Admin | Asistente Virtual de Salud</title>
        <meta
          name="description"
          content="Panel de administración para gestionar artículos de salud"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container size="xl" py="md">
        {/* Header con navegación */}
        <Paper withBorder p="md" mb="xl">
          <Group justify="space-between">
            <Group>
              {/* Breadcrumbs */}
              <Breadcrumbs separator={<IconChevronRight size={14} />}>
                <Anchor component={Link} href="/admin/dashboard">
                  <Group gap="xs">
                    <IconDashboard size={16} />
                    <Text size="sm">Tablero</Text>
                  </Group>
                </Anchor>
                <Text size="sm" c="dimmed">
                  Artículos
                </Text>
              </Breadcrumbs>
            </Group>

            {/* Usuario y menú */}
            <Group>
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <UnstyledButton>
                    <Group gap="sm">
                      <Avatar color="blue" radius="xl">
                        {session.user?.name?.charAt(0) || "A"}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {session.user?.name || "Admin"}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {session.user?.email}
                        </Text>
                      </div>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Navegación</Menu.Label>
                  <Menu.Item
                    component={Link}
                    href="/admin/dashboard"
                    leftSection={<IconDashboard size={14} />}
                  >
                    Tablero
                  </Menu.Item>
                  <Menu.Item
                    component={Link}
                    href="/admin/users"
                    leftSection={<IconUsers size={14} />}
                  >
                    Usuarios
                  </Menu.Item>
                  <Menu.Item
                    component={Link}
                    href="/admin/mapas"
                    leftSection={<IconMapPin size={14} />}
                  >
                    Mapas
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconArticle size={14} />}
                    disabled
                  >
                    Artículos
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={14} />}
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Paper>

        {/* Componente principal de administración de artículos */}
        <AdminArticulos />
      </Container>
    </>
  );
}