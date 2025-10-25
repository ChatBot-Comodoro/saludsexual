import React from "react";
import {
  Box,
  Text,
  Container,
  Stack,
  Flex,
  Image,
  Group,
  Anchor,
} from "@mantine/core";
import {
  IconHeart,
  IconMapPin,
  IconTestPipe,
  IconStethoscope,
  IconPhone,
} from "@tabler/icons-react";
import Link from "next/link";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <Box className={styles.footer}>
      <Container size="xl" py="xl">
        {/* Enlaces de Acceso Rápido - Simples */}
        <Group justify="center" gap="xl" mb="xl" wrap="wrap">
          <Anchor 
            component={Link} 
            href="/mapa" 
            className={styles.simpleLink}
            size="sm"
          >
            <Group gap="xs" align="center">
              <IconMapPin size={16} />
              <Text>Centros de Atención</Text>
            </Group>
          </Anchor>

          <Anchor 
            component={Link} 
            href="/testeos" 
            className={styles.simpleLink}
            size="sm"
          >
            <Group gap="xs" align="center">
              <IconTestPipe size={16} />
              <Text>Quiero Testearme</Text>
            </Group>
          </Anchor>

          <Anchor 
            component={Link} 
            href="/mapa" 
            className={styles.simpleLink}
            size="sm"
          >
            <Group gap="xs" align="center">
              <IconStethoscope size={16} />
              <Text>Centros de Salud</Text>
            </Group>
          </Anchor>

          <Anchor 
            component={Link} 
            href="/contacto" 
            className={styles.simpleLink}
            size="sm"
          >
            <Group gap="xs" align="center">
              <IconPhone size={16} />
              <Text>Contacto</Text>
            </Group>
          </Anchor>
        </Group>

        {/* Divisor */}
        <Box className={styles.divider} />

        {/* Logos institucionales */}
        <Flex justify="center" align="center" direction="column" mb="xl">
          <Group 
            justify="center" 
            align="center" 
            gap={{ base: "md", sm: "lg", md: "xl" }}
            wrap="wrap"
            w="100%"
          >
            <Image
              src="/logo_footer.png"
              alt="Escudo Municipal"
              className={styles.footerImage}
              fit="contain"
              w={{ base: "auto", xs: "auto", sm: "auto" }}
              maw={{ base: 180, xs: 200, sm: 220, md: 240 }}
              style={{ height: 'auto' }}
            />
            <Image
              src="/logo_salud.png"
              alt="Logo Salud"
              className={styles.footerImage}
              fit="contain"
              w={{ base: "auto", xs: "auto", sm: "auto" }}
              maw={{ base: 110, xs: 130, sm: 150, md: 170 }}
              style={{ height: 'auto' }}
            />          
            <Image
              src="/comodoro-conocimiento.png"
              alt="Agencia Comodoro Conocimiento Logo"
              className={styles.footerImage}
              fit="contain"
              w={{ base: "auto", xs: "auto", sm: "auto" }}
              maw={{ base: 140, xs: 160, sm: 180, md: 200 }}
              style={{ height: 'auto' }}
            />
          </Group>
        </Flex>

        {/* Footer inferior */}
        <Box pt="md" className={styles.footerBottom}>
          <Stack gap="xs" align="center">
            <Text size="xs" c="white" ta="center" opacity={0.8}>
              © {new Date().getFullYear()} Municipalidad de Comodoro Rivadavia.
              Todos los derechos reservados.
            </Text>
            <Group gap={4} justify="center">
              <Text size="xs" c="white" opacity={0.7}>
                Hecho con
              </Text>
              <IconHeart size={12} color="#e74c3c" className={styles.heart} />
              <Text size="xs" c="white" opacity={0.7}>
                por iSUR
              </Text>
            </Group>
            
            {/* Logo de ISUR */}
            <Box mt="xs" w="100%" ta="center">
              <Image
                src="/isur.png"
                alt="ISUR Logo"
                className={styles.isurLogo}
                fit="contain"
                w="auto"
                maw={{ base: 120, xs: 140, sm: 160, md: 180 }}
                style={{ height: 'auto' }}
              />
            </Box>
          </Stack> 
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
