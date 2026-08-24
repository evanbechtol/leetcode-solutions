export type RandomIndex = (upperExclusive: number) => number

export const secureRandomIndex: RandomIndex = (upperExclusive) => {
  if (upperExclusive <= 1) return 0
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1)
    const limit = 0x100000000 - (0x100000000 % upperExclusive)
    do globalThis.crypto.getRandomValues(values)
    while (values[0] >= limit)
    return values[0] % upperExclusive
  }
  return Math.floor(Math.random() * upperExclusive)
}

export const shuffleProblemIds = (ids: number[], randomIndex: RandomIndex = secureRandomIndex) => {
  const shuffled = [...ids]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = randomIndex(index + 1)
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }
  return shuffled
}

export const drawRandomProblem = (
  eligibleIds: number[],
  currentProblemId: number | null,
  existingQueue: number[],
  randomIndex: RandomIndex = secureRandomIndex,
) => {
  if (!eligibleIds.length) return { selectedId: null, remainingQueue: [] as number[] }

  const eligible = new Set(eligibleIds)
  let queue = existingQueue.filter((id, index) => eligible.has(id) && existingQueue.indexOf(id) === index)
  if (!queue.length) queue = shuffleProblemIds(eligibleIds, randomIndex)

  if (queue.length > 1 && queue[0] === currentProblemId) {
    const alternativeIndex = queue.findIndex((id) => id !== currentProblemId)
    ;[queue[0], queue[alternativeIndex]] = [queue[alternativeIndex], queue[0]]
  }

  const [selectedId, ...remainingQueue] = queue
  return { selectedId, remainingQueue }
}
