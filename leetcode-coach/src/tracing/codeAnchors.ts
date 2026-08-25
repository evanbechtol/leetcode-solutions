import type { CodeAnchor } from './types'

export const defineAnchors = (anchors: CodeAnchor[]): Record<string, CodeAnchor> => {
  const entries = anchors.map((anchor) => [anchor.id, anchor] as const)
  if (new Set(entries.map(([id]) => id)).size !== entries.length) throw new Error('Trace code-anchor ids must be unique.')
  return Object.fromEntries(entries)
}
