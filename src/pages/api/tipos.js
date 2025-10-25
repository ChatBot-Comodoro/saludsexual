import { getTipos } from '../../service/metadataService.js';

// API route para obtener tipos
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const tipos = await getTipos();
    res.status(200).json(tipos);
  } catch (error) {
    console.error('Error en API tipos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor'
    });
  }
}