import { useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import MarkList from "./components/MarkList";
import SeriesList from "./components/SeriesList";
import SubseriesList from "./components/SubseriesList";
import ModelGrid from "./components/ModelGrid";
import ProductDetail from "./components/ProductDetail";
import SellersCard from "./components/SellersCard";
import SellerSelected from "./components/SellerSelected";
import Footer from "./components/Footer";
import Contact from "./components/Contact";
import { About, Legal } from "./components/InfoPages";
import { PRIVACY, DISCLAIMER } from "./legalText";
import { SideProvider } from "./side";
import { useSideLines } from "./sideContext";
import logo from "./assets/logo-modid.webp";
import hero from "./assets/hero.webp";

/* Every new card starts at the top (query changes, like picking a scale, don't scroll). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const INFO = /^\/(about|contact|privacy|disclaimer)$/;

/* Header of the Specific workbook: the logo at the left, the path lines at the right, then the heading text with its picture. */
function Header({ withHero }) {
  const lines = useSideLines();
  return (
    <>
      <header className="site-head">
        <Link to="/" aria-label="MODid home"><img className="logo" src={logo} alt="MODid, Model Identification" width="200" height="98" /></Link>
        <div className="sidepath">{lines.map((t, i) => <div key={i}>{t}</div>)}</div>
      </header>
      {withHero && (
        <section className="hero">
          <div className="hero-text">
            <p>Let MODid help you guide your scale model car collecting passion</p>
            <p>with the most complete reference to know models, brands and marks</p>
            <p>MODid focuses on scale model identification either die-cast or resin-cast.</p>
          </div>
          <img src={hero} alt="Ferrari 1:43 scale model by Matrix" width="300" height="162" />
        </section>
      )}
    </>
  );
}

export default function App() {
  const { pathname } = useLocation();
  return (
    <SideProvider>
      <ScrollToTop />
      <div className={`frame${/^\/models\//.test(pathname) ? " wide" : ""}`}>
      <Header withHero={!INFO.test(pathname)} />
      <Routes>
        <Route path="/" element={<MarkList home />} />
        <Route path="/browse/:scale/:brand" element={<MarkList />} />
        <Route path="/browse/:scale/:brand/:mark" element={<SeriesList />} />
        <Route path="/browse/:scale/:brand/:mark/:series" element={<SubseriesList />} />
        <Route path="/models/:scale/:brand/:mark/:series" element={<ModelGrid />} />
        <Route path="/models/:scale/:brand/:mark/:series/:subseries" element={<ModelGrid />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/product/:id/sellers" element={<SellersCard />} />
        <Route path="/product/:id/seller/:sid" element={<SellerSelected />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Legal title="Privacy Policy" blocks={PRIVACY} />} />
        <Route path="/disclaimer" element={<Legal title="Disclaimer" blocks={DISCLAIMER} justify />} />
      </Routes>
      <Footer />
      </div>
    </SideProvider>
  );
}
