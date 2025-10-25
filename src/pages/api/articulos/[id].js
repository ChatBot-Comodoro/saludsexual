import { getArticuloById, updateArticulo, deleteArticulo } from '../../../service/articulosService.js';

// API route para CRUD de un artículo específico por ID
export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  // Validar que el ID sea un número
  const articuloId = parseInt(id);
  if (isNaN(articuloId)) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID de artículo inválido' 
    });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res, articuloId);
      case 'PUT':
        return await handlePut(req, res, articuloId);
      case 'DELETE':
        return await handleDelete(req, res, articuloId);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ 
          success: false, 
          message: 'Método no permitido' 
        });
    }
  } catch (error) {
    console.error('❌ Error en handler de artículo por ID:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
}

// Manejo de GET - Obtener artículo por ID
async function handleGet(req, res, id) {
  try {

    
    const articulo = await getArticuloById(id);
    
    if (!articulo) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Artículo obtenido exitosamente',
      data: articulo
    });
  } catch (error) {
    console.error('❌ Error en GET artículo por ID:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el artículo'
    });
  }
}

// Manejo de PUT - Actualizar artículo
async function handlePut(req, res, id) {
  try {

    
    const { titulo, html, usuario } = req.body;
    
    // Validaciones básicas
    if (!titulo || titulo.trim() === '') {

      return res.status(400).json({
        success: false,
        message: 'El título es obligatorio'
      });
    }
    
    if (!html || html.trim() === '') {

      return res.status(400).json({
        success: false,
        message: 'El contenido HTML es obligatorio'
      });
    }
    
    if (!usuario) {

      return res.status(400).json({
        success: false,
        message: 'El usuario es obligatorio'
      });
    }
    
    // Actualizar el artículo

    const success = await updateArticulo(id, {
      titulo: titulo.trim(),
      html,
      usuario: parseInt(usuario)
    });
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado o no se pudo actualizar'
      });
    }
    

    return res.status(200).json({
      success: true,
      message: 'Artículo actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error en PUT artículo:', error.message);
    
    // Manejar diferentes tipos de errores
    if (error.message.includes('Datos incompletos')) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos o inválidos'
      });
    }
    
    if (error.message.includes('Recurso no encontrado')) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }
    
    if (error.message.includes('Usuario no válido')) {
      return res.status(400).json({
        success: false,
        message: 'Usuario no válido'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el artículo'
    });
  }
}

// Manejo de DELETE - Eliminar artículo
async function handleDelete(req, res, id) {
  try {

    
    const success = await deleteArticulo(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado o no se pudo eliminar'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Artículo eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error en DELETE artículo:', error.message);
    
    if (error.message.includes('Recurso no encontrado')) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el artículo'
    });
  }
}