import { describe, expect, it } from 'vitest'
import type { RepairCard } from './repairSelectors'
import { sortRepairCardsForPlanning } from './repairSelectors'

const card = (id: string, sourceConfidence: RepairCard['sourceConfidence'], nextDueOn = '2026-08-25'): RepairCard => ({
  id,
  misconceptionKey: id,
  label: 'Practice this concept',
  concept: 'Boundary reasoning',
  lessonSlug: 'arrays-hash-maps',
  repairMode: 'lesson',
  sourceProblemId: 1,
  sourceProblemTitle: 'Two Sum',
  sourceQuestionType: 'Correctness',
  questionFormat: 'multiple-choice',
  status: 'open',
  nextDueOn,
  snoozed: false,
  why: 'Reviewed feedback',
  contentUpdated: false,
  repeatCount: 1,
  lastOccurredAt: '2026-08-25T12:00:00.000Z',
  sourceConfidence,
})

describe('repair planning priority', () => {
  it('keeps due date primary and prioritizes high-confidence errors when dates tie', () => {
    const sorted = sortRepairCardsForPlanning([
      card('low', 'low'),
      card('high', 'high'),
      card('older-due', 'low', '2026-08-24'),
    ])

    expect(sorted.map(({ id }) => id)).toEqual(['older-due', 'high', 'low'])
  })
})
