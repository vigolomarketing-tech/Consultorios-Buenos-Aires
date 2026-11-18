// CONFIG — Consultorios Buenos Aires (demo de turnos y pagos)
// Todo lo que cambia de un centro a otro vive acá. // PENDIENTE CLIENTE = dato a confirmar.

const CONFIG = {
  negocio: {
    nombre: "Consultorios Buenos Aires",
    rubro: "Centro médico",
    localidad: "Longchamps",
    eslogan: "Sacá tu turno y pagá tu consulta desde el celular",
  },

  colores: { primario: "#1f5fd1", acento: "#e84b8a", fondo: "#f5f8fc", texto: "#14213d" },

  contacto: {
    whatsapp: "5491167198335",
    mensajeWhatsapp: "¡Hola! Vi su web y quería consultar...",
    telefono: "+54 11 6085-3180", // llamadas; el WhatsApp es 11 6719-8335
    direccion: "Manuel Belgrano 1266, Longchamps, Buenos Aires",
    mapsEmbed: "https://www.google.com/maps?q=Manuel+Belgrano+1266+Longchamps&output=embed",
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Manuel+Belgrano+1266+Longchamps",
    instagram: "https://instagram.com/consultoriosbuenosaires",
  },

  // 0 = domingo ... 6 = sábado
  horarios: {
    0: [],
    1: [["09:30", "19:30"]],
    2: [["09:30", "19:30"]],
    3: [["09:30", "19:30"]],
    4: [["09:30", "19:30"]],
    5: [["09:30", "19:30"]],
    6: [["09:30", "14:30"]],
  },

  diasAdelante: 21,
  anticipacionMin: 30, // minutos mínimos antes del turno para poder reservar

  pago: {
    transferencia: { alias: "consultorios.ba", titular: "Consultorios Buenos Aires" }, // PENDIENTE CLIENTE
    politicaCancelacion: "Podés cancelar o reprogramar escribiéndonos por WhatsApp hasta 2 horas antes. Si pagaste online, te devolvemos el importe.",
  },

  // modalidad: "turno" (horarios cada X min, 1 persona por horario) | "llegada" (franja con cupo, se atiende por orden de llegada)
  // Precios reales confirmados por WhatsApp: Traumatología $30.000 y placa $19.000.
  // El resto de precios, días y horarios son de ejemplo: PENDIENTE CLIENTE.
  especialidades: [
    { id: "traumatologia", nombre: "Traumatología", icono: "🦴", tipo: "consulta", modalidad: "llegada", cupo: 12, precio: 30000,
      agenda: ag([1, 2, 3, 4, 5], [["13:00", "15:00"]]) },
    consulta("clinica", "Clínica médica", "🩺", 20000, 20, ag([1, 2, 3, 4], [["10:00", "13:00"], ["16:00", "19:00"]], { 5: [["10:00", "13:00"]] })),
    consulta("pediatria", "Pediatría", "🧸", 22000, 20, ag([1, 3, 5], [["16:00", "19:00"]], { 6: [["10:00", "14:00"]] })),
    consulta("recien-nacidos", "Recién nacidos", "👶", 22000, 30, ag([3], [["10:00", "13:00"]])),
    consulta("ginecologia", "Ginecología", "🌸", 25000, 20, ag([2, 4], [["10:00", "13:00"]])),
    consulta("cardiologia", "Cardiología", "❤️", 28000, 30, ag([1, 3], [["15:00", "18:00"]])),
    consulta("dermatologia", "Dermatología", "✨", 25000, 20, ag([2, 4], [["16:00", "19:00"]])),
    consulta("neurologia", "Neurología", "🧠", 28000, 30, ag([1, 4], [["10:00", "13:00"]])),
    consulta("oftalmologia", "Oftalmología", "👁️", 25000, 20, ag([1, 3], [["10:00", "13:00"]])),
    consulta("otorrino", "Otorrinolaringología", "👂", 25000, 20, ag([3], [["15:00", "18:00"]], { 6: [["10:00", "13:00"]] })),
    consulta("urologia", "Urología", "🚻", 26000, 20, ag([2, 5], [["16:00", "19:00"]])),
    consulta("nefrologia", "Nefrología", "💧", 26000, 30, ag([2], [["15:00", "18:00"]])),
    consulta("gastroenterologia", "Gastroenterología", "🫃", 26000, 20, ag([3], [["10:00", "13:00"]], { 5: [["15:00", "18:00"]] })),
    consulta("flebologia", "Flebología", "🦵", 26000, 20, ag([4], [["16:00", "19:00"]])),
    consulta("hematologia", "Hematología", "🩸", 26000, 30, ag([5], [["10:00", "13:00"]])),
    consulta("cirugia", "Cirugía", "🏥", 26000, 20, ag([2, 4], [["14:00", "16:00"]])),
    consulta("psiquiatria", "Psiquiatría", "💬", 30000, 40, ag([1, 4], [["15:00", "19:00"]])),
    consulta("nutricion", "Nutrición", "🍎", 20000, 30, ag([2, 4], [["10:00", "13:00"]])),
    estudio("radiografia", "Radiografías (placas)", "☢️", 19000, 10, ag([1, 2, 3, 4, 5], [["09:30", "19:30"]], { 6: [["09:30", "14:30"]] }), { porUnidad: true, unidad: "placa" }),
    estudio("ecografia", "Ecografías", "🔊", 35000, 20, ag([2, 4], [["09:30", "13:00"]], { 6: [["09:30", "13:00"]] })),
    estudio("resonancia", "Resonancias", "🧲", 120000, 45, ag([1, 3, 5], [["09:30", "13:00"]])),
  ],
};

// --- helpers para armar la lista ---
function ag(dias, rangos, extra) { const o = {}; dias.forEach(d => (o[d] = rangos)); return Object.assign(o, extra || {}); }
function consulta(id, nombre, icono, precio, duracion, agenda) { return { id, nombre, icono, tipo: "consulta", modalidad: "turno", duracion, cupo: 1, precio, agenda }; }
function estudio(id, nombre, icono, precio, duracion, agenda, extra) { return { id, nombre, icono, tipo: "estudio", modalidad: "turno", duracion, cupo: 1, precio, agenda, ...extra }; }
