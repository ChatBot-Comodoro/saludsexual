import React from "react";
import DynamicArticle from "../components/DynamicArticle";

export default function VIHPage() {
  return (
    <DynamicArticle
      slug="vih"
      showMapButton={true}
      mapButtonText="¿Dónde puedo Testearme?"
      breadcrumbText="VIH"
    />
  );
}
