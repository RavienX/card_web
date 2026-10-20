/* A model picture (served by the API: /pics/MX40604-012_1.jpg?w=240), or the grey placeholder while the model has none. */
export default function Pic({ src, w = 320, alt = "", className = "ph", ...rest }) {
  return src
    ? <img className={`${className} has`} src={`${src}?w=${w}`} alt={alt} loading="lazy" decoding="async" {...rest} />
    : <div className={className} aria-hidden="true" />;
}
