# 🎮 SUGARPARDA — El Juego

Plataformas 2D pixel art sobre la diabetes tipo 1. Mantén la glucosa en rango, esquiva los dulces y llega a la meta lo antes posible.

---

## 🚀 PUBLICAR EN GITHUB PAGES (paso a paso)

### 1. Crear repositorio en GitHub
1. Ve a **github.com** e inicia sesión
2. Clic en **"New repository"** (botón verde)
3. Nombre: `sugarparda`
4. Márcalo como **Public**
5. Clic en **"Create repository"**

### 2. Subir los ficheros
La forma más fácil es desde el navegador:
1. En tu repositorio vacío, clic en **"uploading an existing file"**
2. Arrastra TODOS los ficheros y carpetas de este proyecto
3. Clic en **"Commit changes"**

### 3. Activar GitHub Pages
1. Ve a **Settings** del repositorio
2. En el menú izquierdo, clic en **"Pages"**
3. En "Source", selecciona **"Deploy from a branch"**
4. Branch: **main**, carpeta: **/ (root)**
5. Clic en **"Save"**

### 4. ¡Listo!
En 2-3 minutos tu juego estará en:
`https://TU_USUARIO.github.io/sugarparda`

---

## ⭐ CÓMO CAMBIAR COSAS DEL JUEGO

**Solo toca `config.js`**. Todos los valores del juego están ahí.

Ejemplos:
- Cambiar rangos de glucosa → `RANGE_LOW`, `RANGE_HIGH`, `RANGAZO_LOW`, `RANGAZO_HIGH`
- Cambiar fuerza de insulina → `INSULIN_SLOW_DROP_PER_SEC`, `INSULIN_FAST_DROP`
- Cambiar dificultad enemigos → `ENEMY_*_RAISE`
- Cambiar velocidad → `PLAYER_BASE_SPEED`, `PLAYER_FAST_SPEED`
- Cambiar puntuación → `SCORE_RANGAZO`, `SCORE_IN_RANGE`

---

## 📁 ESTRUCTURA

```
sugarparda/
├── index.html              ← Entrada al juego
├── config.js               ← ⭐ ÚNICO FICHERO A EDITAR
├── supabase.js             ← Ranking público (no tocar)
├── manifest.json           ← PWA móvil
└── src/
    ├── scenes/
    │   ├── BootScene.js    ← Carga de assets
    │   ├── MenuScene.js    ← Pantalla inicio + ranking
    │   ├── GameScene.js    ← Lógica del juego
    │   ├── HUDScene.js     ← Glucómetro + botones
    │   └── ResultScene.js  ← Resultados finales
    └── systems/
        ├── GlucoseSystem.js  ← Lógica glucosa
        └── ScoreSystem.js    ← Puntuación
```

---

## 🩸 MECÁNICAS

- **Glucosa en rango (80-130):** puntuación normal
- **RANGAZO (90-110):** puntuación máxima + aura dorada ✨
- **Hipoglucemia (<50):** desmayo → usa glucagón
- **Hiperglucemia (>180):** pantalla rojiza, penalización
- **Insulina lenta 💉:** baja glucosa gradualmente (ilimitada, acumulable)
- **Insulina rápida ⚡:** baja 40 mg/dL de golpe (solo 3 por partida)
- **Manzana 🍎:** sube glucosa +20 lentamente (carbohidrato lento)
- **Agitar el móvil 📱:** corres más rápido → bajas glucosa más rápido → bonus velocidad
