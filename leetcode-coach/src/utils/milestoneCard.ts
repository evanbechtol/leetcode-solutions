import type { EarnedMilestone } from './learningMap'

const escapeXml = (value: string) => value.replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!)

export const milestoneCardSvg = (milestone: EarnedMilestone) => {
  const label = escapeXml(milestone.label)
  const track = escapeXml(milestone.track ?? 'Pathfinder learning')
  const summary = escapeXml(milestone.summary)
  const summaryWords = summary.split(' ')
  const summaryLines = summaryWords.reduce<string[]>((lines, word) => {
    const last = lines.at(-1) ?? ''
    if (!last || `${last} ${word}`.length > 62) lines.push(word)
    else lines[lines.length - 1] = `${last} ${word}`
    return lines
  }, []).slice(0, 2)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title description">
  <title id="title">Pathfinder ${label} milestone</title><desc id="description">${summary}</desc>
  <rect width="1200" height="630" fill="#111318"/><circle cx="1040" cy="110" r="250" fill="#8de5b2" opacity=".08"/><circle cx="1080" cy="570" r="300" fill="#b9a7ff" opacity=".08"/>
  <path d="M92 92h44l28 28-28 28H92l28-28z" fill="#8de5b2"/><text x="184" y="132" fill="#e4e8eb" font-family="Arial,sans-serif" font-size="34" font-weight="700">pathfinder</text>
  <text x="92" y="270" fill="#8de5b2" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="4">${label.toUpperCase()}</text>
  <text x="92" y="350" fill="#f1f3f5" font-family="Arial,sans-serif" font-size="64" font-weight="700">${track}</text>
  <text x="92" y="420" fill="#aeb6bf" font-family="Arial,sans-serif" font-size="30">${summaryLines.map((line, index) => `<tspan x="92" dy="${index ? 44 : 0}">${line}</tspan>`).join('')}</text>
  <text x="92" y="566" fill="#737d88" font-family="Arial,sans-serif" font-size="22">Private progress · shared by choice</text>
</svg>`
}

export const milestoneCardBlob = (milestone: EarnedMilestone) => new Blob([milestoneCardSvg(milestone)], { type: 'image/svg+xml;charset=utf-8' })

export const milestoneCardFilename = (milestone: EarnedMilestone) => `pathfinder-${milestone.kind}-${milestone.track?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? 'milestone'}.svg`
