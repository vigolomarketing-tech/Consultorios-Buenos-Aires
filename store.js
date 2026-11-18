// Datos y lógica compartida entre la web (index.html) y el panel (admin.html).
// DEMO: guarda en localStorage del navegador. En producción esto se reemplaza por Supabase.
(function () {
  const mem = {};
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (mem[k] ?? d); } catch (e) { return mem[k] ?? d; } };
  const set = (k, v) => { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  const toM = h => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
  const fm = m => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");

  function nowAR() {
    const p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, weekday: "short" })
      .formatToParts(new Date()).reduce((a, x) => (a[x.type] = x.value, a), {});
    return { ymd: `${p.year}-${p.month}-${p.day}`, min: (+p.hour % 24) * 60 + +p.minute, dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday] };
  }
  function addDays(ymd, n) {
    const [y, m, d] = ymd.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + n));
    return { ymd: dt.toISOString().slice(0, 10), dow: dt.getUTCDay() };
  }

  function especialidades() {
    const ov = get("cba_esp", {});
    return CONFIG.especialidades.map(e => ({ activo: true, ...e, ...(ov[e.id] || {}) }));
  }
  function setOverride(id, patch) { const ov = get("cba_esp", {}); ov[id] = { ...(ov[id] || {}), ...patch }; set("cba_esp", ov); }

  // Horarios teóricos de un día (sin mirar disponibilidad)
  function gen(e, dow) {
    const out = [];
    (e.agenda[dow] || []).forEach(([a, b]) => {
      if (e.modalidad === "llegada") out.push({ hora: a, fin: b });
      else for (let m = toM(a); m + e.duracion <= toM(b); m += e.duracion) out.push({ hora: fm(m), fin: fm(m + e.duracion) });
    });
    return out;
  }

  function turnos() {
    let list = get("cba_turnos", null);
    const hoy = nowAR().ymd;
    if (!list || !list.some(t => t.demo && t.fecha >= hoy)) {
      list = (list || []).filter(t => !t.demo).concat(seed());
      set("cba_turnos", list);
    }
    return list;
  }
  function saveTurnos(l) { set("cba_turnos", l); }

  // Disponibilidad de un día para una prestación
  function slots(e, ymd, dow) {
    const hoy = nowAR(), ocupados = turnos().filter(t => t.fecha === ymd && t.espId === e.id && t.estado !== "cancelado");
    return gen(e, dow).map(s => ({ ...s, libre: (e.cupo || 1) - ocupados.filter(t => t.hora === s.hora).length }))
      .filter(s => s.libre > 0 && (ymd !== hoy.ymd || (e.modalidad === "llegada" ? toM(s.fin) - 15 : toM(s.hora) - CONFIG.anticipacionMin) > hoy.min));
  }

  function seed() {
    const hoy = nowAR(), nombres = ["María Gómez", "Lucas Fernández", "Rosa Benítez", "Julián Acosta", "Camila Ríos", "Héctor Sosa", "Valeria Núñez", "Tomás Villalba", "Noelia Paz", "Marcos Ledesma"];
    const out = []; let n = 0;
    for (let i = 0; i < 4; i++) {
      const d = addDays(hoy.ymd, i);
      especialidades().forEach((e, j) => {
        const g = gen(e, d.dow); if (!g.length || (i + j) % 2) return;
        const cant = e.porUnidad ? 1 + (n % 3) : 1, pagado = n % 3 !== 0, pasado = i === 0 && toM(g[0].hora) < hoy.min;
        out.push({ id: "DEMO" + (1000 + n), codigo: "CBA-" + (4100 + n), demo: true, fecha: d.ymd, hora: g[0].hora, espId: e.id, cant,
          paciente: nombres[n % nombres.length], dni: String(30000000 + n * 1234567).slice(0, 8), tel: "11 5" + (100 + n) + "-" + (2000 + n * 37),
          monto: e.precio * cant, pago: pagado ? (n % 2 ? "Mercado Pago" : "Transferencia") : "En consultorio", pagoEstado: pagado || pasado ? "pagado" : "pendiente",
          estado: pasado ? "atendido" : "confirmado" });
        n++;
      });
    }
    return out;
  }

  function nuevoCodigo() { return "CBA-" + Math.random().toString(36).slice(2, 6).toUpperCase(); }
  function abiertoAhora() {
    const n = nowAR(); return (CONFIG.horarios[n.dow] || []).some(([a, b]) => n.min >= toM(a) && n.min < toM(b));
  }
  const fmt = n => "$ " + Number(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reset = () => { set("cba_turnos", seed()); };

  window.Store = { nowAR, addDays, especialidades, setOverride, gen, slots, turnos, saveTurnos, nuevoCodigo, abiertoAhora, fmt, esc, reset, toM, get, set };
})();
