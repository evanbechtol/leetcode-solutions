export interface LearningTrack {
  id: string
  title: string
  description: string
  icon: string
  lessonSlugs: string[]
  representativeProblemIds: number[]
  entryProblemId: number
  prerequisiteTrackIds: string[]
  topic: string
}

// This is an authored learning order. Topic tags describe content, but they are
// not reliable enough to define prerequisites or a beginner's first activity.
export const learningTracks: LearningTrack[] = [
  {
    id: 'arrays', title: 'Arrays', description: 'Index-based data, scans, and prefix information.', icon: 'mdi-view-grid-outline',
    lessonSlugs: ['arrays-hash-maps'], representativeProblemIds: [1, 121], entryProblemId: 1, prerequisiteTrackIds: [], topic: 'Array',
  },
  {
    id: 'strings', title: 'Strings', description: 'Character sequences, windows, and direct scans.', icon: 'mdi-format-text',
    lessonSlugs: ['sliding-window'], representativeProblemIds: [3, 28], entryProblemId: 3, prerequisiteTrackIds: ['arrays'], topic: 'String',
  },
  {
    id: 'hash-maps', title: 'Hash Maps', description: 'Keyed lookup, membership, frequencies, and complements.', icon: 'mdi-table-key',
    lessonSlugs: ['arrays-hash-maps'], representativeProblemIds: [1], entryProblemId: 1, prerequisiteTrackIds: ['arrays'], topic: 'Hash Table',
  },
  {
    id: 'linked-lists', title: 'Linked Lists', description: 'Node references, rewiring, and pointer roles.', icon: 'mdi-link-variant',
    lessonSlugs: ['linked-lists'], representativeProblemIds: [206, 141], entryProblemId: 206, prerequisiteTrackIds: [], topic: 'Linked List',
  },
  {
    id: 'trees', title: 'Trees', description: 'Hierarchy, traversal, recursion, and search invariants.', icon: 'mdi-file-tree-outline',
    lessonSlugs: ['trees'], representativeProblemIds: [104, 102], entryProblemId: 104, prerequisiteTrackIds: ['arrays'], topic: 'Tree',
  },
  {
    id: 'graphs', title: 'Graphs', description: 'Relationships, traversal, reachability, and dependencies.', icon: 'mdi-graph-outline',
    lessonSlugs: ['graphs', 'graph-traversal'], representativeProblemIds: [207, 261], entryProblemId: 207, prerequisiteTrackIds: ['trees'], topic: 'Graph',
  },
  {
    id: 'dynamic-programming', title: 'Dynamic Programming', description: 'Overlapping subproblems and reusable decisions.', icon: 'mdi-table-large',
    lessonSlugs: ['dynamic-programming'], representativeProblemIds: [70, 139], entryProblemId: 70, prerequisiteTrackIds: ['arrays'], topic: 'Dynamic Programming',
  },
  {
    id: 'heaps', title: 'Heaps', description: 'Priority-based access to the next most important item.', icon: 'mdi-triangle-outline',
    lessonSlugs: ['heaps'], representativeProblemIds: [215, 23], entryProblemId: 215, prerequisiteTrackIds: ['arrays'], topic: 'Heap',
  },
]

export const learningTrackById = Object.fromEntries(learningTracks.map((track) => [track.id, track])) as Record<string, LearningTrack>
