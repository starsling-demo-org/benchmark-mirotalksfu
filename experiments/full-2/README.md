# mirotalksfu CI: GitHub vs StarSling

> Not affiliated with [miroslavpejic85/mirotalksfu](https://github.com/miroslavpejic85/mirotalksfu) (3.2k stars). This repository replays mirotalksfu's own CI on real upstream commits to measure **how long a push waits for every check**: from the first workflow starting to the last job finishing.

## Results

**Pushes** (typical wait per push):

Cold: **StarSling: 3.7x faster** than GitHub for a push to wait for every check (101.63 min → 27.32 min). Warm: **StarSling: 36.4x faster** than GitHub for a push to wait for every check (86.18 min → 2.37 min).

StarSling = StarSling runners + StarSling agent PRs.

| | Cold wait | Cold vs GitHub | Warm wait | Warm vs GitHub |
|---|---:|---:|---:|---:|
| GitHub (the project's CI as is, on GitHub-hosted runners) | **101.63 min** | 1x | **86.18 min** | 1x |
| StarSling (StarSling runners + agent PRs) | **27.32 min** | **3.7x** faster | **2.37 min** | **36.4x** faster |

**Where the speedup comes from**

- Cold: StarSling runners alone (CI unchanged): 28.40 min, **3.6x** faster than GitHub
- Cold: StarSling agent PRs, on the same runners: **1.0x** faster (28.40 min → 27.32 min)
- Cold: Together: 3.6x × 1.0x = 3.7x
- Warm: StarSling runners alone (CI unchanged): 26.10 min, **3.3x** faster than GitHub
- Warm: StarSling agent PRs, on the same runners: **11.0x** faster (26.10 min → 2.37 min)
- Warm: Together: 3.3x × 11.0x = 36.4x

> **1 sample(s) failed or were re-run and replaced** (StarSling unchanged (hardware alone): 1). Only complete samples are in the medians.

<sub>Typical = the median over complete rounds. Total speedup = StarSling runners alone × agent PRs on top. Details are in the Appendix.</sub>

## Terms

| Term | Meaning |
|---|---|
| **Wait** | How long one push (or PR update) takes until every check has finished: from the first workflow starting to the last job finishing. |
| **GitHub** | The project's own CI, unchanged, on GitHub-hosted runners (the machines GitHub rents out). |
| **StarSling** | StarSling runners (faster machines) plus StarSling agent PRs (changes to the CI itself). |
| **Agent PRs** | Small pull requests StarSling's agent wrote against the project's CI to make it faster. Each is measured on its own in the Appendix. |
| **Median** | The middle result. Half the runs were faster, half were slower, so one odd run does not move it. |
| **Round** | One replay of the same change on every setup. Only rounds where every setup finished cleanly count. |
| **Cold** | Every run starts with no GitHub Actions caches (saved downloads and build output). |
| **Warm** | Every run starts from caches that an earlier run on the same setup saved. |

## Appendix

<details>
<summary>Agent PRs: what each one changed and its own effect</summary>

Merged in this order. Each row's effect comes from its own before/after experiment; the last row's cumulative wait is the headline.

| # | Agent PR | What it changed | Its own effect (typical wait, before → after) | Wait after it (cumulative) |
|---:|---|---|---|---:|
| 1 | [pull/1](https://github.com/starsling-demo-org/benchmark-mirotalksfu/pull/1) | mediasoup worker stage | 28.40 min → 27.32 min (−4%), 5 runs per side | 27.32 min |

</details>

<details>
<summary>What we changed</summary>

- [mediasoup worker stage](https://github.com/starsling-demo-org/benchmark-mirotalksfu/pull/1)

</details>

<details>
<summary>Same checks, same results</summary>



</details>

<details>
<summary>Every push, round by round</summary>

Each cell is the whole wait for that push and links to its run.

| Upstream commit | Cache | Round | GitHub unchanged | StarSling unchanged (hardware alone) | StarSling + agent PRs |
|---|---|---:|---:|---:|---:|
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Cold | 1 | [96.95 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43818251863) | [29.12 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43813753777) | [27.27 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43831469879) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Cold | 2 | [74.77 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43904144947) | [28.40 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43843133603) | [26.52 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43837085406) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Cold | 3 | [101.63 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43926938353) | [27.58 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane1/actions/runs/43992846648) | [27.63 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43919934453) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Cold | 4 | [116.25 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43953226053) | [29.67 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43980971901) | [28.03 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu/actions/runs/43974645858) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Cold | 5 | [107.65 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane3/actions/runs/43941540381) | [28.17 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane4/actions/runs/43985686859) | [27.32 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane5/actions/runs/43983258232) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Warm | 1 | [97.28 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane4/actions/runs/43954609399) | [26.10 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane2/actions/runs/43984672011) | [2.37 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane3/actions/runs/43987548685) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Warm | 2 | [110.75 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane2/actions/runs/43959500922) | [25.65 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane6/actions/runs/43983935062) | [2.13 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane1/actions/runs/43984275360) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Warm | 3 | [86.18 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane1/actions/runs/43952506485) | [26.27 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane4/actions/runs/43979012034) | [2.45 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane3/actions/runs/43978884919) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Warm | 4 | [58.50 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane6/actions/runs/43951824562) | [24.68 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane5/actions/runs/43976723295) | [2.42 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane1/actions/runs/43975523465) |
| [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) | Warm | 5 | [74.72 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane5/actions/runs/43955252048) | [28.18 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane6/actions/runs/43971759640) | [2.25 min](https://github.com/starsling-demo-org/benchmark-mirotalksfu-lane3/actions/runs/43969844370) |

</details>

<details>
<summary>How it's measured</summary>

1. **Pin.** miroslavpejic85/mirotalksfu is pinned at [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db), the [`upstream/`](upstream) submodule in this repository. Each scenario replays one real upstream event: the merge of [`e76e48f6`](https://github.com/miroslavpejic85/mirotalksfu/commit/e76e48f678f286fd5597617ea040c626d2d191db) to `main`.
2. **Replay natively.** Each sample pushes that exact tree to this repository's `main` branch and fires the real GitHub event (a push, or a PR synchronize). Every workflow, job and step runs with its own triggers, filters, `needs`, conditions, matrices and `workflow_run` follow-ups, in the order GitHub schedules them.
3. **Runner configurations.** GitHub-hosted runners and StarSling Runners run the CI unchanged; StarSling Runners also run it with the agent PR applied (self-improving CI). Jobs on runners StarSling does not offer stay on GitHub-hosted runners in every configuration and still count.
4. **Rounds.** 5 rounds; in each, every runner configuration replays the event once, in a deterministic shuffled order, one sample at a time. Medians use only complete rounds, and a sample counts only if every expected job succeeded on the first attempt.
5. **Control caches.** Cold cache: Every sample starts with no GitHub Actions caches. Warm cache: Every sample starts from caches a seed run produced on the same runner configuration; seed time is not counted.
6. **Check.** Replays are compared job by job with upstream's own runs for the same commit, and every sample's test verdicts, coverage and cache restores are read from its own job logs.

- Samples ran concurrently, each in its own cache scope (one repository per lane: benchmark-mirotalksfu-lane1, benchmark-mirotalksfu-lane2, benchmark-mirotalksfu-lane3, benchmark-mirotalksfu-lane4, benchmark-mirotalksfu-lane5, benchmark-mirotalksfu-lane6, with the same branches, events and payloads as benchmark-mirotalksfu); a cold sample ran with no caches in its repository. 11 samples came from an earlier sequential run of the same configuration.

- **Cold:** Every sample starts with no GitHub Actions caches.
- **Warm:** Every sample starts from caches a seed run produced on the same runner configuration; seed time is not counted.
- **Failed or re-run samples** (replaced, not in the medians): GitHub unchanged: 0; StarSling unchanged (hardware alone): 1; StarSling + agent PRs: 0.

</details>

<details>
<summary>Runners</summary>

| Runners | Label | vCPU | Memory |
|---|---|---:|---:|
| GitHub-hosted | `ubuntu-22.04-4core` | 4 | 16 GiB |
| StarSling | `starsling-ubuntu-24.04` | 4 | 16 GiB |

GitHub-hosted jobs run on the explicit GitHub larger-runner label shown, pinned to the size of upstream's public-repository runner, so the comparison does not change with this repository's visibility.

</details>

<sub>Generated by `bench showcase` from experiment `full-2`. Machine-readable results: [`benchmark/results.json`](benchmark/results.json). Configurations: GitHub-hosted runners; StarSling Runners (hardware only); StarSling Runners (self-improving CI).</sub>
