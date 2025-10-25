import {
  Container,
  Title,
  Text,
  Box,
  Stack,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Button,
} from "@mantine/core";
import Link from "next/link";

export default function Proyecto() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Box ta="center">
          <Title order={1} size="h1" mb="md" className="page-title">
            Nuestro Trabajo
          </Title>
        </Box>

        <Box>
          <Text size="lg" lh={1.6} mb="xl">
            La plataforma digital desarrollada tiene por finalidad centralizar información confiable, facilitar el acceso a servicios de salud del Municipio de Comodoro Rivadavia a través de un mapa georreferenciado, y responder mediante un chatbot interactivo —disponible tanto en la web como en WhatsApp—consultas e inquietudes de las personas usuarias.
          </Text>

          <Text size="lg" lh={1.6} mb="xl">
            La iniciativa fue creada por la <strong>Secretaría de Salud del Municipio de Comodoro Rivadavia</strong> junto a la <strong>Agencia Comodoro Conocimiento</strong>, con el apoyo del <strong>Programa de las Naciones Unidas para el Desarrollo (PNUD) en Argentina</strong> y desarrollada por <strong>iSUR Empresa Consultora</strong>.
          </Text>

          <Text size="lg" lh={1.6} mb="xl">
            Está orientada a fortalecer la respuesta local frente al VIH, las infecciones de transmisión sexual (ITS), las hepatitis virales y la tuberculosis.
          </Text>

          <Text size="lg" lh={1.6} mb="xl">
            Es una plataforma de código abierto, disponible en: <strong>XXXXXXX</strong>.
          </Text>

          <Text size="lg" lh={1.6} mb="md">
            Al recorrer y utilizar esta plataforma estás aceptando nuestras políticas de privacidad.
          </Text>

          <Group justify="center" mt="md">
            <Button 
              component={Link} 
              href="/politicas-privacidad"
              variant="outline"
              color="#FF0048"
              size="md"
            >
              Ver Políticas de Privacidad
            </Button>
          </Group>
        </Box>

        {/* Sección de Organizaciones Participantes */}
        

        {/* Texto informativo */}
        <Box style={{ borderTop: "2px solid #FFF2F6" }}>
          <Text size="sm" ta="start" c="dimmed" lh={1.5} >
            Esta iniciativa de Soluciones Digitales en Salud fue apoyada en su
            diseño y desarrollo por el{" "}
            <strong>Programa de las Naciones Unidas para el Desarrollo</strong>.
            Corresponde al
            <strong> Municipio de Comodoro Rivadavia</strong> la actualización
            de los contenidos. Las opiniones, designaciones y recomendaciones
            que se presentan en esta web no reflejan necesariamente la posición
            oficial de PNUD.
          </Text>
          <Text size="xs" ta="center" c="dimmed" mt="md" fw={600}>
            OCTUBRE DE 2025
          </Text>
        </Box>
      </Stack>
    </Container>
  );
}
