import { Pool } from 'pg';

// Configuración del pool de conexiones de PostgreSQL (se conecta solo cuando es necesario)
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    // Configuraciones para conexiones bajo demanda
    max: 20, // máximo número de conexiones en el pool
    idleTimeoutMillis: 30000, // cerrar conexiones inactivas después de 30 segundos
    connectionTimeoutMillis: 10000, // tiempo de espera para obtener conexión (10 segundos)
    acquireTimeoutMillis: 60000, // tiempo máximo para obtener una conexión del pool
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Configuraciones adicionales para mejorar la estabilidad
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
});

// Función para ejecutar queries de forma segura (se conecta automáticamente)
const query = async (text, params) => {
    let client;
    try {
        client = await pool.connect();
        
        const start = Date.now();
        const res = await client.query(text, params);
        const duration = Date.now() - start;
        return res;
    } catch (error) {
        console.error('❌ Error en query:', {
            message: error.message,
            code: error.code,
            severity: error.severity,
            detail: error.detail
        });
        
        // Si es error de conexión, intentar reconectar
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.message.includes('Connection terminated')) {
            throw new Error('Database connection timeout. Please try again.');
        }
        
        throw error;
    } finally {
        // Liberar la conexión de vuelta al pool solo si existe
        if (client) {
            client.release();
        }
    }
};

// Test de conexión opcional (solo para verificar que la DB esté disponible)
const testConnection = async () => {
    try {
        const result = await query('SELECT NOW() as current_time');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión a PostgreSQL:', error.message);
        return false;
    }
};

// Cerrar todas las conexiones del pool cuando la aplicación se cierre
const closePool = async () => {
    try {
        await pool.end();
    } catch (error) {
        console.error('❌ Error cerrando pool:', error.message);
    }
};

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closePool();
    process.exit(0);
});

export {
    pool,
    pool as default,
    query,
    testConnection,
    closePool
};