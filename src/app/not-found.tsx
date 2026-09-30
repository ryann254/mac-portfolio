import { OpenOnLoad } from '@/desktop/open-on-load'
import { MISSING } from '@/desktop/routes'

/**
 * An address nothing answers to opens the same Finder window a missing file
 * would, over the desktop, with the address left as the reader typed it.
 */
export default function NotFound() {
  return <OpenOnLoad {...MISSING} />
}
