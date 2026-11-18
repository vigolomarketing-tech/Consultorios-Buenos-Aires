(function () {
  const { fmt, esc } = Store, $ = (s, r = document) => r.querySelector(s), app = $("#app");
  const PIN = "1234"; // DEMO. En producción: login real con Supabase Auth.
  let tab = "agenda", fecha = Store.nowAR().ymd, ok = false;
  const espName = id => { const e = Store.especialidades().find(x => x.id === id); return e ? e.nombre : id; };

  function login() {
    app.innerHTML = `<form id="lg" style="max-width:320px;margin:40px auto"><h2>Ingresar</h2><label for="pin">Clave</label><input id="pin" type="password" inputmode="numeric" autofocus><p class="err" id="err"></p><button class="btn" style="width:100%;margin-top:12px">Entrar</button></form>`;
    $("#lg").onsubmit = e => { e.preventDefault(); if ($("#pin").value === PIN) { ok = true; draw(); } else $("#err").textContent = "Clave incorrecta."; };
  }

  function draw() {
    app.innerHTML = `<div class="tabs"><button data-t="agenda" class="${tab === "agenda" ? "on" : ""}">Agenda y cobros</button><button data-t="precios" class="${tab === "precios" ? "on" : ""}">Precios y agenda</button></div><div id="v"></div>`;
    app.querySelector(".tabs").onclick = e => { const b = e.target.closest("[data-t]"); if (b) { tab = b.dataset.t; draw(); } };
    tab === "agenda" ? agenda() : precios();
  }

  function agenda() {
    const all = Store.turnos(), dia = all.filter(t => t.fecha === fecha).sort((a, b) => a.hora.localeCompare(b.hora)), vivos = dia.filter(t => t.estado !== "cancelado");
    const cobrado = vivos.filter(t => t.pagoEstado === "pagado").reduce((s, t) => s + t.monto, 0), aCobrar = vivos.filter(t => t.pagoEstado !== "pagado").reduce((s, t) => s + t.monto, 0);
    $("#v").innerHTML = `<div class="row" style="align-items:end;flex-wrap:wrap"><div><label for="fd">Día</label><input id="fd" type="date" value="${fecha}"></div><div style="flex:0"><button class="mini pri" id="csv" style="min-height:46px;white-space:nowrap">Descargar CSV</button></div></div>
      <div class="kpis"><div class="kpi"><small>Turnos del día</small><b>${vivos.length}</b></div><div class="kpi"><small>Cobrado</small><b>${fmt(cobrado)}</b></div><div class="kpi"><small>A cobrar</small><b>${fmt(aCobrar)}</b></div></div>
      <div class="scroll"><table class="tbl"><thead><tr><th>Hora</th><th>Paciente</th><th>Prestación</th><th>Importe</th><th>Pago</th><th>Estado</th><th></th></tr></thead><tbody>
      ${dia.map(t => `<tr><td><b>${t.hora}</b>${t.orden ? `<br><small>Nº ${t.orden}</small>` : ""}</td><td>${esc(t.paciente)}<br><small>DNI ${esc(t.dni)} · ${esc(t.tel)}</small></td><td>${esc(espName(t.espId))}${t.cant > 1 ? " ×" + t.cant : ""}</td><td>${fmt(t.monto)}</td>
        <td>${esc(t.pago)}<br><span class="tag ${t.pagoEstado === "por verificar" ? "verificar" : t.pagoEstado}">${t.pagoEstado}</span></td><td><span class="tag ${t.estado}">${t.estado}</span></td>
        <td>${t.estado === "cancelado" ? "" : `${t.pagoEstado !== "pagado" ? `<button class="mini pri" data-a="cobrar" data-id="${t.id}">Cobrar</button>` : ""}${t.estado !== "atendido" ? `<button class="mini" data-a="atendido" data-id="${t.id}">Atendido</button>` : ""}<button class="mini" data-a="cancelado" data-id="${t.id}">Cancelar</button>`}</td></tr>`).join("") || `<tr><td colspan="7" class="muted">No hay turnos para este día.</td></tr>`}
      </tbody></table></div>`;
    $("#fd").onchange = e => { fecha = e.target.value || fecha; agenda(); };
    $("#v").onclick = e => {
      const b = e.target.closest("[data-a]"); if (b) {
        const list = Store.turnos(), t = list.find(x => x.id === b.dataset.id);
        if (b.dataset.a === "cobrar") t.pagoEstado = "pagado"; else t.estado = b.dataset.a;
        if (b.dataset.a === "cancelado" && !confirm("¿Cancelar este turno? Se libera el horario.")) return;
        Store.saveTurnos(list); agenda();
      }
      if (e.target.closest("#csv")) csv();
    };
  }

  function csv() {
    const rows = [["Fecha", "Hora", "Paciente", "DNI", "Celular", "Prestación", "Cantidad", "Importe", "Medio de pago", "Estado de pago", "Estado", "Código"]].concat(Store.turnos().sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora)).map(t => [t.fecha, t.hora, t.paciente, t.dni, t.tel, espName(t.espId), t.cant, t.monto, t.pago, t.pagoEstado, t.estado, t.codigo]));
    const txt = "﻿" + rows.map(r => r.map(c => '"' + String(c ?? "").replace(/"/g, '""') + '"').join(";")).join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" })); a.download = "turnos.csv"; a.click();
  }

  function precios() {
    $("#v").innerHTML = `<p class="muted">Cambiá los precios, los cupos o pausá una prestación. Se actualiza al instante en la web.</p><div class="scroll"><table class="tbl"><thead><tr><th>Prestación</th><th>Modalidad</th><th>Precio${""}</th><th>Cupo por horario</th><th>Visible en la web</th></tr></thead><tbody>
      ${Store.especialidades().map(e => `<tr><td>${icon(e)} <b>${esc(e.nombre)}</b>${e.porUnidad ? `<br><small>precio por ${e.unidad}</small>` : ""}</td><td>${e.modalidad === "llegada" ? "Orden de llegada" : "Turno cada " + e.duracion + " min"}</td>
      <td><input type="number" min="0" step="500" value="${e.precio}" data-id="${e.id}" data-k="precio"></td><td><input type="number" min="1" max="50" value="${e.cupo}" data-id="${e.id}" data-k="cupo" style="width:80px"></td>
      <td><input type="checkbox" ${e.activo ? "checked" : ""} data-id="${e.id}" data-k="activo" style="width:24px;height:24px"></td></tr>`).join("")}</tbody></table></div>
      <p style="margin-top:18px"><button class="mini" id="rst">Restablecer datos de demostración</button></p>`;
    $("#v").onchange = e => { const i = e.target; if (!i.dataset.k) return; Store.setOverride(i.dataset.id, { [i.dataset.k]: i.type === "checkbox" ? i.checked : Math.max(0, +i.value || 0) }); };
    $("#rst").onclick = () => { if (confirm("Se borran los turnos cargados y se vuelve a los datos de ejemplo.")) { Store.reset(); precios(); } };
  }

  login();
})();
