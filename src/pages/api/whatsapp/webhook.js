// ====================================
// WEBHOOK ENDPOINT PARA WHATSAPP BUSINESS API
// Archivo: /api/whatsapp/webhook.js
// ====================================

import crypto from 'crypto';
import { WhatsAppService } from '../../../services/whatsappService';

// Función para verificar la signature del webhook
function verifyWebhookSignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WHATSAPP_WEBHOOK_SECRET || '')
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

// No necesitamos estas funciones porque ahora usamos WhatsAppService

export default async function handler(req, res) {
  console.log('📲 WhatsApp Webhook llamado:', {
    method: req.method,
    query: req.query,
    headers: Object.keys(req.headers)
  });

  // GET request para verificación del webhook
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('🔐 Verificación de webhook:', { mode, token, challenge });

    // Verificar que el token coincide con el configurado
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ Webhook verificado correctamente');
      return res.status(200).send(challenge);
    } else {
      console.log('❌ Token de verificación incorrecto');
      return res.status(403).send('Forbidden');
    }
  }

  // POST request para recibir mensajes
  if (req.method === 'POST') {
    try {
      // Verificar la signature del webhook
      const signature = req.headers['x-hub-signature-256'];
      const payload = JSON.stringify(req.body);
      
      if (!verifyWebhookSignature(payload, signature)) {
        console.log('❌ Signature del webhook inválida');
        return res.status(403).json({ error: 'Invalid signature' });
      }

      const body = req.body;
      console.log('📥 Payload recibido:', JSON.stringify(body, null, 2));

      // Verificar que es un mensaje de WhatsApp
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              const value = change.value;
              
              // Procesar mensajes recibidos
              if (value.messages) {
                for (const message of value.messages) {
                  console.log('💬 Procesando mensaje:', {
                    id: message.id,
                    from: message.from,
                    type: message.type,
                    timestamp: message.timestamp
                  });

                  // Solo procesar mensajes de texto por ahora
                  if (message.type === 'text') {
                    try {
                      const userMessage = message.text.body;
                      const fromNumber = message.from;
                      const userName = value.contacts?.[0]?.profile?.name;
                      
                      console.log(`📝 Mensaje de texto de ${fromNumber}: ${userMessage}`);

                      // Guardar mensaje entrante
                      await WhatsAppService.saveMessage(
                        fromNumber, 
                        userMessage, 
                        'inbound', 
                        message.id,
                        {
                          userName,
                          timestamp: message.timestamp,
                          whatsapp_message_id: message.id
                        }
                      );

                      // Procesar con OpenAI usando el servicio
                      const aiResponse = await WhatsAppService.processWithAI(userMessage, fromNumber);
                      
                      // Enviar respuesta por WhatsApp
                      const sendResult = await WhatsAppService.sendMessage(fromNumber, aiResponse);
                      
                      // Guardar mensaje saliente
                      await WhatsAppService.saveMessage(
                        fromNumber,
                        aiResponse,
                        'outbound',
                        sendResult.messages?.[0]?.id,
                        {
                          whatsapp_message_id: sendResult.messages?.[0]?.id,
                          ai_processed: true
                        }
                      );
                      
                      console.log('✅ Conversación procesada y guardada');

                    } catch (error) {
                      console.error('❌ Error procesando mensaje:', error);
                      
                      // Enviar mensaje de error genérico
                      try {
                        await WhatsAppService.sendMessage(
                          message.from, 
                          'Lo siento, hubo un error procesando tu mensaje. Por favor intenta nuevamente.'
                        );
                      } catch (sendError) {
                        console.error('❌ Error enviando mensaje de error:', sendError);
                      }
                    }
                  } else {
                    console.log(`ℹ️ Tipo de mensaje no soportado: ${message.type}`);
                    
                    // Responder que solo aceptamos texto
                    try {
                      await WhatsAppService.sendMessage(
                        message.from,
                        'Hola! Actualmente solo puedo procesar mensajes de texto. Por favor envíame tu consulta como texto y te ayudaré.'
                      );
                    } catch (error) {
                      console.error('❌ Error enviando mensaje de tipo no soportado:', error);
                    }
                  }
                }
              }

              // Procesar estados de mensaje (opcional)
              if (value.statuses) {
                for (const status of value.statuses) {
                  console.log('📊 Estado de mensaje:', {
                    id: status.id,
                    status: status.status,
                    recipient_id: status.recipient_id,
                    timestamp: status.timestamp
                  });
                }
              }
            }
          }
        }
      }

      // Responder siempre con 200 para confirmar recepción
      return res.status(200).json({ status: 'ok' });

    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Método no soportado
  return res.status(405).json({ error: 'Method not allowed' });
}