import { Navigate, useParams } from "react-router-dom";
import { useApi, paths, modelsApi } from "../api";
import { heading } from "../labels";
import Card from "./Card";
import Cascade from "./Cascade";
import Pics from "./Pics";
import p1 from "../assets/c7-1.webp";
import p2 from "../assets/c7-2.webp";

/* Optional card (C7): subseries of a big series, e.g. FERRARI / SERIES 200 > 212, 250. */
export default function SubseriesList() {
  const { scale, brand, mark, series } = useParams();
  const { data, error, loading } = useApi("/subseries", { scale, brand, mark, series });

  // This series is small (or has no subseries): skip straight to its models.
  if (data?.length === 0) return <Navigate replace to={paths.models(scale, brand, mark, series)} />;

  return (
    <Card level="Subseries" trail={{ scale, brand, mark, series }} title={heading({ scale, brand, mark, series })}
      back={{ to: paths.series(scale, brand, mark), label: heading({ scale, brand, mark }) }}
      loading={loading} error={error}>
      <Pics a={p1} b={p2} />
      <Cascade title={`${scale} ${brand.toUpperCase()} ${mark.toUpperCase()} ${series}`} chosen={[{ k: "SCALE", v: scale }, { k: "BRAND", v: brand }, { k: "MARK", v: mark }, { k: "SERIE", v: series }]} label="SUBSERIE" items={data?.map((s) => ({ key: s.subseries, title: s.subseries, meta: `${s.models} models`,
        to: paths.models(scale, brand, mark, series, s.subseries), warm: [modelsApi(scale, brand, mark, series, s.subseries)] })) ?? []} />
    </Card>
  );
}
