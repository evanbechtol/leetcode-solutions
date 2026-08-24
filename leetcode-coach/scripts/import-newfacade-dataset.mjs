import { gunzipSync } from 'node:zlib'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const version = 'v0.3.1'
const sourceBase = `https://raw.githubusercontent.com/newfacade/LeetCodeDataset/main/data/LeetCodeDataset-${version}`
const coreTopics = [
  { name: 'Array', aliases: ['Array'] },
  { name: 'String', aliases: ['String'] },
  { name: 'Hash Table', aliases: ['Hash Table'] },
  { name: 'Linked List', aliases: ['Linked List'] },
  { name: 'Tree', aliases: ['Tree', 'Binary Tree', 'Binary Search Tree'] },
  { name: 'Graph', aliases: ['Graph'] },
  { name: 'Dynamic Programming', aliases: ['Dynamic Programming'] },
  { name: 'Heap', aliases: ['Heap (Priority Queue)', 'Heap'] },
]
const perTopic = Number(process.env.CATALOG_PROBLEMS_PER_TOPIC || 20)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/data/catalog.generated.json')

function titleFromSlug(slug) {
  const small = new Set(['a', 'an', 'and', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'or', 'the', 'to', 'with'])
  return slug.split('-').map((word, index) => {
    if (/^[ivx]+$/i.test(word)) return word.toUpperCase()
    if (index && small.has(word)) return word
    return word.charAt(0).toUpperCase() + word.slice(1)
  }).join(' ')
}

function normalizeText(value = '') {
  return value.replace(/\u00a0/g, ' ').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim()
}

function parseDescription(raw) {
  const text = normalizeText(raw)
  const firstExample = text.search(/\nExample\s+1\s*:/i)
  const constraintsAt = text.search(/\nConstraints\s*:/i)
  const descriptionEnd = firstExample >= 0 ? firstExample : constraintsAt >= 0 ? constraintsAt : text.length
  const description = text.slice(0, descriptionEnd).trim()
  const exampleSection = firstExample >= 0
    ? text.slice(firstExample, constraintsAt >= 0 ? constraintsAt : text.length)
    : ''
  const input = exampleSection.match(/Input:\s*([^\n]+)/i)?.[1]?.trim() || 'See problem statement'
  const output = exampleSection.match(/Output:\s*([^\n]+)/i)?.[1]?.trim() || 'See expected result'
  const explanation = exampleSection.match(/Explanation:\s*([^\n]+(?:\n(?!Example\s+\d|Constraints:)[^\n]+){0,2})/i)?.[1]?.trim()
  const constraints = constraintsAt >= 0
    ? text.slice(constraintsAt).replace(/^\n?Constraints\s*:\s*/i, '').split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 8)
    : []
  return { description, examples: [{ input, output, ...(explanation ? { explanation } : {}) }], constraints }
}

function parseArchive(buffer) {
  return gunzipSync(buffer).toString('utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line))
}

async function download(split) {
  const url = `${sourceBase}-${split}.jsonl.gz`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not download ${url}: ${response.status}`)
  return parseArchive(Buffer.from(await response.arrayBuffer()))
}

const records = [...await download('train'), ...await download('test')]
  .filter((record) => Number.isFinite(Number(record.question_id)) && record.problem_description && record.tags?.length)
  .sort((a, b) => Number(a.question_id) - Number(b.question_id))

const selected = new Map()
for (const topic of coreTopics) {
  const matches = records
    .filter((record) => topic.aliases.some((alias) => record.tags.includes(alias)))
    .filter((record) => record.difficulty !== 'Hard' || Number(record.question_id) < 500)
    .slice(0, perTopic)
  for (const record of matches) selected.set(String(record.question_id), record)
}

const catalog = [...selected.values()].map((record) => {
  const parsed = parseDescription(record.problem_description)
  const normalizedTopics = coreTopics.filter((topic) => topic.aliases.some((alias) => record.tags.includes(alias))).map((topic) => topic.name)
  const otherTags = record.tags.filter((tag) => !coreTopics.some((topic) => topic.aliases.includes(tag)))
  return {
    id: Number(record.question_id),
    title: titleFromSlug(record.task_id),
    difficulty: record.difficulty,
    set: normalizedTopics.map((topic) => `${topic} Foundations`),
    topics: normalizedTopics,
    algorithms: otherTags.length ? otherTags.slice(0, 4) : normalizedTopics,
    ...parsed,
    insight: '',
    solution: normalizeText(record.completion || record.response || ''),
    questions: [],
    starterCode: normalizeText(record.starter_code || ''),
    solutionLanguage: 'Python',
    source: {
      name: 'newfacade/LeetCodeDataset',
      version,
      repository: 'https://github.com/newfacade/LeetCodeDataset',
      license: 'MIT',
      slug: record.task_id,
    },
  }
})

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`)
console.log(`Imported ${catalog.length} unique problems (${perTopic} per core topic target) to ${outputPath}`)
for (const topic of coreTopics) {
  console.log(`${topic.name}: ${catalog.filter((problem) => problem.topics.includes(topic.name)).length}`)
}
