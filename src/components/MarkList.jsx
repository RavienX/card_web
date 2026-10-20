import { useParams } from "react-router-dom";
import { useApi, paths, seriesApi, HOME } from "../api";
import { heading } from "../labels";
import Card from "./Card";
import Cascade from "./Cascade";
import Pics from "./Pics";
import p1 from "../assets/c5-1.webp";
import p2 from "../assets/c5-2.webp";

/* Marks (Ferrari, Alfa Romeo ...) of the chosen scale + brand. */
export default function MarkList({ home = false }) {
  const params = useParams();
  const { scale, brand } = home ? HOME : params;
  const { data, error, loading } = useApi("/marks", { scale, brand });
  return (
    <Card level="Marks" trail={{ scale, brand }} title={heading({ scale, brand })}
      loading={loading} error={error}
      empty={data?.length === 0 && "No marks for this scale and brand yet."}>
      <Pics a={p1} b={p2} to={paths.series(scale, brand, HOME.mark)} />
      <Cascade title={`${scale} ${brand.toUpperCase()}`} chosen={[{ k: "SCALE", v: scale }, { k: "BRAND", v: brand }]} label="MARK" items={data?.map((m) => ({ key: m.mark, title: m.mark, meta: `${m.series} series · ${m.models} models`,
        to: paths.series(scale, brand, m.mark), warm: [seriesApi(scale, brand, m.mark)] })) ?? []} />
    </Card>
  );
}
