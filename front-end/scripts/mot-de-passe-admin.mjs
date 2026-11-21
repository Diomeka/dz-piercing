// Change le mot de passe admin du MODE DÉMO sans jamais l'écrire dans le code.
// Usage (dossier front-end) :  npm run mot-de-passe-admin
// → tape le nouveau mot de passe (invisible), le script met à jour l'empreinte
//   dans src/config.js. Le mot de passe lui-même n'est enregistré nulle part.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { empreinteMotDePasse, nouveauSel } from "../src/lib/motdepasse.js";

function demander(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(question)) process.stdout.write(s); else process.stdout.write("*"); };
    rl.question(question, (r) => { rl.close(); process.stdout.write("\n"); resolve(r); });
  });
}

const mdp = await demander("Nouveau mot de passe admin (10 caractères minimum) : ");
if (mdp.length < 10 || !/[A-Za-z]/.test(mdp) || !/\d/.test(mdp)) {
  console.error("✖ Trop faible : au moins 10 caractères, avec des lettres et des chiffres.");
  process.exit(1);
}
if ((await demander("Confirme le mot de passe : ")) !== mdp) {
  console.error("✖ Les deux mots de passe ne sont pas identiques.");
  process.exit(1);
}

const sel = nouveauSel();
const empreinte = empreinteMotDePasse(mdp, sel);
const fichier = fileURLToPath(new URL("../src/config.js", import.meta.url));
const avant = readFileSync(fichier, "utf8");
const apres = avant
  .replace(/(sel:\s*")[0-9a-f]+(")/, `$1${sel}$2`)
  .replace(/(empreinte:\s*")[0-9a-f]+(")/, `$1${empreinte}$2`);
if (apres === avant) {
  console.error("✖ Impossible de trouver adminDemo.sel / adminDemo.empreinte dans src/config.js");
  process.exit(1);
}
writeFileSync(fichier, apres);
console.log("✔ Mot de passe admin (mode démo) changé. Pense à enregistrer sur GitHub (commit + push).");
