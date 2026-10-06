import { useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import ScaleBrandSelector from "./components/ScaleBrandSelector";
import MarkList from "./components/MarkList";
import SeriesList from "./components/SeriesList";
import SubseriesList from "./components/SubseriesList";
import { STATIC } from "./api";
import ModelGrid from "./components/ModelGrid";
import ProductDetail from "./components/ProductDetail";
import SellersCard from "./components/SellersCard";

/* Every new card starts at the top (query changes, like picking a scale, don't scroll). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <header className="top">
        <Link to="/" className="brand"><i />CARD_web</Link>
        <span>Scale model finder</span>
      </header>
      <Routes>
        <Route path="/" element={<ScaleBrandSelector />} />
        <Route path="/browse/:scale/:brand" element={<MarkList />} />
        <Route path="/browse/:scale/:brand/:mark" element={<SeriesList />} />
        <Route path="/browse/:scale/:brand/:mark/:series" element={<SubseriesList />} />
        <Route path="/models/:scale/:brand/:mark/:series" element={<ModelGrid />} />
        <Route path="/models/:scale/:brand/:mark/:series/:subseries" element={<ModelGrid />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/product/:id/sellers" element={<SellersCard />} />
      </Routes>
      <footer className="foot">{STATIC ? "Demo · sample data (Ferrari) from PROD_db / SELL_db" : "Data from PROD_db / SELL_db"}</footer>
    </>
  );
}
