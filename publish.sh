#!/bin/bash

# 🚀 NUCLEAR SIMULATOR - PUBLICAR EN VERCEL
# Script interactivo que lo hace TODO por ti

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        ⚛️  NUCLEAR SIMULATOR v2.0 - PUBLISH WIZARD  ⚛️          ║"
echo "║                                                                ║"
echo "║              Tu simulador nuclear está listo.                 ║"
echo "║           Este script lo publica en Vercel automáticamente.   ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para checkmark
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Verificar requisitos
echo ""
echo "📋 VERIFICANDO REQUISITOS..."
echo ""

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js instalado: $NODE_VERSION"
else
    error "Node.js NO está instalado"
    error "Descargalo en: https://nodejs.org"
    exit 1
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    success "npm instalado: $NPM_VERSION"
else
    error "npm NO está instalado"
    exit 1
fi

# Git
if command -v git &> /dev/null; then
    success "Git instalado"
else
    error "Git NO está instalado"
    exit 1
fi

echo ""
echo "🔍 OPCIÓN A: PUBLICAR SIN GITHUB (MÁS RÁPIDO)"
echo "───────────────────────────────────────────────"
echo "  Necesitas: Vercel CLI + cuenta Vercel (gratuita)"
echo "  Tiempo: ~5 minutos"
echo ""
echo "🔍 OPCIÓN B: PUBLICAR CON GITHUB (DEPLOY AUTOMÁTICO)"
echo "───────────────────────────────────────────────"
echo "  Necesitas: GitHub + Vercel"
echo "  Tiempo: ~10 minutos, pero futuros deploys automáticos"
echo ""

read -p "¿Cuál opción prefieres? (A/B): " choice

if [ "$choice" = "A" ] || [ "$choice" = "a" ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "🚀 OPCIÓN A: PUBLICAR DIRECTAMENTE EN VERCEL"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    
    # Verificar Vercel CLI
    if ! command -v vercel &> /dev/null; then
        warning "Vercel CLI no instalado. Instalando..."
        npm install -g vercel
        success "Vercel CLI instalado"
    else
        VERCEL_VERSION=$(vercel --version)
        success "Vercel CLI instalado: $VERCEL_VERSION"
    fi
    
    echo ""
    info "PASO 1: Ingresa a Vercel"
    echo "   • Abre navegador en: https://vercel.com/signup"
    echo "   • Crea cuenta (es gratis)"
    echo "   • Regresa aquí cuando termines"
    echo ""
    
    read -p "¿Cuenta Vercel lista? (s/n): " vercel_ready
    
    if [ "$vercel_ready" != "s" ] && [ "$vercel_ready" != "S" ]; then
        error "Operación cancelada"
        exit 1
    fi
    
    echo ""
    info "PASO 2: Autenticarse con Vercel"
    vercel login
    
    if [ $? -ne 0 ]; then
        error "Autenticación falló"
        exit 1
    fi
    
    success "Autenticación exitosa"
    
    echo ""
    info "PASO 3: Desplegando a producción..."
    echo "   (Responde las preguntas o presiona Enter para defaults)"
    echo ""
    
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        success "¡PUBLICADO EXITOSAMENTE!"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        echo "Tu simulador nuclear está LIVE en internet:"
        echo ""
        info "Verifica tu navegador/terminal arriba ↑"
        echo ""
        echo "🎉 ¡Puedes compartir tu URL ahora!"
        echo ""
        echo "Ejemplo de qué compartir:"
        echo "\"Construí un simulador nuclear educativo con React + física real\""
        echo "\"Juega en: https://nuclear-simulator-XXXXX.vercel.app\""
        echo ""
    else
        error "Deployment falló"
        exit 1
    fi

elif [ "$choice" = "B" ] || [ "$choice" = "b" ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "🚀 OPCIÓN B: PUBLICAR CON GITHUB + VERCEL"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    
    echo "📋 PASO 1: Crear repositorio en GitHub"
    echo "   • Ve a: https://github.com/new"
    echo "   • Nombre: nuclear-simulator"
    echo "   • Descripción: Educational nuclear reactor simulator"
    echo "   • Público"
    echo "   • Click 'Create repository'"
    echo ""
    
    read -p "¿Repositorio creado? (s/n): " github_ready
    
    if [ "$github_ready" != "s" ] && [ "$github_ready" != "S" ]; then
        error "Operación cancelada"
        exit 1
    fi
    
    echo ""
    read -p "¿Cuál es tu usuario de GitHub? (ej: MrProphecy): " github_user
    
    if [ -z "$github_user" ]; then
        error "Usuario vacío"
        exit 1
    fi
    
    echo ""
    info "PASO 2: Conectando repositorio local con GitHub..."
    echo ""
    
    cd /home/claude/nuclear-simulator
    
    git remote add origin https://github.com/$github_user/nuclear-simulator.git 2>/dev/null
    if [ $? -eq 0 ]; then
        success "Remoto añadido"
    else
        warning "Remoto ya existe"
    fi
    
    git branch -M main
    success "Branch renombrada a 'main'"
    
    echo ""
    info "PASO 3: Subiendo código a GitHub..."
    echo "   (Puede pedir autenticación)"
    echo ""
    
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        success "Código en GitHub"
        success "URL: https://github.com/$github_user/nuclear-simulator"
    else
        error "Push falló"
        exit 1
    fi
    
    echo ""
    echo "📋 PASO 4: Conectar Vercel con GitHub"
    echo "   • Ve a: https://vercel.com/dashboard"
    echo "   • Click 'Add New' → 'Project'"
    echo "   • Selecciona 'nuclear-simulator'"
    echo "   • Click 'Deploy'"
    echo "   • Espera ~2 minutos"
    echo ""
    
    read -p "¿Vercel deployment completado? (s/n): " vercel_done
    
    if [ "$vercel_done" = "s" ] || [ "$vercel_done" = "S" ]; then
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        success "¡PUBLICADO EXITOSAMENTE!"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        echo "Tu simulador está LIVE:"
        echo "  GitHub:  https://github.com/$github_user/nuclear-simulator"
        echo "  Vercel:  https://nuclear-simulator.vercel.app"
        echo ""
        echo "✨ VENTAJA: Futuras actualizaciones se desplegan automáticamente"
        echo "   Solo haz: git push origin main"
        echo ""
    else
        warning "Verifica manualmente en Vercel dashboard"
    fi
else
    error "Opción inválida"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                      ¡TODO LISTO!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Próximos pasos:"
echo "  ✅ Abre tu URL en navegador"
echo "  ✅ Prueba los 4 escenarios"
echo "  ✅ Desbloquea logros"
echo "  ✅ Comparte con amigos"
echo ""
echo "Información:"
echo "  • README: https://github.com/$github_user/nuclear-simulator"
echo "  • Docs: Ver DEPLOYMENT_GUIDE.md en el repo"
echo ""
echo "⚛️  Hecho con ❤️  por MrProphecy (Viking)"
echo "═══════════════════════════════════════════════════════════════"
echo ""
