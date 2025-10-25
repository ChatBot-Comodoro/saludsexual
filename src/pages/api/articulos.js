import { getArticulos, createArticulo } from '../../service/articulosService.js';

// API route para CRUD de artículos
export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ 
          success: false, 
          message: 'Método no permitido' 
        });
    }
  } catch (error) {
    console.error('❌ Error en handler de artículos:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
}

// Manejo de GET - Obtener todos los artículos
async function handleGet(req, res) {
  try {

    
    const articulos = await getArticulos();
    
    return res.status(200).json({
      success: true,
      message: 'Artículos obtenidos exitosamente',
      data: articulos,
      total: articulos.length
    });
  } catch (error) {
    console.error('❌ Error en GET artículos:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los artículos'
    });
  }
}

// Manejo de POST - Crear nuevo artículo
async function handlePost(req, res) {
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
    
    // Crear el artículo
    const newId = await createArticulo({
      titulo: titulo.trim(),
      html,
      usuario: parseInt(usuario)
    });
    
    return res.status(201).json({
      success: true,
      message: 'Artículo creado exitosamente',
      data: { id: newId }
    });
    
  } catch (error) {
    console.error('❌ Error en POST artículo:', error.message);
    
    // Manejar diferentes tipos de errores
    if (error.message.includes('Datos incompletos')) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos o inválidos'
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
      message: 'Error al crear el artículo'
    });
  }
}