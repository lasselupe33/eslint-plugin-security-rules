# eslint-plugin-security-rules

Introduction...

## Installation

`yarn add --dev eslint-plugin-security-rules`

## Usage

Add the following to your `.eslintrc` configuration:

```json
{
  "extends": [
    "plugin:security-rules/recommended"
  ]
}
```

## Rules

...

<!-- yarn rules watch -->
<!-- yarn eslint -->

## Testing

Generate test-set:

```bash
ts-node ./dummy/_generator/generate.ts [chain-depth <number>]
```

Run performance-test:

```bash
ts-node ./dummy/perf/performanceTest.ts [warmup-iterations <number>] [iterations <number>] [entrypoint <string>]
```