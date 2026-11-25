import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium, expect } from '@playwright/test'
import { build } from './fixture-build.mjs'

const result = await build({
  logLevel: 'silent',
  define: { 'process.env.NODE_ENV': '"development"', 'process.env': '{}' },
  plugins: [
    {
      name: 'delay-native-bridges-for-browser-lifetime-check',
      transform(code, id) {
        if (/\/native(Menu|Select)\.ts$/.test(id))
          return code.replace(
            'return (await import(',
            'await globalThis.__bootstrapNativeReady; return (await import(',
          )
      },
    },
  ],
  build: {
    write: false,
    lib: {
      entry: fileURLToPath(
        new URL('./fixtures/native-lifetime.ts', import.meta.url),
      ),
      formats: ['iife'],
      name: 'NativeLifetime',
    },
  },
})
const output = (Array.isArray(result) ? result : [result]).flatMap(
  (item) => item.output,
)
const code = output.find((item) => item.type === 'chunk').code
const css = output
  .filter((item) => item.type === 'asset' && item.fileName.endsWith('.css'))
  .map((item) => item.source)
  .join('\n')
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? '/usr/bin/chromium',
})
const records = []
try {
  for (const intent of [
    'pointer',
    'select-keyboard',
    'menu-keyboard',
    'cancel',
    'double-click',
    'dispose',
  ]) {
    const page = await browser.newPage()
    page.setDefaultTimeout(6000)
    const errors = []
    page.on('pageerror', (error) => errors.push(String(error)))
    await page.route('http://native-import.test/', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: `<!doctype html><html lang="en"><head><style>${css}</style></head><body></body></html>`,
      }),
    )
    try {
      await page.goto('http://native-import.test/')
      await page.addScriptTag({ content: code })
      await page.evaluate(async () => {
        window.__bootstrapNativeReady = new Promise((resolve) => {
          window.releaseNative = resolve
        })
        window.example = await window.NativeLifetime.prepare()
        window.example.mount()
      })
      const trigger = page.getByRole('combobox', { name: 'Category' })
      if (intent === 'menu-keyboard') {
        await page.locator('[data-entry-key=first]').focus()
        await page.keyboard.press('ArrowDown')
      } else if (intent === 'select-keyboard') {
        await trigger.focus()
        await page.keyboard.press('Home')
      } else await trigger.click()
      if (intent === 'cancel') await page.keyboard.press('Escape')
      if (intent === 'double-click') await trigger.click()
      if (intent === 'dispose')
        await page.evaluate(() => window.example.dispose())
      await page.evaluate(() => window.releaseNative())
      if (intent === 'menu-keyboard')
        await expect(page.locator('[data-entry-key=second]')).toBeFocused()
      else if (intent !== 'dispose')
        await expect(trigger).toHaveAttribute(
          'aria-expanded',
          ['cancel', 'double-click'].includes(intent) ? 'false' : 'true',
        )
      await page.waitForTimeout(80)
      assert.deepEqual(
        await page.evaluate(() => [...window.example.errors]),
        [],
      )
      assert.deepEqual(errors, [])
      if (intent !== 'dispose')
        await page.evaluate(() => window.example.dispose())
      await page.waitForTimeout(40)
      assert.equal(
        await page.evaluate(() => window.example.host.isConnected),
        false,
      )
      assert.deepEqual(errors, [])
      records.push({ intent, passed: true })
    } finally {
      await page.close()
    }
  }
  mkdirSync('var/native-table-ssr/native-import-browser', { recursive: true })
  writeFileSync(
    'var/native-table-ssr/native-import-browser/results.json',
    JSON.stringify({ browser: browser.version(), records }, null, 2) + '\n',
  )
  console.log(
    `Bootstrap native import lifecycle: ${records.length} Chromium cases passed`,
  )
} finally {
  await browser.close()
}
