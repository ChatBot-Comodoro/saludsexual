import {
  Container,
  Title,
  Text,
  Box,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import { IconHome, IconMap } from "@tabler/icons-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import LoadingScreen from "../components/LoadingScreen";

// Cargar el componente InteractiveMap solo en el cliente para evitar errores de SSR
const InteractiveMap = dynamic(() => import("../components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <LoadingScreen
      message="Cargando mapa de servicios..."
      showBackButton={false}
    />
  ),
});

export default function MapaPage() {
  const breadcrumbItems = [
    { title: "Inicio", href: "/" },
    { title: "Mapa de Servicios", href: "/mapa" },
  ].map((item, index) => (
    <Link href={item.href} key={index} passHref legacyBehavior>
      <Anchor size="sm">{item.title}</Anchor>
    </Link>
  ));

  return (
    <Container size="xl" py="lg" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Breadcrumbs */}
      <Box mb="xl">
        <Breadcrumbs mb="sm">{breadcrumbItems}</Breadcrumbs>

        <Title
          order={1}
          size="h1"
          fw={700}
          className="page-title"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <IconMap
            size={36}
            style={{ marginRight: "12px", verticalAlign: "middle" }}
          />
          Centros de Atención y Testeo
        </Title>

        <Text
          c="dimmed"
          size="lg"
          mt="sm"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          El municipio de Comodoro Rivadavia cuenta con 11 Centros de Atención Primaria de Salud (CAPS), el Trailer Móvil que recorre los diferentes barrios de la ciudad y la Sede Central, ubicada en Sarmiento 680. En cada uno de ellos podés encontrar asesoramiento sobre VIH y otras infecciones de transmisión sexual (ITS), entrega gratuita de preservativos y podés consultar donde realizar testeos rápidos. Acá podrás encontrar las direcciones y teléfonos.

        </Text>
      </Box>

      {/* Interactive Map Component */}
      <InteractiveMap />
    </Container>
  );
}
