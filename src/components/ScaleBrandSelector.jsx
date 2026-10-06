import { useSearchParams } from "react-router-dom";
import { useApi, paths, marksApi } from "../api";
import PLink from "./PLink";
import Card from "./Card";

/* Level 1: pick a scale (segmented control), then a brand (clickable list). */
export default function ScaleBrandSelector() {
  const { data, error, loading } = useApi("/scales");
  const [params, setParams] = useSearchParams();
  const active = data?.find((x) => x.scale === params.get("scale")) ?? data?.[0];

  return (
    <Card level="Start" title="Choose a scale and brand" loading={loading} error={error}
      empty={data?.length === 0 && "No products yet."}>
      <div className="seg" role="tablist" aria-label="Scale">
        {data?.map(({ scale }) => (
          <button key={scale} role="tab" aria-selected={scale === active?.scale}
            onClick={() => setParams({ scale }, { replace: true })}>{scale}</button>
        ))}
      </div>
      <div className="grid">
        {active?.brands.map((b) => (
          <PLink className="tile" key={b.brand} to={paths.marks(active.scale, b.brand)}
            warm={[marksApi(active.scale, b.brand)]}>
            <b>{b.brand}</b><span>{b.count} models</span>
          </PLink>
        ))}
      </div>
    </Card>
  );
}
