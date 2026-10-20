import { useParams } from "react-router-dom";
import { useApi, paths, subseriesApi, modelsApi, HOME } from "../api";
import { heading } from "../labels";
import Card from "./Card";
import Cascade from "./Cascade";
import Pics from "./Pics";
import p1 from "../assets/c6-1.webp";
import p2 from "../assets/c6-2.webp";

/* Series of the chosen mark. Big series (more than 20 models) open the Subseries card first. */
export default function SeriesList({ home = false }) {
  const params = useParams();
  const { scale, brand, mark } = home ? HOME : params;
  const { data, error, loading } = useApi("/series", { scale, brand, mark });
  return (
    <Card level="Series" trail={{ scale, brand, mark }} title={heading({ scale, brand, mark })}
      back={{ to: paths.marks(scale, brand), label: heading({ scale, brand }) }} loading={loading} error={error}
      empty={data?.length === 0 && "No series for this mark yet."}>
      <Pics a={p1} b={p2} />
      <Cascade title={`${scale} ${brand.toUpperCase()} ${mark.toUpperCase()}`} chosen={[{ k: "SCALE", v: scale }, { k: "BRAND", v: brand }, { k: "MARK", v: mark }]} label="SERIE" items={data?.map((s) => ({ key: s.series, title: s.series, meta: `${s.models} models${s.has_subseries ? " · subseries" : ""}`,
        to: s.has_subseries ? paths.subseries(scale, brand, mark, s.series) : paths.models(scale, brand, mark, s.series),
        warm: [s.has_subseries ? subseriesApi(scale, brand, mark, s.series) : modelsApi(scale, brand, mark, s.series)] })) ?? []} />
    </Card>
  );
}
