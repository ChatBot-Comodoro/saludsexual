import { updateCentroSalud, deleteCentroServicios, insertCentroServicio } from '../../../service/centrosSaludService.js';
import { getMapaCategorias, getMapaTipos } from '../../../service/metadataService.js';

// API route para administración de mapas/centros de salud
export default async function handler(req, res) {
  
  // Manejo de diferentes métodos HTTP
  switch (req.method) {
    
    case 'PUT':
      return await handleUpdate(req, res);
      
    case 'GET':
      return await handleGet(req, res);
      
    default:
      return res.status(405).json({ 
        message: 'Método no permitido',
        allowed: ['GET', 'PUT'] 
      });
  }
}

// Función para manejar actualizaciones (PUT)
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

    console.log('📝 Datos recibidos (tipos):', {
      id: typeof id,
      latitud: typeof latitud,
      longitud: typeof longitud,
      tipo: typeof tipo,
      categoria: typeof categoria
    });

    // Validaciones básicas
    if (!nombre || !direccion || !latitud || !longitud) {
      return res.status(400).json({
        message: 'Campos requeridos faltantes',
        required: ['id', 'nombre', 'direccion', 'latitud', 'longitud'],
        received: req.body
      });
    }

    // Validar tipos de datos (solo verificar que no estén vacíos)
    if (!latitud || !longitud || latitud.toString().trim() === '' || longitud.toString().trim() === '') {
      return res.status(400).json({
        message: 'Latitud y longitud no pueden estar vacíos',
        received: { latitud, longitud, tipos: { latitud: typeof latitud, longitud: typeof longitud } }
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

    console.log('📝 Datos después de conversión (tipos):', {
      latitud: typeof updateData.latitud,
      longitud: typeof updateData.longitud,
      tipo: typeof updateData.tipo,
      categoria: typeof updateData.categoria,
      valores: {
        latitud: updateData.latitud,
        longitud: updateData.longitud
      }
    });

    console.log('📝 Datos a actualizar:', { id: parseInt(id), ...updateData });

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
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database error'
    });
  }
}

// Función para manejar consultas GET (obtener catálogos)
async function handleGet(req, res) {
  try {
    const { type } = req.query;

    switch (type) {
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

      default:
        return res.status(400).json({
          message: 'Tipo de consulta no válido',
          available: ['categorias', 'tipos'],
          received: type
        });
    }

  } catch (error) {
    console.error('❌ Error en consulta GET:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database error'
    });
  }
}
