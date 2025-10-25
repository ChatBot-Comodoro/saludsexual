// Test script para verificar el formato de datos de la API
// Este archivo es solo para debugging y debe ser eliminado después

const testApiResponse = async () => {
  try {
    console.log('🔍 Testeando formato de respuesta de la API...');
    
    const response = await fetch('/api/admin/centros-salud?type=centros');
    const data = await response.json();
    
    if (response.ok && data.data) {
      console.log('📊 Datos de la API:', JSON.stringify(data.data[0], null, 2));
      
      // Verificar el formato de servicios específicamente
      if (data.data[0] && data.data[0].servicios) {
        console.log('🔧 Tipo de servicios:', typeof data.data[0].servicios);
        console.log('📋 Contenido de servicios:', data.data[0].servicios);
      }
    } else {
      console.error('❌ Error en la respuesta:', data);
    }
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
};

// Llamar esta función solo en desarrollo
if (typeof window !== 'undefined') {
  console.log('🧪 Debug script cargado. Llama testApiResponse() en la consola.');
  window.testApiResponse = testApiResponse;
}

export default testApiResponse;