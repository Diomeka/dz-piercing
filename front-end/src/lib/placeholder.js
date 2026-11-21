/* Génère une image d'attente noir & or tant qu'aucune vraie photo n'est ajoutée. */

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
    if (type === "bracelet") {
      art = `
        <ellipse cx="300" cy="280" rx="170" ry="80" fill="none" stroke="url(#g)" stroke-width="22" stroke-dasharray="34 10" transform="rotate(${(rot % 30) - 15} 300 280)"/>
        <circle cx="300" cy="360" r="14" fill="url(#g)"/>`;
    } else if (type === "galerie") {
      art = `
        <circle cx="300" cy="270" r="${r}" fill="none" stroke="url(#g)" stroke-width="10" stroke-dasharray="${(h % 500) + 200} 2000" stroke-linecap="round" transform="rotate(${rot} 300 270)"/>
        <circle cx="300" cy="270" r="${r - 40}" fill="none" stroke="#ffffff22" stroke-width="2"/>
        <circle cx="${300 + r * Math.cos(rot)}" cy="${270 + r * Math.sin(rot)}" r="16" fill="url(#g)"/>`;
    } else {
      art = `
        <circle cx="300" cy="270" r="${r}" fill="none" stroke="url(#g)" stroke-width="14" stroke-dasharray="${2 * Math.PI * r * 0.82} 2000" stroke-linecap="round" transform="rotate(${rot} 300 270)"/>
        <circle cx="${300 + r * Math.cos((rot * Math.PI) / 180)}" cy="${270 + r * Math.sin((rot * Math.PI) / 180)}" r="22" fill="url(#g)"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#262219"/><stop offset="1" stop-color="#0a0a0a"/></radialGradient>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e27a"/><stop offset=".5" stop-color="#d4af37"/><stop offset="1" stop-color="#9c7a22"/></linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(#bg)"/>
      ${art}
      <text x="300" y="510" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="40" letter-spacing="4" fill="#d4af37">${esc(String(label).toUpperCase().slice(0, 22))}</text>
      <text x="300" y="550" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" letter-spacing="6" fill="#ffffff66">PHOTO À VENIR</text>
    </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

