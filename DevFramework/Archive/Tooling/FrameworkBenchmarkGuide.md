# Framework Benchmark Guide

How to run the framework benchmark system to detect regressions.

---

## What It Is

A set of 10 representative tasks (GT-01 to GT-10) that measure how well the AI agent + framework handles common development scenarios.

## When to Run

| Trigger                      | Action              |
| ---------------------------- | ------------------- |
| After framework version bump | Full suite (10)     |
| After major doc restructure  | Full suite (10)     |
| Monthly                      | Full suite (10)     |
| After anomaly pattern        | Related subset only |

## How to Run

1. Start a fresh chat session
2. Request: "Run framework benchmark GT-XX"
3. Agent executes task per `DevFramework/FrameworkHealthBenchmarks/FrameworkBenchmarks.md`
4. Record results in `FrameworkBenchmarkRunHistory/<YYYY-MM-DD>.md`

## Interpreting Results

| Metric          | Healthy | Warning |
| --------------- | ------- | ------- |
| Pass Rate       | ≥80%    | <80%    |
| Time Efficiency | ≥70%    | <70%    |
| Regressions     | 0       | Any     |

## Location

- Task definitions: `DevFramework/FrameworkHealthBenchmarks/FrameworkBenchmarks.md`
- Run history: `DevFramework/FrameworkHealthBenchmarks/FrameworkBenchmarkRunHistory/`
