import { query } from '../config/db.js';

// ======== FUNCIONES PARA METADATOS ========

// Función para obtener categorías
export const getMapaCategorias = async () => {
    try {
        const result = await query('SELECT * FROM get_mapa_categorias()');
        return result.rows;
    } catch (error) {
        console.error('❌ Error getting categorías:', error.message);
        throw error;
    }
};

// Función para obtener tipos
export const getMapaTipos = async () => {
    try {
        const result = await query('SELECT * FROM get_mapa_tipos()');
        return result.rows;
    } catch (error) {
        console.error('❌ Error getting tipos:', error.message);
        throw error;
    }
};

// Función para obtener servicios únicos
export const getServiciosUnicos = async () => {
    try {
        const result = await query('SELECT * FROM get_servicios_unicos()');
        return result.rows;
    } catch (error) {
        console.error('❌ Error getting servicios únicos:', error.message);
        throw error;
    }
};

// Función para obtener metadatos (tipos, categorías, servicios)
export const getCentroMetadata = async () => {
    try {
        const result = await query('SELECT * FROM get_centro_metadata()');
        return result.rows[0];
    } catch (error) {
        console.error('❌ Error getting metadata:', error.message);
        throw error;
    }
};

// Alias para funciones existentes con nombres más descriptivos
export const getCategorias = getMapaCategorias;
export const getTipos = getMapaTipos;
export const getServicios = getServiciosUnicos;