import type { Problem, VisualizationFrame } from '../../types'
import type { BeginnerPatternProfile } from './beginnerProfiles'
import { buildExactExecutionTrace } from './exactExecutionTraces'

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

const inputStructures = (variables: InputVariable[]): NonNullable<VisualizationFrame['structures']> => variables.flatMap(({ name, value }) => {
  const trimmed = value.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const members = splitTopLevel(trimmed.slice(1, -1))
    return [{
      name,
      kind: 'array' as const,
      description: 'Concrete input elements by index',
      items: members.map((member, index) => ({ key: String(index), value: member })),
    }]
  }
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return [{
      name,
      kind: 'string' as const,
      description: 'Concrete input characters by index',
      items: [...trimmed.slice(1, -1)].map((character, index) => ({ key: String(index), value: character === ' ' ? 'space' : character })),
    }]
  }
  return []
})

interface SourceSymbol { name: string; initializer: string; role: 'control' | 'state' }

const sourceSymbols = (code: string, inputNames: Set<string>): SourceSymbol[] => {
  const found: SourceSymbol[] = []
  const add = (name: string, initializer: string, line: string) => {
    if (!name || inputNames.has(name) || found.some((item) => item.name === name)) return
    const role = /\b(for|while)\b/.test(line) || /^(i|j|k|left|right|mid|index|start|end|node|current|row|col)$/.test(name) ? 'control' : 'state'
    found.push({ name, initializer: initializer.trim() || 'Declared by the canonical code', role })
  }
  for (const line of code.split('\n')) {
    const javascript = line.match(/\b(?:const|let|var)\s+(.+)$/)
    if (javascript) {
      for (const declaration of splitTopLevel(javascript[1])) {
        const match = declaration.match(/^([A-Za-z_$][\w$]*)\s*=\s*(.+?);?$/)
        if (match) add(match[1], match[2], line)
      }
    }
    const python = line.match(/^\s*([A-Za-z_]\w*)\s*=\s*(?!=)(.+)$/)
    if (python) add(python[1], python[2], line)
    const javascriptLoop = line.match(/\bfor\s*\(\s*(?:let|const|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]+)/)
    if (javascriptLoop) add(javascriptLoop[1], javascriptLoop[2], line)
    const pythonLoop = line.match(/^\s*for\s+([A-Za-z_]\w*)\s+in\s+(.+):/)
    if (pythonLoop) add(pythonLoop[1], pythonLoop[2], line)
  }
  return found.slice(0, 8)
}

const sourceVariableState = (
  symbols: SourceSymbol[], code: string, activeCodeLines: number[], phase: 'input' | 'initialize' | 'execute' | 'finish',
) => {
  const lines = code.split('\n')
  return symbols.map(({ name, initializer, role }) => {
    const pattern = new RegExp(`\\b${name.replace(/[$]/g, '\\$&')}\\b`)
    const activeLine = activeCodeLines.map((index) => lines[index]?.trim()).find((line) => line && pattern.test(line))
    const value = phase === 'input' ? 'Not initialized' : phase === 'finish' ? (activeLine || `Final ${name}`) : (activeLine || initializer)
    return { name, value, previousValue: phase === 'initialize' ? 'Not initialized' : undefined, changed: phase !== 'input' && Boolean(activeLine || phase === 'initialize'), role }
  })
}

export const buildExecutionTrace = (
  problem: Problem,
  beginner: BeginnerPatternProfile,
  input: string,
  expectedOutput: string,
): VisualizationFrame[] => {
  const exactTrace = buildExactExecutionTrace(problem)
  if (exactTrace) return exactTrace
  const inputs = inputVariables(input)
  const exactInputs = inputState(inputs)
  const exactStructures = inputStructures(inputs)
  const lines = codeLineGroups(problem.solution)
  const symbols = sourceSymbols(problem.solution, new Set([...inputs.map(({ name }) => name), 'output']))
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
        ...sourceVariableState(symbols, problem.solution, lines.start, 'input'),
        { name: 'output', value: pendingOutput, role: 'output' },
      ],
      structures: exactStructures,
      invariant: 'No input has been processed, so the algorithm has not made any claims yet.',
    },
    {
      id: 'initialize', phase: 'Step 1', title: 'Initialize the algorithm state',
      action: beginner.memory,
      input, expectedOutput, currentOutput: pendingOutput,
      processed: 'Nothing', remaining: 'The entire example', activeCodeLines: lines.setup,
      variables: [
        ...exactInputs,
        ...sourceVariableState(symbols, problem.solution, lines.setup, 'initialize'),
        { name: 'output', value: pendingOutput, role: 'output' },
      ],
      structures: exactStructures,
      invariant: 'The initialized state correctly represents an empty processed region.',
    },
    {
      id: 'before-first-update', phase: 'Step 2', title: 'Prepare the first update',
      action: `Select the first eligible unit of work from ${primaryInput} and evaluate the loop, recursion, or frontier condition.`,
      input, expectedOutput, currentOutput: pendingOutput,
      processed: 'Nothing', remaining: `All work represented by ${primaryInput}`, activeCodeLines: lines.control,
      variables: [
        ...exactInputs,
        ...sourceVariableState(symbols, problem.solution, lines.control, 'execute'),
        { name: 'output', value: pendingOutput, role: 'output' },
      ],
      structures: exactStructures,
      invariant: beginner.promise,
    },
    {
      id: 'after-first-update', phase: 'Step 3', title: 'Apply the update once',
      action: beginner.step,
      input, expectedOutput, currentOutput: 'Pending unless this step satisfies the return condition',
      processed: 'The first eligible unit', remaining: `Every later unit represented by ${primaryInput}`, activeCodeLines: lines.update,
      variables: [
        ...exactInputs,
        ...sourceVariableState(symbols, problem.solution, lines.update, 'execute'),
        { name: 'output', value: 'Pending or returned if the stopping condition is met', previousValue: pendingOutput, changed: true, role: 'output' },
      ],
      structures: exactStructures,
      invariant: beginner.promise,
    },
    {
      id: 'repeat', phase: 'Step 4', title: 'Repeat for the remaining work',
      action: `Repeat the same update for each next eligible unit: ${beginner.step}`,
      input, expectedOutput, currentOutput: 'Updated whenever the algorithm finds or improves a candidate answer',
      processed: 'Every unit handled so far', remaining: 'Only work not yet reached by the control rule', activeCodeLines: [...new Set([...lines.control, ...lines.update])],
      variables: [
        ...exactInputs,
        ...sourceVariableState(symbols, problem.solution, [...new Set([...lines.control, ...lines.update])], 'execute'),
        { name: 'output', value: 'Best or completed result known so far', previousValue: 'Pending or returned if the stopping condition is met', changed: true, role: 'output' },
      ],
      structures: exactStructures,
      invariant: beginner.promise,
    },
    {
      id: 'finish', phase: 'Step 5', title: 'Return the completed result',
      action: beginner.why,
      input, expectedOutput, currentOutput: expectedOutput,
      processed: 'All required work', remaining: 'Nothing', activeCodeLines: lines.finish,
      variables: [
        ...exactInputs,
        ...sourceVariableState(symbols, problem.solution, lines.finish, 'finish'),
        { name: 'output', value: expectedOutput, previousValue: 'Best or completed result known so far', changed: true, role: 'output' },
      ],
      structures: exactStructures,
      invariant: 'All required work is complete, so the final state gives the requested output.',
    },
  ]
}
