(function () {
  const { fmt, esc, nowAR, addDays } = Store;
  const $ = (s, r = document) => r.querySelector(s);
  const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"], MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const DIAS_L = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const C = CONFIG.contacto, wiz = $("#wiz");
  const S = { paso: 1, esp: null, cant: 1, fecha: null, slot: null, datos: {}, pago: "online", turno: null };
  const total = () => S.esp.precio * (S.esp.porUnidad ? S.cant : 1);
  const fechaLarga = ymd => { const [y, m, d] = ymd.split("-").map(Number), dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); return `${DIAS_L[dow]} ${d} de ${MESES[m - 1]}`; };
  const wa = txt => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(txt)}`;

  // ---- contenido estático desde CONFIG ----
  const abierto = $("#abierto"); const ab = Store.abiertoAhora();
  abierto.textContent = ab ? "Abierto ahora" : "Cerrado ahora"; abierto.classList.toggle("off", !ab);
  $("#waHero").href = $("#waFloat").href = wa(C.mensajeWhatsapp);
  $("#dir").textContent = $("#footDir").textContent = C.direccion;
  $("#comoLlegar").href = C.mapsLink; $("#llamar").href = "tel:" + C.telefono.replace(/[^\d+]/g, ""); $("#mapa").src = C.mapsEmbed;
  $("#anio").textContent = new Date().getFullYear(); $("#faqCancel").textContent = CONFIG.pago.politicaCancelacion;
  $("#horarios").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => { const h = CONFIG.horarios[d]; return `<li><span>${DIAS_L[d][0].toUpperCase() + DIAS_L[d].slice(1)}</span><span>${h.length ? h.map(([a, b]) => `${a} - ${b}`).join(" / ") : "Cerrado"}</span></li>`; }).join("");

  // ---- wizard ----
  const NOMBRES = ["Prestación", "Día y hora", "Tus datos", "Pago"];
  const head = n => `<ol class="steps">${NOMBRES.map((t, i) => `<li class="${i + 1 === n ? "on" : i + 1 < n ? "done" : ""}">${i + 1}. ${t}</li>`).join("")}</ol>`;
  const go = n => { S.paso = n; render(); wiz.scrollIntoView({ behavior: "smooth", block: "start" }); };
  function render() { [null, r1, r2, r3, r4, r5][S.paso](); }

  function r1() {
    const norm = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const todas = Store.especialidades().filter(e => e.activo);
    const cards = () => todas.filter(e => (S.tipo === "todas" || e.tipo === S.tipo) && norm(e.nombre).includes(norm(S.q || ""))).map(e =>
      `<button class="card ${S.esp && S.esp.id === e.id ? "sel" : ""}" data-id="${e.id}"><span class="ic">${e.icono}</span><b>${esc(e.nombre)}</b>
      <small>${e.tipo === "estudio" ? "Estudio" : "Consulta"} · ${e.modalidad === "llegada" ? "Orden de llegada" : "Con turno"}</small>
      <span class="precio">${fmt(e.precio)}${e.porUnidad ? " cada " + e.unidad : ""}</span></button>`).join("") || `<p class="muted">No encontramos esa especialidad. Escribinos por WhatsApp y te ayudamos.</p>`;
    S.tipo = S.tipo || "todas";
    wiz.innerHTML = head(1) + `<h3>¿Qué necesitás?</h3><input id="q" type="search" placeholder="Buscar especialidad o estudio" aria-label="Buscar especialidad o estudio" value="${esc(S.q || "")}">
      <div class="filtros">${[["todas", "Todas"], ["consulta", "Consultas"], ["estudio", "Estudios"]].map(([k, t]) => `<button type="button" class="chip ${S.tipo === k ? "on" : ""}" data-tipo="${k}">${t}</button>`).join("")}</div>
      <div class="grid" id="grid">${cards()}</div>`;
    $("#q").oninput = e => { S.q = e.target.value; $("#grid").innerHTML = cards(); };
    wiz.onclick = ev => {
      const c = ev.target.closest("[data-tipo]"); if (c) { S.tipo = c.dataset.tipo; wiz.querySelectorAll(".chip").forEach(x => x.classList.toggle("on", x === c)); $("#grid").innerHTML = cards(); return; }
      const b = ev.target.closest(".card"); if (!b) return; S.esp = todas.find(e => e.id === b.dataset.id); S.cant = 1; S.fecha = S.slot = null; go(2);
    };
  }

  function r2() {
    const e = S.esp, hoy = nowAR();
    const dias = [...Array(CONFIG.diasAdelante)].map((_, i) => { const d = addDays(hoy.ymd, i); return { ...d, n: Store.slots(e, d.ymd, d.dow).length }; });
    if (!S.fecha || !dias.find(d => d.ymd === S.fecha && d.n)) S.fecha = (dias.find(d => d.n) || {}).ymd || null;
    wiz.innerHTML = head(2) + `<h3>${e.icono} ${esc(e.nombre)}</h3>
      ${e.porUnidad ? `<label>¿Cuántas ${e.unidad}s?</label><div class="stepper"><button type="button" data-q="-1" aria-label="Menos">−</button><output>${S.cant}</output><button type="button" data-q="1" aria-label="Más">+</button></div>` : ""}
      ${e.tipo === "estudio" ? `<div class="note info">Traé la orden médica del estudio (impresa o en el celular).</div>` : ""}
      <label>Elegí el día</label>
      <div class="dias">${dias.map(d => { const [, m, dd] = d.ymd.split("-").map(Number); return `<button class="dia ${d.ymd === S.fecha ? "sel" : ""}" data-f="${d.ymd}" ${d.n ? "" : "disabled"}><small>${DIAS[d.dow]}</small><b>${dd}</b><small>${MESES[m - 1]}</small></button>`; }).join("")}</div>
      <label>${e.modalidad === "llegada" ? "Franja de atención" : "Elegí el horario"}</label><div id="horas" class="horas"></div>
      <div class="actions"><button class="btn-link" data-back>← Cambiar prestación</button><button class="btn" id="sig" ${S.slot ? "" : "disabled"}>Continuar</button></div>`;
    drawSlots();
    wiz.onclick = ev => {
      const t = ev.target;
      if (t.closest("[data-back]")) return go(1);
      const q = t.closest("[data-q]"); if (q) { S.cant = Math.min(10, Math.max(1, S.cant + +q.dataset.q)); return r2(); }
      const f = t.closest("[data-f]"); if (f) { S.fecha = f.dataset.f; S.slot = null; wiz.querySelectorAll(".dia").forEach(x => x.classList.toggle("sel", x === f)); $("#sig").disabled = true; return drawSlots(); }
      const h = t.closest("[data-h]"); if (h) { S.slot = S.slots.find(s => s.hora === h.dataset.h); wiz.querySelectorAll("[data-h]").forEach(x => x.classList.toggle("sel", x === h)); $("#sig").disabled = false; }
      if (t.closest("#sig")) go(3);
    };
  }
  function drawSlots() {
    const e = S.esp, box = $("#horas"); if (!S.fecha) { box.innerHTML = `<p class="muted">No hay turnos disponibles en los próximos días. Escribinos por WhatsApp.</p>`; return; }
    const dow = new Date(S.fecha + "T12:00:00Z").getUTCDay(); S.slots = Store.slots(e, S.fecha, dow);
    box.innerHTML = S.slots.map(s => e.modalidad === "llegada"
      ? `<button class="hora big ${S.slot && S.slot.hora === s.hora ? "sel" : ""}" data-h="${s.hora}">Presentate desde las <b>${s.hora} hs</b> · se atiende por orden de llegada · quedan ${s.libre} lugares</button>`
      : `<button class="hora ${S.slot && S.slot.hora === s.hora ? "sel" : ""}" data-h="${s.hora}">${s.hora}</button>`).join("");
  }

  function r3() {
    const d = S.datos;
    wiz.innerHTML = head(3) + `<h3>Tus datos</h3><form id="f" novalidate>
      <label for="n">Nombre y apellido</label><input id="n" required autocomplete="name" value="${esc(d.nombre)}">
      <div class="row"><div><label for="dni">DNI</label><input id="dni" required inputmode="numeric" pattern="[0-9]{7,8}" maxlength="8" autocomplete="off" value="${esc(d.dni)}"></div>
      <div><label for="tel">Celular</label><input id="tel" required type="tel" inputmode="tel" autocomplete="tel" placeholder="11 5555-5555" value="${esc(d.tel)}"></div></div>
      <label for="mail">Email (opcional)</label><input id="mail" type="email" autocomplete="email" value="${esc(d.mail)}">
      <label for="mot">Motivo de consulta (opcional)</label><textarea id="mot" rows="2">${esc(d.motivo)}</textarea>
      <p class="err" id="err"></p>
      <div class="actions"><button type="button" class="btn-link" data-back>← Volver</button><button class="btn">Continuar</button></div></form>`;
    wiz.onclick = ev => { if (ev.target.closest("[data-back]")) go(2); };
    $("#f").onsubmit = ev => {
      ev.preventDefault();
      const v = id => $("#" + id).value.trim(), dni = v("dni").replace(/\D/g, ""), tel = v("tel").replace(/\D/g, "");
      const err = !v("n") || v("n").length < 3 ? "Escribí tu nombre y apellido." : !/^\d{7,8}$/.test(dni) ? "El DNI debe tener 7 u 8 números." : tel.length < 8 ? "Revisá tu número de celular." : v("mail") && !/^\S+@\S+\.\S+$/.test(v("mail")) ? "Revisá el email." : "";
      if (err) { $("#err").textContent = err; return; }
      S.datos = { nombre: v("n"), dni, tel: v("tel"), mail: v("mail"), motivo: v("mot") }; go(4);
    };
  }

  function r4() {
    const e = S.esp, t = CONFIG.pago.transferencia;
    wiz.innerHTML = head(4) + `<h3>Confirmá y pagá</h3>
      <div class="resumen"><div><span>${e.icono} ${esc(e.nombre)}${e.porUnidad ? " × " + S.cant : ""}</span><b>${fmt(total())}</b></div>
      <div><span>Día</span><span>${fechaLarga(S.fecha)}</span></div><div><span>${e.modalidad === "llegada" ? "Desde las" : "Hora"}</span><span>${S.slot.hora} hs</span></div>
      <div><span>Paciente</span><span>${esc(S.datos.nombre)}</span></div><div class="tot"><span>Total</span><span>${fmt(total())}</span></div></div>
      <div class="pagos">
        <label class="pago ${S.pago === "online" ? "sel" : ""}"><input type="radio" name="p" value="online" ${S.pago === "online" ? "checked" : ""}><span><b>Pagar ahora con Mercado Pago</b><small>Tarjeta, dinero en cuenta o débito. Tu turno queda pagado.</small></span></label>
        <label class="pago ${S.pago === "transferencia" ? "sel" : ""}"><input type="radio" name="p" value="transferencia" ${S.pago === "transferencia" ? "checked" : ""}><span><b>Transferencia bancaria</b><small>Alias: <b style="display:inline">${esc(t.alias)}</b> · ${esc(t.titular)}. Te pedimos el comprobante por WhatsApp.</small></span></label>
        <label class="pago ${S.pago === "consultorio" ? "sel" : ""}"><input type="radio" name="p" value="consultorio" ${S.pago === "consultorio" ? "checked" : ""}><span><b>Pagar en el consultorio</b><small>Efectivo o mitad efectivo y mitad transferencia, al momento de la consulta.</small></span></label>
      </div><p class="err" id="err"></p>
      <div class="actions"><button class="btn-link" data-back>← Volver</button><button class="btn" id="conf"></button></div>`;
    const lbl = () => $("#conf").textContent = S.pago === "online" ? `Pagar ${fmt(total())}` : "Confirmar turno";
    lbl();
    wiz.onclick = ev => { if (ev.target.closest("[data-back]")) go(3); if (ev.target.closest("#conf")) { S.pago === "online" ? abrirMP() : finalizar(S.pago === "transferencia" ? "Transferencia" : "En consultorio", S.pago === "transferencia" ? "por verificar" : "pendiente"); } };
    wiz.onchange = ev => { if (ev.target.name === "p") { S.pago = ev.target.value; wiz.querySelectorAll(".pago").forEach(l => l.classList.toggle("sel", l.querySelector("input").checked)); lbl(); } };
  }

  // Mercado Pago SIMULADO. En producción: crear preferencia de pago en un Cloudflare Worker y redirigir al checkout real.
  function abrirMP() {
    const dlg = $("#mp");
    dlg.innerHTML = `<h3>Mercado Pago (simulado)</h3><p>Vas a pagar <b>${fmt(total())}</b> a Consultorios Buenos Aires.</p><p class="muted" style="font-size:14px">Esto es una demostración: no se cobra nada ni se piden datos de tarjeta. En la versión real se abre el checkout oficial de Mercado Pago.</p><div class="actions"><button class="btn-link" id="mpc">Cancelar</button><button class="btn" id="mpok">Simular pago aprobado</button></div>`;
    dlg.showModal();
    $("#mpc").onclick = () => dlg.close();
    $("#mpok").onclick = () => { dlg.innerHTML = `<h3>Procesando pago…</h3><div class="spin"></div>`; setTimeout(() => { dlg.close(); finalizar("Mercado Pago", "pagado"); }, 1300); };
  }

  function finalizar(medio, pagoEstado) {
    const e = S.esp, dow = new Date(S.fecha + "T12:00:00Z").getUTCDay(), s = Store.slots(e, S.fecha, dow).find(x => x.hora === S.slot.hora);
    if (!s) { alert("Ese horario se acaba de ocupar. Elegí otro, por favor."); S.slot = null; return go(2); }
    const list = Store.turnos(), orden = e.modalidad === "llegada" ? list.filter(t => t.fecha === S.fecha && t.espId === e.id && t.estado !== "cancelado").length + 1 : null;
    S.turno = { id: "T" + Date.now(), codigo: Store.nuevoCodigo(), fecha: S.fecha, hora: S.slot.hora, espId: e.id, cant: S.cant, orden, paciente: S.datos.nombre, dni: S.datos.dni, tel: S.datos.tel, mail: S.datos.mail, motivo: S.datos.motivo, monto: total(), pago: medio, pagoEstado, estado: "confirmado" };
    list.push(S.turno); Store.saveTurnos(list); go(5);
  }

  function r5() {
    const t = S.turno, e = S.esp, pag = t.pagoEstado === "pagado" ? "✅ Pago acreditado" : t.pagoEstado === "por verificar" ? `⏳ Transferí ${fmt(t.monto)} al alias <b>${esc(CONFIG.pago.transferencia.alias)}</b> y mandanos el comprobante` : `💵 Pagás ${fmt(t.monto)} en el consultorio`;
    const msg = `¡Hola! Saqué un turno por la web.\nCódigo: ${t.codigo}\n${e.nombre}${e.porUnidad ? " x" + t.cant : ""}\n${fechaLarga(t.fecha)} - ${t.hora} hs\nPaciente: ${t.paciente} (DNI ${t.dni})` + (t.pagoEstado === "por verificar" ? `\nAdjunto el comprobante de transferencia por ${fmt(t.monto)}.` : "");
    wiz.innerHTML = `<div class="ok"><div class="big">✅</div><h3>¡Turno confirmado!</h3><div class="codigo">${t.codigo}</div>
      <div class="resumen" style="text-align:left"><div><span>${e.icono} ${esc(e.nombre)}${e.porUnidad ? " × " + t.cant : ""}</span></div><div><span>Día</span><b>${fechaLarga(t.fecha)}</b></div>
      <div><span>${t.orden ? "Presentate desde las" : "Hora"}</span><b>${t.hora} hs</b></div>${t.orden ? `<div><span>Tu orden de llegada</span><b>Nº ${t.orden}</b></div>` : ""}
      <div><span>Dirección</span><span>${esc(C.direccion)}</span></div><div><span>Pago</span><span>${pag}</span></div></div>
      ${e.tipo === "estudio" ? `<div class="note info">Acordate de traer la orden médica.</div>` : ""}
      <p class="muted" style="font-size:14px">${esc(CONFIG.pago.politicaCancelacion)}</p>
      <div class="cta" style="justify-content:center"><a class="btn" href="${wa(msg)}" target="_blank" rel="noopener">${t.pagoEstado === "por verificar" ? "Enviar comprobante por WhatsApp" : "Enviar por WhatsApp"}</a><button class="btn btn-ghost" id="ics">Agregar al calendario</button></div>
      <button class="btn-link" id="otro">Sacar otro turno</button></div>`;
    $("#ics").onclick = () => descargarICS(t, e);
    $("#otro").onclick = () => { Object.assign(S, { esp: null, fecha: null, slot: null, turno: null, cant: 1 }); go(1); };
    wiz.onclick = null; wiz.onchange = null;
  }

  function descargarICS(t, e) {
    const f = t.fecha.replace(/-/g, ""), h = t.hora.replace(":", "") + "00", fin = Store.toM(t.hora) + (e.modalidad === "llegada" ? 60 : e.duracion), hf = String(Math.floor(fin / 60)).padStart(2, "0") + String(fin % 60).padStart(2, "0") + "00";
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Consultorios Buenos Aires//ES", "BEGIN:VEVENT", "UID:" + t.codigo + "@consultoriosbuenosaires", "DTSTAMP:" + new Date().toISOString().replace(/[-:]|\.\d+/g, ""),
      `DTSTART;TZID=America/Argentina/Buenos_Aires:${f}T${h}`, `DTEND;TZID=America/Argentina/Buenos_Aires:${f}T${hf}`, `SUMMARY:Turno ${e.nombre} - Consultorios Buenos Aires`, "LOCATION:" + C.direccion, "DESCRIPTION:Código " + t.codigo, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "turno-" + t.codigo + ".ics"; a.click();
  }

  render();
})();
