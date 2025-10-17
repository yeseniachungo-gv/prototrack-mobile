# GiraData Industrial - Base de Datos Flexible para la Industria

Una plataforma de base de datos colaborativa y visual que combina la potencia de una hoja de cálculo con capacidades de archivos adjuntos y automatización inteligente, diseñada específicamente para las necesidades de la industria.

## 🚀 Características Principales

### 📊 Gestión de Datos Dinámica
- **Tablas Configurables**: Crea y personaliza columnas con diferentes tipos de datos
- **Tipos de Campo Avanzados**:
  - Texto y Números
  - Archivos Adjuntos (PDF, imágenes, documentos)
  - Selección Múltiple con etiquetas personalizables
  - Fechas de Vencimiento con calendario
  - Fórmulas con asistencia de IA

### 🎨 Vistas Flexibles
- **Vista de Tabla**: Edición en línea con funcionalidad de hoja de cálculo
- **Vista de Galería**: Visualización de archivos adjuntos como tarjetas
- **Interfaz Responsive**: Optimizada para desktop, tablet y móvil

### 🤖 Inteligencia Artificial
- **Asistente de Fórmulas**: Genera fórmulas complejas usando lenguaje natural
- **Automatización**: Alertas automáticas por fechas de vencimiento
- **Notificaciones Inteligentes**: Sistema de alertas configurable

### 📋 Plantillas Preconfiguradas
- **Mantenimiento de Equipos**: Control de mantenimiento preventivo y correctivo
- **Control de Calidad de Lotes**: Seguimiento de calidad y certificación
- **Inventario de Materiales**: Control de stock y movimientos
- **Registro de Seguridad**: Seguimiento de incidentes y capacitaciones

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **State Management**: React Context API
- **File Storage**: Simulación de S3/GCS (listo para integración)
- **AI Integration**: Servicio de IA generativa (listo para OpenAI/Claude/Gemini)
- **Authentication**: Sistema de autenticación personalizado (listo para Auth0/Cognito)

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd giradata-industrial
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🔐 Credenciales de Prueba

Para acceder a la aplicación, utiliza estas credenciales:

- **Email**: admin@giradata.com
- **Contraseña**: admin123

## 🎯 Uso de la Aplicación

### 1. Autenticación
- Accede a la aplicación con las credenciales de prueba
- El sistema redirigirá automáticamente a la vista de gestión de datos

### 2. Crear una Nueva Tabla
- Haz clic en "Nueva Tabla" en la vista de datos
- Configura el nombre y las columnas de tu tabla
- Selecciona los tipos de campo apropiados
- Guarda la configuración

### 3. Usar Plantillas Preconfiguradas
- Ve a la sección "Plantillas" desde el menú
- Selecciona una plantilla que se adapte a tu industria
- La plantilla se aplicará automáticamente a tu vista de datos

### 4. Gestionar Datos
- **Agregar Registros**: Usa el botón "Agregar Fila"
- **Editar Datos**: Haz clic en cualquier celda para editar
- **Subir Archivos**: Usa la columna de archivos adjuntos
- **Aplicar Fórmulas**: Usa el asistente de IA para crear fórmulas complejas

### 5. Cambiar Vista
- Alterna entre vista de tabla y galería usando los botones en la parte superior
- La vista de galería muestra los archivos adjuntos como tarjetas

## 🔧 Configuración Avanzada

### Integración con Servicios Cloud

#### File Storage (S3/GCS)
```typescript
// En services/fileStorage.ts
// Reemplazar la simulación con la integración real
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
```

#### Autenticación (Auth0/Cognito)
```typescript
// En contexts/AuthContext.tsx
// Integrar con el proveedor de autenticación elegido
import { Auth0Client } from '@auth0/auth0-spa-js';
```

#### IA Generativa (OpenAI/Claude)
```typescript
// En services/aiService.ts
// Integrar con la API de IA elegida
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

### Variables de Entorno
Crea un archivo `.env.local` con las siguientes variables:

```env
# Base de datos
DATABASE_URL=your_database_url

# File Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_bucket_name

# Autenticación
AUTH0_DOMAIN=your_auth0_domain
AUTH0_CLIENT_ID=your_auth0_client_id

# IA
OPENAI_API_KEY=your_openai_key
```

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Docker
```bash
# Construir imagen
docker build -t giradata-industrial .

# Ejecutar contenedor
docker run -p 3000:3000 giradata-industrial
```

### Otras Plataformas
La aplicación es compatible con cualquier plataforma que soporte Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Azure Static Web Apps

## 📈 Roadmap

### Próximas Características
- [ ] Integración con bases de datos reales (PostgreSQL, MongoDB)
- [ ] Sistema de roles y permisos
- [ ] Exportación de datos (Excel, PDF, CSV)
- [ ] Dashboard con gráficos y métricas
- [ ] API REST para integraciones externas
- [ ] Notificaciones por email y SMS
- [ ] Aplicación móvil nativa

### Mejoras Técnicas
- [ ] Tests unitarios y de integración
- [ ] Optimización de rendimiento
- [ ] Internacionalización (i18n)
- [ ] Modo offline
- [ ] Sincronización en tiempo real

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@giradata.com
- Documentación: [docs.giradata.com](https://docs.giradata.com)
- Issues: [GitHub Issues](https://github.com/giradata/industrial/issues)

---

**GiraData Industrial** - Transformando la gestión de datos industriales con tecnología de vanguardia.