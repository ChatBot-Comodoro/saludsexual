// ====================================
// SERVICIO PARA MANEJAR CONVERSACIONES DE WHATSAPP
// Archivo: /api/whatsapp/conversations.js
// ====================================

import { query } from '../../../config/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Initializing WhatsApp conversations table...');

    // Crear tabla para conversaciones de WhatsApp si no existe
    const createConversationsTable = `
      CREATE TABLE IF NOT EXISTS whatsapp_conversations (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(20) NOT NULL,
        thread_id VARCHAR(255),
        user_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(phone_number)
      )
    `;

    await query(createConversationsTable);
    console.log('WhatsApp conversations table created successfully');

    // Crear tabla para mensajes de WhatsApp si no existe
    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES whatsapp_conversations(id),
        phone_number VARCHAR(20) NOT NULL,
        message_id VARCHAR(255),
        message_text TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        direction VARCHAR(10) NOT NULL, -- 'inbound' o 'outbound'
        thread_id VARCHAR(255),
        ai_response TEXT,
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      )
    `;

    await query(createMessagesTable);
    console.log('WhatsApp messages table created successfully');

    // Crear índices para optimizar consultas
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone ON whatsapp_conversations (phone_number)',
      'CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_thread ON whatsapp_conversations (thread_id)',
      'CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conversation ON whatsapp_messages (conversation_id)',
      'CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages (phone_number)',
      'CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages (timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_direction ON whatsapp_messages (direction)'
    ];

    for (const indexQuery of indexes) {
      try {
        await query(indexQuery);
        console.log('Index created:', indexQuery.split(' ')[5]);
      } catch (err) {
        console.log('Index might already exist:', err.message);
      }
    }

    // Verificar si hay datos
    const countConversations = await query('SELECT COUNT(*) as count FROM whatsapp_conversations');
    const countMessages = await query('SELECT COUNT(*) as count FROM whatsapp_messages');

    console.log('WhatsApp tables initialized successfully');
    
    res.status(200).json({
      success: true,
      message: 'WhatsApp tables initialized successfully',
      conversationsCount: countConversations.rows[0].count,
      messagesCount: countMessages.rows[0].count
    });

  } catch (error) {
    console.error('Error initializing WhatsApp tables:', error);
    res.status(500).json({
      error: 'Failed to initialize WhatsApp tables',
      details: error.message
    });
  }
}