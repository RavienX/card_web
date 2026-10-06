import { useParams } from "react-router-dom";
import { useApi, paths, seriesApi } from "../api";
import { heading } from "../labels";
import Card from "./Card";
import PLink from "./PLink";

/* Marks (Ferrari, Alfa Romeo ...) of the chosen scale + brand. */
export default function MarkList() {
  const { scale, brand } = useParams();
  const { data, error, loading } = useApi("/marks", { scale, brand });
  return (
    <Card level="Marks" trail={{ scale, brand }} title={heading({ scale, brand })}
      back={{ to: paths.start(scale), label: `all ${scale} brands` }} loading={loading} error={error}
      empty={data?.length === 0 && "No marks for this scale and brand yet."}>
      <div className="grid">
        {data?.map((m) => (
          <PLink className="tile" key={m.mark} to={paths.series(scale, brand, m.mark)}
            warm={[seriesApi(scale, brand, m.mark)]}>
            <b>{m.mark}</b>
            <span>{m.series} series · {m.models} models</span>
          </PLink>
        ))}
      </div>
    </Card>
  );
}
