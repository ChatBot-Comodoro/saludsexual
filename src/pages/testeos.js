import React from 'react';
import DynamicArticle from '../components/DynamicArticle';

export default function TesteosPage() {
  return (
    <DynamicArticle 
      slug="testeos"
      showMapButton={true}
      mapButtonText="Quiero testearme"
      breadcrumbText="Testeos"
    />
  );
}
