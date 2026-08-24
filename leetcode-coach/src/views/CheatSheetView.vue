<script setup lang="ts">
import { computed, ref } from 'vue'
import hljs from 'highlight.js/lib/core'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import rust from 'highlight.js/lib/languages/rust'
import {
  cheatCategories,
  cheatPatterns,
  complexityTargets,
  keywordMap,
  reasoningChecklist,
  triageSignals,
} from '../data/cheatSheet'
import type { CheatPattern } from '../data/cheatSheet'
import { cheatSheetCodeSamples } from '../data/cheatSheetCodeSamples'
import { useCodeLanguagePreference } from '../composables/useCodeLanguagePreference'

hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('rust', rust)

const search = ref('')
const category = ref('All')
const openPatterns = ref<number[]>([])
const showAllTriage = ref(false)
const copiedPattern = ref<number | null>(null)
const { preferredLanguage, setPreferredLanguage } = useCodeLanguagePreference()
const patternLanguages = ['TypeScript', 'Python', 'Java', 'C++', 'Rust']
const highlightLanguages: Record<string, string> = {
  TypeScript: 'typescript',
  Python: 'python',
  Java: 'java',
  'C++': 'cpp',
  Rust: 'rust',
}

const filteredPatterns = computed(() => {
  const query = search.value.trim().toLowerCase()

  return cheatPatterns.filter((pattern) => {
    const matchesCategory = category.value === 'All' || pattern.category === category.value
    const searchable = [
      pattern.title,
      pattern.category,
      pattern.coreIdea,
      pattern.complexity,
      pattern.question,
      ...pattern.signals,
      ...pattern.reasoning,
      ...pattern.mistakes,
      ...pattern.examples,
    ].join(' ').toLowerCase()

    return matchesCategory && (!query || searchable.includes(query))
  })
})

const visibleTriageSignals = computed(() => showAllTriage.value ? triageSignals : triageSignals.slice(0, 8))
const allVisiblePatternsOpen = computed(() => (
  filteredPatterns.value.length > 0
  && filteredPatterns.value.every((pattern) => openPatterns.value.includes(pattern.number))
))

function toggleVisiblePatterns() {
  if (allVisiblePatternsOpen.value) {
    const visible = new Set(filteredPatterns.value.map((pattern) => pattern.number))
    openPatterns.value = openPatterns.value.filter((number) => !visible.has(number))
    return
  }

  openPatterns.value = [...new Set([
    ...openPatterns.value,
    ...filteredPatterns.value.map((pattern) => pattern.number),
  ])]
}

function clearFilters() {
  search.value = ''
  category.value = 'All'
}

function codeSamplesFor(pattern: CheatPattern): Record<string, string> {
  if (!pattern.template) return {}
  const supplemental = cheatSheetCodeSamples[pattern.number] || {}
  return {
    ...(supplemental.TypeScript ? { TypeScript: supplemental.TypeScript } : {}),
    ...(supplemental.Python ? { Python: supplemental.Python } : {}),
    Java: pattern.template,
    ...(supplemental['C++'] ? { 'C++': supplemental['C++'] } : {}),
    ...(supplemental.Rust ? { Rust: supplemental.Rust } : {}),
  }
}

function languagesFor(pattern: CheatPattern) {
  const samples = codeSamplesFor(pattern)
  return patternLanguages.filter((language) => Boolean(samples[language]))
}

function activeLanguageFor(pattern: CheatPattern) {
  const languages = languagesFor(pattern)
  return languages.includes(preferredLanguage.value) ? preferredLanguage.value : languages[0] || 'Java'
}

function sourceFor(pattern: CheatPattern) {
  const language = activeLanguageFor(pattern)
  return codeSamplesFor(pattern)[language] || ''
}

function highlightedTemplate(pattern: CheatPattern) {
  const language = activeLanguageFor(pattern)
  return hljs.highlight(sourceFor(pattern), {
    language: highlightLanguages[language] || 'typescript',
    ignoreIllegals: true,
  }).value
}

async function copyTemplate(pattern: CheatPattern) {
  await navigator.clipboard.writeText(sourceFor(pattern))
  copiedPattern.value = pattern.number
  window.setTimeout(() => {
    if (copiedPattern.value === pattern.number) copiedPattern.value = null
  }, 1400)
}

function makeMarkdown() {
  const lines = [
    '# Algorithm & Pattern Interview Cheat Sheet',
    '',
    'A compact reference for recognizing common interview patterns, stating the controlling invariant, and checking implementation tradeoffs.',
    '',
    '## 60-Second Pattern Triage',
    '',
    '| Problem signal | Pattern to try first |',
    '| --- | --- |',
    ...triageSignals.map((row) => `| ${row.signal} | ${row.pattern} |`),
    '',
  ]

  for (const pattern of cheatPatterns) {
    lines.push(
      `## ${pattern.number}. ${pattern.title}`,
      '',
      `**Category:** ${pattern.category}`,
      '',
      `**Core idea:** ${pattern.coreIdea}`,
      '',
      `**Recognition cues:** ${pattern.signals.join('; ')}`,
      '',
      `**Typical complexity:** ${pattern.complexity}`,
      '',
      `> **Controlling question:** ${pattern.question}`,
      '',
      '### How to reason about it',
      '',
      ...pattern.reasoning.map((item) => `- ${item}`),
      '',
      '### Common mistakes',
      '',
      ...pattern.mistakes.map((item) => `- ${item}`),
      '',
      '### Representative problems and examples',
      '',
      ...pattern.examples.map((item) => `- ${item}`),
      '',
    )

    if (pattern.template) {
      for (const [language, source] of Object.entries(codeSamplesFor(pattern))) {
        const fenceLanguage = highlightLanguages[language] || language.toLowerCase()
        lines.push(`### ${language} template`, '', `\`\`\`${fenceLanguage}`, source, '\`\`\`', '')
      }
    }
  }

  lines.push(
    '## Complexity Targets by Input Size',
    '',
    '| Input size | Practical target |',
    '| --- | --- |',
    ...complexityTargets.map((row) => `| ${row.signal} | ${row.pattern} |`),
    '',
    '_These are interview heuristics, not hard guarantees. Use the actual time and memory limits when available._',
    '',
    '## Keyword-to-Pattern Map',
    '',
    '| Problem wording | Pattern to consider |',
    '| --- | --- |',
    ...keywordMap.map((row) => `| ${row.signal} | ${row.pattern} |`),
    '',
    '## Interview Reasoning Checklist',
    '',
    ...reasoningChecklist.map((item) => `- [ ] ${item}`),
    '',
  )

  return lines.join('\n')
}

function downloadCheatSheet() {
  const blob = new Blob([makeMarkdown()], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pathfinder-algorithm-cheat-sheet.md'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="page-wrap cheat-page">
    <div class="app-shell px-5 px-md-8 py-10 py-md-14">
      <header class="cheat-hero">
        <div class="cheat-hero-copy">
          <div class="eyebrow">Interview field guide</div>
          <h1>Recognize the pattern.<br><em>Protect the invariant.</em></h1>
          <p>
            Use the prompt’s structural clues to narrow the search, then open a pattern for its
            reasoning model, complexity target, failure modes, and representative problems.
          </p>
          <div class="cheat-stats" aria-label="Cheat sheet summary">
            <span><strong>{{ cheatPatterns.length }}</strong> patterns</span>
            <span><strong>{{ cheatCategories.length - 1 }}</strong> families</span>
            <span><strong>{{ triageSignals.length }}</strong> recognition clues</span>
          </div>
        </div>
        <v-btn
          class="cheat-download"
          color="primary"
          prepend-icon="mdi-download-outline"
          size="large"
          @click="downloadCheatSheet"
        >
          Download .md
        </v-btn>
      </header>

      <section class="triage-card mt-10" aria-labelledby="triage-heading">
        <header>
          <div class="triage-heading-copy">
            <span class="triage-icon"><v-icon icon="mdi-timer-sand" size="21" /></span>
            <div>
              <div class="eyebrow">60-second triage</div>
              <h2 id="triage-heading">Start with the strongest signal</h2>
              <p>Translate the wording of the problem into the first family of techniques worth testing.</p>
            </div>
          </div>
          <v-btn
            variant="text"
            :append-icon="showAllTriage ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @click="showAllTriage = !showAllTriage"
          >
            {{ showAllTriage ? 'Show less' : `View all ${triageSignals.length}` }}
          </v-btn>
        </header>

        <div class="triage-grid">
          <article v-for="row in visibleTriageSignals" :key="row.signal">
            <span>{{ row.signal }}</span>
            <v-icon icon="mdi-arrow-right" size="16" />
            <strong>{{ row.pattern }}</strong>
          </article>
        </div>
      </section>

      <section class="cheat-library mt-12" aria-labelledby="pattern-library-heading">
        <div class="cheat-section-heading">
          <div>
            <div class="eyebrow">Pattern library</div>
            <h2 id="pattern-library-heading">Find the right tool</h2>
          </div>
          <span>{{ filteredPatterns.length }} of {{ cheatPatterns.length }} patterns</span>
        </div>

        <div class="cheat-controls mt-6">
          <v-text-field
            v-model="search"
            aria-label="Search algorithm patterns"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search a clue, pattern, complexity, or problem..."
            variant="solo-filled"
            flat
            hide-details
            clearable
          />
          <v-btn
            class="expand-patterns-button"
            variant="outlined"
            :prepend-icon="allVisiblePatternsOpen ? 'mdi-arrow-collapse-vertical' : 'mdi-arrow-expand-vertical'"
            @click="toggleVisiblePatterns"
          >
            {{ allVisiblePatternsOpen ? 'Collapse all' : 'Expand all' }}
          </v-btn>
        </div>

        <v-chip-group v-model="category" class="cheat-category-filters mt-4" mandatory selected-class="cheat-filter-active">
          <v-chip v-for="item in cheatCategories" :key="item" :value="item">{{ item }}</v-chip>
        </v-chip-group>

        <v-expansion-panels v-if="filteredPatterns.length" v-model="openPatterns" multiple class="cheat-pattern-list mt-7">
          <v-expansion-panel v-for="pattern in filteredPatterns" :key="pattern.number" :value="pattern.number">
            <v-expansion-panel-title>
              <div class="pattern-title-row">
                <span class="pattern-number">{{ String(pattern.number).padStart(2, '0') }}</span>
                <div class="pattern-title-copy">
                  <small>{{ pattern.category }}</small>
                  <h3>{{ pattern.title }}</h3>
                  <p>{{ pattern.coreIdea }}</p>
                </div>
                <span class="pattern-complexity">{{ pattern.complexity }}</span>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <div class="pattern-detail">
                <blockquote>
                  <span>Controlling question</span>
                  <p>{{ pattern.question }}</p>
                </blockquote>

                <section class="pattern-signals">
                  <h4>Recognition cues</h4>
                  <div><span v-for="signal in pattern.signals" :key="signal">{{ signal }}</span></div>
                </section>

                <div class="pattern-reasoning-grid">
                  <section>
                    <h4><v-icon icon="mdi-directions-fork" size="18" /> How to reason about it</h4>
                    <ol><li v-for="item in pattern.reasoning" :key="item">{{ item }}</li></ol>
                  </section>
                  <section>
                    <h4><v-icon icon="mdi-alert-outline" size="18" /> Common mistakes</h4>
                    <ul><li v-for="item in pattern.mistakes" :key="item">{{ item }}</li></ul>
                  </section>
                </div>

                <section class="pattern-examples">
                  <h4>Representative problems & examples</h4>
                  <div><span v-for="example in pattern.examples" :key="example">{{ example }}</span></div>
                </section>

                <section v-if="pattern.template" class="cheat-code solution-block">
                  <header class="solution-toolbar">
                    <div class="language-tabs" role="tablist" :aria-label="`${pattern.title} template language`">
                      <button
                        v-for="language in languagesFor(pattern)"
                        :key="language"
                        role="tab"
                        :aria-selected="activeLanguageFor(pattern) === language"
                        :class="{ active: activeLanguageFor(pattern) === language }"
                        @click="setPreferredLanguage(language)"
                      >
                        {{ language }}
                      </button>
                    </div>
                    <v-btn
                      size="small"
                      variant="text"
                      :prepend-icon="copiedPattern === pattern.number ? 'mdi-check' : 'mdi-content-copy'"
                      @click="copyTemplate(pattern)"
                    >
                      {{ copiedPattern === pattern.number ? 'Copied' : 'Copy' }}
                    </v-btn>
                  </header>
                  <pre><code
                    class="hljs"
                    :class="`language-${highlightLanguages[activeLanguageFor(pattern)]}`"
                    v-html="highlightedTemplate(pattern)"
                  /></pre>
                </section>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <div v-else class="cheat-empty">
          <v-icon icon="mdi-text-search" size="38" />
          <h3>No matching pattern</h3>
          <p>Try a broader clue or reset the pattern family.</p>
          <v-btn variant="outlined" @click="clearFilters">Clear filters</v-btn>
        </div>
      </section>

      <section class="cheat-appendices mt-14" aria-labelledby="quick-reference-heading">
        <div class="cheat-section-heading">
          <div>
            <div class="eyebrow">Appendices</div>
            <h2 id="quick-reference-heading">Quick interview references</h2>
          </div>
        </div>

        <v-expansion-panels multiple class="appendix-panels mt-6">
          <v-expansion-panel value="complexity">
            <v-expansion-panel-title>
              <div class="appendix-title"><v-icon icon="mdi-speedometer" /><div><h3>Complexity targets by input size</h3><p>Use constraints to rule out entire algorithm families.</p></div></div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="reference-table">
                <div v-for="row in complexityTargets" :key="row.signal"><strong>{{ row.signal }}</strong><span>{{ row.pattern }}</span></div>
              </div>
              <p class="reference-note">These are interview heuristics, not hard guarantees. Always use the actual time and memory limits when available.</p>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel value="keywords">
            <v-expansion-panel-title>
              <div class="appendix-title"><v-icon icon="mdi-key-outline" /><div><h3>Keyword-to-pattern map</h3><p>Translate familiar wording into a candidate technique.</p></div></div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="reference-table keyword-reference">
                <div v-for="row in keywordMap" :key="row.signal"><strong>{{ row.signal }}</strong><span>{{ row.pattern }}</span></div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel value="checklist">
            <v-expansion-panel-title>
              <div class="appendix-title"><v-icon icon="mdi-format-list-checks" /><div><h3>Interview reasoning checklist</h3><p>A repeatable path from prompt to verified solution.</p></div></div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <ol class="interview-checklist">
                <li v-for="(item, index) in reasoningChecklist" :key="item"><span>{{ String(index + 1).padStart(2, '0') }}</span><p>{{ item }}</p></li>
              </ol>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </section>
    </div>
  </div>
</template>
