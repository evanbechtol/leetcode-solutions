import { describe, expect, it } from 'vitest'
import appSource from '../App.vue?raw'
import feedbackSource from '../components/FeedbackDialog.vue?raw'
import trustSource from '../components/ContentTrustDisclosure.vue?raw'
import routerSource from '../main.ts?raw'
import { publicInformation } from '../data/publicInformation'

describe('public MVP surfaces', () => {
  it('publishes every required policy and help document through hash routes and the global footer', () => {
    expect(Object.keys(publicInformation)).toEqual(['privacy', 'content-policy', 'accessibility', 'changelog', 'data'])
    for (const path of ['/privacy', '/content-policy', '/accessibility', '/changelog', '/data']) {
      expect(routerSource).toContain(`path: '${path}'`)
      expect(appSource).toContain(`to="${path}"`)
    }
  })

  it('keeps feedback user-triggered, locally drafted, and explicit about transmission', () => {
    expect(appSource).toContain('Give feedback')
    expect(feedbackSource).toContain('It sends nothing automatically')
    expect(feedbackSource).toContain('feedback_draft_saved')
    expect(feedbackSource).toContain('feedback_report_copied')
    expect(feedbackSource).toContain('includeDiagnostics')
    expect(feedbackSource).not.toMatch(/fetch\(|axios|XMLHttpRequest/)
  })

  it('uses semantic disclosures and visible trace-quality language', () => {
    expect(trustSource).toContain('<details')
    expect(trustSource).toContain('<summary>')
    expect(trustSource).toContain('Exact reviewed trace')
    expect(trustSource).toContain('Instructional overview')
  })
})
