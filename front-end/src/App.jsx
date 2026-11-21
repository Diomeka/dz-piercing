import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Accueil from "./pages/Accueil.jsx";
import Piercings from "./pages/Piercings.jsx";
import Bracelets from "./pages/Bracelets.jsx";
import RendezVous from "./pages/RendezVous.jsx";
import Galerie from "./pages/Galerie.jsx";
import Soins from "./pages/Soins.jsx";
import Contact from "./pages/Contact.jsx";
import { Chargement } from "./components/useData.jsx";

// L'admin n'est téléchargé que si on l'ouvre : le site reste léger pour les clients
const Admin = lazy(() => import("./pages/admin/Admin.jsx"));
import NotFound from "./pages/NotFound.jsx";
import Confidentialite from "./pages/Confidentialite.jsx";

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0); // accolades : les Chrome récents renvoient une Promise, interdite comme retour d'effet
  }, [pathname]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Accueil />} />
        <Route path="piercings" element={<Piercings />} />
        <Route path="bracelets" element={<Bracelets />} />
        <Route path="rendez-vous" element={<RendezVous />} />
        <Route path="galerie" element={<Galerie />} />
        <Route path="soins" element={<Soins />} />
        <Route path="contact" element={<Contact />} />
        <Route path="confidentialite" element={<Confidentialite />} />
        <Route path="admin" element={<Suspense fallback={<Chargement />}><Admin /></Suspense>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
