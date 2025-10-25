// ====================================
// HELPER SERVICE PARA CONVERSACIONES DE WHATSAPP
// Archivo: /src/services/whatsappService.js
// ====================================

import { query } from '../config/db';
import openai from '../config/openai';

// Función para limpiar referencias de fuentes de OpenAI
function cleanSourceReferences(text) {
  if (!text) return text;
  
  let cleaned = text;
  
  // Patrones de referencias más comunes
  cleaned = cleaned.replace(/【[^】]*†[^】]*】/g, '');
  cleaned = cleaned.replace(/\[[^\]]*†[^\]]*\]/g, '');
  cleaned = cleaned.replace(/【[^】]*】/g, '');
  cleaned = cleaned.replace(/\[[^\]]*†[^\]]*\]/g, '');
  
  // Limpiar espacios múltiples y saltos de línea extra
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.trim();
  
  return cleaned;
}

export class WhatsAppService {
  
  // Obtener o crear conversación
  static async getOrCreateConversation(phoneNumber, userName = null) {
    try {
      // Buscar conversación existente
      let conversationQuery = 'SELECT * FROM whatsapp_conversations WHERE phone_number = $1';
      let result = await query(conversationQuery, [phoneNumber]);

      if (result.rows.length > 0) {
        // Actualizar timestamp de la conversación existente
        await query(
          'UPDATE whatsapp_conversations SET updated_at = CURRENT_TIMESTAMP WHERE phone_number = $1',
          [phoneNumber]
        );
        return result.rows[0];
      } else {
        // Crear nueva conversación
        const createQuery = `
          INSERT INTO whatsapp_conversations (phone_number, user_name, is_active)
          VALUES ($1, $2, true)
          RETURNING *
        `;
        result = await query(createQuery, [phoneNumber, userName]);
        return result.rows[0];
      }
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      throw error;
    }
  }

  // Obtener thread ID existente o crear uno nuevo
  static async getOrCreateThread(phoneNumber) {
    try {
      const conversation = await this.getOrCreateConversation(phoneNumber);
      
      if (conversation.thread_id) {
        console.log('✅ Thread existente encontrado:', conversation.thread_id);
        return conversation.thread_id;
      }

      // Crear nuevo thread
      console.log('🆕 Creando nuevo thread para WhatsApp...');
      const thread = await openai.beta.threads.create();
      const threadId = thread.id;

      // Actualizar conversación con el thread ID
      await query(
        'UPDATE whatsapp_conversations SET thread_id = $1, updated_at = CURRENT_TIMESTAMP WHERE phone_number = $2',
        [threadId, phoneNumber]
      );

      console.log('✅ Thread creado y guardado:', threadId);
      return threadId;
    } catch (error) {
      console.error('Error getting or creating thread:', error);
      throw error;
    }
  }

  // Guardar mensaje en la base de datos
  static async saveMessage(phoneNumber, messageText, direction, messageId = null, metadata = null) {
    try {
      const conversation = await this.getOrCreateConversation(phoneNumber);
      
      const saveQuery = `
        INSERT INTO whatsapp_messages (
          conversation_id, phone_number, message_id, message_text, 
          direction, thread_id, metadata, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
        RETURNING *
      `;

      const result = await query(saveQuery, [
        conversation.id,
        phoneNumber,
        messageId,
        messageText,
        direction,
        conversation.thread_id,
        metadata ? JSON.stringify(metadata) : null
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  // Actualizar estado del mensaje
  static async updateMessageStatus(messageId, status, aiResponse = null) {
    try {
      const updateQuery = `
        UPDATE whatsapp_messages 
        SET status = $1, ai_response = $2, timestamp = CURRENT_TIMESTAMP
        WHERE message_id = $3
        RETURNING *
      `;

      const result = await query(updateQuery, [status, aiResponse, messageId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  }

  // Procesar mensaje con OpenAI
  static async processWithAI(messageText, phoneNumber) {
    try {
      console.log('🤖 Procesando mensaje con IA:', { messageText, phoneNumber });

      const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
      
      if (!ASSISTANT_ID) {
        throw new Error('OPENAI_ASSISTANT_ID no está configurado');
      }

      // Obtener o crear thread para esta conversación
      const threadId = await this.getOrCreateThread(phoneNumber);

      // Agregar mensaje del usuario al thread
      console.log('✍️ Agregando mensaje al thread...');
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: `Mensaje de WhatsApp desde ${phoneNumber}: ${messageText}`,
      });

      // Crear y ejecutar run con polling automático
      console.log('▶️ Creando run...');
      const run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: ASSISTANT_ID,
      });

      console.log('🔄 Run completado con estado:', run.status);

      if (run.status === 'completed') {
        // Obtener los mensajes del thread
        const messages = await openai.beta.threads.messages.list(threadId);
        
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
          
          console.log('✅ Respuesta obtenida y limpiada para WhatsApp');
          
          return response;
        }
      }

      throw new Error(`Run falló con estado: ${run.status}`);

    } catch (error) {
      console.error('❌ Error procesando mensaje con IA:', error);
      throw error;
    }
  }

  // Enviar mensaje por WhatsApp
  static async sendMessage(to, message) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: {
              body: message
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API Error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('✅ Mensaje enviado por WhatsApp:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error enviando mensaje de WhatsApp:', error);
      throw error;
    }
  }

  // Obtener historial de conversación
  static async getConversationHistory(phoneNumber, limit = 50) {
    try {
      const historyQuery = `
        SELECT wm.*, wc.user_name, wc.created_at as conversation_started
        FROM whatsapp_messages wm
        JOIN whatsapp_conversations wc ON wm.conversation_id = wc.id
        WHERE wm.phone_number = $1
        ORDER BY wm.timestamp DESC
        LIMIT $2
      `;

      const result = await query(historyQuery, [phoneNumber, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error;
    }
  }

  // Obtener estadísticas de WhatsApp
  static async getWhatsAppStats(days = 30) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT wc.phone_number) as total_users,
          COUNT(wm.id) as total_messages,
          COUNT(CASE WHEN wm.direction = 'inbound' THEN 1 END) as inbound_messages,
          COUNT(CASE WHEN wm.direction = 'outbound' THEN 1 END) as outbound_messages,
          COUNT(CASE WHEN wm.status = 'delivered' THEN 1 END) as delivered_messages,
          COUNT(CASE WHEN wm.status = 'read' THEN 1 END) as read_messages,
          AVG(CASE WHEN wm.direction = 'inbound' THEN LENGTH(wm.message_text) END) as avg_message_length
        FROM whatsapp_conversations wc
        LEFT JOIN whatsapp_messages wm ON wc.id = wm.conversation_id
        WHERE wc.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      `;

      const result = await query(statsQuery);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting WhatsApp stats:', error);
      throw error;
    }
  }
}