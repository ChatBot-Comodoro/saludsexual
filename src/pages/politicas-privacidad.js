import React from 'react';
import {
  Container,
  Title,
  Text,
  Box,
  Stack,
  Paper,
  Breadcrumbs,
  Anchor,
  List,
  Divider
} from '@mantine/core';
import Link from 'next/link';
import Head from 'next/head';
import { IconChevronRight } from '@tabler/icons-react';

export default function PoliticasPrivacidad() {
  return (
    <>
      <Head>
        <title>Políticas de Privacidad - Comodoro Salud</title>
        <meta name="description" content="Políticas de privacidad y protección de datos de Comodoro Salud - Municipio de Comodoro Rivadavia." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Container size="md" py={60}>
        <Box mb={30}>
          <Breadcrumbs separator={<IconChevronRight size={14} />} mb={20}>
            <Anchor component={Link} href="/">
              Inicio
            </Anchor>
            <Anchor component={Link} href="/proyecto">
              Proyecto
            </Anchor>
            <Text size="sm" color="dimmed">Políticas de Privacidad</Text>
          </Breadcrumbs>
        </Box>

        <Paper p={40} shadow="xs" radius="md">
          <Title order={1} size="h1" mb={30} c="#FF0048">
            Política de privacidad: chatbot informativo sobre VIH e infecciones de transmisión sexual (ITS)
          </Title>

          <Stack gap="xl">
            <Box>
              <Title order={2} size="h2" mb={20} c="#FF0048">
                Introducción
              </Title>
              
              <Text size="md" lh={1.6} mb="md">
                El Municipio de Comodoro Rivadavia, a través de este sitio web, asume el compromiso irrestricto con la protección de los datos personales y la privacidad de todas las personas que utilizan nuestros servicios informativos y de consulta en materia de Virus de Inmunodeficiencia Humana (VIH) e Infecciones de Transmisión Sexual (ITS). Esta política se encuentra en estricta conformidad con la Ley Nacional de Protección de Datos Personales N° 25.326, su Decreto Reglamentario 1558/2001, y la Ley Nacional de Respuesta Integral al VIH, Hepatitis Virales, otras Infecciones de Transmisión Sexual (ITS) y Tuberculosis (TBC) N° 27.675, así como las normativas provinciales y municipales aplicables en la provincia de Chubut y el municipio de Comodoro Rivadavia.
              </Text>

              <Text size="md" lh={1.6} mb="md">
                Entendemos la naturaleza sensible de la información relacionada con la salud y garantizamos el más alto nivel de confidencialidad y seguridad en el tratamiento de sus datos.
              </Text>

              <Text size="md" lh={1.6}>
                Para este sitio es muy importante la privacidad y la confidencialidad de quienes interactúan con chatbot. Esta política de privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos los datos proporcionados por los usuarios.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text size="md" lh={1.6} mb="md">
                <strong>1. Finalidad del chatbot:</strong> el chatbot tiene como objetivo brindar información educativa y orientación general sobre el VIH y otras ITS de manera anónima y confidencial.
              </Text>
              
              <Text size="md" lh={1.6}>
                No se trata de una herramienta de diagnóstico ni de atención médica. Si estas en una situación de urgencia, contacta con un profesional de salud o servicio de emergencia de la ciudad.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text size="md" lh={1.6} mb="md">
                <strong>2. Privacidad y anonimato:</strong>
              </Text>
              
              <List spacing="sm" size="md">
                <List.Item>el chatbot no recopila datos personales como nombres, direcciones, correos electrónicos, números de teléfonos ni identificadores técnicos (como direcciones IP)</List.Item>
                <List.Item>las conversaciones son anónimas y no se asocian a ninguna persona individual</List.Item>
                <List.Item>no se utiliza tecnología de rastreo (geolocalización)</List.Item>
              </List>
            </Box>

            <Divider />

            <Box>
              <Text size="md" lh={1.6} mb="md">
                <strong>3. Uso de la información:</strong> aunque el chatbot no recopila información identificable, puede procesar datos ingresados de forma anónima (como preguntas, síntomas, edad o género siempre y cuando el usuario lo mencione voluntariamente) con fines como:
              </Text>
              
              <List spacing="sm" size="md">
                <List.Item>Mejorar la calidad y precisión de las respuestas</List.Item>
                <List.Item>Analizar tendencias generales de uso para fines estadísticos o de salud pública, siempre en forma agregada y no identificable</List.Item>
              </List>
            </Box>

            <Divider />

            <Box>
              <Text size="md" lh={1.6}>
                <strong>4. Seguridad de la información:</strong> toda la comunicación con el chatbot está cifrada mediante protocolos seguros. Los registros de conversaciones, si se almacenan, son tratados de forma segura y sin posibilidad de vincularlos a usuarios individuales.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text size="md" lh={1.6}>
                <strong>5. No compartimos información:</strong> no compartimos, vendemos ni transmitimos información a terceros. En el caso de se utilice la información para investigación o mejora del servicio, será siempre de forma anónima.
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text size="md" lh={1.6}>
                <strong>6. Modificaciones a la Política de Privacidad:</strong> El Municipio de Comodoro Rivadavia se reserva el derecho de modificar esta Política de Privacidad para adaptarla a novedades legislativas o jurisprudenciales. Cualquier modificación será debidamente informada en este sitio web.
              </Text>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
