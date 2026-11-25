import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Bootstrap focus waits for native details reveal and abandons obsolete requests', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/reveal-focus.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'RevealFocus',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((r) => r.output)
    .find((r) => r.type === 'chunk').code
  const dom = new JSDOM(
    '<button>Before</button><details class="accordion-item" open><summary>Billing</summary><input></details><button id="after">After</button>',
    {
      url: 'http://localhost/',
      runScripts: 'outside-only',
      pretendToBeVisual: true,
    },
  )
  try {
    installDomEnvironment(dom.window)
    dom.window.eval(code)
    const document = dom.window.document
    const input = document.querySelector('input')
    const details = document.querySelector('details')
    const before = document.querySelector('button')
    const after = document.querySelector('#after')
    // Reproduce the browser evidence: details-content is hidden while the
    // animation API exposes no reveal effect. Drive rendering deterministically.
    let revealing = true
    let now = 0
    const frames = []
    dom.window.requestAnimationFrame = (callback) => frames.push(callback)
    Object.defineProperty(dom.window.performance, 'now', { value: () => now })
    const computed = dom.window.getComputedStyle.bind(dom.window)
    dom.window.getComputedStyle = (element, pseudo) =>
      element === details && pseudo === '::details-content'
        ? {
            contentVisibility: revealing ? 'hidden' : 'visible',
            transitionDuration: '0.2s',
            transitionDelay: '0s',
          }
        : computed(element)
    details.getAnimations = () => []
    const nativeFocus = input.focus.bind(input)
    let focusCalls = 0
    input.focus = () => {
      focusCalls++
      if (!revealing) nativeFocus()
    }
    const tick = async () => {
      for (let turn = 0; turn < 10; turn++) await Promise.resolve()
    }
    const render = async () => {
      now += 16
      for (const callback of frames.splice(0)) callback(now)
      await tick()
    }
    for (const outcome of [
      'complete',
      'closed',
      'moved',
      'disabled',
      'replaced',
      'disconnected',
      'already-visible',
      'stays-hidden',
    ]) {
      details.append(input)
      details.open = true
      revealing = outcome !== 'already-visible'
      focusCalls = 0
      let disabled = false
      let target = input
      before.focus()
      let settled = false
      const requested = dom.window.RevealFocus.focus(
        () => target,
        () => disabled,
      ).then((result) => {
        settled = true
        return result
      })
      await tick()
      if (outcome !== 'already-visible') {
        assert.equal(
          focusCalls,
          0,
          'never attempt focus on hidden native content',
        )
        // The first rendering opportunity can still report hidden content.
        await render()
        assert.equal(
          settled,
          false,
          'wait on visibility, not animation discovery',
        )
        if (outcome === 'closed') details.open = false
        if (outcome === 'moved') after.focus()
        if (outcome === 'disabled') disabled = true
        if (outcome === 'replaced') target = null
        if (outcome === 'disconnected') input.remove()
        if (outcome !== 'stays-hidden') revealing = false
        for (let turn = 0; !settled && turn < 20; turn++) await render()
      }
      assert.ok(
        settled,
        'a permanently hidden target must not leave focus pending',
      )
      const succeeds = outcome === 'complete' || outcome === 'already-visible'
      assert.equal(await requested, succeeds, outcome)
      assert.equal(focusCalls, succeeds ? 1 : 0, outcome)
      assert.equal(
        document.activeElement,
        succeeds ? input : outcome === 'moved' ? after : before,
        outcome,
      )
    }
  } finally {
    dom.window.close()
  }
})
