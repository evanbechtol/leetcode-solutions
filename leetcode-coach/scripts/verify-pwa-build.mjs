import { readdir, readFile, stat } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'
import process from 'node:process'

const root = resolve('dist')
const manifestPath = resolve(root, 'manifest.webmanifest')
const workerPath = resolve(root, 'sw.js')
const indexPath = resolve(root, 'index.html')
const cacheableExtensions = new Set(['.js', '.css', '.html', '.json', '.webmanifest', '.svg', '.png', '.ico', '.woff2'])

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? filesBelow(path) : [path]
  }))).flat()
}

function assert(condition, message) {
  if (!condition) throw new Error(`PWA verification failed: ${message}`)
}

function assertScopedUrl(value, label) {
  assert(typeof value === 'string' && value.length > 0, `${label} must be present`)
  assert(!value.startsWith('/') && !/^https?:/i.test(value), `${label} must stay relative to the deployment subpath: ${value}`)
}

const [manifestSource, workerSource, indexSource, files] = await Promise.all([
  readFile(manifestPath, 'utf8'),
  readFile(workerPath, 'utf8'),
  readFile(indexPath, 'utf8'),
  filesBelow(root),
])
const manifest = JSON.parse(manifestSource)

assert(manifest.name === 'Pathfinder — LeetCode Coach', 'manifest name is incorrect')
assert(manifest.short_name === 'Pathfinder', 'manifest short name is incorrect')
assert(manifest.display === 'standalone', 'manifest display must be standalone')
assert(manifest.theme_color === '#171A21', 'manifest theme color is incorrect')
assert(manifest.background_color === '#111318', 'manifest background color is incorrect')
assertScopedUrl(manifest.id, 'manifest id')
assertScopedUrl(manifest.scope, 'manifest scope')
assertScopedUrl(manifest.start_url, 'manifest start URL')
assert(Array.isArray(manifest.icons) && manifest.icons.some(({ sizes }) => sizes === '192x192'), '192x192 icon is missing')
assert(manifest.icons.some(({ sizes }) => sizes === '512x512'), '512x512 icon is missing')
assert(manifest.icons.some(({ purpose }) => purpose === 'maskable'), 'maskable icon is missing')
assert(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length === 3, 'Today, Practice, and Learn shortcuts are required')

for (const icon of manifest.icons) {
  assertScopedUrl(icon.src, `icon ${icon.sizes}`)
  await stat(resolve(root, icon.src))
}
for (const shortcut of manifest.shortcuts) assertScopedUrl(shortcut.url, `shortcut ${shortcut.name}`)

assert(/rel="manifest"[^>]+href="\.\/manifest\.webmanifest"/.test(indexSource), 'manifest link must be deployment-relative')
assert(!workerSource.includes('fonts.googleapis.com'), 'Google Fonts must not appear in the service worker')
assert(!workerSource.includes('/api/hint') && !workerSource.includes('/api/quiz'), 'AI endpoints must not appear in the service worker')

const excludedWorkerFiles = /^(sw\.js|workbox-[^/]+\.js)$/
const cacheableFiles = files
  .map((path) => relative(root, path).replaceAll('\\', '/'))
  .filter((path) => cacheableExtensions.has(extname(path)) && !excludedWorkerFiles.test(path))

for (const path of cacheableFiles) {
  assert(workerSource.includes(path), `precache is missing ${path}`)
}

const totalBytes = (await Promise.all(cacheableFiles.map(async (path) => (await stat(resolve(root, path))).size)))
  .reduce((sum, size) => sum + size, 0)

console.log(`PWA verified: ${cacheableFiles.length} local assets precached (${(totalBytes / 1024 / 1024).toFixed(2)} MiB).`)
