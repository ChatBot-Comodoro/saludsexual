import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { query } from '@/config/db';

// Configurar el transporter de Nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // o tu proveedor de email
    auth: {
      user: process.env.EMAIL_USER, // tu email
      pass: process.env.EMAIL_PASSWORD, // tu contraseña de app
    },
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email es requerido' });
  }

  try {
    // Verificar si el usuario existe (usando la misma normalización que tu función)
    const userResult = await query(
      'SELECT id, nombre, apellido, correo FROM usuarios WHERE LOWER(correo) = LOWER($1) AND estado = 1',
      [email.trim()]
    );

    if (userResult.rows.length === 0) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({ 
        message: 'Si el email existe, recibirás un enlace de recuperación' 
      });
    }

    const user = userResult.rows[0];

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    // Guardar el token en la base de datos
    await query(
      `UPDATE usuarios 
       SET reset_token = $1, reset_token_expires = $2 
       WHERE id = $3`,
      [resetToken, resetExpires, user.id]
    );

    // Configurar el transporter
    const transporter = createTransporter();

    // Configurar el email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.correo, // Usar el email normalizado de la base de datos
      subject: 'Recuperación de Contraseña - Chatbot Comodoro Salud',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1B436B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Chatbot Comodoro Salud</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #2c3e50;">Recuperación de Contraseña</h2>
            
            <p style="color: #6c757d; line-height: 1.6;">
              Hola ${user.nombre} ${user.apellido},
            </p>
            <p style="color: #6c757d; line-height: 1.6;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta de administrador. 
              Haz clic en el siguiente botón para crear una nueva contraseña:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}" 
                 style="background-color: #4A90E2; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            
            <p style="color: #6c757d; font-size: 14px;">
              Este enlace expirará en 1 hora por seguridad.
            </p>
            
            <p style="color: #6c757d; font-size: 14px;">
              Si no solicitaste este cambio, puedes ignorar este email.
            </p>
          </div>
          
          <div style="background-color: #e9ecef; padding: 20px; text-align: center;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Municipalidad de Comodoro Rivadavia
            </p>
          </div>
        </div>
      `,
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Email de recuperación enviado exitosamente' 
    });

  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
}