# mirotalksfu CI: GitHub-hosted runners vs StarSling Runners (with agents)

_Not affiliated with [miroslavpejic85/mirotalksfu](https://github.com/miroslavpejic85/mirotalksfu) (3.2k stars)._

mirotalksfu's own CI workflows, replayed for a real upstream merge to its default branch on GitHub-hosted runners and on StarSling Runners (with agents). Every number comes from this repository's replays; upstream's own runs are linked for comparison.

StarSling Runners (with agents) = StarSling runners + StarSling agent PRs.

## Results

**Warm cache:** every sample starts from caches a seed run produced on the same runner configuration; seed time is not counted.

| Runner configuration | Merge CI duration<br><sub>Merge to the default branch</sub> | Runner time<br><sub>Merge to the default branch</sub> |
|---|---:|---:|
| **GitHub-hosted runners** | 86.18 min | 86.08 min |
| **StarSling Runners (with agents)** | 2.37 min<br>**36.4× faster** | 2.00 min<br>**43.0× less** |

**Cold cache:** every sample starts with no GitHub Actions caches.

| Runner configuration | Merge CI duration<br><sub>Merge to the default branch</sub> | Runner time<br><sub>Merge to the default branch</sub> |
|---|---:|---:|
| **GitHub-hosted runners** | 101.63 min | 101.53 min |
| **StarSling Runners (with agents)** | 27.32 min<br>**3.7× faster** | 27.02 min<br>**3.8× less** |

- On StarSling Runners (with agents), every check for a merge to the default branch finished in **2.37 min** instead of 86.18 min warm (**36.4× faster**), using 2.00 min instead of 86.08 min of runner time (**43.0× less**). Cold: **27.32 min** instead of 101.63 min (**3.7× faster**), using 27.02 min instead of 101.53 min of runner time (**3.8× less**).
- **Why warm and cold differ:** the agent PR is a cache fix, so its gain shows on warm runs. On a cold run it saves little, because nothing is cached yet and the arm64 copy of the mediasoup worker still compiles under CPU emulation (QEMU).
- **PR updates:** not measured. Upstream's only workflow runs on merges to the default branch and has no pull-request trigger, so a PR update starts no CI to replay.
- **Context, not the headline** (upstream's own runs; not like-for-like with the numbers above): What upstream sees today, on upstream's own GitHub runners over the last 60 days (315 successful runs), counted separately by whether the Docker worker layer was cached. **Uncached** (the worker layer is rebuilt): a median 102.3 min per merge to the default branch (n=283; last 10 median 83.3 min). **Cached** (the layer cache hits): a median 1.7 min (n=32), a different kind of run. Standard runners, many commits; not a like-for-like replay.

<sub>Medians over complete rounds.</sub>

## Runners

| Runners | Label | vCPU | Memory |
|---|---|---:|---:|
| GitHub-hosted | `ubuntu-22.04-4core` | 4 | 16 GiB |
| StarSling | `starsling-ubuntu-24.04` | 4 | 16 GiB |

Runner time compared at these machine sizes: GitHub 4 vCPU vs StarSling 4 vCPU. StarSling's 4 vCPU runners can burst to 5 vCPU and 32 GB RAM (Afterburner); GitHub's 4-core runners have 16 GB.

GitHub-hosted jobs run on the explicit GitHub larger-runner label shown, pinned to the size of upstream's public-repository runner, so the comparison does not change with this repository's visibility.

## Claim checklist

- [x] **Same CI as upstream:** replays run the same workflows and jobs as upstream's own runs, with the same conclusions; the Docker Hub login and image push are switched off in every configuration (see below)
- [x] **Same checks, same results:** every sample's checks were read from its own job logs, and all passed in every configuration
- [x] **Cache state verified** for every sample
- [x] **Both runner configurations measured** (2 of 2), warm and cold
- [x] **All requested samples finished** (20 of 20)
- [x] **At least 5 rounds** (5 requested, warm and cold)
- [x] **No interference:** no other workflow run overlapped a sample
- [x] **Cost neutral:** the agent PR adds no parallel jobs that spend the freed runner time

### Same CI as upstream

- **Merge to the default branch:** same workflow (`ci.yml`) and jobs (`test`, then `build`) as upstream's own run for the same commit ([#42260522986](https://github.com/miroslavpejic85/mirotalksfu/actions/runs/42260522986)), same conclusions. The only step differences, identical in every configuration, are the Docker Hub login and the image push, which do not run here because nothing is published (see Method).

### Same checks, same results

Every counted sample's results were read from its own job logs. In all 20 counted samples (5 per configuration, warm, and 5 per configuration, cold) the same 2 jobs ran and passed: `test`, the project's mocha tests (every sample's mocha total passed with no failures; 851 passing in the logs checked by hand), and `build`, which built the Docker image for linux/amd64 and linux/arm64. The image build is checked by its steps completing (the mediasoup worker, the dependency install and the three application layers for each CPU type; a cached step counts as complete), not by comparing images byte for byte. The image is built but not published.

## Terms

| Term | Meaning |
|---|---|
| **PR CI duration** | Elapsed time from the first workflow starting to the last job finishing, across every workflow one PR update starts (including `workflow_run` follow-ups). |
| **Merge CI duration** | The same, for every workflow one merge to the default branch starts. |
| **Runner time** | Total machine time all jobs used for one event, summed across jobs; billed per second. Jobs kept on GitHub-hosted runners still count. |
| **StarSling Runners (with agents)** | StarSling runners plus StarSling agent PRs: the project's CI with StarSling's agent PRs applied, running on StarSling runners. "StarSling" on this page always means this one configuration. |
| **Round** | One replay of the event on every runner configuration. Medians use only complete rounds. |
| **Cold / warm cache** | Cold starts with no GitHub Actions caches; warm starts from caches a seed run produced on the same runner configuration. |
| **Cost neutral** | The agent PRs save runner time without adding parallel jobs that spend it again. |

## Appendix

<details>
<summary>Agent PRs</summary>

Merged in this order. Each fix's own measurement, on the CI step it changes, is under What we changed.

| # | Agent PR | What it changed |
|---:|---|---|
| 1 | [pull/1](https://github.com/starsling-demo-org/benchmark-mirotalksfu/pull/1) | Build the mediasoup C++ worker in its own Docker stage, keyed on the mediasoup version in `package-lock.json`, so changes to the app or to other dependencies no longer rebuild it. One file, `Dockerfile`: a stage reads the mediasoup version, a second stage builds the worker (cached by that version), `npm ci` skips the worker build, and the built worker is copied in. The npm cache mount also gets one id per CPU type, because the two image builds now run `npm ci` at the same time; that part is for safety and changes no timing. |

</details>

<details>
<summary>What was slow</summary>

Every merge to mirotalksfu's default branch runs one workflow, `ci.yml`: the tests (a median 28 s on GitHub-hosted runners, cold), then one `build` job that builds the Docker image for linux/amd64 and linux/arm64. That one job is almost the whole wait: warm, `build` took a median 5,129 s of the 5,171 s merge on GitHub-hosted runners (cold, 6,064 s of 6,098 s). The image build compiles the mediasoup C++ worker from source inside the Dockerfile, once per CPU type, and the arm64 copy runs under CPU emulation (QEMU), where that compile is very slow. Without the fix it reruns whenever the Dockerfile's dependency step reruns, which is for any change to the dependencies or the app version, so warm caches barely help.

</details>

<details>
<summary>What we changed</summary>

The original showcase for this project proposed one fix: build the worker in its own cached stage. We measured it on StarSling, with 5 runs on each side (the CI as it was, and the CI with the fix), on the step it changes. Warm means starting from the cache a seed run left behind; cold means no caches at the start.

| Fix | Result | Decision |
|---|---|---|
| Build the mediasoup worker in its own stage, cached by the mediasoup version (with a per-CPU npm cache id) | `Build & Push` step of the `build` job, warm: 1,507 s to 77 s (median), **19.6x faster**; every run with the fix beat every run without it. Cold: 1,636 s to 1,586 s (median), about 3% faster, and the runs overlap: with nothing cached, the arm64 worker still compiles under QEMU. | Kept (agent PR 1) |

The fix is a cache, so it only helps when an earlier merge has built the worker at the same mediasoup version. A merge that changes the mediasoup version rebuilds the worker even with the fix, and then looks like a cold run. The full benchmark runs both warm and cold, over 5 rounds each.

- [Build the mediasoup C++ worker in its own Docker stage, keyed on the mediasoup version](https://github.com/starsling-demo-org/benchmark-mirotalksfu/pull/1)

</details>

<details>
<summary>Every sample, with links to its runs</summary>

Each cell is the whole wait for that merge and links to its run.

| Upstream commit | Cache | Round | GitHub-hosted runners | StarSling Runners (with agents) |
|---|---|---:|---:|---:|
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Warm | 1 | 97.28 min | 2.37 min |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Warm | 2 | 110.75 min | 2.13 min |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Warm | 3 | 86.18 min | 2.45 min |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Warm | 4 | 58.50 min | 2.42 min |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Warm | 5 | 74.72 min | 2.25 min |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Cold | 1 | [96.95 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43818251863) | [27.27 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43831469879) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Cold | 2 | [74.77 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43904144947) | [26.52 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43837085406) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Cold | 3 | [101.63 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43926938353) | [27.63 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43919934453) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Cold | 4 | [116.25 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43953226053) | [28.03 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43974645858) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Cold | 5 | 107.65 min | 27.32 min |

</details>

<details>
<summary>Method</summary>

1. **Pin.** miroslavpejic85/mirotalksfu is pinned at [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db), the [`upstream/`](upstream) submodule in this repository. Each scenario replays one real upstream event: the merge of [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) to the default branch.
2. **Replay natively.** Each sample puts that exact tree on a branch of this repository named like upstream's default branch, which fires the same GitHub event a merge to the default branch fires. Every workflow, job and step runs with its own triggers, filters, `needs`, conditions, matrices and `workflow_run` follow-ups, in the order GitHub schedules them.
3. **Runner configurations.** GitHub-hosted runners run the CI unchanged; StarSling Runners (with agents) run it with the agent PR applied. Jobs on runners StarSling does not offer stay on GitHub-hosted runners in every configuration and still count.
4. **Rounds.** 5 rounds, warm and cold; in each, every runner configuration replays the event once. Medians use only complete rounds, and a sample counts only if every expected job succeeded on the first attempt.
5. **Control caches.** Warm cache: every sample starts from caches a seed run produced on the same runner configuration; seed time is not counted. Cold cache: every sample starts with no GitHub Actions caches.
6. **Check.** Replays are compared job by job with upstream's own runs for the same commit, and every sample's test verdicts, coverage and cache restores are read from its own job logs.

- **Control configuration.** Each round also replayed the event on StarSling runners with the CI unchanged, as an internal control. It is not part of this comparison, and its samples are not shown in the tables on this page; they are in the data files under `benchmark/`.
- **Default branch.** Upstream's default branch is `main`.
- **Lane: merges to the default branch.** This page measures merges to mirotalksfu's default branch. Each sample replays the merge of `e76e48f6`. PR updates were not measured: upstream's only workflow runs on merges to the default branch and has no pull-request trigger.
- **Workflows in this merge.** The replayed merge runs upstream's only workflow, `ci.yml`: the tests, then one `build` job that builds the image for both CPU types under emulation (QEMU) in a single job.
- **One repository per lane.** Most samples ran concurrently, each in its own repository (one separate copy of this repository per lane, six in all, with the same branches, events and payloads as this repository), so their caches never mix; a cold sample ran with no caches in its repository. 8 of the 20 samples on this page (cold rounds 1 to 4, both configurations) came from an earlier sequential run of the same configuration in this repository, one sample at a time; the other 12 came from the lanes. Those copies are not public, so samples that ran in them appear in the sample table without a run link.
- **Root and non-root StarSling samples, pooled.** During the benchmark, StarSling switched this organization's jobs from root to an ordinary (non-root) user. Of the 10 StarSling Runners (with agents) samples, 3 ran as root (cold rounds 1 to 3) and 7 as non-root. Before pooling, the agent PR's step (`Build & Push`) was compared across the two: cold, one non-root sample was about 1.6% slower than the slowest root sample (1,623 s against 1,597 s), and the other (1,585 s) fell inside the root range. That is inside the run-to-run spread, so the samples are pooled.
- **Disk-storage voids, re-run.** This benchmark counts StarSling samples only when the runner had its usual RAM disk. One control sample (cold round 3) ran on runners whose RAM disk could not be confirmed after a storage change in this organization; it was voided and re-run once, and the re-run fills its slot. Neither run is on this page or in any number on it. No GitHub-hosted or StarSling Runners (with agents) sample was voided.
- **Collector fix.** The test collector that reads each job log was fixed during the benchmark: when the app printed console output around a mocha suite header (first seen with the `PresenterManager` suite), it did not start the new suite. The record this page uses was built with the fixed collector. In one GitHub-hosted sample (warm round 2) a log line printed right after the `RemoteControlSetup` header, so that suite's tests are listed under the previous suite; the sample's mocha total passed, with 851 passing as in the others.
- **Bench-only changes, identical in every configuration and never part of the agent PR:**
  - Switched off: the Docker Hub login and the image push (`push: false`; the image is still built for both CPUs, then discarded). Upstream has no guard on either. The Docker Hub secrets do not exist here and nothing may be published; upstream did run the login and push on this merge, so that work is not in any column. The two secret references are removed.
  - Time limit: the benchmark waits up to 150 minutes for a sample (the default is 60; upstream's own `build` job took 69 minutes). This is a wait limit only; nothing measured changes.
  - One harness step, `Benchmark event context (harness)`, is added at the start of every job. It prints two IDs so each job can be matched to its sample; its median time is 0 s.
  - Different Ubuntu image on StarSling: upstream runs Ubuntu 22.04. StarSling has no 22.04 runner, so StarSling runs `starsling-ubuntu-24.04` while GitHub runs `ubuntu-22.04-4core`. The Docker image is built inside containers, so the host image affects only the Docker and QEMU setup.
  - Warm seed: warm samples start from a cache a seed run left behind, produced by replaying the previous upstream merge (`46231380`) on the same configuration; its time is not counted. mediasoup is at the same version (3.32.2) in the seed and in the replayed merge, so the worker layer is reusable.
  - On the agent PR's own branch only, never in a replay: a setup commit points the workflow's trigger at that branch and the runners at StarSling, and applies the same login and push switch-off, so the PR's checks run there.
- **Runner sizes.** Upstream's `ubuntu-22.04` jobs run on GitHub `ubuntu-22.04-4core` (4 vCPU, 16 GiB) and StarSling `starsling-ubuntu-24.04` (4 vCPU, 16 GiB). StarSling's 4 vCPU runners can burst to 5 vCPU and 32 GB RAM (Afterburner); GitHub's 4-core runners have 16 GB. Both jobs run on these labels. The linux/arm64 image is built under QEMU emulation on these x64 runners in every configuration, as upstream does.
- **Upstream reference (context only; not like-for-like; not the headline).** What upstream sees today, on upstream's own GitHub runners over the last 60 days (315 successful runs), counted separately. Uncached (the Docker worker layer is rebuilt): a median 102.3 min per merge to the default branch (n=283; last 10 median 83.3 min). Cached (the layer cache hits): a median 1.7 min (n=32), a different kind of run. Standard runners, many commits; not a like-for-like replay.
- **Failed or re-run samples** (replaced, not in the medians): GitHub-hosted runners: 0; StarSling Runners (with agents): 0.

</details>

<sub>Generated by `bench showcase` from experiment `full-2`. Machine-readable results: [`benchmark/results.json`](benchmark/results.json).</sub>
