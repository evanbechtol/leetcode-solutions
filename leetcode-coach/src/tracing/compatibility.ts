import type { VisualizationFrame } from '../types'
import { diffSnapshots } from './traceDiff'
import type { ExecutionTrace, TraceSnapshot, TraceStructure } from './types'
import { formatTraceValue } from './traceValues'

const statuses = (snapshot: TraceSnapshot) => Object.values(snapshot.structures).flatMap((structure) =>
  structure.kind === 'array' ? structure.items.map(({ status }) => status) : structure.entries.map(({ status }) => status))

const progressLabel = (snapshot: TraceSnapshot, wanted: 'processed' | 'remaining') => {
  const all = statuses(snapshot)
  if (!all.length) return wanted === 'processed' ? 'No elements marked yet' : 'State initialization'
  const count = wanted === 'processed'
    ? all.filter((status) => ['processed', 'result'].includes(status ?? '')).length
    : all.filter((status) => ['candidate', 'active', 'queued'].includes(status ?? '')).length
  return `${count} element${count === 1 ? '' : 's'}`
}

const structureItems = (
  structure: TraceStructure,
  before: TraceSnapshot,
): NonNullable<VisualizationFrame['structures']>[number]['items'] => {
  const changedIds = new Set(diffSnapshots(before, { ...before, structures: { ...before.structures, [structure.id]: structure } })
    .filter(({ id }) => id.startsWith(`structure:${structure.id}:`))
    .map(({ id }) => id.slice(`structure:${structure.id}:`.length)))
  const previous = before.structures[structure.id]
  const previousValues = previous?.kind === 'array'
    ? Object.fromEntries(previous.items.map((item) => [`${item.id}:value`, item.value]))
    : previous?.kind === 'map'
      ? Object.fromEntries(previous.entries.map((entry) => [`${entry.id}:value`, entry.value]))
      : {}
  return (
  structure.kind === 'array'
    ? structure.items.map((item) => ({
      key: String(item.index), value: formatTraceValue(item.value), status: item.status,
      changed: changedIds.has(`${item.id}:value`) || changedIds.has(`${item.id}:status`),
      previousValue: previousValues[`${item.id}:value`] ? formatTraceValue(previousValues[`${item.id}:value`]) : undefined,
    }))
    : structure.entries.map((entry) => ({
      key: formatTraceValue(entry.key), value: formatTraceValue(entry.value), status: entry.status,
      changed: changedIds.has(`${entry.id}:value`) || changedIds.has(`${entry.id}:key`) || changedIds.has(`${entry.id}:status`),
      previousValue: previousValues[`${entry.id}:value`] ? formatTraceValue(previousValues[`${entry.id}:value`]) : undefined,
    }))
  )
}

const structures = (before: TraceSnapshot, snapshot: TraceSnapshot): VisualizationFrame['structures'] => Object.values(snapshot.structures).map((structure) => ({
  name: structure.name,
  kind: structure.kind,
  description: structure.description,
  items: structureItems(structure, before),
}))

const variables = (before: TraceSnapshot, after: TraceSnapshot): VisualizationFrame['variables'] => {
  const changedIds = new Set(diffSnapshots(before, after)
    .filter(({ id }) => id.startsWith('variable:'))
    .map(({ id }) => id.slice('variable:'.length)))
  return Object.values(after.variables).map((variable) => {
    const previous = before.variables[variable.id]
    const changed = changedIds.has(variable.id)
    return {
      name: variable.name,
      value: formatTraceValue(variable.value),
      previousValue: changed && previous ? formatTraceValue(previous.value) : undefined,
      changed,
      role: variable.role,
    }
  })
}

export const traceToVisualizationFrames = (trace: ExecutionTrace, language: string): VisualizationFrame[] => {
  const initial: VisualizationFrame = {
    id: 'input',
    phase: 'Step 0',
    title: 'Load the exact input',
    action: 'Read the complete input before creating algorithm state.',
    input: trace.inputLabel,
    expectedOutput: formatTraceValue(trace.expectedOutput),
    currentOutput: formatTraceValue(trace.initialState.output),
    processed: 'No algorithm steps',
    remaining: 'The complete input',
    activeCodeLines: trace.anchors['function-entry']?.rangesByLanguage[language]
      ? [trace.anchors['function-entry'].rangesByLanguage[language].startLine]
      : [0],
    variables: variables(trace.initialState, trace.initialState),
    structures: structures(trace.initialState, trace.initialState),
    invariant: 'Execution has not started; the input remains unchanged.',
  }

  return [initial, ...trace.transitions.map((transition, index): VisualizationFrame => {
    const range = trace.anchors[transition.anchorId]?.rangesByLanguage[language]
    return {
      id: transition.id,
      phase: `Step ${index + 1}`,
      title: transition.title,
      action: transition.action,
      input: trace.inputLabel,
      expectedOutput: formatTraceValue(trace.expectedOutput),
      currentOutput: formatTraceValue(transition.after.output),
      processed: progressLabel(transition.after, 'processed'),
      remaining: progressLabel(transition.after, 'remaining'),
      activeCodeLines: range ? Array.from({ length: range.endLine - range.startLine + 1 }, (_, offset) => range.startLine + offset) : [0],
      variables: variables(transition.before, transition.after),
      structures: structures(transition.before, transition.after),
      invariant: transition.invariant.statement,
    }
  })]
}
