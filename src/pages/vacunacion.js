import React from 'react';
import DynamicArticle from '../components/DynamicArticle';

export default function VacunacionPage() {
  return (
    <DynamicArticle 
      slug="vacunacion"
      showMapButton={true}   
      mapButtonText="¿Dónde puedo vacunarme?"
      breadcrumbText="Vacunación y Prevención"
    />
  );
}