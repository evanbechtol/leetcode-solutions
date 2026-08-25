<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTrainerStore } from '../stores/trainer'

const store = useTrainerStore()
const router = useRouter()
const rebuilt = ref(false)
onMounted(() => store.ensureTodaySession())

const session = computed(() => store.todaySession)
const tasks = computed(() => store.todayTasks)
const remaining = computed(() => tasks.value.filter((task) => !task.completed).length)
const isComplete = computed(() => session.value?.status === 'complete')

function taskIcon(kind: string) {
  return ({ lesson: 'mdi-book-open-page-variant-outline', problem: 'mdi-code-braces', retrieval: 'mdi-brain', repair: 'mdi-wrench-check-outline', trace: 'mdi-motion-play-outline' } as Record<string, string>)[kind] || 'mdi-compass-outline'
}

async function openTask(task: typeof tasks.value[number]) {
  if (!store.beginDailyTask(task.id)) return
  if (['lesson', 'repair', 'trace'].includes(task.kind) && task.lessonSlug) {
    await router.push({ path: `/learn/${task.lessonSlug}`, query: task.id.startsWith('repair') ? { repair: task.id } : {} })
    return
  }
  if (task.problemId) await router.push({ name: 'problem', params: { problemId: task.problemId }, query: { from: 'today', dailyTask: task.id } })
}

function completeTask(taskId: string) {
  store.completeDailyTask(taskId)
}

function rebuild() {
  rebuilt.value = store.rebuildTodaySession()
}
</script>

<template>
  <div class="app-shell today-page px-5 px-md-8 py-9 py-md-12">
    <header class="today-hero">
      <div>
        <div class="eyebrow">Today’s mastery session</div>
        <h1>{{ isComplete ? 'A thoughtful session, complete.' : 'One useful next step.' }}</h1>
        <p>{{ isComplete ? 'Your practice is recorded. Come back when another small session fits.' : `${remaining} ${remaining === 1 ? 'task remains' : 'tasks remain'} in a ${session?.plannedMinutes ?? store.progressState.learner.dailyMinutes}-minute plan.` }}</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-format-list-bulleted" to="/problems">Browse catalog</v-btn>
    </header>

    <section class="consistency-card mt-8" aria-label="Practice consistency">
      <div><span>Practice consistency</span><strong>{{ store.practiceConsistency.current }} day{{ store.practiceConsistency.current === 1 ? '' : 's' }}</strong><small>Current run · best {{ store.practiceConsistency.best }}</small></div>
      <div class="consistency-days" aria-label="Last seven days">
        <span v-for="day in store.practiceConsistency.lastSevenDays" :key="day.day" :class="{ active: day.active }" :title="day.day">{{ day.day.slice(-2) }}</span>
      </div>
      <p>A day counts when you complete at least one Today task. Missing a day pauses the run; it never erases what you learned.</p>
    </section>

    <section v-if="store.dueRepairCards.length" class="today-atlas mt-5" aria-labelledby="today-atlas-heading">
      <div><span class="eyebrow">Personal Error Atlas</span><h2 id="today-atlas-heading">One concept is ready for a focused review</h2><p>{{ store.dueRepairCards[0].why }}</p></div>
      <div><strong>{{ store.dueRepairCards[0].concept }}</strong><small>This is the first repair action in today’s plan.</small></div>
    </section>

    <section class="today-session mt-8">
      <div class="section-heading"><div><span class="eyebrow">Your plan</span><h2>Why these tasks?</h2><p class="section-copy">Tasks come from your selected track and existing learning history. Pathfinder does not invent activity just to fill a session.</p></div><v-btn v-if="session?.status === 'planned' && !session.rebuildCount" variant="text" size="small" prepend-icon="mdi-refresh" @click="rebuild">Rebuild once</v-btn></div>
      <v-btn class="mt-3" variant="text" size="small" prepend-icon="mdi-map-marker-path" to="/paths">See how today’s work fits your learning map</v-btn>
      <v-alert v-if="rebuilt" class="mt-5" density="compact" type="success" variant="tonal">Your unstarted session was rebuilt with a different first task.</v-alert>
      <div v-if="tasks.length" class="today-task-list mt-6">
        <article v-for="(task, index) in tasks" :key="task.id" class="today-task" :class="{ completed: task.completed }">
          <div class="today-task-index">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="today-task-icon"><v-icon :icon="taskIcon(task.kind)" /></div>
          <div class="today-task-copy"><span>{{ task.kind === 'problem' ? 'Guided problem' : task.kind }}</span><h3>{{ task.title }}</h3><p>{{ task.description }}</p><small><v-icon icon="mdi-information-outline" size="14" /> {{ task.reason }}</small></div>
          <div class="today-task-action"><v-chip v-if="task.completed" size="small" color="primary" prepend-icon="mdi-check">Done</v-chip><template v-else><v-btn v-if="['lesson', 'repair', 'trace'].includes(task.kind)" variant="outlined" @click="openTask(task)">{{ task.kind === 'repair' ? 'Open review' : task.kind === 'trace' ? 'Open trace' : 'Open lesson' }}</v-btn><v-btn v-else color="primary" @click="openTask(task)">Start</v-btn><v-btn v-if="['lesson', 'repair', 'trace'].includes(task.kind)" variant="text" size="small" @click="completeTask(task.id)">Mark reviewed</v-btn></template></div>
        </article>
      </div>
      <v-card v-else class="empty-today pa-7 mt-6"><v-icon icon="mdi-calendar-check-outline" size="42" /><h3>No artificial tasks today</h3><p>Your selected tracks do not have another reviewed task to schedule right now. Browse the catalog when you want to choose freely.</p><v-btn color="primary" to="/problems">Browse problems</v-btn></v-card>
    </section>
  </div>
</template>
