import { Container, Title, Text, Box, Stack, Card, Group, ThemeIcon, Button, SimpleGrid } from '@mantine/core';
import { IconPhone, IconMail, IconMapPin, IconClock, IconAlertTriangle } from '@tabler/icons-react';

const contactInfo = [
  
  {
    icon: IconPhone,
    title: "Línea de Consultas",
    content: "+54 297 446 1153",
    description: "Lunes a Viernes, 8:00 - 20:00",
    color: "blue"
  },
  {
    icon: IconMail,
    title: "Email",
    content: "salud@comodoro.gov.ar",
    description: "Respuesta en 24-48 horas",
    color: "green"
  }
];

export default function Contactos() {
  return (
    <Container style={{ minHeight: "70vh" }} size="lg" py="xl">
      <Stack gap="xl">
        <Box ta="center">
          <Title order={1} size="h1" mb="md" className="page-title">
            Contacto
          </Title>
          <Text size="lg" c="dimmed" maw={1000} mx="auto">
            Si no pudiste resolver tus dudas con nuestro chatbot, recordá que podes ubicar el centro de salud más próximo en el mapa. Si necesitas comunicarte con personal de salud a través de teléfono o email utilizá los siguientes canales.
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {contactInfo.map((contact, index) => (
            <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <ThemeIcon size="xl" radius="md" variant="light" color={contact.color}>
                  <contact.icon size={28} />
                </ThemeIcon>
                <Box>
                  <Title order={4}>{contact.title}</Title>
                  <Text fw={600} size="lg" c={contact.color}>
                    {contact.content}
                  </Text>
                </Box>
              </Group>
              <Text size="sm" c="dimmed">
                {contact.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Card shadow="sm" padding="xl" radius="md" withBorder bg="red.0">
          <Group>
            <ThemeIcon size="xl" radius="md" color="red">
              <IconAlertTriangle size={32} />
            </ThemeIcon>
            <Box flex={1}>
              <Title order={3} c="red">Emergencias Médicas</Title>
              <Text size="sm" mb="md">
                Si estás experimentando una emergencia médica, no uses este sitio web. 
                Llama inmediatamente al 911 o dirígete al centro de emergencias más cercano.
              </Text>
              <Button color="red" size="lg">
                Llamar 911
              </Button>
            </Box>
          </Group>
        </Card>

       
      </Stack>
    </Container>
  );
}
