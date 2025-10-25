import { 
  getCentrosSalud,
  createCentroSalud, 
  updateCentroSalud, 
  deleteCentroSalud,
  deleteCentroServicios, 
  insertCentroServicio
} from '../../../service/centrosSaludService.js';
import { 
  getMapaCategorias, 
  getMapaTipos,
  getServiciosUnicos
} from '../../../service/metadataService.js';

// API route completo para administración de centros de salud
export default async function handler(req, res) {
  
  // Manejo de diferentes métodos HTTP
  switch (req.method) {
    
    case 'GET':
      return await handleGet(req, res);
      
    case 'POST':
      return await handleCreate(req, res);
    
    case 'PUT':
      return await handleUpdate(req, res);
      
    case 'DELETE':
      return await handleDelete(req, res);
      
    default:
      return res.status(405).json({ 
        message: 'Método no permitido',
        allowed: ['GET', 'POST', 'PUT', 'DELETE'] 
      });
  }
}

// ==================== GET - Obtener datos ====================
async function handleGet(req, res) {
  try {
    const { type, id } = req.query;

    switch (type) {
      case 'centros':
        const centros = await getCentrosSalud();
        return res.status(200).json({
          message: 'Centros obtenidos exitosamente',
          data: centros,
          total: centros.length
        });

      case 'categorias':
        const categorias = await getMapaCategorias();
        return res.status(200).json({
          message: 'Categorías obtenidas exitosamente',
          data: categorias
        });

      case 'tipos':
        const tipos = await getMapaTipos();
        return res.status(200).json({
          message: 'Tipos obtenidos exitosamente',
          data: tipos
        });

      case 'servicios':
        const servicios = await getServiciosUnicos();
        return res.status(200).json({
          message: 'Servicios obtenidos exitosamente',
          data: servicios
        });

      case 'centro':
        if (!id) {
          return res.status(400).json({
            message: 'ID del centro es requerido para consulta individual'
          });
        }
        const allCentros = await getCentrosSalud();
        const centro = allCentros.find(c => c.id === parseInt(id));
        
        if (!centro) {
          return res.status(404).json({
            message: 'Centro no encontrado',
            id: parseInt(id)
          });
        }
        
        return res.status(200).json({
          message: 'Centro obtenido exitosamente',
          data: centro
        });

      default:
        return res.status(400).json({
          message: 'Tipo de consulta no válido',
          available: ['centros', 'categorias', 'tipos', 'servicios', 'centro'],
          received: type
        });
    }

  } catch (error) {
    console.error('❌ Error en consulta GET:', error);
    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
}

// ==================== POST - Crear nuevo centro ====================
async function handleCreate(req, res) {
  try {
    const {
      nombre,
      direccion,
      latitud,
      longitud,
      telefono,
      dias_horas,
      tipo,
      categoria,
      descripcion,
      servicios
    } = req.body;

    console.log('📝 Datos recibidos para crear:', req.body);

    // Validaciones básicas
    if (!nombre || !direccion || !latitud || !longitud || !tipo || !categoria) {
      return res.status(400).json({
        message: 'Campos requeridos faltantes',
        required: ['nombre', 'direccion', 'latitud', 'longitud', 'tipo', 'categoria'],
        received: req.body
      });
    }

    // Validar tipos de datos
    if (!latitud || !longitud || latitud.toString().trim() === '' || longitud.toString().trim() === '') {
      return res.status(400).json({
        message: 'Latitud y longitud no pueden estar vacíos',
        received: { latitud, longitud }
      });
    }

    if (isNaN(parseInt(tipo)) || isNaN(parseInt(categoria))) {
      return res.status(400).json({
        message: 'Tipo y categoría deben ser IDs válidos',
        received: { tipo, categoria }
      });
    }

    // Preparar datos para la creación
    const createData = {
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      latitud: latitud.toString().trim(),
      longitud: longitud.toString().trim(),
      telefono: telefono ? telefono.trim() : null,
      dias_horas: dias_horas ? dias_horas.trim() : null,
      tipo: parseInt(tipo),
      categoria: parseInt(categoria),
      descripcion: descripcion ? descripcion.trim() : null
    };

    console.log('📝 Datos preparados para crear:', createData);

    // Crear el centro
    const newId = await createCentroSalud(createData);

    if (newId) {
      // Si se creó exitosamente, proceder con los servicios
      let serviciosCreated = true;
      let serviciosLog = [];

      if (servicios && Array.isArray(servicios) && servicios.length > 0) {
        console.log('🔄 Agregando servicios al nuevo centro...');
        
        for (const servicioId of servicios) {
          try {
            const insertSuccess = await insertCentroServicio(newId, parseInt(servicioId));
            if (insertSuccess) {
              serviciosLog.push({ servicioId: parseInt(servicioId), status: 'success' });
              console.log(`✅ Servicio ${servicioId} agregado correctamente`);
            } else {
              serviciosLog.push({ servicioId: parseInt(servicioId), status: 'failed' });
              console.log(`❌ Fallo al agregar servicio ${servicioId}`);
              serviciosCreated = false;
            }
          } catch (serviceError) {
            serviciosLog.push({ servicioId: parseInt(servicioId), status: 'error', error: serviceError.message });
            console.error(`❌ Error agregando servicio ${servicioId}:`, serviceError.message);
            serviciosCreated = false;
          }
        }
      }

      return res.status(201).json({
        message: serviciosCreated ? 'Centro y servicios creados exitosamente' : 'Centro creado, pero hubo problemas con los servicios',
        id: newId,
        data: createData,
        servicios: {
          created: serviciosCreated,
          log: serviciosLog,
          total: servicios ? servicios.length : 0
        }
      });
    } else {
      return res.status(500).json({
        message: 'Error al crear el centro'
      });
    }

  } catch (error) {
    console.error('❌ Error en creación de centro:', error);
    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
}

// ==================== PUT - Actualizar centro ====================
async function handleUpdate(req, res) {
  try {
    const {
      id,
      nombre,
      direccion,
      latitud,
      longitud,
      telefono,
      dias_horas,
      tipo,
      categoria,
      descripcion,
      servicios
    } = req.body;

    // Validar que se proporcione el ID
    if (!id) {
      return res.status(400).json({ 
        message: 'ID del centro es requerido',
        error: 'Missing id in body'
      });
    }

    console.log('📝 Datos recibidos para actualizar:', { id, ...req.body });

    // Validaciones básicas
    if (!nombre || !direccion || !latitud || !longitud) {
      return res.status(400).json({
        message: 'Campos requeridos faltantes',
        required: ['id', 'nombre', 'direccion', 'latitud', 'longitud'],
        received: req.body
      });
    }

    // Validar tipos de datos
    if (!latitud || !longitud || latitud.toString().trim() === '' || longitud.toString().trim() === '') {
      return res.status(400).json({
        message: 'Latitud y longitud no pueden estar vacíos',
        received: { latitud, longitud }
      });
    }

    if (isNaN(parseInt(tipo)) || isNaN(parseInt(categoria))) {
      return res.status(400).json({
        message: 'Tipo y categoría deben ser IDs válidos',
        received: { tipo, categoria }
      });
    }

    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'ID debe ser un número válido',
        received: { id }
      });
    }

    // Preparar datos para la actualización
    const updateData = {
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      latitud: latitud.toString().trim(),
      longitud: longitud.toString().trim(),
      telefono: telefono ? telefono.trim() : null,
      dias_horas: dias_horas ? dias_horas.trim() : null,
      tipo: parseInt(tipo),
      categoria: parseInt(categoria),
      descripcion: descripcion ? descripcion.trim() : null
    };

    console.log('📝 Datos preparados para actualizar:', { id: parseInt(id), ...updateData });

    // Ejecutar la actualización
    const success = await updateCentroSalud(parseInt(id), updateData);

    if (success) {
      // Si la actualización del centro fue exitosa, proceder con los servicios
      let serviciosUpdated = true;
      let serviciosLog = [];

      if (servicios && Array.isArray(servicios)) {
        console.log('🔄 Iniciando actualización de servicios...');
        console.log('📋 Servicios a procesar:', servicios);

        // 1. Eliminar todos los servicios existentes del centro
        console.log('🗑️ Eliminando servicios existentes...');
        const deleteSuccess = await deleteCentroServicios(parseInt(id));
        
        if (deleteSuccess) {
          console.log('✅ Servicios existentes eliminados');
          
          // 2. Insertar los nuevos servicios uno por uno
          console.log('➕ Insertando nuevos servicios...');
          for (const servicioId of servicios) {
            try {
              const insertSuccess = await insertCentroServicio(parseInt(id), parseInt(servicioId));
              if (insertSuccess) {
                serviciosLog.push({ servicioId: parseInt(servicioId), status: 'success' });
                console.log(`✅ Servicio ${servicioId} insertado correctamente`);
              } else {
                serviciosLog.push({ servicioId: parseInt(servicioId), status: 'failed', error: 'Insert returned false' });
                console.log(`❌ Fallo al insertar servicio ${servicioId}`);
                serviciosUpdated = false;
              }
            } catch (serviceError) {
              serviciosLog.push({ servicioId: parseInt(servicioId), status: 'error', error: serviceError.message });
              console.error(`❌ Error insertando servicio ${servicioId}:`, serviceError.message);
              serviciosUpdated = false;
            }
          }
        } else {
          console.log('❌ Fallo al eliminar servicios existentes');
          serviciosUpdated = false;
        }
      } else {
        console.log('ℹ️ No se proporcionaron servicios para actualizar');
      }

      return res.status(200).json({
        message: serviciosUpdated ? 'Centro y servicios actualizados exitosamente' : 'Centro actualizado, pero hubo problemas con los servicios',
        id: parseInt(id),
        data: updateData,
        servicios: {
          updated: serviciosUpdated,
          log: serviciosLog,
          total: servicios ? servicios.length : 0
        }
      });
    } else {
      return res.status(404).json({
        message: 'Centro no encontrado o no se pudo actualizar',
        id: parseInt(id)
      });
    }

  } catch (error) {
    console.error('❌ Error en actualización de centro:', error);
    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
}

// ==================== DELETE - Eliminar centro ====================
async function handleDelete(req, res) {
  try {
    // Obtener ID tanto de query como de body para mayor flexibilidad
    const idFromQuery = req.query.id;
    const idFromBody = req.body?.id;
    const id = idFromQuery || idFromBody;

    console.log('🔍 DEBUGGING - Eliminación:', {
      idFromQuery,
      idFromBody,
      selectedId: id,
      queryParams: req.query,
      bodyParams: req.body
    });

    // Validar que se proporcione el ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        message: 'ID del centro es requerido y debe ser un número válido',
        received: { 
          queryId: idFromQuery, 
          bodyId: idFromBody,
          selectedId: id 
        }
      });
    }

    console.log(`🗑️ Solicitud de eliminación para centro ID: ${id}`);

    // Primero eliminar servicios asociados
    console.log('🗑️ Eliminando servicios asociados...');
    const serviciosDeleted = await deleteCentroServicios(parseInt(id));
    
    if (serviciosDeleted) {
      console.log('✅ Servicios eliminados correctamente');
    } else {
      console.log('⚠️ No se encontraron servicios asociados o ya fueron eliminados');
    }

    // Luego eliminar el centro
    console.log('🗑️ Eliminando centro...');
    const success = await deleteCentroSalud(parseInt(id));

    if (success) {
      return res.status(200).json({
        message: 'Centro eliminado exitosamente',
        id: parseInt(id),
        serviciosDeleted: serviciosDeleted
      });
    } else {
      return res.status(404).json({
        message: 'Centro no encontrado o no se pudo eliminar',
        id: parseInt(id)
      });
    }

  } catch (error) {
    console.error('❌ Error en eliminación de centro:', error);
    return res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
}