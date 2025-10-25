import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';
import pool from '@/config/db';

export default NextAuth({
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'isur-secret-key-2024',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        correo: { label: 'Correo', type: 'email' },
        contrasena: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contrasena) {
          throw new Error('Credenciales incompletas');
        }

        try {
          console.log('🔐 Autenticando usuario:', credentials.correo);
          
          // SEGURIDAD: Las contraseñas llegan ya hasheadas desde el frontend
          // Buscar usuario directamente con contraseña hasheada
          const result = await pool.query(
            `SELECT id, nombre, apellido, correo, rol, estado 
             FROM usuarios 
             WHERE LOWER(correo) = LOWER($1) AND contraseña = $2 AND estado = 1`,
            [credentials.correo.trim(), credentials.contrasena] // contrasena ya viene hasheada
          );

          if (result.rows.length === 0) {
            console.log('❌ Credenciales inválidas para:', credentials.correo);
            throw new Error('Credenciales inválidas');
          }

          const usuario = result.rows[0];
          console.log('✅ Usuario encontrado:', usuario.correo, 'Rol:', usuario.rol);

          // Verificar que el usuario esté activo (estado = 1 significa activo)
          if (usuario.estado != 1) {
            console.log('❌ Usuario inactivo:', usuario.correo);
            throw new Error('Usuario inactivo');
          }

          // Verificar que sea admin (rol = 1) o moderador (rol = 2)
          if (usuario.rol != 1 && usuario.rol != 2) {
            console.log('❌ Permisos insuficientes. Rol:', usuario.rol);
            throw new Error('No tienes permisos para acceder');
          }

          const userResult = {
            id: usuario.id.toString(),
            name: `${usuario.nombre} ${usuario.apellido}`,
            email: usuario.correo,
            role: usuario.rol,
            roleName: usuario.rol === 1 ? 'admin' : 'moderator'
          };

          console.log('✅ Login exitoso para:', userResult.name);
          return userResult;
        } catch (error) {
          console.error('❌ Error en autenticación:', error);
          throw new Error(error.message || 'Error de autenticación');
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
    // Agregar página de callback personalizada
    // signOut: '/login'
  },
  callbacks: {
    async redirect({ url, baseUrl }) {

      
      // Si la URL es relativa, construir URL completa
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Si la URL es del mismo dominio, permitir
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Por defecto, redirigir al dashboard
      return `${baseUrl}/admin/dashboard`;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      
      if (user) {

        token.role = user.role;
        token.roleName = user.roleName;
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      return token;
    },
    async session({ session, token }) {

      
      if (token) {
        // Agregar campos al objeto user
        session.user.role = token.role;
        session.user.roleName = token.roleName;
        session.user.userId = token.userId;
        session.user.id = token.userId; // También agregar como 'id'
        session.user.name = token.name;
        session.user.email = token.email;
        
        // Agregar campos a la raíz de la sesión también
        session.userId = token.userId;
        session.role = token.role;
        session.roleName = token.roleName;
        

        
        session.accessToken = jwt.sign(
          {
            userId: token.userId,
            email: token.email,
            role: token.role,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
          },
          process.env.NEXTAUTH_SECRET || 'isur-secret-key-2024'
        );
      }
      

      
      return session;
    }
  },
  events: {
    async signIn({ user, account, profile }) {

    },
    async signOut({ session, token }) {

    }
  }
});