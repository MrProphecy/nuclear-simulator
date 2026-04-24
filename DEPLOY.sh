#!/bin/bash

# 📋 INSTRUCCIONES PARA PUBLICAR EN VERCEL
# ⚛️ Nuclear Reactor Simulator v2.0

echo "🚀 Publicando Nuclear Reactor Simulator en Vercel..."
echo ""

# 1. Verificar que tienes Vercel CLI instalado
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI no está instalado"
  echo "📦 Instalando: npm install -g vercel"
  npm install -g vercel
fi

# 2. Verificar que estás en la carpeta correcta
if [ ! -f "package.json" ]; then
  echo "❌ Error: No estás en la carpeta del proyecto"
  echo "📂 Debes estar en: /path/to/nuclear-simulator"
  exit 1
fi

echo "✅ Ambiente listo"
echo ""

# 3. Build local
echo "🔨 Compilando proyecto..."
npm run build
echo "✅ Build exitoso"
echo ""

# 4. Conectar/Autenticar con Vercel
echo "🔑 Autenticando con Vercel..."
vercel login

echo ""
echo "📤 Desplegando a producción..."
vercel --prod

echo ""
echo "✅ ¡Publicado! Tu simulador está en línea"
echo "📱 Verifica la URL en los logs arriba ↑"
echo ""
echo "🎯 Próximos pasos:"
echo "  • Visita tu URL de Vercel"
echo "  • Prueba todos los escenarios"
echo "  • Comparte con amigos: 'construí un simulador nuclear con IA'"
echo "  • GitHub: puedo ayudarte a vincular el repo si quieres deploy automático"
echo ""
echo "💡 Para futuras actualizaciones:"
echo "  git push origin main"
echo "  (Vercel redeployará automáticamente)"
