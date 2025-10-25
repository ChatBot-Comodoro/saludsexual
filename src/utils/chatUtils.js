// Utilidades para el chat
export const openFloatingChat = () => {
  // Limpiar cualquier tema previo
  sessionStorage.removeItem('chatTopic');
  // Disparar evento personalizado para abrir el chat flotante
  const event = new CustomEvent('openFloatingChat');
  window.dispatchEvent(event);
};

export const openFloatingChatWithTopic = (topic) => {
  // Guardar el tema en sessionStorage para que el chat lo pueda leer
  const botMessage = `Veo que te interesa el tema de ${topic}, ¿qué te gustaría saber específicamente?`;
  sessionStorage.setItem('chatTopic', topic);
  sessionStorage.setItem('chatBotMessage', botMessage);
  
  // Disparar evento personalizado para abrir el chat flotante
  const event = new CustomEvent('openFloatingChat', {
    detail: {
      hasTopic: true,
      topic: topic,
      botMessage: botMessage
    }
  });
  window.dispatchEvent(event);
};
