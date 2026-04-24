# 🚀 GUÍA COMPLETA DE DEPLOYMENT
## ⚛️ Nuclear Reactor Simulator v2.0

---

## OPCIÓN 1: DEPLOY EN VERCEL (RECOMENDADO - GRATIS)

### Requisitos
- Cuenta en Vercel (free) → https://vercel.com
- Cuenta en GitHub (free) → https://github.com
- Node.js 18+ instalado

### Paso 1: Preparar Repositorio GitHub

```bash
# Si no tienes git configurado aún:
git config --global user.email "tu@email.com"
git config --global user.name "Tu Nombre"

# En la carpeta del proyecto:
cd /home/claude/nuclear-simulator

# Crear nuevo repositorio en GitHub:
# 1. Ve a https://github.com/new
# 2. Nombre: nuclear-simulator
# 3. Descripción: "Educational nuclear reactor simulator with realistic physics"
# 4. Público (para que sea visible)
# 5. Crear

# Conectar repo local con GitHub:
git remote add origin https://github.com/TUUSUARIO/nuclear-simulator.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar Vercel con GitHub

1. Ve a https://vercel.com/login
2. "Continue with GitHub"
3. Autoriza Vercel a acceder a tus repos
4. Dashboard → "Add New..." → "Project"
5. Selecciona "nuclear-simulator" de tu lista
6. Framework: "Vite" (Vercel lo detectará automáticamente)
7. Build Command: `npm run build` (ya configurado en package.json)
8. Output Directory: `dist`
9. Click "Deploy"

**¡Listo! Tu simulador estará en vivo en ~2 minutos.**

URL será algo como: `https://nuclear-simulator-abc123.vercel.app`

### Paso 3: Deploy Automático en Futuras Actualizaciones

```bash
# Simplemente haz push a main:
git add .
git commit -m "feat: descripción del cambio"
git push origin main

# Vercel redeployará automáticamente
# Puedes ver el progreso en vercel.com/dashboard
```

---

## OPCIÓN 2: DEPLOY MANUAL EN VERCEL (Sin GitHub)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Autenticarse
vercel login

# En la carpeta del proyecto
cd /home/claude/nuclear-simulator

# Deploy a production
vercel --prod

# Sigue los prompts
```

**Ventaja**: Más rápido
**Desventaja**: No tienes deploy automático en próximos pushes

---

## OPCIÓN 3: GITHUB PAGES (Gratis, Estático)

```bash
# 1. Crear gh-pages branch
git branch gh-pages

# 2. Instalar gh-pages
npm install --save-dev gh-pages

# 3. Actualizar package.json
# Agregar en "scripts":
# "deploy": "npm run build && gh-pages -d dist"

# 4. Deploy
npm run deploy
```

URL será: `https://TUUSUARIO.github.io/nuclear-simulator`

---

## VERIFICACIÓN POST-DEPLOY

Una vez publicado, verifica que:

1. **La app carga** → No errores en console (F12)
2. **Physics funciona** → Presiona INICIAR, ve cambios en real-time
3. **Gráficas aparecer** → Historial se llena después de 30s
4. **Escenarios funcionan** → Carga cada escenario sin crashes
5. **Scoring funciona** → Puntuación sube, logros se desbloquean

Si ves errores:

```bash
# Verificar build local funciona:
npm run build
npm run preview

# Si preview funciona pero Vercel falla:
# 1. Borra node_modules: rm -rf node_modules
# 2. Reinstala: npm install
# 3. Vuelve a pushear a GitHub
# 4. Vercel reintentará el build
```

---

## DOMINIO PERSONALIZADO (Opcional)

Si quieres nuclear-simulator.com en lugar de *.vercel.app:

1. **Comprar dominio**:
   - namecheap.com (~$0.99/año)
   - godaddy.com (~$12/año)
   - ionos.com (barato en España)

2. **Configurar en Vercel**:
   - Vercel Dashboard → Settings → Domains
   - Add Domain → "nuclear-simulator.com"
   - Sigue instrucciones de DNS (CNAME records)
   - Vercel gestiona SSL/HTTPS automáticamente

3. **¡Listo!** Nuclear-simulator.com redirige a tu app

---

## ESTADÍSTICAS POST-DEPLOYMENT

Vercel te da acceso a:

- **Analytics**: Cuántas visitas, qué navegadores, geolocalización
- **Build logs**: Historial de deploys
- **Performance**: Métricas de Core Web Vitals
- **Environment variables**: Si necesitas APIs (no aplicable aquí)

Todo está en vercel.com/dashboard

---

## COMPARTIR EL PROYECTO

**URL para LinkedIn/Twitter/Reddit:**

```
Construí un simulador nuclear educativo completamente funcional
con React + física nuclear real en un fin de semana usando Claude Code.
Juega, aprende ingeniería nuclear, desbloquea logros.

URL: https://nuclear-simulator.vercel.app

#ReactJS #Physics #Education #OpenSource
```

**Para técnicos:**
```
Educational nuclear reactor simulator with real point kinetics equations,
feedback modeling, and SCRAM systems. 4 scenarios (Normal, LOCA, Chernobyl, Fukushima).
Built with React, Vite, Recharts. Realtime physics integration.

GitHub: github.com/MrProphecy/nuclear-simulator
```

---

## TROUBLESHOOTING

### Error: "Build failed"

**Causa**: Problema en build
**Solución**:
```bash
npm install
npm run build
# Revisar errores ↑
# Fixear, commit, push
```

### Error: "Module not found"

**Causa**: Falta instalar dependencias
**Solución**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
git add .
git commit -m "reinstall deps"
git push
```

### Error: "Cannot find dist/"

**Causa**: Build command incorrecto
**Solución**: Vercel → Project Settings → Build Command
```
debe ser: npm run build
```

### App carga pero sin estilos (CSS roto)

**Causa**: Tailwind no se compiló
**Solución**:
```bash
npm install -D tailwindcss postcss autoprefixer
npm run build
```

### "Recharts not rendering"

**Causa**: Componente falla silenciosamente
**Solución**:
```bash
# Revisar console (F12) → Errors
# Probablemente import incorrecto
# Verificar en src/components/Charts.jsx
```

---

## PRÓXIMAS MEJORAS

Una vez publicado, puedes agregar:

1. **PWA**: Funciona offline
   ```bash
   npm install workbox-precache
   # Configurar vite.config.js
   ```

2. **Leaderboard**: Guardar scores en Firebase
   ```bash
   npm install firebase
   ```

3. **Multiplayer**: WebSocket, juega con amigos
   ```bash
   npm install socket.io-client
   ```

4. **Mobile App**: Convertir a React Native / Flutter

5. **VR Mode**: Three.js + WebXR para Meta Quest

---

## SOPORTE & ERRORES

Si algo falla después del deploy:

1. **Ver logs**: Vercel Dashboard → Project → Deployments → Logs
2. **Console browser**: F12 → Console → Ver errores
3. **Network tab**: F12 → Network → Ver requests fallidos
4. **GitHub Issues**: Crear issue en repo para futuras mejoras

---

## ¡LISTO PARA PRODUCCIÓN! 🚀

Tu simulador está completamente funcional, optimizado y listo para publicar.

**Resumen**:
- ✅ Física nuclear realista (ecuaciones diferenciales reales)
- ✅ Sistema de scoring y logros
- ✅ 4 escenarios educativos
- ✅ UI responsivo con Tailwind
- ✅ Gráficas en tiempo real
- ✅ Componentes modularizados
- ✅ Build optimizado (~165KB gzipped)
- ✅ GitHub + Vercel ready

**Próximo paso**: `git push origin main` → Vercel despliega automáticamente

---

**⚛️ Nuclear Reactor Simulator v2.0 | Built by MrProphecy | Educational Purpose Only**
