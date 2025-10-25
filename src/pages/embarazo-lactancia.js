import React from 'react';
import DynamicArticle from '../components/DynamicArticle';

export default function EmbarazoLactanciaPage() {
  return (
    <DynamicArticle 
      slug="embarazo-lactancia"
      showMapButton={true}   
      mapButtonText="¿Dónde puedo testearme?"
      breadcrumbText="Embarazo y Lactancia"
    />
  );
}
