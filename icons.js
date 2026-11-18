// Íconos de línea (24x24). icon(e) devuelve el SVG de una prestación.
(function () {
  const P = {
    stetho: "M6 3v6a4 4 0 0 0 8 0V3M10 13v2a5 5 0 0 0 10 0v-1.5M20 9.500a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
    heart: "M12 20s-7.500-4.500-7.500-10.200A4.200 4.200 0 0 1 12 7.600a4.200 4.200 0 0 1 7.500 2.200C19.500 15.500 12 20 12 20z",
    brain: "M9 4.500a3 3 0 0 0-3 3 3 3 0 0 0-2 2.800 3 3 0 0 0 2 2.800 3 3 0 0 0 3 4.400V4.500zM15 4.500a3 3 0 0 1 3 3 3 3 0 0 1 2 2.800 3 3 0 0 1-2 2.800 3 3 0 0 1-3 4.400V4.500z",
    eye: "M2 12s3.800-6.500 10-6.500S22 12 22 12s-3.800 6.500-10 6.500S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    ear: "M7 9.500a5 5 0 0 1 10 0c0 3-3 3.500-3 6.500a3 3 0 0 1-5.500 1.500M10 9.500a2 2 0 0 1 4 0",
    bone: "M7.500 6.500a2.200 2.200 0 1 0-3.100 3 2.200 2.200 0 1 0 3 3.100l4.600 4.600a2.200 2.200 0 1 0 3 3.100 2.200 2.200 0 1 0 3.100-3 2.200 2.200 0 1 0-3-3.100L10.600 9.600a2.200 2.200 0 0 0-3.100-3.100z",
    baby: "M12 3.500a8.500 8.500 0 1 0 0 17 8.500 8.500 0 0 0 0-17zM9 10.500h.01M15 10.500h.01M9 14.500c1.500 1.300 4.500 1.300 6 0M12 3.500c1.500 0 2 1 1.500 2",
    drop: "M12 3.500s6 6.200 6 10.500a6 6 0 0 1-12 0C6 9.700 12 3.500 12 3.500z",
    scan: "M4 8V5.500A1.500 1.500 0 0 1 5.500 4H8M16 4h2.500A1.500 1.500 0 0 1 20 5.500V8M20 16v2.500a1.500 1.500 0 0 1-1.500 1.500H16M8 20H5.500A1.500 1.500 0 0 1 4 18.500V16M4 12h16",
    wave: "M2 12h4l2.500-6 4 12 3-9 1.500 3H22",
    ring: "M12 3.500a8.500 8.500 0 1 0 0 17 8.500 8.500 0 0 0 0-17zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    apple: "M12 7.500C9 5.500 5 7.500 5 12.500c0 4 2.800 8 5 8 1 0 1.300-.5 2-.5s1 .5 2 .5c2.200 0 5-4 5-8 0-5-4-7-7-5zM12 7.500c0-2 1-3.500 3-4",
    spark: "M12 3l2 5.500L19.500 10.500 14 12.500 12 18l-2-5.500L4.500 10.500 10 8.500z",
    venus: "M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 13v8M9 18h6",
    chat: "M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 10h8M8 13h5",
    knife: "M4 20l10-10M14 10l5.500-5.500a2 2 0 0 0-3-3L11 7zM6 14l4 4",
    leg: "M9 3c0 4 1 6 1 9s-1 4-1 9M15 3c0 4-1 6-1 9s1 4 1 9",
    gut: "M7 4h10v5c0 2-1 2-1 4s2 2 2 4a3 3 0 0 1-6 0c0-2-2-2-2-4s-3-3-3-6z",
    check: "M5 12.500l4.500 4.500L19 7.500",
    shield: "M12 3l7 3v5c0 5-3.500 8.500-7 10-3.500-1.500-7-5-7-10V6z",
    cal: "M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4",
    clock: "M12 3.500a8.500 8.500 0 1 0 0 17 8.500 8.500 0 0 0 0-17zM12 8v4.500l3 1.500",
  };
  const MAP = { traumatologia: "bone", cardiologia: "heart", neurologia: "brain", oftalmologia: "eye", otorrino: "ear", "recien-nacidos": "baby", pediatria: "baby",
    urologia: "drop", nefrologia: "drop", hematologia: "drop", radiografia: "scan", ecografia: "wave", resonancia: "ring", nutricion: "apple", dermatologia: "spark",
    ginecologia: "venus", psiquiatria: "chat", cirugia: "knife", flebologia: "leg", gastroenterologia: "gut" };
  const svg = (k, s = 24) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[k]}"/></svg>`;
  window.icon = e => `<span class="ico">${svg(MAP[e.id] || "stetho")}</span>`;
  window.svgIcon = svg;
})();
