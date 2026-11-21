import { lazy, Suspense, useEffect } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Accueil from "./pages/Accueil.jsx";
import Piercings from "./pages/Piercings.jsx";
import Braces from "./pages/Braces.jsx";
import RendezVous from "./pages/RendezVous.jsx";
import Galerie from "./pages/Galerie.jsx";
import Soins from "./pages/Soins.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";
import Confidentialite from "./pages/Confidentialite.jsx";
import Connexion from "./pages/compte/Connexion.jsx";
import Inscription from "./pages/compte/Inscription.jsx";
import Compte from "./pages/compte/Compte.jsx";
import { Chargement } from "./components/useData.jsx";

// L'admin n'est téléchargé que si on l'ouvre : le site reste léger pour les clients
const Admin = lazy(() => import("./pages/admin/Admin.jsx"));

/** Le formulaire repart de zéro quand le lien change (ex. autre modèle de braces choisi). */
function RendezVousSelonLien() {
  const { search } = useLocation();
  return <RendezVous key={search} />;
}

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0); // accolades : les Chrome récents renvoient une Promise, interdite comme retour d'effet
  }, [pathname]);

  return (
    <Routes>
      {/* SITE CLIENT */}
      <Route element={<Layout />}>
        <Route index element={<Accueil />} />
        <Route path="piercings" element={<Piercings />} />
        <Route path="braces" element={<Braces />} />
        <Route path="bracelets" element={<Navigate to="/braces" replace />} /> {/* ancienne adresse */}
        <Route path="rendez-vous" element={<RendezVousSelonLien />} />
        <Route path="galerie" element={<Galerie />} />
        <Route path="soins" element={<Soins />} />
        <Route path="contact" element={<Contact />} />
        <Route path="confidentialite" element={<Confidentialite />} />
        <Route path="connexion" element={<Connexion />} />
        <Route path="inscription" element={<Inscription />} />
        <Route path="compte" element={<Compte />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* INTERFACE ADMIN — séparée : pas de menus clients, bouton « Voir le site » */}
      <Route path="admin" element={<Suspense fallback={<Chargement />}><Admin /></Suspense>} />
    </Routes>
  );
}
