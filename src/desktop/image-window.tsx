import Image from 'next/image'
import { fileAt, isDrawn } from './file-tree'
import { MissingFile } from './missing-file'
import type { Target } from './routes'

/** Wide enough to stay sharp in a maximised window without fetching the original. */
const SHOWN = { width: 1024, height: 640 }

/**
 * A picture, opened from Finder, on the near-black Preview uses so a screenshot
 * with a white page in it does not glare.
 */
export function ImageWindow({ target }: { target: Target }) {
  const file = target.showing === undefined ? undefined : fileAt(target.showing)
  if (file?.kind !== 'image') return <MissingFile />

  const fit = 'max-h-full w-auto max-w-full rounded-[5px]'

  return (
    <div className="flex h-full items-center justify-center bg-[#1c1c1e] p-3.5">
      {isDrawn(file) ? (
        // biome-ignore lint/performance/noImgElement: drawn art, which scales to any size for nothing and which the optimiser refuses outright without dangerouslyAllowSVG.
        <img src={file.src} alt={file.alt} className={`h-auto ${fit}`} />
      ) : (
        <Image
          src={file.src}
          alt={file.alt}
          width={SHOWN.width}
          height={SHOWN.height}
          className={`h-auto ${fit}`}
        />
      )}
    </div>
  )
}
