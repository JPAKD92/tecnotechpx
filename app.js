/* ============================================================
   TECNOTECH DIÉSEL — Generador de Presupuestos
   Vanilla JS · jsPDF · localStorage
   ============================================================ */

const COMPANY = { name: "TECNOTECH DIÉSEL", phone: "+54 9 11 7361-1964" };
const TOTAL_STEPS = 7;
const STEP_TITLES = {
  1: "Datos del cliente", 2: "Datos del vehículo", 3: "Trabajo solicitado",
  4: "Trabajo a realizar", 5: "Observaciones", 6: "Materiales y mano de obra",
  7: "Daños localizados"
};
const STORE_KEY = "tecnotech_presupuesto_v1";

/* ---- Logo SVG (inline vector, recreación de TECNOTECH DIÉSEL) ---- */
const LOGO_SVG = `<svg viewBox="0 0 260 78" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.46" stop-color="#c8d0e0"/>
      <stop offset="0.54" stop-color="#7c879f"/><stop offset="1" stop-color="#e9eefb"/>
    </linearGradient>
    <linearGradient id="redm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff7b78"/><stop offset="0.5" stop-color="#e53935"/>
      <stop offset="0.55" stop-color="#b71c1c"/><stop offset="1" stop-color="#ff5a55"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="260" height="78" rx="10" fill="#05070d"/>
  <g fill="none" stroke-width="1.3" opacity=".95">
    <g stroke="#e53935">
      <path d="M8 20 H44 l9 9 H86"/><path d="M8 40 H30 l7 -7 H70"/>
      <path d="M20 10 V24"/><path d="M8 58 H40 l6 6 H78"/>
    </g>
    <g stroke="#2196f3">
      <path d="M252 22 H210 l-9 9 H164"/><path d="M252 44 H222 l-7 -7 H180"/>
      <path d="M236 12 V26"/><path d="M252 60 H214 l-6 -6 H176"/>
    </g>
  </g>
  <g fill="#e53935"><circle cx="8" cy="20" r="2.3"/><circle cx="20" cy="10" r="2"/><circle cx="8" cy="58" r="2"/></g>
  <g fill="#2196f3"><circle cx="252" cy="22" r="2.3"/><circle cx="236" cy="12" r="2"/><circle cx="252" cy="60" r="2"/></g>
  <g font-family="Arial,Helvetica,sans-serif" font-weight="800" font-style="italic" font-size="34" letter-spacing="-0.5">
    <text x="130" y="46" text-anchor="middle">
      <tspan fill="url(#steel)" stroke="#5b657e" stroke-width="0.5">TECNO</tspan><tspan fill="url(#redm)" stroke="#7a1513" stroke-width="0.5">TECH</tspan>
    </text>
  </g>
  <text x="132" y="66" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="800" font-style="italic" fill="#2196f3" letter-spacing="8">DIÉSEL</text>
</svg>`;

/* ---- State ---- */
let state = blankState();
let currentStep = 1;

function blankState() {
  return {
    budgetNumber: genBudgetNumber(),
    cliente: { nombre: "", telefono: "" },
    vehiculo: { marca: "", modelo: "", anio: "", patente: "" },
    trabajoSolicitado: "", trabajoRealizar: "", observaciones: "",
    items: [{ concepto: "", cantidad: "" }],
    total: "",
    danos: { zonas: [], obs: "" }
  };
}

/* ---- Budget number: ddmmaahhmm ---- */
function genBudgetNumber() {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  return p(d.getDate()) + p(d.getMonth() + 1) + p(d.getFullYear() % 100) +
         p(d.getHours()) + p(d.getMinutes());
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("brandLogo").innerHTML = LOGO_SVG;
  load();
  buildVehicleDiagram();
  bindInputs();
  bindNav();
  renderItems();
  renderAll();
  showStep(currentStep);
});

/* ---- Persistence ---- */
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ state, currentStep })); } catch (e) {}
}
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.state) state = Object.assign(blankState(), data.state);
    if (!state.items || !state.items.length) state.items = [{ concepto: "", cantidad: "" }];
    if (!state.danos) state.danos = { zonas: [], obs: "" };
    if (data.currentStep) currentStep = data.currentStep;
  } catch (e) {}
}

/* ---- Bind text inputs ---- */
function bindInputs() {
  const map = {
    clienteNombre: ["cliente", "nombre"], clienteTelefono: ["cliente", "telefono"],
    vehMarca: ["vehiculo", "marca"], vehModelo: ["vehiculo", "modelo"],
    vehAnio: ["vehiculo", "anio"], vehPatente: ["vehiculo", "patente"],
    trabajoSolicitado: ["trabajoSolicitado"], trabajoRealizar: ["trabajoRealizar"],
    observaciones: ["observaciones"], danosObs: ["danos", "obs"],
    montoTotal: ["total"]
  };
  for (const id in map) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener("input", () => {
      const path = map[id];
      if (path.length === 2) state[path[0]][path[1]] = el.value;
      else state[path[0]] = el.value;
      save();
    });
  }
}

/* ---- Reflect state into inputs ---- */
function renderAll() {
  document.getElementById("budgetNumber").textContent = state.budgetNumber;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ""; };
  set("clienteNombre", state.cliente.nombre); set("clienteTelefono", state.cliente.telefono);
  set("vehMarca", state.vehiculo.marca); set("vehModelo", state.vehiculo.modelo);
  set("vehAnio", state.vehiculo.anio); set("vehPatente", state.vehiculo.patente);
  set("trabajoSolicitado", state.trabajoSolicitado); set("trabajoRealizar", state.trabajoRealizar);
  set("observaciones", state.observaciones); set("danosObs", state.danos.obs);
  set("montoTotal", state.total);
  renderZones();
}

/* ============================================================
   WIZARD NAVIGATION
   ============================================================ */
function bindNav() {
  document.getElementById("nextBtn").addEventListener("click", () => goStep(currentStep + 1));
  document.getElementById("prevBtn").addEventListener("click", () => goStep(currentStep - 1));
  document.getElementById("addItemBtn").addEventListener("click", addItem);
  document.getElementById("genPdfBtn").addEventListener("click", generatePDF);
  document.getElementById("genPdfBtn2").addEventListener("click", generatePDF);
  document.getElementById("whatsappBtn").addEventListener("click", shareWhatsApp);
  document.getElementById("newBudgetBtn").addEventListener("click", newBudget);
}

function goStep(n) {
  n = Math.max(1, Math.min(TOTAL_STEPS, n));
  currentStep = n; save(); showStep(n);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showStep(n) {
  document.querySelectorAll(".step").forEach(s =>
    s.classList.toggle("active", +s.dataset.step === n));
  document.getElementById("progressFill").style.width = (n / TOTAL_STEPS * 100) + "%";
  document.getElementById("stepLabel").textContent = `Paso ${n} de ${TOTAL_STEPS}`;
  document.getElementById("stepTitle").textContent = STEP_TITLES[n];

  const prev = document.getElementById("prevBtn");
  const next = document.getElementById("nextBtn");
  const gen = document.getElementById("genPdfBtn");
  prev.style.visibility = n === 1 ? "hidden" : "visible";

  const last = n === TOTAL_STEPS;
  next.classList.toggle("hidden", last);
  gen.classList.add("hidden"); // generation handled in final-actions bar
  document.querySelector(".wizard-nav").classList.toggle("hidden", last);
  document.getElementById("finalActions").classList.toggle("hidden", !last);
}

/* ============================================================
   ITEMS (Materiales y mano de obra)
   ============================================================ */
function addItem() {
  state.items.push({ concepto: "", cantidad: "" });
  save(); renderItems();
}
function removeItem(i) {
  state.items.splice(i, 1);
  if (!state.items.length) state.items.push({ concepto: "", cantidad: "" });
  save(); renderItems();
}
function renderItems() {
  const list = document.getElementById("itemsList");
  list.innerHTML = "";
  state.items.forEach((it, i) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="f-concept"><label>Concepto
        <input type="text" value="${esc(it.concepto)}" placeholder="Ej: Inyector Bosch"></label></div>
      <div class="f-qty"><label>Cantidad
        <input type="text" inputmode="numeric" value="${esc(it.cantidad)}" placeholder="1"></label></div>
      <button type="button" class="item-del" title="Eliminar">✕</button>`;
    const ins = card.querySelectorAll("input");
    const cIn = ins[0], qIn = ins[1];
    cIn.addEventListener("input", () => { state.items[i].concepto = cIn.value; save(); });
    qIn.addEventListener("input", () => { state.items[i].cantidad = qIn.value; save(); });
    card.querySelector(".item-del").addEventListener("click", () => removeItem(i));
    list.appendChild(card);
  });
}

/* ============================================================
   VEHICLE DIAGRAM (Daños localizados)
   ============================================================ */
const ZONES = [
  { id: "capo",  label: "Capó / Frente",     view: "top",   x: 70,  y: 16,  w: 80, h: 48,  t: "Capó" },
  { id: "li",    label: "Lateral Izquierdo", view: "top",   x: 22,  y: 78,  w: 44, h: 144, t: "Lat. Izq." },
  { id: "techo", label: "Techo",             view: "top",   x: 78,  y: 78,  w: 64, h: 144, t: "Techo" },
  { id: "ld",    label: "Lateral Derecho",   view: "top",   x: 154, y: 78,  w: 44, h: 144, t: "Lat. Der." },
  { id: "baul",  label: "Baúl / Trasera",    view: "top",   x: 70,  y: 234, w: 80, h: 48,  t: "Baúl" },
  { id: "frente",  label: "Paragolpes delantero", view: "front", x: 30, y: 24, w: 140, h: 70, t: "Frente" },
  { id: "trasera", label: "Paragolpes trasero",   view: "rear",  x: 30, y: 24, w: 140, h: 70, t: "Trasera" }
];

function buildVehicleDiagram() {
  const wrap = document.getElementById("vehicleDiagram");
  wrap.innerHTML = `
    <div class="veh-view full">
      <h4>Vista superior</h4>
      ${svgTop()}
    </div>
    <div class="veh-view">
      <h4>Frontal</h4>
      ${svgEnd("front")}
    </div>
    <div class="veh-view">
      <h4>Trasera</h4>
      ${svgEnd("rear")}
    </div>`;
  wrap.querySelectorAll("[data-zone]").forEach(el =>
    el.addEventListener("click", () => toggleZone(el.dataset.zone)));
  syncDiagram();
}

function zoneRect(z) {
  return `<rect class="veh-zone" data-zone="${z.id}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="8"></rect>
          <text class="veh-label" x="${z.x + z.w / 2}" y="${z.y + z.h / 2 + 4}" data-lbl="${z.id}">${z.t}</text>`;
}

function svgTop() {
  // Zonas como polígonos siguiendo la silueta (vista superior, frente arriba)
  const zone = (id, label, pts, lx, ly) =>
    `<polygon class="veh-zone" data-zone="${id}" points="${pts}"></polygon>
     <text class="veh-label" data-lbl="${id}" x="${lx}" y="${ly}">${label}</text>`;
  return `<svg viewBox="0 0 240 360" xmlns="http://www.w3.org/2000/svg">
    <rect class="veh-wheel" x="52" y="78" width="14" height="34" rx="5"/>
    <rect class="veh-wheel" x="174" y="78" width="14" height="34" rx="5"/>
    <rect class="veh-wheel" x="52" y="250" width="14" height="34" rx="5"/>
    <rect class="veh-wheel" x="174" y="250" width="14" height="34" rx="5"/>
    <path class="veh-silhouette" d="M70 120 l-12 -4 M170 120 l12 -4"/>
    <path class="veh-silhouette" d="M70 52 Q70 14 108 12 L132 12 Q170 14 170 52 L170 312 Q170 348 132 350 L108 350 Q70 348 70 312 Z"/>
    <polygon class="veh-glass" points="84,96 156,96 146,132 94,132"/>
    <rect class="veh-glass" x="94" y="132" width="52" height="96" rx="4"/>
    <polygon class="veh-glass" points="94,228 146,228 156,264 84,264"/>
    ${zone("capo",  "Capó",  "76,18 164,18 166,92 74,92", 120, 60)}
    ${zone("techo", "Techo", "94,96 146,96 146,266 94,266", 120, 184)}
    ${zone("baul",  "Baúl",  "74,270 166,270 164,344 76,344", 120, 312)}
    <polygon class="veh-zone" data-zone="li" points="72,96 92,96 92,266 72,266"></polygon>
    <text class="veh-label" data-lbl="li" x="82" y="184" transform="rotate(-90 82 184)">Izq.</text>
    <polygon class="veh-zone" data-zone="ld" points="148,96 168,96 168,266 148,266"></polygon>
    <text class="veh-label" data-lbl="ld" x="158" y="184" transform="rotate(90 158 184)">Der.</text>
  </svg>`;
}
function svgEnd(view) {
  const z = ZONES.find(zz => zz.view === view);
  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="14" width="164" height="92" rx="18" fill="none" stroke="#42507a" stroke-width="2"/>
    ${zoneRect(z)}
  </svg>`;
}

function toggleZone(id) {
  const z = ZONES.find(zz => zz.id === id); if (!z) return;
  const i = state.danos.zonas.indexOf(z.label);
  if (i >= 0) state.danos.zonas.splice(i, 1);
  else state.danos.zonas.push(z.label);
  save(); syncDiagram(); renderZones();
}

function syncDiagram() {
  ZONES.forEach(z => {
    const on = state.danos.zonas.includes(z.label);
    document.querySelectorAll(`[data-zone="${z.id}"]`).forEach(el => el.classList.toggle("on", on));
    document.querySelectorAll(`[data-lbl="${z.id}"]`).forEach(el => el.classList.toggle("on", on));
  });
}
function renderZones() {
  syncDiagram();
  const box = document.getElementById("zonesSummary");
  if (!box) return;
  box.innerHTML = state.danos.zonas.length
    ? state.danos.zonas.map(z => `<span class="zone-chip">📍 ${esc(z)}</span>`).join("")
    : `<span style="color:var(--txt-dim);font-size:13px">Ninguna zona marcada todavía.</span>`;
}

/* ============================================================
   PDF GENERATION (jsPDF) — A4 profesional
   ============================================================ */
function generatePDF(returnDoc) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 14;
  const RED = [229, 57, 53], BLUE = [33, 150, 243], DARK = [20, 28, 48], GREY = [120, 130, 150];
  let y = 0;

  /* ---- Header band ---- */
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, W, 30, "F");
  doc.setFillColor(...RED); doc.rect(0, 30, W, 1.4, "F");
  doc.setFillColor(...BLUE); doc.rect(W / 2, 30, W / 2, 1.4, "F");

  // logo text (TECNO plateado + TECH rojo, DIÉSEL azul)
  doc.setFont("helvetica", "bolditalic"); doc.setFontSize(20);
  doc.setTextColor(235, 238, 245); doc.text("TECNO", M, 15);
  const wTecno = doc.getTextWidth("TECNO");
  doc.setTextColor(...RED); doc.text("TECH", M + wTecno, 15);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...BLUE); doc.setFontSize(11);
  doc.setLineHeightFactor(1); doc.text("D I É S E L", M + 1, 22);
  doc.setTextColor(180, 190, 210); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text("Tel: " + COMPANY.phone, M, 27);

  // budget badge right
  doc.setTextColor(170, 180, 200); doc.setFontSize(8);
  doc.text("PRESUPUESTO N°", W - M, 12, { align: "right" });
  doc.setTextColor(52, 211, 153); doc.setFont("helvetica", "bold"); doc.setFontSize(15);
  doc.text(state.budgetNumber, W - M, 19, { align: "right" });
  doc.setTextColor(180, 190, 210); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text("Fecha: " + fmtDate(), W - M, 25, { align: "right" });

  y = 40;

  /* ---- Cliente / Vehículo boxes ---- */
  const colW = (W - M * 2 - 6) / 2;
  const boxH = 30;
  infoBox(doc, M, y, colW, boxH, "DATOS DEL CLIENTE", [
    ["Cliente", state.cliente.nombre || "—"],
    ["Teléfono", state.cliente.telefono || "—"]
  ], RED);
  infoBox(doc, M + colW + 6, y, colW, boxH, "DATOS DEL VEHÍCULO", [
    ["Marca / Modelo", trim(`${state.vehiculo.marca} ${state.vehiculo.modelo}`) || "—"],
    ["Año", state.vehiculo.anio || "—"],
    ["Patente", (state.vehiculo.patente || "—").toUpperCase()]
  ], BLUE);
  y += boxH + 8;

  /* ---- Text sections ---- */
  y = textSection(doc, M, y, W - M * 2, "TRABAJO SOLICITADO", state.trabajoSolicitado, RED);
  y = textSection(doc, M, y, W - M * 2, "TRABAJO A REALIZAR", state.trabajoRealizar, BLUE);
  if (trim(state.observaciones))
    y = textSection(doc, M, y, W - M * 2, "OBSERVACIONES", state.observaciones, GREY);

  /* ---- Items table ---- */
  y = checkPage(doc, y, 30);
  y = sectionHeader(doc, M, y, W - M * 2, "MATERIALES Y MANO DE OBRA", DARK);
  y = itemsTable(doc, M, y, W - M * 2);

  /* ---- TOTAL ---- */
  y = checkPage(doc, y, 16);
  const tW = 78, tH = 12, tX = W - M - tW;
  doc.setFillColor(11, 17, 32); doc.roundedRect(tX, y, tW, tH, 2, 2, "F");
  doc.setFillColor(...RED); doc.rect(tX, y, 2.2, tH, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(200, 208, 224);
  doc.text("TOTAL", tX + 6, y + 7.6);
  doc.setFontSize(14); doc.setTextColor(52, 211, 153);
  const totalTxt = trim(state.total) ? "$ " + trim(state.total) : "$ —";
  doc.text(totalTxt, tX + tW - 5, y + 8, { align: "right" });
  y += tH + 8;

  /* ---- Daños ---- */
  y = checkPage(doc, y, 70);
  y += 2;
  y = sectionHeader(doc, M, y, W - M * 2, "DAÑOS LOCALIZADOS", RED);
  const danosTop = y;
  // left: text + chips
  const leftW = W - M * 2 - 70;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(40, 40, 50);
  const obsTxt = trim(state.danos.obs) || "Sin observaciones de daños.";
  const lines = doc.splitTextToSize(obsTxt, leftW);
  doc.text(lines, M, y + 5);
  let zy = y + 5 + lines.length * 4.5 + 3;
  doc.setFontSize(8); doc.setTextColor(...RED);
  if (state.danos.zonas.length) {
    doc.setFont("helvetica", "bold");
    doc.text("Zonas marcadas:", M, zy); zy += 4.5;
    doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 70);
    doc.splitTextToSize("• " + state.danos.zonas.join("   • "), leftW).forEach(l => {
      doc.text(l, M, zy); zy += 4.5;
    });
  }
  // right: schema
  drawSchema(doc, W - M - 62, danosTop + 2, state.danos.zonas);

  /* ---- Footer ---- */
  const ph = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...BLUE); doc.setLineWidth(0.4);
  doc.line(M, ph - 14, W - M, ph - 14);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...DARK);
  doc.text(COMPANY.name, M, ph - 9);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...GREY);
  doc.text("Tel: " + COMPANY.phone, W - M, ph - 9, { align: "right" });
  doc.text("Presupuesto sin validez fiscal. Precios a convenir.", M, ph - 5);

  applyWatermark(doc);

  if (returnDoc === true) return doc;
  const fname = `Presupuesto_TECNOTECH_${state.budgetNumber}.pdf`;
  doc.save(fname);
  toast("✅ PDF generado");
  return doc;
}

/* ---- Marca de agua TECNOTECH (leve, en todas las páginas) ---- */
function applyWatermark(doc) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    const hasG = typeof doc.GState === "function";
    if (hasG) doc.setGState(new doc.GState({ opacity: 0.05 }));
    doc.setFont("helvetica", "bold"); doc.setFontSize(26);
    doc.setTextColor(70, 90, 130);
    for (let yy = 18; yy < H + 20; yy += 40) {
      for (let xx = -6; xx < W + 50; xx += 78) {
        doc.text("TECNOTECH", xx, yy, { angle: 30 });
      }
    }
    if (hasG) doc.setGState(new doc.GState({ opacity: 1 }));
  }
}

/* ---- PDF helpers ---- */
function infoBox(doc, x, y, w, h, title, rows, color) {
  doc.setDrawColor(225, 228, 235); doc.setFillColor(247, 249, 252);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");
  doc.setFillColor(...color); doc.roundedRect(x, y, w, 5.5, 2, 2, "F");
  doc.rect(x, y + 3, w, 2.5, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255);
  doc.text(title, x + 3, y + 4);
  let ry = y + 11;
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(130, 138, 155);
    doc.text(k.toUpperCase(), x + 3, ry);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(30, 36, 52);
    doc.text(String(v), x + 3, ry + 4.5, { maxWidth: w - 6 });
    ry += 9;
  });
}

function sectionHeader(doc, x, y, w, title, color) {
  doc.setFillColor(...color); doc.roundedRect(x, y, w, 6.5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
  doc.text(title, x + 3, y + 4.5);
  return y + 6.5;
}

function textSection(doc, x, y, w, title, text, color) {
  text = trim(text) || "—";
  doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
  const lines = doc.splitTextToSize(text, w - 6);
  const bodyH = Math.max(8, lines.length * 4.8 + 5);
  y = checkPage(doc, y, bodyH + 10);
  y = sectionHeader(doc, x, y, w, title, color);
  doc.setDrawColor(225, 228, 235); doc.setFillColor(252, 253, 255);
  doc.roundedRect(x, y, w, bodyH, 1.5, 1.5, "FD");
  doc.setTextColor(35, 40, 55);
  doc.text(lines, x + 3, y + 5);
  return y + bodyH + 6;
}

function itemsTable(doc, x, y, w) {
  const qW = 30, cW = w - qW;
  // head
  doc.setFillColor(28, 38, 64); doc.rect(x, y, cW, 7, "F");
  doc.setFillColor(46, 58, 92); doc.rect(x + cW, y, qW, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(255, 255, 255);
  doc.text("CONCEPTO", x + 3, y + 4.7);
  doc.text("CANTIDAD", x + cW + qW / 2, y + 4.7, { align: "center" });
  y += 7;
  const rows = state.items.filter(it => trim(it.concepto) || trim(it.cantidad));
  const data = rows.length ? rows : [{ concepto: "—", cantidad: "" }];
  doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(35, 40, 55);
  data.forEach((it, i) => {
    const lines = doc.splitTextToSize(trim(it.concepto) || "—", cW - 6);
    const rh = Math.max(7, lines.length * 4.6 + 2.5);
    y = checkPage(doc, y, rh);
    if (i % 2 === 0) { doc.setFillColor(245, 247, 251); doc.rect(x, y, w, rh, "F"); }
    doc.setDrawColor(225, 228, 235);
    doc.rect(x, y, cW, rh); doc.rect(x + cW, y, qW, rh);
    doc.text(lines, x + 3, y + 4.6);
    doc.text(String(it.cantidad || ""), x + cW + qW / 2, y + 4.6, { align: "center" });
    y += rh;
  });
  return y + 6;
}

function drawSchema(doc, x, y, zonas) {
  const has = lbl => zonas.includes(lbl);
  const bx = x + 12, bw = 38, by = y + 5;

  doc.setTextColor(90, 90, 100); doc.setFont("helvetica", "bold"); doc.setFontSize(6.5);
  doc.text("Vista superior del vehículo", x + 4, y + 1);

  // ruedas
  doc.setFillColor(40, 46, 60);
  [[bx - 3.5, by + 7], [bx + bw + 0.5, by + 7], [bx - 3.5, by + 47], [bx + bw + 0.5, by + 47]]
    .forEach(([wx, wy]) => doc.roundedRect(wx, wy, 3, 9, 1, 1, "F"));
  // espejos
  doc.setDrawColor(120, 130, 150); doc.setLineWidth(0.4);
  doc.line(bx, by + 15, bx - 3, by + 13); doc.line(bx + bw, by + 15, bx + bw + 3, by + 13);

  // segmento (zona) — relleno rojo si está marcada
  const seg = (zx, zy, zw, zh, lbl, short, r) => {
    if (has(lbl)) doc.setFillColor(229, 57, 53); else doc.setFillColor(236, 239, 245);
    doc.setDrawColor(120, 130, 150); doc.setLineWidth(0.3);
    doc.roundedRect(zx, zy, zw, zh, r || 1.5, r || 1.5, "FD");
    doc.setTextColor(has(lbl) ? 255 : 120, has(lbl) ? 255 : 128, has(lbl) ? 255 : 145);
    doc.setFontSize(5.5); doc.setFont("helvetica", "bold");
    doc.text(short, zx + zw / 2, zy + zh / 2 + 1.1, { align: "center" });
  };
  // capó (frente, redondeado arriba)
  seg(bx, by, bw, 12, "Capó / Frente", "CAPÓ", 4);
  // fila central: izq | techo | der
  seg(bx, by + 14, 10, 26, "Lateral Izquierdo", "IZQ");
  seg(bx + 12, by + 14, 14, 26, "Techo", "TECHO");
  seg(bx + 28, by + 14, 10, 26, "Lateral Derecho", "DER");
  // baúl (trasera, redondeado abajo)
  seg(bx, by + 42, bw, 12, "Baúl / Trasera", "BAÚL", 4);
  // contorno carrocería
  doc.setDrawColor(70, 80, 110); doc.setLineWidth(0.8);
  doc.roundedRect(bx - 1, by - 1, bw + 2, 56, 6, 6, "S");
}

function checkPage(doc, y, needed) {
  const ph = doc.internal.pageSize.getHeight();
  if (y + needed > ph - 18) { doc.addPage(); return 16; }
  return y;
}

/* ============================================================
   WHATSAPP
   ============================================================ */
function shareWhatsApp() {
  // ensure PDF exists (download it)
  generatePDF();
  const msg = `Adjuntamos presupuesto ${COMPANY.name} N° ${state.budgetNumber}`;
  const url = "https://wa.me/?text=" + encodeURIComponent(msg);
  setTimeout(() => {
    window.open(url, "_blank");
    toast("📎 Adjuntá el PDF descargado en WhatsApp");
  }, 600);
}

/* ============================================================
   NUEVO PRESUPUESTO
   ============================================================ */
function newBudget() {
  if (!confirm("¿Crear un nuevo presupuesto? Se borrarán los datos actuales.")) return;
  state = blankState();
  currentStep = 1;
  save();
  renderItems();
  renderAll();
  showStep(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
  toast("🆕 Nuevo presupuesto " + state.budgetNumber);
}

/* ============================================================
   UTILS
   ============================================================ */
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function trim(s) { return (s || "").trim(); }
function fmtDate() {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}
