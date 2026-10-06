import { Navigate, useParams } from "react-router-dom";
import { useApi, paths, modelsApi } from "../api";
import { heading } from "../labels";
import Card from "./Card";
import PLink from "./PLink";

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
      <ol className="list">
        {data?.map((s, i) => (
          <li key={s.subseries}>
            <PLink to={paths.models(scale, brand, mark, series, s.subseries)}
              warm={[modelsApi(scale, brand, mark, series, s.subseries)]}>
              <span className="n">{i + 1}</span>
              <span className="t">{s.subseries}</span>
              <span className="meta">{s.models} models</span>
              <span className="go">→</span>
            </PLink>
          </li>
        ))}
      </ol>
    </Card>
  );
}
