import { useParams } from "react-router-dom";
import { useApi, paths, subseriesApi, modelsApi } from "../api";
import { heading } from "../labels";
import Card from "./Card";
import PLink from "./PLink";

/* Series of the chosen mark. Big series (more than 20 models) open the Subseries card first. */
export default function SeriesList() {
  const { scale, brand, mark } = useParams();
  const { data, error, loading } = useApi("/series", { scale, brand, mark });
  return (
    <Card level="Series" trail={{ scale, brand, mark }} title={heading({ scale, brand, mark })}
      back={{ to: paths.marks(scale, brand), label: heading({ scale, brand }) }} loading={loading} error={error}
      empty={data?.length === 0 && "No series for this mark yet."}>
      <ol className="list">
        {data?.map((s, i) => (
          <li key={s.series}>
            <PLink
              to={s.has_subseries ? paths.subseries(scale, brand, mark, s.series) : paths.models(scale, brand, mark, s.series)}
              warm={[s.has_subseries ? subseriesApi(scale, brand, mark, s.series) : modelsApi(scale, brand, mark, s.series)]}>
              <span className="n">{i + 1}</span>
              <span className="t">{s.series}</span>
              <span className="meta">{s.models} models{s.has_subseries ? " · subseries" : ""}</span>
              <span className="go">→</span>
            </PLink>
          </li>
        ))}
      </ol>
    </Card>
  );
}
