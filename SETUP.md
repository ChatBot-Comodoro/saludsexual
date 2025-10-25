# Instrucciones de Configuración para Despliegue Open Source

## 🚀 Inicio Rápido

### 1. Clonar e Instalar
```bash
git clone https://github.com/ChatBot-Comodoro/saludsexual.git
cd salud
npm install
```

### 2. Configuración de Entorno
```bash
# Copiar archivos de ejemplo
cp environments/.env.local.example environments/.env.local
cp environments/.env.dev.example environments/.env.dev
cp environments/.env.prod.example environments/.env.prod
```

### 3. Configurar tus Variables de Entorno

Edita `environments/.env.local` con tus valores:

#### Configuración Requerida
- **Clave API de OpenAI**: Obtener desde [Plataforma OpenAI](https://platform.openai.com/api-keys)
- **Base de Datos PostgreSQL**: Configurar tu conexión de base de datos
- **Secreto NextAuth**: Generar una cadena aleatoria segura

#### Configuración Opcional  
- **WhatsApp Business API**: Para integración con WhatsApp
- **SMTP de Email**: Para funciones de recuperación de contraseñas

### 4. Personalizar Contenido para tu Ubicación

Actualiza estos archivos para que coincidan con tu organización:

- `src/data/articleContents.js` - Reemplazar contenido de salud y referencias de ciudad
- `src/components/FloatingChat/FloatingChat.js` - Actualizar mensaje de introducción del chatbot
- `src/pages/chat.js` - Actualizar títulos y descripciones de páginas

### 5. Ejecutar la Aplicación

```bash
# Desarrollo
npm run local

# Producción
npm run build
npm run start
```

## 🗺️ Mapa de Centros de Salud

El componente de mapa interactivo está ubicado en `src/components/InteractiveMap/`. Necesitarás:

1. Actualizar la fuente de datos del mapa con tus centros de salud locales
2. Configurar las coordenadas del mapa para tu ciudad/región
3. Actualizar las tiles del mapa si es necesario

## 🤖 Configuración del Asistente IA

El chatbot está configurado para proporcionar información de salud. Podrías querer:

1. Crear un nuevo Asistente OpenAI específicamente para tu organización
2. Actualizar los prompts del sistema para que coincidan con tus protocolos de salud locales
3. Configurar la base de conocimiento del asistente con tus recursos de salud

## 📊 Panel de Administración

El panel de administración te permite:
- Gestionar artículos de salud
- Ver analíticas de usuarios  
- Gestionar cuentas de usuario
- Configurar ubicaciones del mapa

El acceso de administrador predeterminado se configura a través de la base de datos. Revisa los componentes admin en `src/components/admin/`.

## 🔐 Notas de Seguridad

- Todos los datos sensibles han sido removidos de este repositorio
- Asegúrate de usar contraseñas fuertes para todos los servicios
- Configura certificados HTTPS apropiados para producción
- Revisa y actualiza los headers de seguridad en `next.config.mjs`

## 📱 Integración WhatsApp

Si quieres habilitar la integración con WhatsApp Business API:

1. Configurar Meta Business Manager
2. Crear una Cuenta WhatsApp Business
3. Configurar endpoints de webhook
4. Actualizar variables de entorno con tus credenciales de Meta

## 🎨 Personalización

- Los estilos CSS están en `src/styles/globals.css`
- Los estilos de componentes usan módulos CSS
- Los colores y branding pueden actualizarse en las variables CSS
- Los iconos son de Tabler Icons - puedes reemplazarlos según sea necesario
