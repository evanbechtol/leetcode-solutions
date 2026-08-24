<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { lessons } from '../data/lessons'
import TreeDiagramNode from '../components/TreeDiagramNode.vue'

const route = useRoute()
const search = ref('')
const category = ref<'All' | 'Data Structure' | 'Algorithmic Pattern'>('All')

const lesson = computed(() => lessons.find((item) => item.slug === route.params.slug))
const lessonIndex = computed(() => lessons.findIndex((item) => item.slug === route.params.slug))
const previousLesson = computed(() => lessonIndex.value > 0 ? lessons[lessonIndex.value - 1] : undefined)
const nextLesson = computed(() => lessonIndex.value >= 0 && lessonIndex.value < lessons.length - 1 ? lessons[lessonIndex.value + 1] : undefined)
const filteredLessons = computed(() => {
  const query = search.value.trim().toLowerCase()
  return lessons.filter((item) => {
    const matchesCategory = category.value === 'All' || item.category === category.value
    const searchable = [item.title, item.summary, ...item.signals, ...item.problemTypes, ...item.relatedTopics].join(' ').toLowerCase()
    return matchesCategory && (!query || searchable.includes(query))
  })
})

watch(() => route.params.slug, () => window.scrollTo({ top: 0, behavior: 'smooth' }))
</script>

<template>
  <div class="page-wrap learn-page">
    <template v-if="!lesson">
      <section class="app-shell learn-catalog px-5 px-md-8 py-12 py-md-16">
        <header class="learn-hero">
          <div>
            <div class="eyebrow">Concept library</div>
            <h1>Understand the tools<br><em>behind the solution.</em></h1>
            <p>Build recognition, not memorization. Each lesson connects a mental model to the clues, tradeoffs, and problem families that tell you when to use it.</p>
          </div>
          <div class="learn-overview" aria-label="Curriculum overview">
            <div><strong>{{ lessons.length }}</strong><span>deep dives</span></div>
            <div><strong>3</strong><span>skill levels</span></div>
            <div><strong>∞</strong><span>patterns unlocked</span></div>
          </div>
        </header>

        <div class="learn-controls mt-10">
          <v-text-field
            v-model="search"
            aria-label="Search lessons"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search a concept or clue..."
            variant="solo-filled"
            flat
            hide-details
            clearable
          />
          <v-chip-group v-model="category" mandatory selected-class="learn-filter-active">
            <v-chip value="All">All topics</v-chip>
            <v-chip value="Data Structure">Data structures</v-chip>
            <v-chip value="Algorithmic Pattern">Patterns</v-chip>
          </v-chip-group>
        </div>

        <div class="lesson-grid mt-8">
          <router-link
            v-for="item in filteredLessons"
            :key="item.slug"
            :to="`/learn/${item.slug}`"
            class="lesson-card"
          >
            <div class="lesson-card-top">
              <span class="lesson-card-icon"><v-icon :icon="item.icon" size="23" /></span>
              <span class="lesson-number">{{ String(lessons.indexOf(item) + 1).padStart(2, '0') }}</span>
            </div>
            <div class="lesson-card-meta"><span>{{ item.category }}</span><span>{{ item.level }}</span></div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.summary }}</p>
            <div class="lesson-clue"><v-icon icon="mdi-lightbulb-on-outline" size="16" /> {{ item.signals[0] }}</div>
            <footer><span>{{ item.minutes }} min</span><span>Open lesson <v-icon icon="mdi-arrow-right" size="16" /></span></footer>
          </router-link>
        </div>

        <div v-if="!filteredLessons.length" class="learn-empty">
          <v-icon icon="mdi-bookshelf" size="40" />
          <h2>No matching lesson</h2>
          <p>Try a broader search or switch topic groups.</p>
        </div>
      </section>
    </template>

    <template v-else>
      <div class="app-shell lesson-detail-layout px-5 px-md-8 py-10">
        <aside class="lesson-rail">
          <router-link to="/learn" class="back-link"><v-icon icon="mdi-arrow-left" size="17" /> All lessons</router-link>
          <div class="lesson-rail-label">Curriculum</div>
          <nav aria-label="Lesson navigation">
            <router-link v-for="(item, index) in lessons" :key="item.slug" :to="`/learn/${item.slug}`" class="rail-link">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <v-icon :icon="item.icon" size="17" />
              <strong>{{ item.title }}</strong>
            </router-link>
          </nav>
        </aside>

        <main class="lesson-reader">
          <header class="lesson-reader-hero">
            <div class="reader-kicker"><span>{{ lesson.category }}</span><span>{{ lesson.level }}</span><span>{{ lesson.minutes }} min</span></div>
            <div class="reader-title-row">
              <div class="reader-icon"><v-icon :icon="lesson.icon" size="30" /></div>
              <h1>{{ lesson.title }}</h1>
            </div>
            <p class="reader-summary">{{ lesson.summary }}</p>
          </header>

          <section class="lesson-section mental-model">
            <div class="section-heading-row"><span>01</span><div><div class="eyebrow">Mental model</div><h2>Make it intuitive</h2></div></div>
            <p>{{ lesson.mentalModel }}</p>
          </section>

          <section v-if="lesson.deepDive" class="lesson-section deep-dive-section">
            <div class="section-heading-row"><span>01A</span><div><div class="eyebrow">Foundations</div><h2>{{ lesson.deepDive.title }}</h2></div></div>

            <div class="deep-introduction">
              <p v-for="paragraph in lesson.deepDive.introduction" :key="paragraph">{{ paragraph }}</p>
            </div>

            <div class="tree-fact-strip">
              <div v-for="fact in lesson.deepDive.facts" :key="fact.label"><strong>{{ fact.value }}</strong><span>{{ fact.label }}</span></div>
            </div>

            <div v-if="lesson.deepDive.models?.length" class="fundamental-model-grid mt-8">
              <article v-for="model in lesson.deepDive.models" :key="model.title" class="fundamental-model">
                <header><h3>{{ model.title }}</h3><p>{{ model.description }}</p></header>
                <div class="fundamental-model-items">
                  <div v-for="item in model.items" :key="`${item.label}-${item.value}`" :class="item.tone ? `tone-${item.tone}` : ''">
                    <small>{{ item.label }}</small><strong>{{ item.value }}</strong>
                  </div>
                </div>
                <footer v-if="model.note"><v-icon icon="mdi-information-outline" size="16" /> {{ model.note }}</footer>
              </article>
            </div>

            <article v-if="lesson.deepDive.diagram" class="tree-illustration mt-8">
              <div class="tree-illustration-heading"><div><div class="eyebrow">Anatomy</div><h3>What a tree looks like</h3></div><div class="tree-legend"><span><i class="root" /> Root</span><span><i class="internal" /> Internal</span><span><i class="leaf" /> Leaf</span></div></div>
              <div class="tree-diagram-scroll"><TreeDiagramNode :node="lesson.deepDive.diagram.root" /></div>
              <p>{{ lesson.deepDive.diagram.caption }}</p>
            </article>

            <div class="deep-subheading"><div class="eyebrow">Language of trees</div><h3>Core vocabulary</h3></div>
            <div class="tree-vocabulary">
              <article v-for="item in lesson.deepDive.vocabulary" :key="item.term"><strong>{{ item.term }}</strong><p>{{ item.definition }}</p></article>
            </div>

            <div class="deep-subheading"><div class="eyebrow">Representation</div><h3>How the idea appears in code</h3><p>Recognize both the conceptual model and the concrete form a problem uses to give it to you.</p></div>
            <div class="representation-list">
              <article v-for="(item, index) in lesson.deepDive.representations" :key="item.title" class="representation-card">
                <div class="representation-copy"><span>{{ String(index + 1).padStart(2, '0') }}</span><h4>{{ item.title }}</h4><small>{{ item.bestFor }}</small><p>{{ item.description }}</p></div>
                <pre><code>{{ item.code }}</code></pre>
              </article>
            </div>

            <div class="deep-subheading"><div class="eyebrow">Core algorithms</div><h3>How to explore a tree</h3><p>Every full traversal visits the same nodes. The frontier data structure and visit order determine what information becomes available first.</p></div>
            <div class="tree-algorithm-list">
              <article v-for="(algorithm, index) in lesson.deepDive.algorithms" :key="algorithm.title" class="tree-algorithm-card">
                <header><span>{{ String(index + 1).padStart(2, '0') }}</span><div><small>{{ algorithm.label }}</small><h4>{{ algorithm.title }}</h4></div></header>
                <p class="algorithm-summary">{{ algorithm.summary }}</p>
                <div v-if="algorithm.invariant" class="algorithm-invariant"><strong>Invariant</strong><p>{{ algorithm.invariant }}</p></div>
                <div class="algorithm-use"><strong>Reach for it when</strong><p>{{ algorithm.useWhen }}</p></div>
                <div class="algorithm-example"><strong>Trace on the example tree</strong><ol><li v-for="step in algorithm.example" :key="step">{{ step }}</li></ol></div>
                <div class="algorithm-code"><div>TypeScript</div><pre><code>{{ algorithm.code }}</code></pre></div>
                <footer><v-icon icon="mdi-chart-timeline-variant" size="17" /><span>{{ algorithm.complexity }}</span></footer>
              </article>
            </div>
          </section>

          <section class="lesson-section">
            <div class="section-heading-row"><span>02</span><div><div class="eyebrow">Recognition</div><h2>Know when to reach for it</h2></div></div>
            <div class="recognition-grid">
              <article class="content-panel signal-panel">
                <h3><v-icon icon="mdi-radar" size="19" /> Signals in the prompt</h3>
                <ul><li v-for="signal in lesson.signals" :key="signal">{{ signal }}</li></ul>
              </article>
              <article class="content-panel">
                <h3><v-icon icon="mdi-shape-outline" size="19" /> Problem families</h3>
                <div class="problem-family-list"><span v-for="type in lesson.problemTypes" :key="type">{{ type }}</span></div>
              </article>
            </div>
          </section>

          <section class="lesson-section">
            <div class="section-heading-row"><span>03</span><div><div class="eyebrow">Illustration</div><h2>{{ lesson.walkthrough.title }}</h2></div></div>
            <div class="walkthrough">
              <div class="walkthrough-input"><span>Input</span><code>{{ lesson.walkthrough.input }}</code></div>
              <article v-for="(frame, index) in lesson.walkthrough.frames" :key="frame.label" class="walk-frame">
                <div class="frame-marker"><span>{{ index + 1 }}</span><i /></div>
                <div class="frame-content">
                  <h3>{{ frame.label }}</h3>
                  <div class="frame-values">
                    <span
                      v-for="(value, valueIndex) in frame.values"
                      :key="`${value}-${valueIndex}`"
                      :class="{ active: frame.active?.includes(valueIndex), settled: frame.settled?.includes(valueIndex) }"
                    >{{ value }}</span>
                  </div>
                  <p>{{ frame.note }}</p>
                </div>
              </article>
            </div>
          </section>

          <section class="lesson-section">
            <div class="section-heading-row"><span>04</span><div><div class="eyebrow">Analysis</div><h2>Complexity & tradeoffs</h2></div></div>
            <div class="complexity-table">
              <div class="complexity-head"><span>Operation</span><span>Time</span><span>Space</span><span>Why</span></div>
              <div v-for="row in lesson.complexity" :key="row.operation" class="complexity-row">
                <strong>{{ row.operation }}</strong><code>{{ row.time }}</code><code>{{ row.space || '—' }}</code><p>{{ row.note }}</p>
              </div>
            </div>
          </section>

          <section class="lesson-section">
            <div class="section-heading-row"><span>05</span><div><div class="eyebrow">Method</div><h2>A repeatable recipe</h2></div></div>
            <ol class="recipe-list"><li v-for="(step, index) in lesson.steps" :key="step"><span>{{ index + 1 }}</span><p>{{ step }}</p></li></ol>
          </section>

          <section class="lesson-section">
            <div class="section-heading-row"><span>06</span><div><div class="eyebrow">Reference implementation</div><h2>See the pattern in code</h2></div></div>
            <div class="lesson-code"><div><span></span><span></span><span></span><small>TypeScript</small></div><pre><code>{{ lesson.code }}</code></pre></div>
          </section>

          <section class="lesson-section">
            <div class="section-heading-row"><span>07</span><div><div class="eyebrow">Judgment</div><h2>Boundaries & common mistakes</h2></div></div>
            <div class="pitfall-grid">
              <article><h3><v-icon icon="mdi-cancel" size="19" /> Choose another tool when…</h3><ul><li v-for="item in lesson.avoidWhen" :key="item">{{ item }}</li></ul></article>
              <article><h3><v-icon icon="mdi-alert-outline" size="19" /> Watch out for…</h3><ul><li v-for="item in lesson.pitfalls" :key="item">{{ item }}</li></ul></article>
            </div>
          </section>

          <div class="related-topics"><span>Related LeetCode topics</span><v-chip v-for="topic in lesson.relatedTopics" :key="topic" size="small">{{ topic }}</v-chip></div>

          <nav class="lesson-pagination" aria-label="Previous and next lessons">
            <router-link v-if="previousLesson" :to="`/learn/${previousLesson.slug}`"><small>Previous</small><strong><v-icon icon="mdi-arrow-left" size="17" /> {{ previousLesson.title }}</strong></router-link>
            <span v-else />
            <router-link v-if="nextLesson" :to="`/learn/${nextLesson.slug}`" class="next"><small>Next up</small><strong>{{ nextLesson.title }} <v-icon icon="mdi-arrow-right" size="17" /></strong></router-link>
          </nav>
        </main>
      </div>
    </template>
  </div>
</template>
