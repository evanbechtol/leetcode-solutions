import { describe, expect, it } from 'vitest'
import { onboardingDecisions, recommendationFor } from './onboarding'
import { lessons } from './lessons'
import { problems } from './problems'
import { learningTracks } from './tracks'

describe('reviewed onboarding content', () => {
  it('uses six existing reviewed decisions with the intended beginner concepts', () => {
    expect(onboardingDecisions).toHaveLength(6)
    expect(onboardingDecisions.map(({ question }) => question.stage)).toEqual([
      'contract', 'data-structure', 'pattern', 'data-structure', 'time-complexity', 'space-complexity',
    ])
    expect(onboardingDecisions.every(({ question }) => question.reasoningSkillKeys.length > 0)).toBe(true)
    expect(onboardingDecisions.map(({ question }) => question.format)).toContain('constraint-signals')
    expect(onboardingDecisions.map(({ question }) => question.format)).toContain('operation-contract')
    expect(onboardingDecisions.every(({ problem }) => problem.description.length > 0)).toBe(true)
    expect(onboardingDecisions.every(({ problem }) => problem.examples.every((example) => example.input.length > 0 && example.output.length > 0))).toBe(true)
  })

  it('keeps every authored track destination resolvable', () => {
    for (const track of learningTracks) {
      expect(lessons.some(({ slug }) => slug === track.lessonSlugs[0]), track.title).toBe(true)
      expect(problems.some(({ id }) => id === track.entryProblemId), track.title).toBe(true)
      expect(track.representativeProblemIds.every((id) => problems.some((problem) => problem.id === id)), track.title).toBe(true)
      expect(track.prerequisiteTrackIds.every((id) => learningTracks.some((candidate) => candidate.id === id)), track.title).toBe(true)
    }
  })

  it('falls back only to an authored prerequisite when diagnostic evidence shows a foundational gap', () => {
    expect(recommendationFor('graphs', 2).recommendedTrack.id).toBe('trees')
    expect(recommendationFor('graphs', 5).recommendedTrack.id).toBe('graphs')
    expect(recommendationFor('arrays', 2).recommendedTrack.id).toBe('arrays')
  })
})
