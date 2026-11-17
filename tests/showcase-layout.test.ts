/**
 * The "showcase" README layout (result table first, savings, one row per agent PR). Golden file:
 * docs/SHOWCASE-LAYOUT-EXAMPLE.md; `pnpm test -u` regenerates it. The default layout stays covered by
 * tests/showcase-example.test.ts.
 */
import { describe, expect, it } from 'vitest'
import fixtureConfig from './fixtures/definitelytyped.config.ts'
import type { SampleMeasurementResult } from '../src/collector.ts'
import { type BoundAssessment, observationHash } from '../src/evidence.ts'
import { createExperimentManifest } from '../src/manifest.ts'
import type { ScenarioReference } from '../src/reference.ts'
import { type BenchmarkExperimentReport, generateExperimentReport } from '../src/reporter.ts'
import { mergeFixArm } from '../src/fix-arm.ts'
import { renderShowcase } from '../src/showcase.ts'
import type { ShowcaseNarrative } from '../src/showcase-model.ts'
import type { VariantId } from '../src/types.ts'

const config = structuredClone(fixtureConfig)
type Manifest = ReturnType<typeof createExperimentManifest>
type Timing = Record<VariantId, { build: number; test: number }>
const at = (offset: number) => new Date(Date.UTC(2026, 10, 6) + offset * 1000).toISOString()

const seconds: Record<string, Timing> = {
  'main-push': {
    'github-baseline': { build: 540, test: 300 },
    'github-patched': { build: 150, test: 300 },
    'starsling-baseline': { build: 230, test: 130 },
    'starsling-patched': { build: 60, test: 130 },
  },
  'pr-single-package': {
    'github-baseline': { build: 420, test: 240 },
    'github-patched': { build: 120, test: 240 },
    'starsling-baseline': { build: 180, test: 100 },
    'starsling-patched': { build: 45, test: 100 },
  },
}
const jitter = (repetition: number) => ((repetition * 7) % 5) - 2

function sample(manifest: Manifest, request: Manifest['samples'][number], timing?: Timing): SampleMeasurementResult {
  const base = (timing ?? seconds[request.scenarioName])?.[request.variant]
  if (!base) throw new Error(`No timing for ${request.sampleId}`)
  const scale = request.profileName === 'warm' ? 0.8 : 1
  const build = Math.round(base.build * scale) + 3 * jitter(request.repetition)
  const test = Math.round(base.test * scale) + 2 * jitter(request.repetition + 1)
  const pr = request.scenarioName.startsWith('pr-')
  const label = request.variant.startsWith('github') ? 'ubuntu-24.04' : 'starsling-ubuntu-24.04'
  const runId = 1000 + manifest.samples.indexOf(request)
  const job = (id: number, name: string, duration: number, offset: number) => ({
    jobRecordId: runId * 10 + id,
    runId,
    runAttempt: 1,
    workflowPath: '.github/workflows/CI.yml',
    jobName: name,
    logicalJobId: name,
    conclusion: 'success' as const,
    durationSeconds: duration,
    dependencyWaitSeconds: 0,
    runnerQueueSeconds: 0,
    resolution: '1s' as const,
    labels: [label],
    startedAt: at(offset),
    completedAt: at(offset + duration),
    steps: [
      {
        number: 1,
        name: `Run ${name}`,
        conclusion: 'success' as const,
        durationSeconds: duration,
        resolution: '1s' as const,
        isHarnessInstrumentation: false,
      },
    ],
  })
  const wall = build + test
  return {
    ...request,
    inputFingerprint: manifest.inputFingerprint,
    complete: true,
    incompleteReasons: [],
    missingWorkflows: [],
    missingJobs: [],
    cancelledJobs: [],
    failedJobs: [],
    partialTimestampJobs: [],
    timestampResolution: '1s',
    artifacts: [],
    metrics: {
      rawRunnerSeconds: wall,
      repoMinutes: wall / 60,
      wallClockSeconds: wall,
      prWallClockSeconds: pr ? wall : null,
      mainWallClockSeconds: pr ? null : wall,
      triggerLatencySeconds: 2,
      harnessOverheadSeconds: 0,
    },
    workflows: [
      {
        runId,
        runAttempt: 1,
        priorAttemptsCount: 0,
        workflowPath: '.github/workflows/CI.yml',
        workflowName: 'CI',
        event: pr ? 'pull_request' : 'push',
        conclusion: 'success',
        durationSeconds: wall,
        startedAt: at(0),
        completedAt: at(wall),
        htmlUrl: `https://github.com/starsling-agent/example-ci-speedup/actions/runs/${runId}`,
        artifacts: [],
        jobs: [job(1, 'build', build, 0), job(2, 'test', test, build)],
      },
    ],
  }
}

function reference(scenarioName: string): ScenarioReference {
  const scenario = config.scenarios[scenarioName]
  const pr = Boolean(scenario?.pr)
  return {
    schemaVersion: 1,
    scenarioName,
    upstreamRepository: config.upstream.repository,
    event: pr ? 'pull_request' : 'push',
    headSha: scenario?.pr?.headSha ?? config.upstream.commitSha,
    retrievedAt: at(0),
    metrics: { wallClockSeconds: pr ? 702 : 897, runnerSeconds: pr ? 702 : 897 },
    runs: [
      {
        runId: pr ? 41506146212 : 41515783490,
        attempt: 1,
        workflowPath: '.github/workflows/CI.yml',
        workflowName: 'CI',
        event: pr ? 'pull_request' : 'push',
        status: 'completed',
        conclusion: 'success',
        htmlUrl: `https://github.com/${config.upstream.repository}/actions/runs/${pr ? 41506146212 : 41515783490}`,
        createdAt: at(0),
        startedAt: at(0),
        jobs: ['build', 'test'].map((name, id) => ({
          id,
          name,
          status: 'completed',
          conclusion: 'success',
          startedAt: at(0),
          completedAt: at(60),
          durationSeconds: 60,
          labels: ['ubuntu-24.04'],
          steps: [{ number: 1, name: `Run ${name}`, conclusion: 'success', durationSeconds: 60 }],
        })),
      },
    ],
  }
}

function verified(manifest: Manifest, s: SampleMeasurementResult): BoundAssessment {
  const mode = s.profileName === 'warm' ? 'warm' : 'cold'
  return {
    sampleId: s.sampleId,
    inputFingerprint: manifest.inputFingerprint,
    observationHash: observationHash(s),
    sourceHashes: ['0'.repeat(64)],
    parity: {
      passed: true,
      evidenceLevel: 'coverage-qualified',
      satisfies01PpCoverageRequirement: true,
      structural: { passed: true, issues: [] },
      observed: { passed: true, issues: [] },
      semantic: {
        passed: true,
        issues: [],
        testInventory: { executed: ['build', 'test'], reused: [], skipped: [], missing: [] },
      },
    },
    cache: {
      profileName: s.profileName,
      mode,
      valid: true,
      contaminated: false,
      violations: [],
      cacheEvents: [],
      artifactEvents: [],
      costBreakdown: {
        coldPopulationSeconds: 0,
        coldSaveSeconds: 0,
        warmConsumerSeconds: 0,
        amortizationHorizonRuns: null,
        amortizedTotalSeconds: null,
      },
    },
  }
}

function buildReport(
  manifest: Manifest,
  options: { timing?: Timing; mutate?: (s: SampleMeasurementResult) => SampleMeasurementResult } = {},
): BenchmarkExperimentReport {
  const samples = manifest.samples.map((request) => {
    const s = sample(manifest, request, options.timing)
    return options.mutate ? options.mutate(s) : s
  })
  return generateExperimentReport({
    experimentId: manifest.experimentId,
    config,
    manifest,
    samples,
    references: Object.fromEntries(
      Object.keys(config.scenarios)
        .filter((name) => config.scenarios[name]?.role !== 'seed')
        .map((name) => [name, reference(name)]),
    ),
    assessments: Object.fromEntries(samples.map((s) => [s.sampleId, verified(manifest, s)])),
    generatedAt: at(0),
  })
}

const headlineManifest = () =>
  createExperimentManifest({ config, experimentId: 'headline', profileNames: ['cold', 'warm'] })
const headline = (mutate?: (s: SampleMeasurementResult) => SampleMeasurementResult) =>
  buildReport(headlineManifest(), mutate ? { mutate } : {})

/** Merge-lane StarSling wait (build + test) after each agent PR lands, starting from the unchanged CI (360 s). */
const CUMULATIVE = [360, 300, 250, 210, 190]
function leverReport(k: number, cumulative: number[] = CUMULATIVE): BenchmarkExperimentReport {
  const timing: Timing = {
    ...seconds['main-push'],
    'starsling-baseline': { build: (cumulative[k - 1] ?? 0) - 130, test: 130 },
    'starsling-patched': { build: (cumulative[k] ?? 0) - 130, test: 130 },
  } as Timing
  return buildReport(
    createExperimentManifest({
      config,
      experimentId: `lever-${k}`,
      scenarioNames: ['main-push'],
      profileNames: ['cold'],
      variants: ['starsling-baseline', 'starsling-patched'],
    }),
    { timing },
  )
}
const levers = (cumulative: number[] = CUMULATIVE): Record<string, BenchmarkExperimentReport> => {
  const result: Record<string, BenchmarkExperimentReport> = {}
  for (const k of [1, 2, 3, 4]) result[`lever-${k}`] = leverReport(k, cumulative)
  return result
}

const agentPrs = [1, 2, 3, 4].map((k) => ({
  url: `https://github.com/starsling-agent/example-ci-speedup/pull/${k}`,
  summary: [
    'Sparse checkout of changed packages',
    'Shard count from git',
    'Narrowed pnpm workspace',
    'Fold scripts check into test',
  ][k - 1] as string,
  experiment: { id: `lever-${k}`, before: 'starsling-baseline' as const, after: 'starsling-patched' as const },
}))

const narrative = (extra: Partial<ShowcaseNarrative> = {}): ShowcaseNarrative => ({
  layout: 'showcase',
  title: 'DefinitelyTyped',
  stars: '51.5k',
  whatWasSlow: 'Every push starts with a full-history checkout, then installs the whole workspace.',
  whatWeChanged: 'Four small agent PRs, each measured on its own below.',
  same: 'Every sample ran the same packages through dtslint with the same verdicts.',
  pushesPerMonth: { value: 600, source: 'upstream push count for the last 30 days' },
  prUpdatesPerMonth: { value: 900, source: 'upstream PR synchronize events for the last 30 days' },
  agentPrs,
  notes: ['Example method note from showcase.json.'],
  ...extra,
})

const render = (n: ShowcaseNarrative = narrative(), report = headline(), leverReports = levers()) =>
  renderShowcase({ report, config, narrative: n, leverReports })

describe('showcase layout', () => {
  it('renders the golden example', async () => {
    const readme = render()
    const example = [
      '> [!CAUTION]',
      '> **Example rendering, not a measurement.** This is the "showcase" README layout `src/showcase-layout.ts` renders, from the fixture in `tests/showcase-layout.test.ts`. Every number is made up, and links to `upstream/`, `patches/` and `benchmark/` resolve only inside a benchmark repository. Regenerate with `pnpm test -u`.',
      '',
      readme,
    ].join('\n')
    await expect(example).toMatchFileSnapshot('../docs/SHOWCASE-LAYOUT-EXAMPLE.md')
  })

  it('puts Results first, then Terms, then an Appendix whose sections are all collapsed', () => {
    const readme = render()
    const order = [
      '## Results',
      '**StarSling:',
      "| GitHub (the project's CI as is, on GitHub-hosted runners) |",
      '| StarSling (StarSling runners + agent PRs) |',
      '**Where the speedup comes from**',
      '## Terms',
      '## Appendix',
      '<summary>Agent PRs',
      '<summary>What was slow',
      '<summary>What we changed',
      '<summary>Same checks, same results',
      '<summary>Runner time saved per month',
      '<summary>Every push, round by round',
      '<summary>Every PR update, round by round',
      "<summary>How it's measured",
      '<summary>Runners',
    ].map((needle) => readme.indexOf(needle))
    expect(order.every((i) => i >= 0)).toBe(true)
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(readme).toMatch(/\| Cold wait \| Cold vs GitHub \| Warm wait \| Warm vs GitHub \|/)
    // No section heading other than the three top-level ones; everything else lives in <details>.
    expect(readme.match(/^## .*/gm)).toEqual(['## Results', '## Terms', '## Appendix'])
    const appendix = readme.slice(readme.indexOf('## Appendix'))
    expect(appendix.match(/<details>/g)).toHaveLength(9)
    expect(appendix.match(/<\/details>/g)).toHaveLength(9)
    expect(appendix.match(/^### /gm)).toBeNull()
  })

  it('explains the terms in plain English, and only the ones the page uses', () => {
    const readme = render()
    const terms = readme.slice(readme.indexOf('## Terms'), readme.indexOf('## Appendix'))
    for (const term of ['Wait', 'GitHub', 'StarSling', 'Agent PRs', 'Median', 'Round', 'Cold', 'Warm'])
      expect(terms).toContain(`**${term}**`)
    expect(terms).not.toMatch(/runner minutes|CI minutes/i)
    const plain = renderShowcase({
      report: buildReport(
        createExperimentManifest({
          config,
          experimentId: 'hw',
          profileNames: ['cold'],
          variants: ['github-baseline', 'starsling-baseline'],
        }),
      ),
      config,
      narrative: { layout: 'showcase', title: 'DefinitelyTyped' },
    })
    const plainTerms = plain.slice(plain.indexOf('## Terms'), plain.indexOf('## Appendix'))
    expect(plainTerms).not.toContain('**Agent PRs**')
    expect(plainTerms).not.toContain('**Warm**')
    expect(plainTerms).toContain('**Cold**')
  })

  it('frames the result as GitHub vs StarSling: a headline sentence, two headline rows, and a product breakdown', () => {
    const readme = render()
    expect(readme.split('\n')[0]).toBe('# DefinitelyTyped CI: GitHub vs StarSling')
    expect(readme).toContain('StarSling = StarSling runners + StarSling agent PRs.')
    // Two headline rows only: the runners-alone configuration is in the breakdown, not the table.
    const pushTable = readme.slice(readme.indexOf('**Pushes**'), readme.indexOf('**Where the speedup comes from**'))
    expect(pushTable.match(/^\| (GitHub|StarSling)/gm)).toHaveLength(2)
    expect(pushTable).not.toContain('hardware alone')
    // Breakdown: runners alone x agent PRs on the same runners = the headline multiple (cold, 840 / 360 / 190).
    const report = headline()
    const c = report.comparisons.find((x) => x.scenarioName === 'main-push' && x.profileName === 'cold')
    const w = (v: VariantId) => c?.variants[v].wallClockSec.median as number
    const a = w('github-baseline') / w('starsling-baseline')
    const b = w('starsling-baseline') / w('starsling-patched')
    const total = w('github-baseline') / w('starsling-patched')
    expect(a * b).toBeCloseTo(total, 9)
    const x = (r: number) => `${r.toFixed(1)}x`
    expect(readme).toContain(`Cold: Together: ${x(a)} × ${x(b)} = ${x(total)}`)
    expect(readme).toContain(`Cold: **StarSling: ${x(total)} faster** than GitHub for a push`)
    expect(readme).toContain('Cold: StarSling runners alone (CI unchanged)')
    expect(readme).toContain('Cold: StarSling agent PRs, on the same runners')
  })

  it('with no agent PRs the StarSling row is the runners alone and the breakdown is omitted', () => {
    const manifest = createExperimentManifest({
      config,
      experimentId: 'hardware-only',
      profileNames: ['cold'],
      variants: ['github-baseline', 'starsling-baseline'],
    })
    const { pushesPerMonth: _a, prUpdatesPerMonth: _b, ...rest } = narrative({ agentPrs: [] })
    const readme = renderShowcase({ report: buildReport(manifest), config, narrative: rest })
    expect(readme).toContain('| StarSling (runners) |')
    expect(readme).toContain('StarSling = StarSling runners.')
    expect(readme).not.toContain('agent PRs, on the same runners')
    expect(readme).not.toContain('Where the speedup comes from')
    expect(readme).not.toContain('StarSling runners + agent PRs')
    expect(readme).not.toContain('<summary>Agent PRs')
  })

  it('prints no dollar figure anywhere', () => {
    expect(render()).not.toContain('$')
  })

  it('refuses a dollar figure or currency word in any prose field it prints, naming the field', () => {
    expect(() => render(narrative({ whatWasSlow: 'Saves $5,000 a month.' }))).toThrow(/whatWasSlow/)
    expect(() => render(narrative({ whatWeChanged: 'Costs 40 USD less.' }))).toThrow(/whatWeChanged/)
    expect(() => render(narrative({ same: 'Saved 3 dollars.' }))).toThrow(/same/)
    expect(() => render(narrative({ notes: ['fine', 'about $9'] }))).toThrow(/notes\[1\]/)
    const bad = agentPrs.map((p, i) => (i === 2 ? { ...p, summary: 'Cuts $12 per run' } : p))
    expect(() => render(narrative({ agentPrs: bad }))).toThrow(/agentPrs\[2\]\.summary/)
    // A lone dollar sign without a digit is not a figure; the default layout is not checked.
    expect(() => render(narrative({ whatWasSlow: 'Shell prompt $ and $HOME.' }))).not.toThrow()
    const plain = { title: 'DefinitelyTyped', whatWasSlow: 'Saves $5,000.' }
    expect(() => renderShowcase({ report: headline(), config, narrative: plain })).not.toThrow()
  })

  it('has no fourth (Disks) row', () => {
    expect(render()).not.toContain('Disks')
  })

  it('warns when the last agent PR row differs from the headline by more than 10%', () => {
    expect(render()).not.toContain('does not match the headline')
    const readme = render(narrative(), headline(), levers([360, 300, 250, 210, 300]))
    expect(readme).toContain('> [!WARNING]')
    expect(readme).toContain('does not match the headline')
    // The warning is in the visible Results section, not hidden in a collapsed block.
    expect(readme.indexOf('does not match the headline')).toBeLessThan(readme.indexOf('## Terms'))
  })

  it('warns in Results, not only in the Appendix, when the checks are not verified', () => {
    expect(render()).not.toContain('Not verified yet')
    const report = headline()
    const unverified = structuredClone(report)
    for (const c of unverified.comparisons) c.cacheValidated = false
    const readme = render(narrative(), unverified)
    expect(readme).toContain('**Not verified yet.**')
    expect(readme.indexOf('**Not verified yet.**')).toBeLessThan(readme.indexOf('## Terms'))
  })

  it('marks an agent PR "not measured" when its experiment is missing or its checks are unverified', () => {
    const missing = { ...levers() }
    delete missing['lever-2']
    expect(render(narrative(), headline(), missing)).toMatch(/Shard count from git.*not measured/)
  })

  it('notes failed or re-run samples per configuration, only when there are some', () => {
    expect(render()).not.toContain('failed or were re-run')
    const readme = render(
      narrative(),
      headline((s) =>
        s.variant === 'starsling-baseline' &&
        s.scenarioName === 'main-push' &&
        s.profileName === 'cold' &&
        s.repetition === 2
          ? { ...s, complete: false, incompleteReasons: ['Rerun requires a replacement sample: CI.yml'] }
          : s,
      ),
    )
    expect(readme).toMatch(/1 sample\(s\)? failed or were re-run and replaced/)
    expect(readme).toContain('StarSling unchanged (hardware alone): 1')
  })

  it('shows runner time only in the collapsed Appendix, in seconds, never in Results or Terms', () => {
    const readme = render()
    const top = readme.slice(0, readme.indexOf('## Appendix'))
    expect(top).not.toMatch(/runner minutes|CI minutes|fewer|minutes saved|per month/i)
    const section = readme.slice(readme.indexOf('<summary>Runner time saved per month'))
    expect(section).toMatch(/\d s saved per month/)
    expect(section).not.toMatch(/minutes saved/i)
    const { pushesPerMonth: _a, prUpdatesPerMonth: _b, ...withoutFrequency } = narrative()
    const without = render(withoutFrequency)
    expect(without).not.toContain('Runner time saved')
    expect(without).not.toContain('per month')
  })

  it('renders a two-record result: the agent PR arm from the fix record, the rest from the base, the method naming both', () => {
    const only = { scenarioNames: ['main-push'], profileNames: ['cold'] }
    const baseManifest = createExperimentManifest({
      config,
      experimentId: 'base',
      inputFingerprint: 'fp-base',
      ...only,
    })
    const fixManifest = createExperimentManifest({
      config,
      experimentId: 'fix',
      inputFingerprint: 'fp-fix',
      variants: ['starsling-patched'],
      ...only,
    })
    const fixTiming = { ...seconds['main-push'], 'starsling-patched': { build: 20, test: 130 } } as Timing
    const record = (manifest: Manifest, timing: Timing | undefined, shiftMs: number) => {
      const samples = manifest.samples.map((r) => {
        const s = sample(manifest, r, timing)
        return {
          ...s,
          workflows: s.workflows.map((w) => ({
            ...w,
            startedAt: new Date(Date.parse(w.startedAt ?? '') + shiftMs).toISOString(),
            completedAt: new Date(Date.parse(w.completedAt ?? '') + shiftMs).toISOString(),
          })),
        }
      })
      return {
        input: {
          experimentId: manifest.experimentId,
          manifest,
          samples,
          assessments: Object.fromEntries(samples.map((s) => [s.sampleId, verified(manifest, s)])),
        },
        config,
        harnessHash: 'h1',
      }
    }
    const merged = mergeFixArm(
      record(baseManifest, undefined, 0),
      record(fixManifest, fixTiming, 3 * 86_400_000 + 7_200_000),
    )
    const report = generateExperimentReport({
      experimentId: 'base',
      config,
      manifest: merged.input.manifest as Manifest,
      samples: merged.input.samples,
      references: { 'main-push': reference('main-push') },
      assessments: merged.input.assessments ?? {},
    })
    const readme = renderShowcase({
      report,
      config,
      narrative: { layout: 'showcase', title: 'DefinitelyTyped' },
      fixArm: merged.info,
    })
    // The patched arm is the fix record's (about 20 + 130 s); the GitHub arm is the base record's (about 540 + 300 s).
    expect(readme).toContain('**2.48 min**')
    expect(readme).toContain('**13.98 min**')
    expect(readme).not.toContain('Not verified yet')
    expect(readme).toContain('**Two experiment records.**')
    expect(readme).toMatch(/experiment `base`; .* experiment `fix`, which ran 3 days 1 hour after `base` finished/)
    expect(readme.indexOf('`fix`, taken 3 days')).toBeLessThan(readme.indexOf('## Terms'))
    expect(readme).toContain('(StarSling + agent PRs arm from experiment `fix`)')
    // Without a fix arm none of this appears.
    expect(render()).not.toContain('Two experiment records')
  })

  it('leaves the default layout unchanged', () => {
    const report = headline()
    const plain = renderShowcase({ report, config, narrative: { title: 'DefinitelyTyped' } })
    const explicit = renderShowcase({ report, config, narrative: { title: 'DefinitelyTyped', layout: 'default' } })
    expect(explicit).toBe(plain)
    expect(plain).toContain('## Claim checklist')
    expect(plain).not.toContain('## Agent PRs')
  })
})
