import { expect, test } from '@playwright/test'

test('installs the complete app shell and opens lazy routes offline', async ({ context, page }) => {
  await page.goto('/#/today')
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready
    if (!registration.active) throw new Error('Service worker did not activate')
    localStorage.setItem('pathfinder-pwa-test', 'preserved')
  })
  await expect(page.getByRole('heading', { name: 'One useful next step.' })).toBeVisible()

  await context.setOffline(true)
  await page.reload()
  await page.evaluate(() => window.dispatchEvent(new Event('offline')))
  await expect(page.getByText('You’re offline. Downloaded lessons and practice remain available.')).toBeVisible()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('pathfinder-pwa-test'))).toBe('preserved')

  await page.goto('/#/learn')
  await expect(page.getByRole('heading', { name: /Understand the tools/ })).toBeVisible()
  await page.goto('/#/cheat-sheet')
  await expect(page.getByRole('heading', { name: /Recognize the pattern/ })).toBeVisible()
  await page.goto('/#/problems')
  await expect(page.getByRole('heading', { name: /Choose your next problem/ })).toBeVisible()
  await page.goto('/#/profile')
  await expect(page.getByRole('heading', { name: 'Progress, not perfection.' })).toBeVisible()
})

test('publishes scoped install metadata without third-party font requests', async ({ page }) => {
  const thirdPartyFontRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('fonts.googleapis.com') || request.url().includes('fonts.gstatic.com')) thirdPartyFontRequests.push(request.url())
  })
  await page.goto('/')
  const manifest = await page.evaluate(async () => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
    if (!link) throw new Error('Manifest link missing')
    return fetch(link.href).then((response) => response.json())
  })
  expect(manifest).toMatchObject({
    name: 'Pathfinder — LeetCode Coach',
    display: 'standalone',
    start_url: './#/today',
    scope: './',
  })
  expect(manifest.icons).toEqual(expect.arrayContaining([expect.objectContaining({ sizes: '512x512' })]))
  expect(thirdPartyFontRequests).toEqual([])
})
