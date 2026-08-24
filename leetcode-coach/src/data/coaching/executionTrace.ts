import type { Problem, VisualizationFrame } from '../../types'
import type { BeginnerPatternProfile } from './beginnerProfiles'

interface InputVariable { name: string; value: string }

const splitTopLevel = (value: string) => {
  const parts: string[] = []
  let start = 0
  let depth = 0
  let quote = ''
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index]
    if (quote) {
      if (character === quote && value[index - 1] !== '\\') quote = ''
      continue
    }
    if (character === '"' || character === "'") quote = character
    else if ('[({'.includes(character)) depth += 1
    else if (']})'.includes(character)) depth -= 1
    else if (character === ',' && depth === 0) {
      parts.push(value.slice(start, index).trim())
      start = index + 1
    }
  }
  parts.push(value.slice(start).trim())
  return parts.filter(Boolean)
}

const inputVariables = (input: string): InputVariable[] => {
  const variables = splitTopLevel(input).map((part, index) => {
    const separator = part.indexOf('=')
    if (separator < 0) return { name: index ? `input${index + 1}` : 'input', value: part }
    const name = part.slice(0, separator).trim().replace(/[^\w.[\]]/g, '') || `input${index + 1}`
    return { name, value: part.slice(separator + 1).trim() || 'Not included in the imported example' }
  })
  return variables.length ? variables : [{ name: 'input', value: input }]
}

const codeLineGroups = (code: string) => {
  const lines = code.split('\n')
  const nonEmpty = lines.map((line, index) => ({ line, index })).filter(({ line }) => line.trim())
  const controlStart = nonEmpty.find(({ line }) => /^\s*(for|while)\b|^\s*}?\s*(for|while)\s*\(/.test(line))?.index ?? Math.min(2, lines.length - 1)
  const returnLines = nonEmpty.filter(({ line }) => /\breturn\b/.test(line)).map(({ index }) => index)
  const lastReturn = returnLines.at(-1) ?? lines.length - 1
  const setup = nonEmpty
    .filter(({ line, index }) => index < controlStart && index > 0 && /=|new Map|new Set/.test(line))
    .map(({ index }) => index)
  const loopCandidates = nonEmpty
    .filter(({ index }) => index >= controlStart && index < lastReturn)
    .slice(0, 6)
    .map(({ index }) => index)
  const loop = loopCandidates.length ? loopCandidates : [Math.max(0, Math.min(controlStart, lines.length - 1))]
  return {
    start: nonEmpty.slice(0, 2).map(({ index }) => index),
    setup: setup.length ? setup : nonEmpty.slice(1, 3).map(({ index }) => index),
    control: loop.slice(0, 2),
    update: loop.slice(1, 5).length ? loop.slice(1, 5) : loop,
    finish: returnLines.length ? returnLines : [lastReturn],
  }
}

const inputState = (variables: InputVariable[]) => variables.map(({ name, value }) => ({
  name,
  value,
  role: 'input' as const,
}))

export const buildExecutionTrace = (
  problem: Problem,
  beginner: BeginnerPatternProfile,
  input: string,
  expectedOutput: string,
): VisualizationFrame[] => {
  const inputs = inputVariables(input)
  const exactInputs = inputState(inputs)
  const lines = codeLineGroups(problem.solution)
  const primaryInput = inputs[0]?.name ?? 'input'
  const pendingOutput = 'Not produced yet'

  return [
    {
      id: 'input', phase: 'Step 0', title: 'Load the example',
      action: 'Read every input variable and the output the algorithm must eventually produce.',
      input, expectedOutput, currentOutput: pendingOutput,
      processed: 'Nothing', remaining: 'The entire example', activeCodeLines: lines.start,
      variables: [
        ...exactInputs,
        { name: 'iteration', value: 'Not started', role: 'control' },
        { name: 'algorithmState', value: 'Not initialized', role: 'state' },
        { name: 'output', value: pendingOutput, role: 'output' },
      ],
      invariant: 'No input has been processed, so the algorithm has not made any claims yet.',
    },
    {
      id: 'initialize', phase: 'Step 1', title: 'Initialize the algorithm state',
      action: beginner.memory,
      input, expectedOutput, currentOutput: pendingOutput,
      processed: 'Nothing', remaining: 'The entire example', activeCodeLines: lines.setup,
      variables: [
        ...exactInputs,
        { name: 'iteration', value: '0', previousValue: 'Not started', changed: true, role: 'control' },
        { name: 'algorithmState', value: beginner.memory, previousValue: 'Not initialized', changed: true, role: 'state' },
        { name: 'processedWork', value: 'None', role: 'state' },
        { name: 'output', value: pendingOutput, role: 'output' },
      ],
      invariant: 'The initialized state correctly represents an empty processed region.',
    },
    {
      id: 'before-first-update', phase: 'Step 2', title: 'Prepare the first update',
      action: `Select the first eligible unit of work from ${primaryInput} and evaluate the loop, recursion, or frontier condition.`,
      input, expectedOutput, currentOutput: pendingOutput,
      processed: 'Nothing', remaining: `All work represented by ${primaryInput}`, activeCodeLines: lines.control,
      variables: [
        ...exactInputs,
        { name: 'iteration', value: '1 — before update', previousValue: '0', changed: true, role: 'control' },
        { name: 'currentWork', value: `First eligible unit from ${primaryInput}`, changed: true, role: 'control' },
        { name: 'processedWork', value: 'None', role: 'state' },
        { name: 'remainingWork', value: `All work represented by ${primaryInput}`, role: 'state' },
        { name: 'algorithmState', value: beginner.memory, role: 'state' },
        { name: 'output', value: pendingOutput, role: 'output' },
      ],
      invariant: beginner.promise,
    },
    {
      id: 'after-first-update', phase: 'Step 3', title: 'Apply the update once',
      action: beginner.step,
      input, expectedOutput, currentOutput: 'Pending unless this step satisfies the return condition',
      processed: 'The first eligible unit', remaining: `Every later unit represented by ${primaryInput}`, activeCodeLines: lines.update,
      variables: [
        ...exactInputs,
        { name: 'iteration', value: '1 — complete', previousValue: '1 — before update', changed: true, role: 'control' },
        { name: 'currentWork', value: 'First eligible unit — handled', previousValue: `First eligible unit from ${primaryInput}`, changed: true, role: 'control' },
        { name: 'processedWork', value: 'First eligible unit', previousValue: 'None', changed: true, role: 'state' },
        { name: 'remainingWork', value: `Every later unit represented by ${primaryInput}`, previousValue: `All work represented by ${primaryInput}`, changed: true, role: 'state' },
        { name: 'algorithmState', value: `Updated once using: ${beginner.step}`, previousValue: beginner.memory, changed: true, role: 'state' },
        { name: 'output', value: 'Pending or returned if the stopping condition is met', previousValue: pendingOutput, changed: true, role: 'output' },
      ],
      invariant: beginner.promise,
    },
    {
      id: 'repeat', phase: 'Step 4', title: 'Repeat for the remaining work',
      action: `Repeat the same update for each next eligible unit: ${beginner.step}`,
      input, expectedOutput, currentOutput: 'Updated whenever the algorithm finds or improves a candidate answer',
      processed: 'Every unit handled so far', remaining: 'Only work not yet reached by the control rule', activeCodeLines: [...new Set([...lines.control, ...lines.update])],
      variables: [
        ...exactInputs,
        { name: 'iteration', value: '2…n, until the stopping condition', previousValue: '1 — complete', changed: true, role: 'control' },
        { name: 'currentWork', value: 'The next eligible item, node, edge, range, or state', previousValue: 'First eligible unit — handled', changed: true, role: 'control' },
        { name: 'processedWork', value: 'Every unit completed before the current step', previousValue: 'First eligible unit', changed: true, role: 'state' },
        { name: 'remainingWork', value: 'Only units not reached yet', previousValue: `Every later unit represented by ${primaryInput}`, changed: true, role: 'state' },
        { name: 'algorithmState', value: `Current result after repeatedly applying: ${beginner.step}`, previousValue: `Updated once using: ${beginner.step}`, changed: true, role: 'state' },
        { name: 'output', value: 'Best or completed result known so far', previousValue: 'Pending or returned if the stopping condition is met', changed: true, role: 'output' },
      ],
      invariant: beginner.promise,
    },
    {
      id: 'finish', phase: 'Step 5', title: 'Return the completed result',
      action: beginner.why,
      input, expectedOutput, currentOutput: expectedOutput,
      processed: 'All required work', remaining: 'Nothing', activeCodeLines: lines.finish,
      variables: [
        ...exactInputs,
        { name: 'iteration', value: 'Complete', previousValue: '2…n, until the stopping condition', changed: true, role: 'control' },
        { name: 'currentWork', value: 'None', previousValue: 'The next eligible item, node, edge, range, or state', changed: true, role: 'control' },
        { name: 'processedWork', value: 'All required work', previousValue: 'Every unit completed before the current step', changed: true, role: 'state' },
        { name: 'remainingWork', value: 'Nothing', previousValue: 'Only units not reached yet', changed: true, role: 'state' },
        { name: 'algorithmState', value: 'Final state satisfies the required result', previousValue: `Current result after repeatedly applying: ${beginner.step}`, changed: true, role: 'state' },
        { name: 'output', value: expectedOutput, previousValue: 'Best or completed result known so far', changed: true, role: 'output' },
      ],
      invariant: 'All required work is complete, so the final state gives the requested output.',
    },
  ]
}
