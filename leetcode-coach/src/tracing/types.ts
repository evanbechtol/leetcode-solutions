export type TraceQuality = 'exact-reviewed' | 'instructional-overview'

export type TraceValue =
  | { kind: 'null' }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'number'; value: number }
  | { kind: 'string'; value: string }
  | { kind: 'infinity'; sign: 1 | -1 }
  | { kind: 'node-reference'; nodeId: string | null }
  | { kind: 'array'; items: TraceValue[] }
  | { kind: 'object'; entries: Record<string, TraceValue> }
  | { kind: 'pending'; label?: string }

export type TraceVariableRole = 'input' | 'control' | 'state' | 'output'

export interface TraceVariable {
  id: string
  name: string
  role: TraceVariableRole
  value: TraceValue
}

export type TraceItemStatus = 'active' | 'processed' | 'candidate' | 'discarded' | 'queued' | 'result'

export interface TraceArrayItem {
  id: string
  index: number
  value: TraceValue
  status?: TraceItemStatus
}

export interface TraceMapEntry {
  id: string
  key: TraceValue
  value: TraceValue
  status?: TraceItemStatus
}

export type TraceStructure =
  | { id: string; name: string; kind: 'array'; description: string; items: TraceArrayItem[] }
  | { id: string; name: string; kind: 'map'; description: string; entries: TraceMapEntry[] }

export interface TraceSnapshot {
  variables: Record<string, TraceVariable>
  structures: Record<string, TraceStructure>
  output: TraceValue
}

export type TraceEvent =
  | { kind: 'initialize'; targetId: string; description: string }
  | { kind: 'read'; targetId: string; description: string }
  | { kind: 'compute'; targetId: string; description: string }
  | { kind: 'compare'; targetId: string; description: string; result: boolean }
  | { kind: 'write'; targetId: string; description: string }
  | { kind: 'discard-region'; structureId: string; from: number; to: number; description: string }
  | { kind: 'return'; description: string }

export interface CodeAnchorRange {
  startLine: number
  endLine: number
}

export interface CodeAnchor {
  id: string
  rangesByLanguage: Record<string, CodeAnchorRange>
}

export type InvariantStatus = 'holds' | 'temporarily-relaxed' | 'restored' | 'not-applicable'

export interface InvariantCheckpoint {
  statement: string
  status: InvariantStatus
  assertionId?: string
}

export interface TraceTransition {
  id: string
  title: string
  action: string
  before: TraceSnapshot
  after: TraceSnapshot
  events: TraceEvent[]
  anchorId: string
  invariant: InvariantCheckpoint
}

export interface ExecutionTrace {
  schemaVersion: 1
  quality: TraceQuality
  problemId: number
  fixtureId: string
  inputLabel: string
  expectedOutput: TraceValue
  initialState: TraceSnapshot
  transitions: TraceTransition[]
  anchors: Record<string, CodeAnchor>
  termination: string
  finalOutput: TraceValue
}
