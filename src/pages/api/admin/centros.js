import { getCentroById, updateCentroSalud, createCentroSalud, deleteCentroSalud } from '../../../service/centrosSaludService.js';
import { getCentroMetadata } from '../../../service/metadataService.js';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (id) {
          // Obtener un centro específico
          const centro = await getCentroById(parseInt(id));
          if (!centro) {
            return res.status(404).json({ success: false, message: 'Centro no encontrado' });
          }
          res.status(200).json({ success: true, data: centro });
        } else {
          // Obtener metadatos (tipos, categorías, servicios)
          const metadata = await getCentroMetadata();
          res.status(200).json({ success: true, data: metadata });
        }
        break;

      case 'PUT':
        if (!id) {
          return res.status(400).json({ success: false, message: 'ID requerido para actualizar' });
        }
        
        // Validar datos requeridos
        const { name, address, phone, hours, lat, lng, description, categoria, servicios, tipo_id, categoria_id } = req.body;
        
        if (!name || !address || !lat || !lng) {
          return res.status(400).json({ 
            success: false, 
            message: 'Campos requeridos: name, address, lat, lng' 
          });
        }

        const updateSuccess = await updateCentroSalud(parseInt(id), {
          name,
          address,
          phone: phone || '',
          hours: hours || '',
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          description: description || '',
          categoria: categoria || '',
          servicios: servicios || [],
          tipo_id: tipo_id || null,
          categoria_id: categoria_id || null
        });

        if (updateSuccess) {
          res.status(200).json({ success: true, message: 'Centro actualizado exitosamente' });
        } else {
          res.status(400).json({ success: false, message: 'No se pudo actualizar el centro' });
        }
        break;

      case 'POST':
        // Crear nuevo centro
        const newCentroData = req.body;
        
        if (!newCentroData.name || !newCentroData.address || !newCentroData.lat || !newCentroData.lng) {
          return res.status(400).json({ 
            success: false, 
            message: 'Campos requeridos: name, address, lat, lng' 
          });
        }

        const newId = await createCentroSalud({
          name: newCentroData.name,
          address: newCentroData.address,
          phone: newCentroData.phone || '',
          hours: newCentroData.hours || '',
          lat: parseFloat(newCentroData.lat),
          lng: parseFloat(newCentroData.lng),
          description: newCentroData.description || '',
          categoria: newCentroData.categoria || '',
          servicios: newCentroData.servicios || [],
          tipo_id: newCentroData.tipo_id || null,
          categoria_id: newCentroData.categoria_id || null
        });

        res.status(201).json({ 
          success: true, 
          message: 'Centro creado exitosamente', 
          data: { id: newId } 
        });
        break;

      case 'DELETE':
        if (!id) {
          return res.status(400).json({ success: false, message: 'ID requerido para eliminar' });
        }

        const deleteSuccess = await deleteCentroSalud(parseInt(id));
        
        if (deleteSuccess) {
          res.status(200).json({ success: true, message: 'Centro eliminado exitosamente' });
        } else {
          res.status(400).json({ success: false, message: 'No se pudo eliminar el centro' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST', 'DELETE']);
        res.status(405).json({ success: false, message: `Método ${method} no permitido` });
    }
  } catch (error) {
    console.error('❌ Error en API admin/centros:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}
