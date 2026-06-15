# TECNOTECH DIÉSEL — Generador de Presupuestos

App web (HTML + CSS + JS puro, sin backend) para generar presupuestos del taller diésel y compartirlos por WhatsApp. Pensada para usarse desde el celular.

## Archivos
- `index.html` — estructura del wizard (7 pasos)
- `styles.css` — diseño mobile-first
- `app.js` — lógica, autoguardado, esquema de daños y generación de PDF (jsPDF por CDN)

## Cómo usarla
Abrí `index.html` en el navegador. Completá los pasos (podés saltear los opcionales) y tocá **Generar PDF** o **Compartir por WhatsApp**.

- El **N° de presupuesto** se genera solo con formato `ddmmaahhmm` (ej: `1506262236` = 15/06/26 22:36).
- Los datos se **guardan automáticamente**: si cerrás el navegador, al volver se recuperan.
- **Nuevo Presupuesto** limpia todo y genera un número nuevo.

### WhatsApp
Al tocar *Compartir por WhatsApp* se descarga el PDF y se abre WhatsApp con el mensaje precargado
*"Adjuntamos presupuesto TECNOTECH DIÉSEL N° XXXXX"*. Luego adjuntá manualmente el PDF descargado
(los navegadores no permiten adjuntar archivos automáticamente por seguridad).

## Publicar en GitHub Pages
1. Creá un repositorio y subí los 3 archivos (`index.html`, `styles.css`, `app.js`).
2. Settings → Pages → Branch: `main` / carpeta `/root` → Save.
3. La app queda en `https://TU_USUARIO.github.io/TU_REPO/`.

## Logo
El logo está hecho en SVG vectorial dentro de `app.js` (constante `LOGO_SVG`) para que el proyecto sea
autónomo. Si querés usar tu PNG real, reemplazá el contenido de esa constante o cargá la imagen y
ajustá el encabezado.
