// API de prueba para diagnosticar problemas con artículos
import { query } from '@/config/db';

export default async function handler(req, res) {
  try {
    console.log('🔍 Iniciando diagnóstico de artículos...');
    
    // 1. Verificar que la tabla articles existe y tiene datos
    const articlesTest = await query('SELECT id, slug, title, status FROM articles LIMIT 5');
    console.log('📊 Artículos encontrados:', articlesTest.rows);
    
    // 2. Buscar específicamente el artículo de VIH
    const vihTest = await query('SELECT * FROM articles WHERE slug = $1', ['vih']);
    console.log('🔍 Artículo VIH encontrado:', vihTest.rows);
    
    // 3. Verificar si existe la función get_article_complete
    const functionTest = await query(`
      SELECT proname, proargtypes 
      FROM pg_proc 
      WHERE proname = 'get_article_complete'
    `);
    console.log('🔧 Función get_article_complete:', functionTest.rows);
    
    // 4. Si no existe la función, usar consulta directa
    let articleResult;
    if (functionTest.rows.length === 0) {
      console.log('⚠️ Función get_article_complete no existe, usando consulta directa');
      articleResult = await query('SELECT * FROM articles WHERE slug = $1 AND status = $2', ['vih', 'published']);
    } else {
      console.log('✅ Usando función get_article_complete');
      articleResult = await query('SELECT * FROM get_article_complete($1)', ['vih']);
    }
    
    console.log('📖 Resultado final del artículo:', articleResult.rows);
    
    // 5. Verificar secciones
    if (articleResult.rows.length > 0) {
      const sectionsTest = await query(`
        SELECT section_key, title, order_index 
        FROM article_sections 
        WHERE article_id = $1 
        ORDER BY order_index ASC
      `, [articleResult.rows[0].id]);
      console.log('📑 Secciones encontradas:', sectionsTest.rows);
    }
    
    res.status(200).json({
      success: true,
      articles_count: articlesTest.rows.length,
      vih_found: vihTest.rows.length > 0,
      function_exists: functionTest.rows.length > 0,
      article_data: articleResult.rows[0] || null,
      sections_count: articleResult.rows.length > 0 ? await query(`
        SELECT COUNT(*) as count 
        FROM article_sections 
        WHERE article_id = $1
      `, [articleResult.rows[0].id]).then(r => r.rows[0].count) : 0
    });
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}