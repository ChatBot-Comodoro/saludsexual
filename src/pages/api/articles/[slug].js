// API pública para obtener artículos (sin autenticación)
import { query } from '@/config/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Slug del artículo requerido'
      });
    }

    // Obtener artículo completo con secciones
    const result = await query('SELECT get_article_complete($1)', [slug]);
    const response = result.rows[0].get_article_complete;

    if (!response.success) {
      return res.status(404).json(response);
    }

    // Añadir headers para cache
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=1800');
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error obteniendo artículo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}