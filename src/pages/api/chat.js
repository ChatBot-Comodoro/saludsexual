import openai from '@/config/openai';

// Función para limpiar referencias de fuentes de OpenAI
function cleanSourceReferences(text) {
  if (!text) return text;
  
  let cleaned = text;
  
  // Patrones de referencias más comunes:
  // 【14:0†source】, 【1†source】, 【2:1†source】
  cleaned = cleaned.replace(/【[^】]*†[^】]*】/g, '');
  
  // Patrones con corchetes normales: [14:0†source], [1†source]
  cleaned = cleaned.replace(/\[[^\]]*†[^\]]*\]/g, '');
  
  // Patrones más generales con símbolos especiales
  cleaned = cleaned.replace(/【[^】]*】/g, '');
  cleaned = cleaned.replace(/\[[^\]]*†[^\]]*\]/g, '');
  
  // Limpiar espacios múltiples y saltos de línea extra
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.trim();
  
  return cleaned;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo se permite POST' });
  }

  try {
    const { message, threadId } = req.body;
    
    console.log('📨 Mensaje recibido:', message);
    console.log('🔗 Thread ID:', threadId);

    const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
    
    if (!ASSISTANT_ID) {
      throw new Error('OPENAI_ASSISTANT_ID no está configurado');
    }

    let currentThreadId = threadId;

    // Crear thread si no existe
    if (!currentThreadId) {
      console.log('🆕 Creando nuevo thread...');
      const thread = await openai.beta.threads.create();
      currentThreadId = thread.id;
      console.log('✅ Thread creado:', currentThreadId);
    }

    // Agregar mensaje del usuario al thread
    console.log('✍️ Agregando mensaje al thread...');
    await openai.beta.threads.messages.create(currentThreadId, {
      role: 'user',
      content: message,
    });

    // Crear y ejecutar run con polling automático
    console.log('▶️ Creando run...');
    const run = await openai.beta.threads.runs.createAndPoll(currentThreadId, {
      assistant_id: ASSISTANT_ID,
    });

    console.log('🔄 Run completado con estado:', run.status);

    if (run.status === 'completed') {
      // Obtener los mensajes del thread
      const messages = await openai.beta.threads.messages.list(currentThreadId);
      
      // Encontrar la respuesta del asistente
      const assistantMessage = messages.data.find(
        msg => msg.role === 'assistant' && msg.run_id === run.id
      );

      if (assistantMessage && assistantMessage.content[0]) {
        const originalResponse = assistantMessage.content[0].text.value;
        const response = cleanSourceReferences(originalResponse);
        
        // Log para debugging si se encontraron referencias
        if (originalResponse !== response) {
          console.log('🧹 Referencias de fuentes eliminadas');
          console.log('📝 Diferencia de caracteres:', originalResponse.length - response.length);
        }
        
        console.log('✅ Respuesta obtenida y limpiada');
        
        return res.status(200).json({
          response,
          threadId: currentThreadId,
        });
      }
    }

    throw new Error(`Run falló con estado: ${run.status}`);

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
