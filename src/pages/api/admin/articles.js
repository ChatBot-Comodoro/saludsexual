// API para gestión de artículos por administrador
import { query } from '../../../config/db';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  // Usar getToken en lugar de getServerSession para obtener los campos personalizados
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || 'isur-secret-key-2024' 
  });

  // Debug del token
  console.log('🔍 Token JWT en articles API:', {
    hasToken: !!token,
    token: token
  });

  // Verificar autenticación y permisos de admin/moderador  
  const userId = token?.userId;
  const userRole = token?.role;
  
  if (!userId || (userRole !== 1 && userRole !== 2)) {
    console.log('❌ Token verificado en articles:', {
      hasToken: !!token,
      userId: userId,
      userRole: userRole,
      userName: token?.name
    });
    return res.status(401).json({
      success: false,
      message: 'No autorizado. Se requieren permisos de administrador.'
    });
  }

  console.log('✅ Token autorizado en articles:', {
    userId: userId,
    role: userRole,
    name: token?.name
  });

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await obtenerArticulos(req, res);
      case 'POST':
        return await crearArticulo(req, res, userId);
      case 'PUT':
        return await actualizarArticulo(req, res, userId);
      case 'DELETE':
        return await eliminarArticulo(req, res);
      default:
        return res.status(405).json({
          success: false,
          message: 'Método no permitido'
        });
    }
  } catch (error) {
    console.error('❌ Error en API de artículos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// GET - Obtener todos los artículos
async function obtenerArticulos(req, res) {
  try {
    const { slug, id } = req.query;

    if (slug) {
      // Obtener artículo específico por slug con secciones
      const result = await query('SELECT get_article_complete($1)', [slug]);
      const response = result.rows[0].get_article_complete;
      return res.status(200).json(response);
    } else if (id) {
      // Obtener artículo específico por ID con secciones
      const result = await query(`
        SELECT 
          a.id,
          a.slug,
          a.title,
          a.content,
          a.meta_description,
          a.meta_keywords,
          a.status,
          a.created_at,
          a.updated_at,
          (
            SELECT COUNT(*)::int 
            FROM article_sections s 
            WHERE s.article_id = a.id AND s.is_active = true
          ) as sections_count,
          (
            SELECT json_agg(
              json_build_object(
                'id', s.id,
                'section_key', s.section_key,
                'title', s.title,
                'content', s.content,
                'description', s.description,
                'order_index', s.order_index
              ) ORDER BY s.order_index
            )
            FROM article_sections s 
            WHERE s.article_id = a.id AND s.is_active = true
          ) as sections
        FROM articles a
        WHERE a.id = $1 AND a.status != 'archived'
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Artículo no encontrado'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } else {
      // Obtener lista completa de artículos
      const result = await query('SELECT get_all_articles()');
      const response = result.rows[0].get_all_articles;
      return res.status(200).json(response);
    }
  } catch (error) {
    console.error('❌ Error obteniendo artículos:', error);
    throw error;
  }
}

// POST - Crear nuevo artículo
async function crearArticulo(req, res, userId) {
  try {
    const {
      slug,
      title,
      meta_description,
      meta_keywords,
      content,
      status = 'published',
      sections = []
    } = req.body;

    // Validaciones básicas
    if (!slug || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Los campos slug, título y contenido son obligatorios'
      });
    }

    // Crear artículo principal
    const articleResult = await query(
      'SELECT upsert_article($1, $2, $3, $4, $5, $6, $7, $8)',
      [slug, title, content, userId, null, meta_description, meta_keywords, status]
    );

    const articleResponse = articleResult.rows[0].upsert_article;

    if (!articleResponse.success) {
      return res.status(400).json(articleResponse);
    }

    const articleId = articleResponse.data.id;

    // Crear secciones si existen
    if (sections && sections.length > 0) {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        await query(
          'SELECT upsert_article_section($1, $2, $3, $4, $5, $6, $7, $8)',
          [
            articleId, // p_article_id
            section.section_key, // p_section_key
            section.title, // p_title
            section.content, // p_content
            null, // p_section_id
            section.description, // p_description
            i, // p_order_index
            true // p_is_active
          ]
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Artículo creado exitosamente',
      data: { id: articleId }
    });

  } catch (error) {
    console.error('❌ Error creando artículo:', error);
    
    // Manejar error de slug duplicado
    if (error.code === '23505' && error.constraint === 'articles_slug_key') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un artículo con ese slug'
      });
    }
    
    throw error;
  }
}

// PUT - Actualizar artículo existente
async function actualizarArticulo(req, res, userId) {
  try {
    const {
      id,
      slug,
      title,
      meta_description,
      meta_keywords,
      content,
      status,
      sections = []
    } = req.body;

    if (!id || !slug || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Los campos id, slug, título y contenido son obligatorios'
      });
    }

    // Actualizar artículo principal
    const articleResult = await query(
      'SELECT upsert_article($1, $2, $3, $4, $5, $6, $7, $8)',
      [slug, title, content, userId, id, meta_description, meta_keywords, status]
    );

    const articleResponse = articleResult.rows[0].upsert_article;

    if (!articleResponse.success) {
      return res.status(400).json(articleResponse);
    }

    // Desactivar todas las secciones existentes
    await query(
      'UPDATE article_sections SET is_active = false WHERE article_id = $1',
      [id]
    );

    // Crear/actualizar secciones
    if (sections && sections.length > 0) {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        await query(
          'SELECT upsert_article_section($1, $2, $3, $4, $5, $6, $7, $8)',
          [
            id, // p_article_id
            section.section_key, // p_section_key
            section.title, // p_title
            section.content, // p_content
            section.id || null, // p_section_id
            section.description, // p_description
            i, // p_order_index
            true // p_is_active
          ]
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Artículo actualizado exitosamente',
      data: { id: id }
    });

  } catch (error) {
    console.error('❌ Error actualizando artículo:', error);
    throw error;
  }
}

// DELETE - Eliminar artículo (cambiar estado a archived)
async function eliminarArticulo(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID del artículo requerido'
      });
    }

    const result = await query(
      'UPDATE articles SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['archived', id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Artículo eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando artículo:', error);
    throw error;
  }
}