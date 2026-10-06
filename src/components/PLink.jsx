import { Link } from 'react-router-dom'
import { prefetch } from '../api'

/** <Link> that loads the next card's data on hover / focus / touch, so the click feels instant. */
export default function PLink({ warm = [], ...props }) {
  const go = () => warm.forEach(prefetch)
  return <Link {...props} onMouseEnter={go} onFocus={go} onTouchStart={go} />
}
