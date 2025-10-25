import React, { useState, useEffect } from 'react';
import {
  AppShell,
  Group,
  Text,
  Burger,
  Drawer,
  Stack,
  Box,
  ActionIcon,
  Container,
  Image,
  useMatches
} from '@mantine/core';
import {
  IconBrandFacebook, 
  IconBrandInstagram
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import classes from './Navbar.module.css';

const navigation = [
  
  { name: 'Inicio', href: '/' },
  
  { name: 'Nuestro Trabajo', href: '/proyecto' },
  { name: 'VIH', href: '/vih' },
  { name: 'ITS', href: '/its' },
  { name: 'Centros de atención y testeo', href: '/mapa' }
];

const Navbar = () => {
  const [opened, setOpened] = useState(false);
  const router = useRouter();

  // Usar useMatches de Mantine para responsividad con breakpoints más específicos
  const isMobile = useMatches({
    base: true,
    xs: true,
    sm: true,
    md: false,
    lg: false,
    xl: false,
  });

  const isTablet = useMatches({
    base: false,
    xs: false,
    sm: false,
    md: true,
    lg: false,
    xl: false,
  });

  const isDesktop = useMatches({
    base: false,
    xs: false,
    sm: false,
    md: false,
    lg: true,
    xl: true,
  });

  // Cerrar el drawer cuando cambie la ruta
  useEffect(() => {
    setOpened(false);
  }, [router.pathname]);

  return (
    <>
      <AppShell.Header 
        className={classes.header}
        style={{
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          height: '60px',
          minHeight: '60px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 100,
          // iOS Safari specific fixes
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
      >
        <Container 
          size="xl" 
          className={classes.inner}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
            width: '100%'
          }}
        >
          {/* Logo */}
          <Group className={classes.logo}>
            <Link  href="/" style={{ textDecoration: 'none' }}>
              <Box style={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Image
                  src="/logo_salud.png"
                  alt="Logo de Salud"
                  height={isMobile ? 45 : 55}
                  width="auto"
                  style={{
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </Link>
          </Group>

          {/* Desktop Navigation */}
          {isDesktop && (
            <Group className={classes.desktopNav} gap="xl">
              {navigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`${classes.link} ${router.pathname === item.href ? classes.linkActive : ''}`}
                >
                  {item.name}
                </Link>
              ))}
            </Group>
          )}

          {/* Tablet Navigation */}
          {isTablet && (
            <Box className={classes.tabletNav}>
              <Group gap="md" className={classes.tabletNavInner}>
                {navigation.map((item) => (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    className={`${classes.tabletLink} ${router.pathname === item.href ? classes.linkActive : ''}`}
                  >
                    {item.name}
                  </Link>
                ))}
              </Group>
            </Box>
          )}

          {/* Right Section */}
          <Group className={classes.rightSection}>
            {/* Social Icons - Solo visible en tablet y desktop */}
            {!isMobile && (
              <Group className={classes.socialIcons} gap="xs">
                <ActionIcon
                  variant="subtle"
                  size={isTablet ? "md" : "lg"}
                  component="a"
                  href="https://www.facebook.com/mcrsecretariadesalud/?locale=es_LA"
                  className={classes.socialIcon}
                >
                  <IconBrandFacebook size={isTablet ? 16 : 20} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  size={isTablet ? "md" : "lg"}
                  component="a"
                  href="https://www.instagram.com/secretaria.de.salud.mcr/?hl=es"
                  className={classes.socialIcon}
                >
                  <IconBrandInstagram size={isTablet ? 16 : 20} />
                </ActionIcon>
                
              </Group>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                className={classes.burger}
                size="lg"
                color="#1B436B"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 102,
                  position: 'relative',
                  minWidth: '44px',
                  minHeight: '44px',
                  width: '44px',
                  height: '44px',
                  backgroundColor: 'transparent',
                  border: '2px solid #1B436B',
                  borderRadius: '8px',
                  padding: '8px',
                  // iOS specific optimizations
                  WebkitTapHighlightColor: 'rgba(27, 67, 107, 0.2)',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  touchAction: 'manipulation',
                  WebkitTransform: 'translateZ(0)',
                  transform: 'translateZ(0)'
                }}
              />
            )}
          </Group>
        </Container>
      </AppShell.Header>

      {/* Mobile Drawer - Simplificado para evitar conflictos */}
      {isMobile && (
        <Drawer
      
          opened={opened}
          onClose={() => setOpened(false)}
          title={
            <Text size="lg" fw={600} c="#495057">
              Menú
            </Text>
          }
          size="70%"
          position="right"
          zIndex={3000}
          overlayProps={{ 
            backgroundOpacity: 0.4,
            zIndex: 2999,
            onClick: () => setOpened(false)
          }}
          styles={{
            inner: {
              zIndex: 3001
            },
            header: {
              background: 'white',
              borderBottom: '1px solid #e9ecef',
              zIndex: 3002
            },
            body: {
              padding: '1rem',
              background: 'white',
              zIndex: 3001
            },
            content: {
              zIndex: 3001
            }
          }}
        >
          <Stack gap="sm" style={{ zIndex: 3001, position: 'relative' }}>
            {navigation.map((item) => (
              <Box
                key={item.name}
                component={Link}
                href={item.href}
                onClick={() => setOpened(false)}
                style={{
                  display: 'block',
                  color: router.pathname === item.href ? '#1B436B' : '#495057',
                  textDecoration: 'none',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  backgroundColor: router.pathname === item.href ? '#f8f9fa' : 'transparent',
                  position: 'relative',
                  zIndex: 3002,
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
                onMouseEnter={(e) => {
                  if (router.pathname !== item.href) {
                    e.target.style.color = '#1B436B';
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (router.pathname !== item.href) {
                    e.target.style.color = '#495057';
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {item.name}
              </Box>
            ))}
            
            <Box style={{ 
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e9ecef',
              zIndex: 3001,
              position: 'relative'
            }}>
              <Text size="sm" fw={500} mb="xs" c="dimmed">Síguenos</Text>
              <Group gap="xs">
                <ActionIcon
                  variant="light"
                  size="lg"
                  component="a"
                  href="https://www.facebook.com/mcrsecretariadesalud/?locale=es_LA"
                  style={{
                    touchAction: 'manipulation',
                    zIndex: 3002
                  }}
                >
                  <IconBrandFacebook size={20} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  size="lg"
                  component="a"
                  href="https://www.instagram.com/secretaria.de.salud.mcr/?hl=es"
                  style={{
                    touchAction: 'manipulation',
                    zIndex: 3002
                  }}
                >
                  <IconBrandInstagram size={20} />
                </ActionIcon>
                
              </Group>
            </Box>
          </Stack>
        </Drawer>
      )}
    </>
  );
};

export default Navbar;
