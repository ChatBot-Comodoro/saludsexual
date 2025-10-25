// Endpoint para inicializar la tabla de analytics
import { query } from '../../../config/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Initializing analytics table...');

    // Crear tabla si no existe
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS anonymous_visits (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        page_path VARCHAR(500) NOT NULL,
        page_title VARCHAR(500),
        referrer VARCHAR(500),
        device_type VARCHAR(50) DEFAULT 'desktop',
        browser_info TEXT,
        ip_address INET,
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await query(createTableQuery);
    console.log('Table created successfully');

    // Crear índices
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_anonymous_visits_session_id ON anonymous_visits (session_id)',
      'CREATE INDEX IF NOT EXISTS idx_anonymous_visits_timestamp ON anonymous_visits (timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_anonymous_visits_page_path ON anonymous_visits (page_path)',
      'CREATE INDEX IF NOT EXISTS idx_anonymous_visits_device_type ON anonymous_visits (device_type)'
    ];

    for (const indexQuery of indexes) {
      try {
        await query(indexQuery);
        console.log('Index created:', indexQuery);
      } catch (err) {
        console.log('Index might already exist:', err.message);
      }
    }

    // Verificar si hay datos
    const countResult = await query('SELECT COUNT(*) as count FROM anonymous_visits');
    const count = parseInt(countResult.rows[0].count);

    if (count === 0) {
      console.log('Inserting sample data...');
      
      // Insertar datos de ejemplo
      const sampleData = [];
      const pages = ['/', '/mapa', '/chat', '/embarazo', '/vih', '/hepatitis', '/prep'];
      const devices = ['desktop', 'mobile', 'tablet'];
      
      for (let i = 1; i <= 200; i++) {
        const randomPage = pages[Math.floor(Math.random() * pages.length)];
        const randomDevice = devices[Math.floor(Math.random() * devices.length)];
        const randomDaysAgo = Math.floor(Math.random() * 30);
        
        sampleData.push(`
          ('example-session-${i}', '${randomPage}', 'Página ${randomPage}', 'https://google.com', 
           '${randomDevice}', 'Mozilla/5.0', '127.0.0.1', 'Chrome Browser', 
           NOW() - INTERVAL '${randomDaysAgo} days' - INTERVAL '${Math.floor(Math.random() * 24)} hours')
        `);
      }

      const insertQuery = `
        INSERT INTO anonymous_visits 
        (session_id, page_path, page_title, referrer, device_type, browser_info, ip_address, user_agent, timestamp)
        VALUES ${sampleData.join(', ')}
      `;

      await query(insertQuery);
      console.log('Sample data inserted');
    }

    // Obtener estadísticas finales
    const finalCount = await query('SELECT COUNT(*) as count FROM anonymous_visits');
    
    res.status(200).json({
      success: true,
      message: 'Analytics table initialized successfully',
      totalRecords: finalCount.rows[0].count
    });

  } catch (error) {
    console.error('Error initializing analytics table:', error);
    res.status(500).json({
      error: 'Failed to initialize table',
      details: error.message
    });
  }
}