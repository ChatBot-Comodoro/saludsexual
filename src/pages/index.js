import {
  Container,
  Grid,
  Loader,
  Title,
  Text,
  Box,
  Stack,
  Button,
  Group,
  Card,
  SimpleGrid,
  ThemeIcon,
  ActionIcon,
} from "@mantine/core";
import {
  IconHeartHandshake,
  IconMessageCircle,
  IconQuestionMark,
  IconPhone,
  IconChevronLeft,
  IconChevronRight,
  IconMap,
} from "@tabler/icons-react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import {
  HivIcon,
  VacunaIcon,
  TestIcon,
  LaboratorioIcon,
  PreservativoIcon,
  VirusIcon,
  BalanzaIcon,
  EmbarazoIcon,
  ApoyoIcon,
  MapaIcon,
  HospitalPinIcon,
  PrevencionCombinadaIcon,
} from "../components/icons";
// Importar el mapa compacto dinámicamente para evitar problemas de SSR
const CompactMap = dynamic(
  () => import("@/components/InteractiveMap/CompactMap"),
  {
    ssr: false,
    loading: () => (
      <Box
        h={400}
        bg="gray.1"
        radius="md"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack align="center" ta="center">
          <Loader size="lg" />
          <Text size="lg" fw={500} c="gray.6">
            Cargando mapa...
          </Text>
        </Stack>
      </Box>
    ),
  }
);

const features = [
  {
    icon: HivIcon,
    title: "VIH",
    description: "Prevención, diagnóstico y tratamiento del VIH",
    color: "violet",
    href: "/vih",
  },
  {
    icon: VirusIcon,
    title: "ITS",
    description:
      "Infecciones de transmisión sexual: sífilis, gonorrea, clamidia, HPV",
    color: "red",
    href: "/its",
  },
  {
    icon: HospitalPinIcon,
    title: "Centros de Atención y Testeo",
    description:
      "Centros de atención y testeos en Comodoro Rivadavia",
    color: "red",
    href: "/mapa",
  },
  {
    icon: BalanzaIcon,
    title: "Conocé tus derechos",
    description: "Derechos y marco legal en salud sexual y reproductiva",
    color: "blue",
    href: "/conoce-tus-derechos",
  },
  {
    icon: PrevencionCombinadaIcon,
    title: "Prevención combinada",
    description: "Prevención combinada: estrategias y métodos",
    color: "blue",
    href: "/prevencion-combinada",
  },
  {
    icon: VacunaIcon,
    title: "Vacunación",
    description: "Vacunación específica",
    color: "green",
    href: "/vacunacion",
  },
  {
    icon: TestIcon,
    title: "Testeos",
    description: "Tests rápidos y dónde realizarlos",
    color: "orange",
    href: "/testeos",
  },
  {
    icon: EmbarazoIcon,
    title: "Embarazo y lactancia",
    description: "Cuidados, controles y prevención durante el embarazo",
    color: "purple",
    href: "/embarazo-lactancia",
  },
  {
    icon: ApoyoIcon,
    title: "Si tenés VIH, te acompañamos",
    description: "Información útil para personas con VIH - No estás sol@",
    color: "teal",
    href: "/apoyo-vih",
  },
  {
    icon: PreservativoIcon,
    title: "Preservativos",
    description: "Uso correcto, tipos y consejos para una protección efectiva",
    color: "indigo",
    href: "/preservativos",
  },
];

export default function Home() {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <>
      <Head>
        <title>Comodoro Salud - Asistente Virtual de Salud</title>
        <meta
          name="description"
          content="Asistente Virtual de Salud del Municipio de Comodoro Rivadavia. Información sobre salud, VIH, ITS, anticonceptivos, embarazo y más."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Container size="md" py="sm">
        <Stack gap="md">
          {/* Hero Section with Banner */}
          <Box ta="center" pt={0} pb="sm">
            <Box
              mb="sm"
              style={{
                width: "100%",
                maxWidth: "1200px",
                margin: "0 auto",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Image
                src="/banner_index.png"
                alt="Banner Salud Comodoro"
                width={800}
                height={400}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  maxHeight: "400px",
                  objectFit: "cover",
                }}
                priority
              />
            </Box>

            <Title
              order={1}
              size="2.5rem"
              mb="md"
              mt={30}
              className="page-title"
            >
              ¿Queres sacarte todas tus dudas?
            </Title>
            <Text size="lg" c="dimmed" maw={600} mx="auto" mb="xl" mt={10}>
              Chateá con nuestro chatbot de forma anónima y confidencial.
              Encontrá información confiable sobre temas de salud sexual.
            </Text>
            <Group justify="center" gap="md">
              <Button
                component={Link}
                href="/chat"
                size="lg"
                variant="outline"
                leftSection={<IconMessageCircle size={20} />}
                radius="xl"
              >
                Conocé más sobre el chat
              </Button>
              {/*  <Text size="sm" c="dimmed">
              comenzá a chatear con el botón flotante 💬 en la esquina inferior derecha
            </Text> */}
            </Group>
              <Group justify="center" gap="md" pt={10}>
            <Button
              component={Link}
              href="/mapa"
              size="lg"
              variant="outline"
              leftSection={<IconMap size={20} />}
              radius="xl"
            >
              Quiero testearme
            </Button>
          </Group>
          
          </Box>

          {/* Topics Section */}
          <Box>
            <Title order={2} ta="center" mb="xl">
              Explorá información sobre distintos temas
            </Title>

            {/* Indicador para móviles */}
            <Text size="sm" c="dimmed" ta="center" mb="md" hiddenFrom="sm">
              👆 Desliza horizontalmente para ver más temas
            </Text>

            {/* Carrusel Container */}
            <Box pos="relative">
              {/* Botón Izquierdo */}
              <ActionIcon
                variant="filled"
                size="lg"
                radius="xl"
                color="pink"
                pos="absolute"
                left={-10}
                top="50%"
                style={{
                  transform: "translateY(-50%)",
                  zIndex: 10,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
                onClick={scrollLeft}
                visibleFrom="sm"
              >
                <IconChevronLeft size={20} />
              </ActionIcon>

              {/* Área de desplazamiento */}
              <div
                ref={scrollRef}
                style={{
                  display: "flex",
                  gap: "16px",
                  overflowX: "auto",
                  overflowY: "hidden",
                  padding: "0 40px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
                className="carousel-container"
              >
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    component={Link}
                    href={feature.href}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      textDecoration: "none",
                      color: "inherit",
                      minWidth: "200px",
                      maxWidth: "200px",
                      flexShrink: 0,
                    }}
                    className="hover-card"
                  >
                    <Stack align="center" ta="center" gap="sm">
                      <ThemeIcon
                        size={90}
                        radius="50%"
                        variant="filled"
                        style={{ backgroundColor: "#FFF2F6" }}
                      >
                        <feature.icon size={64} />
                      </ThemeIcon>
                      <Title order={4} size="1.1rem">
                        {feature.title}
                      </Title>
                      <Text size="sm" c="dimmed">
                        {feature.description}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </div>

              {/* Botón Derecho */}
              <ActionIcon
                variant="filled"
                size="lg"
                radius="xl"
                color="pink"
                pos="absolute"
                right={-10}
                top="50%"
                style={{
                  transform: "translateY(-50%)",
                  zIndex: 10,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
                onClick={scrollRight}
                visibleFrom="sm"
              >
                <IconChevronRight size={20} />
              </ActionIcon>
            </Box>
          </Box>

        
        </Stack>

        <style jsx>{`
          .hover-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }

          /* Estilos para el carrusel */
          .carousel-container {
            scroll-behavior: smooth;
          }

          /* Ocultar scrollbar en webkit browsers */
          .carousel-container::-webkit-scrollbar {
            display: none;
          }

          /* Ocultar scrollbar en Firefox */
          .carousel-container {
            scrollbar-width: none;
          }

          /* Ocultar scrollbar en IE/Edge */
          .carousel-container {
            -ms-overflow-style: none;
          }
        `}</style>
      </Container>
    </>
  );
}
