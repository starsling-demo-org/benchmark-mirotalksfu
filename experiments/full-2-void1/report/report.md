# StarSling Whole-Pipeline Benchmark Report (`full-2`)

> superseded: the void was a mistake, the sample's runners were tmpfs

- **Upstream:** `miroslavpejic85/mirotalksfu@e76e48f678f286fd5597617ea040c626d2d191db`
- **Timestamp Resolution:** `1s` (GitHub Actions workflow/job/step timestamps)

## Event `main-push` · cold cache

**No speedup claim yet: Incomplete rounds (4 of 5 complete).**

### Runner configurations

| Runner configuration | Complete / requested | CI duration p50 (IQR) | CI minutes p50 | Estimated cost p50 (USD) | Trigger latency p50 | Harness overhead p50 |
|---|---|---|---|---|---|---|
| `github-baseline` | 5/5 | 6138.0 s (IQR 1973.0 s, n=4) | 102.18 min | $1.6560 | 5.0 s | 0.0 s |
| `starsling-baseline` | 5/5 | 1725.5 s (IQR 57.0 s, n=4) | 28.46 min | $0.2360 | 4.5 s | 0.0 s |
| `starsling-patched` | 4/5 | 1637.5 s (IQR 48.0 s, n=4) | 26.99 min | $0.2240 | 5.0 s | 0.0 s |

### Speedups

| Speedup | Ratio | Compares | Cost neutral |
|---|---|---|---|
| `github-baseline` / `github-patched` | — | Self-improving CI speedup, GitHub-hosted runners | Not established (Self-improving CI changed which runners jobs use, so its speedup includes a hardware change.) |
| `starsling-baseline` / `starsling-patched` | 1.05× | Self-improving CI speedup, StarSling Runners | Yes |
| `github-baseline` / `starsling-baseline` | 3.56× | Hardware speedup | Not applicable: hardware speedups never establish it |
| `github-baseline` / `starsling-patched` | 3.75× | Total speedup | Not applicable |

### Step times

| Workflow › job | Step | Change | GitHub-hosted p50 | GitHub-hosted, self-improving CI p50 | StarSling, hardware only p50 | StarSling, self-improving CI p50 |
|---|---|---|---|---|---|---|
| `.github/workflows/ci.yml#test` | Set up job | `matched` | 1.0 s | — | 1.0 s | 0.5 s |
| `.github/workflows/ci.yml#test` | Benchmark event context (harness) | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Run actions/checkout@v4 | `matched` | 2.0 s | — | 1.0 s | 1.0 s |
| `.github/workflows/ci.yml#test` | Run actions/setup-node@v4 | `matched` | 5.0 s | — | 3.0 s | 3.0 s |
| `.github/workflows/ci.yml#test` | Run npm ci | `matched` | 8.0 s | — | 5.0 s | 5.0 s |
| `.github/workflows/ci.yml#test` | Run cp app/src/config.template.js app/src/config.js | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Run npm test | `matched` | 9.0 s | — | 6.0 s | 6.0 s |
| `.github/workflows/ci.yml#test` | Post Run actions/setup-node@v4 | `matched` | 1.0 s | — | 3.0 s | 1.5 s |
| `.github/workflows/ci.yml#test` | Post Run actions/checkout@v4 | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Complete job | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Set up job | `matched` | 2.0 s | — | 0.0 s | 1.0 s |
| `.github/workflows/ci.yml#build` | Benchmark event context (harness) | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Run actions/checkout@v4 | `matched` | 2.0 s | — | 1.0 s | 1.0 s |
| `.github/workflows/ci.yml#build` | Run docker/login-action@v3 | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Run docker/setup-qemu-action@v3 | `matched` | 6.0 s | — | 2.0 s | 2.0 s |
| `.github/workflows/ci.yml#build` | Run docker/setup-buildx-action@v3 | `matched` | 4.0 s | — | 2.0 s | 2.0 s |
| `.github/workflows/ci.yml#build` | Build & Push | `matched` | 6040.0 s | — | 1636.0 s | 1585.5 s |
| `.github/workflows/ci.yml#build` | Post Build & Push | `matched` | 2.0 s | — | 2.0 s | 1.5 s |
| `.github/workflows/ci.yml#build` | Post Run docker/setup-buildx-action@v3 | `matched` | 8.0 s | — | 2.0 s | 3.0 s |
| `.github/workflows/ci.yml#build` | Post Run docker/setup-qemu-action@v3 | `matched` | 2.0 s | — | 2.0 s | 1.5 s |
| `.github/workflows/ci.yml#build` | Post Run actions/checkout@v4 | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Complete job | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Set up runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Complete runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Set up runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Complete runner | `matched` | — | — | 0.0 s | 0.0 s |

### Samples

| Sample ID | Round | Runner configuration | Complete | CI duration | CI minutes | Runs and diagnostics |
|---|---|---|---|---|---|---|
| `full-2-main-push-cold-rep1-starsling-baseline` | 1 | `starsling-baseline` | ✓ | 1747.0 s | 28.87m | [run #43813753777](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43813753777) |
| `full-2-main-push-cold-rep1-github-baseline` | 1 | `github-baseline` | ✓ | 5817.0 s | 96.83m | [run #43818251863](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43818251863) |
| `full-2-main-push-cold-rep1-starsling-patched` | 1 | `starsling-patched` | ✓ | 1636.0 s | 27.02m | [run #43831469879](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43831469879) |
| `full-2-main-push-cold-rep2-starsling-patched` | 2 | `starsling-patched` | ✓ | 1591.0 s | 26.25m | [run #43837085406](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43837085406) |
| `full-2-main-push-cold-rep2-starsling-baseline` | 2 | `starsling-baseline` | ✓ | 1704.0 s | 28.05m | [run #43843133603](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43843133603) |
| `full-2-main-push-cold-rep2-github-baseline` | 2 | `github-baseline` | ✓ | 4486.0 s | 74.67m | [run #43904144947](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43904144947) |
| `full-2-main-push-cold-rep3-github-baseline` | 3 | `github-baseline` | ✓ | 6098.0 s | 101.53m | [run #43926938353](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43926938353) |
| `full-2-main-push-cold-rep4-github-baseline` | 4 | `github-baseline` | ✓ | 6975.0 s | 116.13m | [run #43953226053](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43953226053) |
| `full-2-main-push-cold-rep4-starsling-patched` | 4 | `starsling-patched` | ✓ | 1682.0 s | 27.67m | [run #43974645858](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43974645858) |
| `full-2-main-push-cold-rep4-starsling-baseline` | 4 | `starsling-baseline` | ✓ | 1780.0 s | 29.37m | [run #43980971901](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43980971901) |
| `full-2-main-push-cold-rep5-github-baseline` | 5 | `github-baseline` | ✓ | 6459.0 s | 107.53m | [run #43941540381](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane3/actions/runs/43941540381) |
| `full-2-main-push-cold-rep5-starsling-patched` | 5 | `starsling-patched` | ✓ | 1639.0 s | 26.97m | [run #43983258232](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane5/actions/runs/43983258232) |
| `full-2-main-push-cold-rep5-starsling-baseline` | 5 | `starsling-baseline` | ✓ | 1690.0 s | 27.83m | [run #43985686859](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane4/actions/runs/43985686859) |
| `full-2-main-push-cold-rep3-starsling-baseline-retry1` | 3 | `starsling-baseline` | ✓ | 1655.0 s | 27.17m | [run #43992846648](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane1/actions/runs/43992846648) |
| `full-2-main-push-cold-rep3-starsling-patched` | 3 | `starsling-patched` | ✗ | 1658.0 s | 27.28m | [run #43919934453](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43919934453) (StarSling runner without RAM disk (starsling-z-70edf145d0614a19883ae3d2ad109202, starsling-z-bc479960cb1249c08279d38f88025fa5: no storage record; the run started 2026-11-16T17:35:16Z, inside the disk-storage window 17:25Z-20:50Z; voided conservatively, coordinator 2026-11-16)) |
| `full-2-main-push-cold-rep3-starsling-baseline` | 3 | `starsling-baseline` | ✗ | 1641.0 s | 27.00m | [run #43946669661](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43946669661) (StarSling runner without RAM disk (starsling-z-4af8fe31c78c4999a7e6c40fe7d91e9c: storage unknown after the switch; starsling-z-a232329a445a4b7bb056137a5168cfa0: storage unknown after the switch)) |

## Event `main-push` · warm cache

**Total speedup 36.42×: hardware speedup 3.30×, self-improving CI speedup 11.03× on StarSling Runners and — on GitHub-hosted runners. Evidence: coverage-qualified.**

### Runner configurations

| Runner configuration | Complete / requested | CI duration p50 (IQR) | CI minutes p50 | Estimated cost p50 (USD) | Trigger latency p50 | Harness overhead p50 |
|---|---|---|---|---|---|---|
| `github-baseline` | 5/5 | 5171.0 s (IQR 1354.0 s, n=5) | 86.08 min | $1.3920 | 5.0 s | 0.0 s |
| `starsling-baseline` | 5/5 | 1566.0 s (IQR 37.0 s, n=5) | 25.70 min | $0.2160 | 6.0 s | 0.0 s |
| `starsling-patched` | 5/5 | 142.0 s (IQR 10.0 s, n=5) | 2.00 min | $0.0240 | 5.0 s | 0.0 s |

### Speedups

| Speedup | Ratio | Compares | Cost neutral |
|---|---|---|---|
| `github-baseline` / `github-patched` | — | Self-improving CI speedup, GitHub-hosted runners | Not established (Self-improving CI changed which runners jobs use, so its speedup includes a hardware change.) |
| `starsling-baseline` / `starsling-patched` | 11.03× | Self-improving CI speedup, StarSling Runners | Yes |
| `github-baseline` / `starsling-baseline` | 3.30× | Hardware speedup | Not applicable: hardware speedups never establish it |
| `github-baseline` / `starsling-patched` | 36.42× | Total speedup | Not applicable |

### Step times

| Workflow › job | Step | Change | GitHub-hosted p50 | GitHub-hosted, self-improving CI p50 | StarSling, hardware only p50 | StarSling, self-improving CI p50 |
|---|---|---|---|---|---|---|
| `.github/workflows/ci.yml#test` | Set up job | `matched` | 1.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Benchmark event context (harness) | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Run actions/checkout@v4 | `matched` | 2.0 s | — | 1.0 s | 1.0 s |
| `.github/workflows/ci.yml#test` | Run actions/setup-node@v4 | `matched` | 5.0 s | — | 3.0 s | 3.0 s |
| `.github/workflows/ci.yml#test` | Run npm ci | `matched` | 10.0 s | — | 5.0 s | 5.0 s |
| `.github/workflows/ci.yml#test` | Run cp app/src/config.template.js app/src/config.js | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Run npm test | `matched` | 9.0 s | — | 6.0 s | 6.0 s |
| `.github/workflows/ci.yml#test` | Post Run actions/setup-node@v4 | `matched` | 2.0 s | — | 1.0 s | 2.0 s |
| `.github/workflows/ci.yml#test` | Post Run actions/checkout@v4 | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Complete job | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Set up job | `matched` | 3.0 s | — | 1.0 s | 1.0 s |
| `.github/workflows/ci.yml#build` | Benchmark event context (harness) | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Run actions/checkout@v4 | `matched` | 2.0 s | — | 1.0 s | 2.0 s |
| `.github/workflows/ci.yml#build` | Run docker/login-action@v3 | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Run docker/setup-qemu-action@v3 | `matched` | 8.0 s | — | 3.0 s | 3.0 s |
| `.github/workflows/ci.yml#build` | Run docker/setup-buildx-action@v3 | `matched` | 5.0 s | — | 3.0 s | 2.0 s |
| `.github/workflows/ci.yml#build` | Build & Push | `matched` | 5091.0 s | — | 1507.0 s | 77.0 s |
| `.github/workflows/ci.yml#build` | Post Build & Push | `matched` | 2.0 s | — | 1.0 s | 1.0 s |
| `.github/workflows/ci.yml#build` | Post Run docker/setup-buildx-action@v3 | `matched` | 11.0 s | — | 2.0 s | 3.0 s |
| `.github/workflows/ci.yml#build` | Post Run docker/setup-qemu-action@v3 | `matched` | 1.0 s | — | 1.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Post Run actions/checkout@v4 | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Complete job | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Set up runner | `matched` | — | — | 1.0 s | 0.0 s |
| `.github/workflows/ci.yml#test` | Complete runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Set up runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/ci.yml#build` | Complete runner | `matched` | — | — | 0.0 s | 0.0 s |

### Samples

| Sample ID | Round | Runner configuration | Complete | CI duration | CI minutes | Runs and diagnostics |
|---|---|---|---|---|---|---|
| `full-2-main-push-warm-rep5-github-baseline` | 5 | `github-baseline` | ✓ | 4483.0 s | 74.60m | [run #43955252048](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane5/actions/runs/43955252048) |
| `full-2-main-push-warm-rep4-github-baseline` | 4 | `github-baseline` | ✓ | 3510.0 s | 58.38m | [run #43951824562](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane6/actions/runs/43951824562) |
| `full-2-main-push-warm-rep3-github-baseline` | 3 | `github-baseline` | ✓ | 5171.0 s | 86.08m | [run #43952506485](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane1/actions/runs/43952506485) |
| `full-2-main-push-warm-rep2-github-baseline` | 2 | `github-baseline` | ✓ | 6645.0 s | 110.62m | [run #43959500922](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane2/actions/runs/43959500922) |
| `full-2-main-push-warm-rep1-github-baseline` | 1 | `github-baseline` | ✓ | 5837.0 s | 97.18m | [run #43954609399](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane4/actions/runs/43954609399) |
| `full-2-main-push-warm-rep5-starsling-patched` | 5 | `starsling-patched` | ✓ | 135.0 s | 1.88m | [run #43969844370](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane3/actions/runs/43969844370) |
| `full-2-main-push-warm-rep5-starsling-baseline` | 5 | `starsling-baseline` | ✓ | 1691.0 s | 27.80m | [run #43971759640](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane6/actions/runs/43971759640) |
| `full-2-main-push-warm-rep4-starsling-patched` | 4 | `starsling-patched` | ✓ | 145.0 s | 2.08m | [run #43975523465](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane1/actions/runs/43975523465) |
| `full-2-main-push-warm-rep4-starsling-baseline` | 4 | `starsling-baseline` | ✓ | 1481.0 s | 24.38m | [run #43976723295](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane5/actions/runs/43976723295) |
| `full-2-main-push-warm-rep3-starsling-patched` | 3 | `starsling-patched` | ✓ | 147.0 s | 2.00m | [run #43978884919](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane3/actions/runs/43978884919) |
| `full-2-main-push-warm-rep3-starsling-baseline` | 3 | `starsling-baseline` | ✓ | 1576.0 s | 25.70m | [run #43979012034](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane4/actions/runs/43979012034) |
| `full-2-main-push-warm-rep2-starsling-patched` | 2 | `starsling-patched` | ✓ | 128.0 s | 1.80m | [run #43984275360](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane1/actions/runs/43984275360) |
| `full-2-main-push-warm-rep2-starsling-baseline` | 2 | `starsling-baseline` | ✓ | 1539.0 s | 25.32m | [run #43983935062](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane6/actions/runs/43983935062) |
| `full-2-main-push-warm-rep1-starsling-baseline` | 1 | `starsling-baseline` | ✓ | 1566.0 s | 26.02m | [run #43984672011](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane2/actions/runs/43984672011) |
| `full-2-main-push-warm-rep1-starsling-patched` | 1 | `starsling-patched` | ✓ | 142.0 s | 2.00m | [run #43987548685](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane3/actions/runs/43987548685) |



## GitHub API calls

Budget: 252 calls per hour for this controller. Free `304 Not Modified` answers are listed separately and do not count against the account.

- **Experiment:** 603 calls (986 free 304s); cache-delete 375, run-list 66, jobs 37, workflows 26, caches 26, artifacts 24, job-logs 24, workflow-write 22, other-read 3
- **Waiting:** 6714 s stretched to fit the budget, 0 s waiting for an account reset

| Sample | Calls | Free 304s | Biggest callers |
| --- | ---: | ---: | --- |
| `full-1-main-push-cold-rep1-starsling-baseline` | 16 | 59 | run-list 4, workflows 3, jobs 3, workflow-write 2, artifacts 2, job-logs 2 |
| `full-1-main-push-cold-rep1-github-baseline` | 15 | 163 | run-list 4, jobs 3, workflows 2, workflow-write 2, artifacts 2, job-logs 2 |
| `full-1-main-push-cold-rep1-starsling-patched` | 15 | 58 | run-list 4, jobs 3, workflows 2, workflow-write 2, artifacts 2, job-logs 2 |
| `full-1-main-push-cold-rep2-starsling-patched` | 15 | 58 | run-list 4, jobs 3, workflows 2, workflow-write 2, artifacts 2, job-logs 2 |
| `full-1-main-push-cold-rep2-starsling-baseline` | 16 | 60 | run-list 4, jobs 4, workflows 2, workflow-write 2, artifacts 2, job-logs 2 |
| `full-1-main-push-cold-rep2-github-baseline` | 20 | 80 | run-list 9, jobs 3, workflows 2, workflow-write 2, artifacts 2, job-logs 2 |
| `full-1-main-push-cold-rep3-starsling-patched` | 20 | 50 | run-list 9, jobs 3, workflows 2, workflow-write 2, artifacts 2, job-logs 2 |
| `full-1-main-push-cold-rep3-github-baseline` | 15 | 166 | run-list 4, jobs 3, workflows 2, workflow-write 2, artifacts 2, job-logs 2 |
| `full-1-main-push-cold-rep3-starsling-baseline` | 15 | 55 | run-list 4, jobs 3, workflows 2, workflow-write 2, artifacts 2, job-logs 2 |
| `full-1-main-push-cold-rep4-github-baseline` | 8 | 123 | run-list 2, jobs 2, job-logs 2, artifacts 2 |
| `full-1-main-push-cold-rep4-starsling-patched` | 20 | 53 | run-list 9, jobs 3, workflows 2, job-logs 2, artifacts 2, workflow-write 2 |
| `full-1-main-push-cold-rep4-starsling-baseline` | 16 | 60 | run-list 4, jobs 4, workflows 2, job-logs 2, artifacts 2, workflow-write 2 |
