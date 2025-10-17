#!/bin/bash

echo "🚀 Configurando GiraData Industrial..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org/"
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error al instalar dependencias"
    exit 1
fi

# Crear archivo de variables de entorno de ejemplo
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo de variables de entorno..."
    cat > .env.local << EOF
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/giradata

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=giradata-files

# Autenticación (Auth0)
AUTH0_DOMAIN=your_domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# IA (OpenAI)
OPENAI_API_KEY=your_openai_api_key

# Configuración de la aplicación
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
EOF
    echo "✅ Archivo .env.local creado"
else
    echo "ℹ️  El archivo .env.local ya existe"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "Para iniciar la aplicación:"
echo "  npm run dev"
echo ""
echo "Para construir para producción:"
echo "  npm run build"
echo ""
echo "Para ejecutar en producción:"
echo "  npm start"
echo ""
echo "📚 Documentación completa en README.md"
echo "🔐 Credenciales de prueba: admin@giradata.com / admin123"
echo ""
echo "¡Disfruta usando GiraData Industrial! 🚀"