import { describe, expect, it } from 'vitest'
import { parsePublicReleaseConfig } from './publicRelease'

describe('public release configuration', () => {
  it('keeps beta and external feedback disabled by default', () => {
    expect(parsePublicReleaseConfig({}, '0.1.0')).toEqual({ appVersion: '0.1.0', betaEnabled: false, feedbackUrl: null })
  })

  it('accepts explicit beta and safe public URLs', () => {
    expect(parsePublicReleaseConfig({ VITE_PUBLIC_BETA_ENABLED: 'true', VITE_PUBLIC_FEEDBACK_URL: 'https://example.com/issues' }, '1.2.3'))
      .toEqual({ appVersion: '1.2.3', betaEnabled: true, feedbackUrl: 'https://example.com/issues' })
  })

  it('rejects browser-executable and malformed feedback URLs', () => {
    expect(parsePublicReleaseConfig({ VITE_PUBLIC_FEEDBACK_URL: 'javascript:alert(1)' }, '0.1.0').feedbackUrl).toBeNull()
    expect(parsePublicReleaseConfig({ VITE_PUBLIC_FEEDBACK_URL: 'not a URL' }, '0.1.0').feedbackUrl).toBeNull()
  })
})
