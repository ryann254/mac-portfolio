import Image from 'next/image'
import { appById } from './apps'
import { isDrawn, type Node } from './file-tree'

/** How big Finder draws the art on one file. */
const ART = 54

/** The one icon here with no app behind it, and what the desktop folders wear. */
export const FOLDER_ICON = '/icons/folder.svg'

/**
 * What a thing in a folder is drawn as. A picture is drawn as itself, the way
 * Finder previews one, and everything else wears the document icon of the app
 * that opens it, which is where the three we drew ourselves are used.
 */
const artOf = (node: Node): string => {
  if (node.kind === 'folder') return FOLDER_ICON
  if (node.kind === 'image') return node.src
  return appById(node.kind).icon
}

export function FileIcon({ node }: { node: Node }) {
  const art = artOf(node)

  /* A screenshot is most of a megabyte of pixels and is drawn here at 54 px, so
     that one goes through the optimiser. Everything else is drawn art, which
     scales to any size for nothing and which the optimiser refuses outright
     without `dangerouslyAllowSVG`. */
  if (node.kind === 'image' && !isDrawn(node)) {
    return (
      <Image
        src={art}
        alt=""
        width={ART}
        height={ART}
        className="size-[54px] shrink-0 rounded object-cover shadow-[0_1px_4px_rgba(0,0,0,0.28)]"
      />
    )
  }

  return (
    // biome-ignore lint/performance/noImgElement: drawn art at one fixed size, which the optimiser would charge a round trip to hand back unchanged, and it refuses SVG outright without dangerouslyAllowSVG.
    <img src={art} alt="" width={ART} height={ART} className="size-[54px] shrink-0" />
  )
}
