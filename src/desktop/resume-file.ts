import { profile } from '@/content'

/**
 * The one file Resume shows. `pnpm resume` prints it from the same content the
 * site renders, so the window and the download are the same document and the
 * name it lands under is his, not `resume(3).pdf`.
 */
export const RESUME_FILE = '/resume.pdf'

export const RESUME_NAME = `${profile.name.toLowerCase().replace(/\s+/g, '-')}.pdf`

/** Fitted to the width of a window that is taller than it is wide. */
export const RESUME_VIEW = `${RESUME_FILE}#view=FitH`
