import { ref, watch } from 'vue'

export const codeLanguages = ['TypeScript', 'Python', 'Java', 'C++', 'Rust', 'JavaScript'] as const
export type CodeLanguage = typeof codeLanguages[number]

const STORAGE_KEY = 'pathfinder-code-language-v1'

function loadLanguage(): CodeLanguage {
  if (typeof window === 'undefined') return 'TypeScript'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return codeLanguages.includes(saved as CodeLanguage) ? saved as CodeLanguage : 'TypeScript'
}

const preferredLanguage = ref<CodeLanguage>(loadLanguage())

watch(preferredLanguage, (language) => {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, language)
})

export function useCodeLanguagePreference() {
  function setPreferredLanguage(language: string) {
    if (codeLanguages.includes(language as CodeLanguage)) {
      preferredLanguage.value = language as CodeLanguage
    }
  }

  return { preferredLanguage, setPreferredLanguage }
}
