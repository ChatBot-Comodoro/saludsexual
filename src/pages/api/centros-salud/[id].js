import { getCentroSaludById, updateCentroSalud, deleteCentroSalud, deleteCentroServicios, insertCentroServicio } from '../../../service/centrosSaludService.js';

// API route para CRUD de un centro de salud específico
export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  // Validar que el ID sea válido
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'ID de centro inválido' });
  }

  const centroId = parseInt(id);

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res, centroId);
      
      case 'PUT':
        return await handlePut(req, res, centroId);
        
      case 'DELETE':
        return await handleDelete(req, res, centroId);
        
      default:
        return res.status(405).json({ message: 'Método no permitido' });
    }
  } catch (error) {
    console.error(`Error en API centros-salud/${id}:`, error);
    res.status(500).json({ 
      message: 'Error interno del servidor'
    });
  }
}

// Manejar GET - Obtener centro específico por ID
async function handleGet(req, res, centroId) {
  console.log(`🔍 API: Obteniendo centro con ID: ${centroId}`);
  
  const centro = await getCentroSaludById(centroId);
  
  if (!centro) {
    console.log(`❌ Centro con ID ${centroId} no encontrado`);
    return res.status(404).json({ message: 'Centro de salud no encontrado' });
  }

  // Formatear los datos para el formulario de edición
  const centroFormatted = {
    id: centro.id,
    nombre: centro.nombre,
    direccion: centro.direccion,
    telefono: centro.telefono,
    descripcion: centro.descripcion,
    dias_horas: centro.dias_horas,
    latitud: centro.latitud || centro.latitude || '0',
    longitud: centro.longitud || centro.longitude || '0',
    categoria_id: centro.categoria_id,
    tipo_id: centro.tipo_id,
    servicios_ids: Array.isArray(centro.servicios_ids) ? centro.servicios_ids.map(id => id?.toString()).filter(Boolean) : [],
    fecha_graba: centro.fecha_graba,
    // También incluir datos para mostrar nombres
    tipo: centro.tipo_nombre || centro.tipo,
    categoria: centro.categoria_nombre || centro.categoria,
    servicios: centro.servicios ? centro.servicios.split(', ') : [],
    color: centro.color
  };

  console.log(`✅ Centro formateado - ID: ${centroFormatted.id}, categoria_id: ${centroFormatted.categoria_id}, tipo_id: ${centroFormatted.tipo_id}, servicios_ids: [${centroFormatted.servicios_ids.join(', ')}]`);

  res.status(200).json(centroFormatted);
}

// Manejar PUT - Actualizar centro específico
async function handlePut(req, res, centroId) {
  const {
    nombre,
    direccion,
    telefono,
    descripcion,
    dias_horas,
    latitud,
    longitud,
    categoria_id,
    tipo_id,
    servicios_ids
  } = req.body;

  console.log('🔍 Datos recibidos para actualizar:', {
    nombre,
    direccion,
    telefono,
    latitud,
    longitud,
    categoria_id,
    tipo_id,
    servicios_ids
  });

  // Validaciones estrictas - campos obligatorios
  const errores = [];
  
  if (!nombre || nombre.trim() === '') {
    errores.push('El nombre es requerido');
  }
  
  if (!direccion || direccion.trim() === '') {
    errores.push('La dirección es requerida');
  }
  
  if (!telefono || telefono.trim() === '') {
    errores.push('El teléfono es requerido');
  }
  
  if (!latitud || isNaN(parseFloat(latitud))) {
    errores.push('La latitud es requerida y debe ser un número válido');
  }
  
  if (!longitud || isNaN(parseFloat(longitud))) {
    errores.push('La longitud es requerida y debe ser un número válido');
  }
  
  if (!categoria_id || isNaN(parseInt(categoria_id))) {
    errores.push('La categoría es requerida');
  }
  
  if (!tipo_id || isNaN(parseInt(tipo_id))) {
    errores.push('El tipo es requerido');
  }
  
  if (!servicios_ids || !Array.isArray(servicios_ids) || servicios_ids.length === 0) {
    errores.push('Debe seleccionar al menos un servicio');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      message: 'Errores de validación:',
      errores: errores
    });
  }

  // Verificar que el centro existe
  const centroExistente = await getCentroSaludById(centroId);
  if (!centroExistente) {
    return res.status(404).json({ message: 'Centro de salud no encontrado' });
  }

  console.log('🔧 Iniciando actualización completa del centro...');

  // Actualizar datos básicos del centro
  const centroActualizado = await updateCentroSalud(centroId, {
    nombre: nombre.trim(),
    direccion: direccion.trim(),
    telefono: telefono.trim(),
    descripcion: descripcion ? descripcion.trim() : null,
    dias_horas: dias_horas ? dias_horas.trim() : null,
    latitud: latitud.toString(), // Mantener como string para preservar precisión
    longitud: longitud.toString(), // Mantener como string para preservar precisión
    categoria_id: parseInt(categoria_id),
    tipo_id: parseInt(tipo_id),
    servicios_ids: servicios_ids
  });

  console.log('✅ Datos básicos actualizados, ahora actualizando servicios...');

  // Actualizar servicios del centro
  try {
    // Primero eliminar servicios existentes (funciones ya importadas al inicio)
    await deleteCentroServicios(centroId);
    console.log('🗑️ Servicios existentes eliminados');

    // Insertar nuevos servicios
    if (servicios_ids && Array.isArray(servicios_ids) && servicios_ids.length > 0) {
      for (const servicioId of servicios_ids) {
        await insertCentroServicio(centroId, parseInt(servicioId));
      }
      console.log(`✅ ${servicios_ids.length} servicios insertados`);
    }
  } catch (serviciosError) {
    console.error('❌ Error actualizando servicios:', serviciosError);
    // Continuar aunque falle la actualización de servicios
  }

  res.status(200).json({
    message: 'Centro de salud actualizado exitosamente',
    centro: centroActualizado
  });
}

// Manejar DELETE - Eliminar centro específico
async function handleDelete(req, res, centroId) {
  // Verificar que el centro existe
  const centroExistente = await getCentroSaludById(centroId);
  if (!centroExistente) {
    return res.status(404).json({ message: 'Centro de salud no encontrado' });
  }

  await deleteCentroSalud(centroId);

  res.status(200).json({
    message: 'Centro de salud eliminado exitosamente'
  });
}