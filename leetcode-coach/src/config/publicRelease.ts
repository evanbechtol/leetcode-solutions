import packageMetadata from '../../package.json'

export interface PublicReleaseEnvironment {
  VITE_PUBLIC_BETA_ENABLED?: string
  VITE_PUBLIC_FEEDBACK_URL?: string
}

export interface PublicReleaseConfig {
  appVersion: string
  betaEnabled: boolean
  feedbackUrl: string | null
}

const safePublicUrl = (value: string | undefined) => {
  if (!value?.trim()) return null
  try {
    const url = new URL(value.trim())
    return ['https:', 'http:'].includes(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

export const parsePublicReleaseConfig = (
  environment: PublicReleaseEnvironment,
  appVersion: string,
): PublicReleaseConfig => ({
  appVersion,
  betaEnabled: environment.VITE_PUBLIC_BETA_ENABLED === 'true',
  feedbackUrl: safePublicUrl(environment.VITE_PUBLIC_FEEDBACK_URL),
})

export const publicReleaseConfig = parsePublicReleaseConfig(import.meta.env, packageMetadata.version)
