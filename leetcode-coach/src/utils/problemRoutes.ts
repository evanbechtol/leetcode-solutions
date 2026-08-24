export const problemRoutePath = (problemId: number) => `/problems/${problemId}`

export const parseProblemRouteId = (value: unknown) => {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) return null
  const problemId = Number(raw)
  return Number.isSafeInteger(problemId) && problemId > 0 ? problemId : null
}
