import {
  Container,
  Title,
  Text,
  Box,
  Stack,
  Button,
  Group,
  ThemeIcon,
  Stepper,
  Image,
} from "@mantine/core";
import {
  IconMessageCircle,
  IconClipboardCheck,
} from "@tabler/icons-react";
import Head from "next/head";
import { openFloatingChat, openFloatingChatWithTopic } from "@/utils/chatUtils";

export default function Chat() {
  return (
    <>
      <Head>
        <meta
          name="description"
          content="Chatbot especializado en salud del Municipio de Comodoro Rivadavia. Consultas anónimas y confidenciales las 24 horas."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Box ta="center">
            <Title order={1} size="2.5rem" mb="md" className="page-title">
              Chatbot Salud Comodoro
            </Title>
            <Text size="lg" c="dimmed" maw={900} mx="auto">
              Obtené información confiable sobre salud sexual con nuestro
              chatbot especializado. Está disponible las 24hs para ayudarte a
              recibir información de manera anónima y confidencial. Este chatbot
              es un asistente virtual que usa inteligencia artificial para
              responderte y no es una persona humana. Si quisieras recibir
              asesoramiento por parte del personal de salud consultá por un
              Centro de Atención .
            </Text>
            <Group justify="center" gap="md" mt={20}>
              <Button
                size="lg"
                variant="outline"
                leftSection={<IconMessageCircle size={20} />}
                onClick={openFloatingChat}
                radius="xl"
              >
                Chateá en la Web
              </Button>
              <Button
                size="lg"
                variant="filled"
                leftSection={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516z"/>
                  </svg>
                }
                radius="xl"
                component="a"
                href="https://wa.me/5492974000000?text=Hola,%20quiero%20consultar%20sobre%20salud%20sexual"
                target="_blank"
                style={{
                  backgroundColor: "#25D366",
                  "&:hover": {
                    backgroundColor: "#128C7E"
                  }
                }}
              >
                Chateá por WhatsApp
              </Button>
            </Group>

            <Text size="sm" c="dimmed" mt={10} variant="outline">
              Podés consultar sobre estos temas:
            </Text>

            {/* Topic Buttons */}
            <Group justify="center" gap="xs" mt="md">
              {[
                "Sífilis",
                "Anticonceptivos",
                "VIH",
                "Vacunación",
                "Hepatitis",
                "Gonorrea",
                "PrEP",
                "PEP",
              ].map((topic, index) => (
                <Button
                  key={index}
                  size="xs"
                  variant="default"
                  radius="xl"
                  onClick={() => {
                    // Abrir el chat flotante con tema específico
                    openFloatingChatWithTopic(topic);
                  }}
                  styles={{
                    root: {
                      fontSize: "11px",
                      fontWeight: 500,
                      height: "28px",
                      paddingLeft: "12px",
                      paddingRight: "12px",
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #faf9f9 100%)",
                      border: "1px solid #e9ecef",
                      color: "#495057",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)",
                        transform: "translateY(-1px)",
                      },
                    },
                  }}
                >
                  {topic}
                </Button>
              ))}
            </Group>
          </Box>

          {/* Chatbot Image */}
          <Box ta="center" my="xl">
            <Image
              src="/chatbot.png"
              alt="Chatbot Salud Comodoro"
              maw={800}
              mx="auto"
              radius="lg"
              style={{
                filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1))",
                transition: "transform 0.3s ease",
              }}
              sx={{
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            />
          </Box>

          {/* How it works */}
          <Box bg="white" p="xl" radius="md" ta="center">
            <Title order={3} ta="center" c="#FF0048" mb="xl">
              ¿Cómo usar el Chatbot Salud Comodoro?
            </Title>

            <Box 
              style={{ 
                display: "flex", 
                justifyContent: "center",
                width: "100%"
              }}
            >
              <Stepper
                active={0}
                orientation="vertical"
                color="#1B436B"
                styles={{
                  root: {
                    maxWidth: "600px",
                    width: "100%",
                  },
                  step: {
                    minHeight: "auto",
                    display: "flex",
                    alignItems: "center",
                    paddingBottom: "20px",
                  },
                  stepBody: {
                    marginLeft: "20px",
                    paddingBottom: "0px",
                    display: "flex",
                    alignItems: "center",
                    minHeight: "auto",
                  },
                  stepIcon: {
                    backgroundColor: "#1B436B",
                    borderColor: "#1B436B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    width: "32px",
                    height: "32px",
                    marginTop: "0px",
                    "&[data-completed]": {
                      backgroundColor: "#1B436B",
                      borderColor: "#1B436B",
                    },
                  },
                  stepLabel: {
                    display: "flex",
                    alignItems: "center",
                    lineHeight: "1.4",
                    margin: "0px",
                    padding: "0px",
                  },
                  separator: {
                    marginLeft: "16px",
                    marginRight: "0px",
                  },
                }}
              >
                <Stepper.Step
                  icon={
                    <Text size="sm" fw={700} c="white" style={{ lineHeight: "1", margin: "0" }}>
                      1
                    </Text>
                  }
                  completedIcon={
                    <Text size="sm" fw={700} c="white" style={{ lineHeight: "1", margin: "0" }}>
                      1
                    </Text>
                  }
                  label={
                    <Text fw={400} c="#0D0D0D" style={{ textAlign: "left", lineHeight: "1.4" }}>
                      Hacé clic en el botón de chat flotante en la esquina
                      inferior derecha.
                    </Text>
                  }
                />

                <Stepper.Step
                  icon={
                    <Text size="sm" fw={700} c="white" style={{ lineHeight: "1", margin: "0" }}>
                      2
                    </Text>
                  }
                  completedIcon={
                    <Text size="sm" fw={700} c="white" style={{ lineHeight: "1", margin: "0" }}>
                      2
                    </Text>
                  }
                  label={
                    <Text fw={400} c="#0D0D0D" style={{ textAlign: "left", lineHeight: "1.4" }}>
                      Escribí tu consulta o el tema que te interesa.
                    </Text>
                  }
                />

                <Stepper.Step
                  icon={
                    <Text size="sm" fw={700} c="white" style={{ lineHeight: "1", margin: "0" }}>
                      3
                    </Text>
                  }
                  completedIcon={
                    <Text size="sm" fw={700} c="white" style={{ lineHeight: "1", margin: "0" }}>
                      3
                    </Text>
                  }
                  label={
                    <Text fw={400} c="#0D0D0D" style={{ textAlign: "left", lineHeight: "1.4" }}>
                      Recibí información confiable inmediatamente.
                    </Text>
                  }
                />

                <Stepper.Step
                  icon={
                    <Text size="sm" fw={700} c="white" style={{ lineHeight: "1", margin: "0" }}>
                      4
                    </Text>
                  }
                  completedIcon={
                    <Text size="sm" fw={700} c="white" style={{ lineHeight: "1", margin: "0" }}>
                      4
                    </Text>
                  }
                  label={
                    <Text fw={400} c="#0D0D0D" style={{ textAlign: "left", lineHeight: "1.4" }}>
                      Consultá detalles y otros temas. Una vez finalizado el
                      chat, la conversación será eliminada.
                    </Text>
                  }
                />
              </Stepper>
            </Box>
          </Box>

          {/* Important notice */}
          <Box
            ta="center"
            p="lg"
            bg="white"
            maw={600}
            mx="auto"
            style={{
              border: "2px solid #868e96",
              borderRadius: "20px",
            }}
          >
            <Group justify="center" gap="sm" mb="md">
              <ThemeIcon size={40} radius="xl" color="#1B436B">
                <IconClipboardCheck size={24} />
              </ThemeIcon>
              <Text size="sm" fw={800} c="#1B436B">
                Recordatorio Importante
              </Text>
            </Group>
            <Text size="sm" c="#1B436B">
              El Chatbot Salud Comodoro proporciona información educativa y no
              constituye consejo médico profesional. En caso de emergencia o
              síntomas graves, busca atención médica inmediata.
            </Text>
          </Box>
        </Stack>
      </Container>
    </>
  );
}
