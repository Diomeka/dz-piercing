/* Génère une image d'attente ivoire & or tant qu'aucune vraie photo n'est ajoutée. */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

export function placeholder(label, type) {
    const h = hash(String(label) + type);
    const rot = h % 360;
    const r = 120 + (h % 40);
    let art;
    if (type === "braces") {
      // un sourire avec des attaches (brackets) reliées par un fil
      const n = 8;
      const attaches = Array.from({ length: n }, (_, i) => {
        const a = Math.PI * (0.18 + (0.64 * i) / (n - 1));
        const x = 300 - 190 * Math.cos(a), y = 210 + 110 * Math.sin(a);
        return `<rect x="${x - 17}" y="${y - 15}" width="34" height="30" rx="7" fill="url(#g)"/>`;
      }).join("");
      art = `
        <path d="M95 250 Q300 430 505 250" fill="none" stroke="#8a6a1255" stroke-width="3"/>
        <path d="M118 240 Q300 395 482 240" fill="none" stroke="url(#g)" stroke-width="6" stroke-linecap="round"/>
        ${attaches}`;
    } else if (type === "galerie") {
      art = `
        <circle cx="300" cy="270" r="${r}" fill="none" stroke="url(#g)" stroke-width="10" stroke-dasharray="${(h % 500) + 200} 2000" stroke-linecap="round" transform="rotate(${rot} 300 270)"/>
        <circle cx="300" cy="270" r="${r - 40}" fill="none" stroke="#8a6a1233" stroke-width="2"/>
        <circle cx="${300 + r * Math.cos(rot)}" cy="${270 + r * Math.sin(rot)}" r="16" fill="url(#g)"/>`;
    } else {
      art = `
        <circle cx="300" cy="270" r="${r}" fill="none" stroke="url(#g)" stroke-width="14" stroke-dasharray="${2 * Math.PI * r * 0.82} 2000" stroke-linecap="round" transform="rotate(${rot} 300 270)"/>
        <circle cx="${300 + r * Math.cos((rot * Math.PI) / 180)}" cy="${270 + r * Math.sin((rot * Math.PI) / 180)}" r="22" fill="url(#g)"/>`;
    }
    // le nom tient toujours dans l'image : police plus petite si le nom est long
    const texte = String(label).toUpperCase().slice(0, 30);
    const taille = Math.max(20, Math.min(40, Math.floor(540 / (texte.length * 0.72 + 1))));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#efe6d3"/></radialGradient>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e27a"/><stop offset=".5" stop-color="#d4af37"/><stop offset="1" stop-color="#9c7a22"/></linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(#bg)"/>
      ${art}
      <text x="300" y="510" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${taille}" letter-spacing="3" fill="#8a6a12">${esc(texte)}</text>
      <text x="300" y="550" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" letter-spacing="6" fill="#16130d66">PHOTO À VENIR</text>
    </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

