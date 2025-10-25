import { query } from '../config/db.js';

// ======== FUNCIONES PARA CENTROS DE SALUD ========

// Función específica para obtener centros de salud
export const getCentrosSalud = async () => {
    try {
        const result = await query('SELECT * FROM get_centros_salud()');
        return result.rows;
    } catch (error) {
        console.error('❌ Error getting centros de salud:', error.message);
        throw error;
    }
};

// Función para obtener un centro de salud específico por ID
export const getCentroSaludById = async (id) => {
    try {
        // Primero obtener todos los centros y filtrar por ID
        const result = await query('SELECT * FROM get_centros_salud()');
        
        const centro = result.rows.find(c => c.id === parseInt(id));
        
        if (centro) {
            // Obtener los IDs de servicios basándonos en los nombres
            if (centro.servicios && typeof centro.servicios === 'string') {
                const serviciosNombres = centro.servicios.split(', ');
                const serviciosIds = await getServiciosIdsByNames(serviciosNombres);
                centro.servicios_ids = serviciosIds;
            } else {
                centro.servicios_ids = [];
            }
        }
        
        return centro || null;
    } catch (error) {
        console.error('❌ Error obteniendo centro por ID:', error.message);
        throw error;
    }
};

// Función auxiliar para obtener IDs de servicios por nombres
const getServiciosIdsByNames = async (nombres) => {
    try {
        const serviciosResult = await query('SELECT * FROM get_servicios_unicos()');
        const servicios = serviciosResult.rows;
        
        const ids = [];
        nombres.forEach(nombre => {
            // Validar que nombre sea un string
            if (typeof nombre !== 'string') {
                return;
            }
            
            // Buscar por el campo 'tipo' no 'nombre'
            const servicio = servicios.find(s => s.tipo === nombre.trim());
            if (servicio) {
                ids.push(servicio.id);
            }
        });
        
        return ids;
    } catch (error) {
        console.error('❌ Error obteniendo IDs de servicios:', error.message);
        return [];
    }
};

// Función para crear un nuevo centro de salud
export const createCentroSalud = async (data) => {
    try {
        
        // Primero intentar con la función que incluye servicios (si existe)
        let result;
        try {
            // Intentar con función extendida que incluye servicios
            result = await query(`
                SELECT create_centro_salud_con_servicios($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
                data.nombre,                    // p_nombre
                data.direccion,                 // p_direccion
                data.latitud.toString(),        // p_latitud (como string)
                data.longitud.toString(),       // p_longitud (como string)
                data.telefono,                  // p_telefono
                data.dias_horas,                // p_dias_horas
                data.tipo_id,                   // p_tipo_id
                data.categoria_id,              // p_categoria_id
                data.descripcion,               // p_descripcion
                JSON.stringify(data.servicios_ids || []) // p_servicios_ids como JSON
            ]);
        } catch (error) {
            // Si no existe la función extendida, usar la básica
            result = await query(`
                SELECT create_centro_salud($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                data.nombre,                    // p_nombre
                data.direccion,                 // p_direccion
                data.latitud.toString(),        // p_latitud (como string)
                data.longitud.toString(),       // p_longitud (como string)
                data.telefono,                  // p_telefono
                data.dias_horas,                // p_dias_horas
                data.tipo_id,                   // p_tipo_id (corregido)
                data.categoria_id,              // p_categoria_id (corregido)
                data.descripcion                // p_descripcion
            ]);
        }
        
        const newId = result.rows[0].create_centro_salud || result.rows[0].create_centro_salud_con_servicios;
        
        // NO manejar servicios aquí - se manejarán desde la API
        // La función createCentroSalud solo debería crear el centro básico
        
        return newId;
    } catch (error) {
        console.error('❌ Error creating centro:', error.message);
        console.error('📊 Detalles del error:', {
            data,
            errorCode: error.code,
            errorDetail: error.detail
        });
        throw error;
    }
};

// Función para actualizar un centro de salud
export const updateCentroSalud = async (id, data) => {
    try {
        
        const result = await query(`
            SELECT update_centro_salud($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
            id,                    // p_id
            data.nombre,           // p_nombre
            data.direccion,        // p_direccion
            data.latitud,          // p_latitud
            data.longitud,         // p_longitud
            data.telefono,         // p_telefono
            data.dias_horas,       // p_dias_horas
            data.tipo_id,          // p_tipo_id (corregido)
            data.categoria_id,     // p_categoria_id (corregido)
            data.descripcion       // p_descripcion
        ]);
        
        const success = result.rows[0].update_centro_salud;
        return success;
    } catch (error) {
        console.error('❌ Error updating centro:', error.message);
        console.error('📊 Detalles del error:', {
            id,
            data,
            errorCode: error.code,
            errorDetail: error.detail
        });
        throw error;
    }
};

// Función para eliminar un centro de salud
export const deleteCentroSalud = async (id) => {
    try {
        const result = await query('SELECT delete_centro_salud($1)', [id]);
        const success = result.rows[0].delete_centro_salud;
        return success;
    } catch (error) {
        console.error('❌ Error deleting centro:', error.message);
        throw error;
    }
};

// Función para eliminar servicios de un centro
export const deleteCentroServicios = async (mapaId) => {
    try {
        const result = await query('SELECT delete_centro_servicios($1)', [mapaId]);
        const success = result.rows[0].delete_centro_servicios;
        return success;
    } catch (error) {
        console.error('❌ Error deleting servicios:', error.message);
        throw error;
    }
};

// Función para insertar un servicio a un centro
export const insertCentroServicio = async (mapaId, servicioId) => {
    try {
        const result = await query('SELECT insert_centro_servicio($1, $2)', [mapaId, servicioId]);
        const success = result.rows[0].insert_centro_servicio;
        return success;
    } catch (error) {
        console.error('❌ Error inserting servicio:', error.message);
        throw error;
    } 
};

// Alias para compatibilidad con código existente
export const getCentroById = getCentroSaludById;