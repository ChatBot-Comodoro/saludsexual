// ====================================
// API ENDPOINT PARA ENVIAR MENSAJES DE WHATSAPP
// Archivo: /api/whatsapp/send-message.js
// ====================================

import { WhatsAppService } from '../../../services/whatsappService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Both "to" and "message" are required'
      });
    }

    console.log('Enviando mensaje de WhatsApp:', { to, message: message.substring(0, 100) + '...' });

    // Enviar mensaje usando el servicio
    const result = await WhatsAppService.sendMessage(to, message);

    // Guardar mensaje en la base de datos
    await WhatsAppService.saveMessage(
      to,
      message,
      'outbound',
      result.messages?.[0]?.id,
      {
        whatsapp_message_id: result.messages?.[0]?.id,
        admin_sent: true,
        api_response: result
      }
    );

    console.log('Mensaje enviado y guardado correctamente');

    res.status(200).json({
      success: true,
      data: result,
      message: 'Mensaje enviado correctamente'
    });

  } catch (error) {
    console.error('Error enviando mensaje de WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: 'Error enviando mensaje',
      details: error.message
    });
  }
}