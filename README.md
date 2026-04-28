# @lyralabs/gitignore-cli

Tiny CLI to add and remove entries in `.gitignore`. Zero dependencies.

## Install

```bash
npm i -g @lyralabs/gitignore-cli
```

Or run without installing:

```bash
npx @lyralabs/gitignore-cli -v
```

## Usage

```
gitignore [options] add <pattern>    Add a pattern (idempotent)
gitignore [options] rm  <pattern>    Remove a pattern (exact match)
gitignore -h, --help                 Show help
gitignore -v, --version              Show version

Options:
  -f, --file <path>   Path to gitignore file (default: ./.gitignore)
```

## Examples

```bash
gitignore add ./venv
gitignore add 'data/*.png'
gitignore rm .env.example

# target a different file
gitignore -f ./src/.gitignore add node_modules
```

## Behavior

- `add` is idempotent — re-adding an existing pattern is a no-op.
- `rm` matches lines exactly (after trimming whitespace) and exits non-zero if not found.
- Default target is `.gitignore` in the current working directory.
- Parent directories are created automatically when writing.

## License

MIT
