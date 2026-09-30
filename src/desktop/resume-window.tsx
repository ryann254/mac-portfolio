import { profile } from '@/content'
import { RESUME_FILE, RESUME_NAME, RESUME_VIEW } from './resume-file'

/**
 * The resume, in whatever PDF viewer the reader's browser has. Drawing our own
 * viewer would mean a page rail and a zoom that do less than the one already
 * built into the browser, and a second renderer to keep in step with the file.
 *
 * A browser with no viewer, which is most of them on a phone, gets the download
 * instead of an empty grey rectangle.
 */
export function ResumeWindow() {
  return (
    <object
      data={RESUME_VIEW}
      type="application/pdf"
      title={`${profile.name}, ${profile.headline}`}
      className="size-full bg-zinc-700"
    >
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-[13px] text-zinc-300">
          This browser will not show a PDF inside a window.
        </p>
        <a
          href={RESUME_FILE}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[7px] bg-white/15 px-3 py-1.5 font-medium text-[13px] text-white hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-sky-400 focus-visible:outline-offset-2"
        >
          Open {RESUME_NAME}
        </a>
      </div>
    </object>
  )
}

/** The toolbar: what the file is called, and the button that hands it over. */
export function ResumeBar() {
  return (
    <div className="pointer-events-none relative flex min-w-0 flex-1 items-center pr-2.5">
      <span className="-translate-x-1/2 absolute left-1/2 truncate font-medium text-[13px] text-zinc-700 dark:text-zinc-200">
        {RESUME_NAME}
      </span>
      <span className="pointer-events-auto ml-auto">
        <Download />
      </span>
    </div>
  )
}

const Download = () => (
  <a
    href={RESUME_FILE}
    download={RESUME_NAME}
    className="inline-flex items-center gap-1.5 rounded-[7px] bg-black/[0.06] px-2.5 py-[3px] font-medium text-[12px] text-zinc-800 hover:bg-black/[0.1] focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/[0.16]"
  >
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-3.5 shrink-0">
      <path d="M11 3h2v9.6l3.3-3.3 1.4 1.4-5.7 5.7-5.7-5.7 1.4-1.4L11 12.6zM5 18h14v2H5z" />
    </svg>
    Download
  </a>
)
