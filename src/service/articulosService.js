import { query } from '../config/db.js';

// ======== FUNCIONES PARA ARTÍCULOS ========

// Función para obtener todos los artículos
export const getArticulos = async () => {
    try {
        const result = await query('SELECT * FROM get_articulos()');
        return result.rows;
    } catch (error) {
        console.error('❌ Error getting artículos:', error.message);
        throw error;
    }
};

// Función para obtener un artículo por ID
export const getArticuloById = async (id) => {
    try {
        console.log(`🔍 Obteniendo artículo con ID: ${id}`);
        const result = await query('SELECT * FROM get_articulo_by_id($1)', [id]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return result.rows[0];
    } catch (error) {
        console.error('❌ Error obteniendo artículo por ID:', error.message);
        throw error;
    }
};

// Función para crear un nuevo artículo
export const createArticulo = async (data) => {
    try {
        
        const result = await query(`
            SELECT create_articulo($1, $2, $3)
        `, [
            data.titulo,        // p_titulo
            data.html,          // p_html
            data.usuario        // p_usuario
        ]);
        
        const newId = result.rows[0].create_articulo;
        
        return newId;
    } catch (error) {
        console.error('❌ Error creating artículo:', error.message);
        console.error('📊 Detalles del error:', {
            data,
            errorCode: error.code,
            errorDetail: error.detail
        });
        throw error;
    }
};

// Función para actualizar un artículo
export const updateArticulo = async (id, data) => {
    try {
        
        const result = await query(`
            SELECT update_articulo($1, $2, $3, $4)
        `, [
            id,                 // p_id
            data.titulo,        // p_titulo
            data.html,          // p_html
            data.usuario        // p_usuario
        ]);
        
        const success = result.rows[0].update_articulo;
        return success;
    } catch (error) {
        console.error('❌ Error updating artículo:', error.message);
        console.error('📊 Detalles del error:', {
            id,
            data,
            errorCode: error.code,
            errorDetail: error.detail
        });
        throw error;
    }
};

// Función para eliminar un artículo
export const deleteArticulo = async (id) => {
    try {
        const result = await query('SELECT delete_articulo($1)', [id]);
        const success = result.rows[0].delete_articulo;
        return success;
    } catch (error) {
        console.error('❌ Error deleting artículo:', error.message);
        throw error;
    }
};