/**
 * Evidence extractor for miroslavpejic85/mirotalksfu CI (.github/workflows/ci.yml, jobs `test` and `build`).
 *
 * Checks proved, each as a named unit that keeps the same id whatever the Dockerfile layout:
 *  - `mocha:<top-level suite>` and `mocha:total` from the `test` job's `npm test` (mocha spec reporter): every
 *    top-level suite passes with no failing case, and the run's `N passing` equals the passing cases seen.
 *  - `npm-ci:test-job`: the `test` job's own `npm ci`.
 *  - per target platform (`linux/amd64`, `linux/arm64`) from the `build` job's BuildKit plain progress:
 *      `npm-ci:<platform>`           the app's `npm ci --omit=dev` step (with or without MEDIASOUP_WORKER_BIN),
 *      `mediasoup-worker:<platform>` the mediasoup C++ worker build, wherever it happens: inside `npm ci` before
 *                                    lever 01, in its own stage (`npm install --no-save mediasoup@...`) after it,
 *      `image:<platform>`            the final image's application layers (app, public, config.js).
 *
 * Units and verdicts come only from the job logs. A unit passes when BuildKit ran it to completion in this sample
 * (`#N DONE`), fails on `#N ERROR` or when it cannot be found, and is `reused` when BuildKit restored it from cache.
 * Cross-compile levers rename stages (`linux/amd64->arm64`), add `$BUILDPLATFORM` stages and change k/n, so units key
 * on the target platform and the step's command, never on stage names or step numbers.
 */
import type { EvidenceExtractor, EvidenceJob } from '../src/evidence-collect.ts'
import type { TestCaseVerdictRecord } from '../src/parity.ts'

export const PLATFORMS = ['linux/amd64', 'linux/arm64'] as const

export interface BuildkitVertex {
  /** Target platform: `linux/arm64` for a native `[linux/arm64 ...]` and a cross `[linux/amd64->arm64 ...]` step. */
  target: string | undefined
  stage: string
  command: string
  done: boolean
  cached: boolean
  error: boolean
}

const STEP =
  /^#(\d+) \[(?:(linux\/\w+(?:\/v\d+)?)(?:->(\w+(?:\/v\d+)?))? )?([\w.-]+)\s+\d+\/\d+\] (.*)$/

/** BuildKit's plain-progress vertices (`#N [platform stage k/n] COMMAND` followed by `#N DONE|CACHED|ERROR`). */
export function buildkitVertices(log: string): BuildkitVertex[] {
  const vertices = new Map<string, BuildkitVertex>()
  for (const line of log.split('\n')) {
    const step = STEP.exec(line)
    if (step) {
      const [, id = '', platform, cross, stage = '', command = ''] = step
      if (!vertices.has(id))
        vertices.set(id, {
          target: cross ? `linux/${cross}` : platform,
          stage,
          command: command.replace(/\s+/g, ' ').trim(),
          done: false,
          cached: false,
          error: false,
        })
      continue
    }
    const end = /^#(\d+) (DONE|CACHED|ERROR)\b/.exec(line)
    const vertex = end ? vertices.get(end[1] ?? '') : undefined
    if (!vertex) continue
    if (end?.[2] === 'DONE') vertex.done = true
    else if (end?.[2] === 'CACHED') vertex.cached = true
    else vertex.error = true
  }
  return [...vertices.values()]
}

type Outcome = Pick<TestCaseVerdictRecord, 'verdict' | 'mode'>

function verdictOf(vertices: BuildkitVertex[]): Outcome {
  if (!vertices.length || vertices.some((v) => v.error)) return { verdict: 'failed', mode: 'executed' }
  if (vertices.every((v) => v.done)) return { verdict: 'passed', mode: 'executed' }
  if (vertices.every((v) => v.done || v.cached)) return { verdict: 'passed', mode: 'reused' }
  return { verdict: 'failed', mode: 'executed' }
}

export interface MochaSuite {
  passed: number
  failed: number
  pending: number
}

export interface MochaResult {
  suites: Map<string, MochaSuite>
  /** The summary line's counts, `undefined` when the run never printed one. */
  summary: { passing: number; failing: number; pending: number } | undefined
}

/** Mocha spec-reporter output of `mocha tests/*.js`: per top-level suite case counts plus the summary line. */
export function parseMocha(log: string): MochaResult {
  const suites = new Map<string, MochaSuite>()
  const lines = log.split('\n')
  const start = lines.findIndex((l) => /^> mocha\b/.test(l))
  let current = '(root)'
  let summary: MochaResult['summary']
  const suite = () => {
    let s = suites.get(current)
    if (!s) suites.set(current, (s = { passed: 0, failed: 0, pending: 0 }))
    return s
  }
  for (let i = start < 0 ? lines.length : start + 1; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const total = /^\s+(\d+) passing\b/.exec(line)
    if (total) {
      summary = { passing: Number(total[1]), failing: 0, pending: 0 }
      continue
    }
    if (summary) {
      const failing = /^\s+(\d+) failing\b/.exec(line)
      const pending = /^\s+(\d+) pending\b/.exec(line)
      if (failing) summary.failing = Number(failing[1])
      if (pending) summary.pending = Number(pending[1])
      continue
    }
    if (/^\s+(?:✔|✓)\s/.test(line)) suite().passed++
    else if (/^\s+\d+\) \S/.test(line)) suite().failed++
    else if (/^\s+- \S/.test(line)) suite().pending++
    else {
      // A top-level `describe`: two-space indent, a blank line before it and an indented line after it. Tests print
      // console output into the same stream (objects, `  key: value` lines), which must not become suites.
      const top = /^ {2}(\S.*?)\s*$/.exec(line)
      if (top?.[1] && (lines[i - 1] ?? '').trim() === '' && /^ {4}\S/.test(lines[i + 1] ?? '')) current = top[1]
      // Console output can wrap a header (full-1 cold rep1, job 133120995303: `  producerId: ...`, the header, then
      // `}`). Also accept a bare title (no `:`, quote, comma or bracket) when, skipping only closing brackets, the next
      // line is a test result.
      else if (top?.[1] && !/[:'"`,{}[\]()]/.test(top[1])) {
        let j = i + 1
        while (/^\s*[}\])]+[,;]?\s*$/.test(lines[j] ?? '')) j++
        if (/^ {4}(?:✔|✓|\d+\) |- )/.test(lines[j] ?? '')) current = top[1]
      }
    }
  }
  for (const [name, s] of suites) if (!s.passed && !s.failed && !s.pending) suites.delete(name)
  return { suites, summary }
}

const stepConclusion = (job: EvidenceJob, pattern: RegExp) => job.steps.find((s) => pattern.test(s.name))?.conclusion

function findJob(jobs: EvidenceJob[], id: string): EvidenceJob | undefined {
  const ciJobs = jobs.filter((j) => j.workflowPath.endsWith('ci.yml'))
  const named = (j: EvidenceJob) => j.logicalJobId === id || new RegExp(`^${id}\\b`, 'i').test(j.jobName)
  return ciJobs.find(named)
}

const ok = (conclusion: string | null | undefined) => conclusion === undefined || conclusion === 'success'

const NPM_CI = /\bnpm ci --omit=dev\b/
const WORKER_BUILD = /\bnpm install --no-save "?mediasoup@/

const extract: EvidenceExtractor = ({ jobs }) => {
  const units = new Map<string, Outcome>()
  const commands = new Set<string>()
  const fail: Outcome = { verdict: 'failed', mode: 'executed' }

  // test job: mocha suites and the host `npm ci`
  const test = findJob(jobs, 'test')
  const testPassed = test?.conclusion === 'success'
  const mocha = test ? parseMocha(test.log) : { suites: new Map<string, MochaSuite>(), summary: undefined }
  const testStep = test ? stepConclusion(test, /npm test/) : undefined
  for (const [name, s] of mocha.suites) {
    const good = ok(testStep) && s.failed === 0 && s.passed > 0
    const skippedOnly = ok(testStep) && s.failed === 0 && s.passed === 0 && s.pending > 0
    units.set(
      `mocha:${name}`,
      skippedOnly ? { verdict: 'skipped', mode: 'skipped' } : good ? { verdict: 'passed', mode: 'executed' } : fail,
    )
  }
  const seen = [...mocha.suites.values()].reduce((n, s) => n + s.passed, 0)
  const sum = mocha.summary
  units.set(
    'mocha:total',
    sum && ok(testStep) && sum.failing === 0 && sum.passing > 0 && sum.passing === seen
      ? { verdict: 'passed', mode: 'executed' }
      : fail,
  )
  const hostCiLog = test?.log.split('\n').slice(test.log.split('\n').findIndex((l) => /^##\[group\]Run npm ci\b/.test(l)))
  const hostCiOk = hostCiLog?.some((l) => /^added \d+ packages\b/.test(l)) && !hostCiLog.some((l) => /^npm (ERR|error)/.test(l))
  units.set(
    'npm-ci:test-job',
    test && hostCiOk && ok(stepConclusion(test, /^Run npm ci$/)) ? { verdict: 'passed', mode: 'executed' } : fail,
  )
  if (test && /^##\[group\]Run npm test\b/m.test(test.log)) commands.add('npm test')
  if (test && /^##\[group\]Run npm ci\b/m.test(test.log)) commands.add('npm ci')

  // build job: BuildKit units per target platform
  const build = findJob(jobs, 'build')
  const vertices = build ? buildkitVertices(build.log) : []
  const buildStep = build ? (stepConclusion(build, /^Build (&|and) [Pp]ush/) ?? build.conclusion) : undefined
  const buildPassed = buildStep === 'success'
  for (const platform of PLATFORMS) {
    const on = vertices.filter((v) => v.target === platform)
    const npmCi = on.filter((v) => NPM_CI.test(v.command))
    const workerStage = on.filter((v) => WORKER_BUILD.test(v.command))
    // Before lever 01 the worker is built by mediasoup's install step inside the app's `npm ci`; after it, in its own
    // stage, and `npm ci` runs with MEDIASOUP_WORKER_BIN so it skips the build.
    const worker = workerStage.length ? workerStage : npmCi.filter((v) => !/MEDIASOUP_WORKER_BIN=/.test(v.command))
    const image = (fragment: string) => on.filter((v) => /^COPY --chown=node:node /.test(v.command) && v.command.includes(fragment))
    const layers = ['./app', './public', 'config.js'].map(image)
    const imageVertices = layers.flat()
    const imageOutcome = layers.every((l) => l.length) ? verdictOf(imageVertices) : fail
    const wrap = (o: Outcome): Outcome => (buildPassed ? o : fail)
    units.set(`npm-ci:${platform}`, wrap(verdictOf(npmCi)))
    units.set(`mediasoup-worker:${platform}`, wrap(verdictOf(worker)))
    units.set(`image:${platform}`, wrap(imageOutcome))
    for (const v of [...npmCi, ...worker]) commands.add(v.command.replace(/MEDIASOUP_WORKER_BIN=\S+ /, '').replace(/,id=\S+/, ''))
  }

  const tests: TestCaseVerdictRecord[] = [...units]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([testId, o]) => ({ testId, verdict: testPassed || !testId.startsWith('mocha:') ? o.verdict : 'failed', mode: o.mode }))
  const passed = new Set(tests.filter((t) => t.verdict === 'passed').map((t) => t.testId))
  const obligations = PLATFORMS.filter(
    (p) => passed.has(`npm-ci:${p}`) && passed.has(`mediasoup-worker:${p}`) && passed.has(`image:${p}`),
  ).map((p) => `release-image:${p}`)
  if (passed.has('mocha:total')) obligations.push('unit-tests')
  return {
    tests,
    coverage: { scope: [...units.keys()].sort(), covered: [...passed].sort() },
    obligations: obligations.sort(),
    commands: [...commands].sort(),
  }
}

export default extract
