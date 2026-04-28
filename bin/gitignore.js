#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');

const HELP = `gitignore - manage .gitignore entries

Usage:
  gitignore [options] add <pattern>    Add a pattern (idempotent)
  gitignore [options] rm  <pattern>    Remove a pattern (exact match)
  gitignore -h, --help                 Show this help
  gitignore -v, --version              Show version

Options:
  -f, --file <path>   Path to gitignore file (default: ./.gitignore)

Examples:
  gitignore add ./venv
  gitignore add 'data/*.png'
  gitignore rm .env.example
  gitignore -f ./src/.gitignore add node_modules`;

function read(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n');
}

function write(file, lines) {
  let out = lines.join('\n');
  if (!out.endsWith('\n')) out += '\n';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, out);
}

function add(file, pattern) {
  const lines = read(file);
  if (lines.some(l => l.trim() === pattern)) {
    console.log(`already present: ${pattern}`);
    return;
  }
  if (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  lines.push(pattern);
  write(file, lines);
  console.log(`added: ${pattern} -> ${file}`);
}

function rm(file, pattern) {
  if (!fs.existsSync(file)) {
    console.error(`no gitignore at ${file}`);
    process.exit(1);
  }
  const lines = read(file);
  const next = lines.filter(l => l.trim() !== pattern);
  if (next.length === lines.length) {
    console.error(`not found: ${pattern}`);
    process.exit(1);
  }
  write(file, next);
  console.log(`removed: ${pattern} <- ${file}`);
}

function parseArgs(argv) {
  const out = { file: null, rest: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-f' || a === '--file') {
      if (!argv[i + 1]) { console.error(`${a}: missing path`); process.exit(1); }
      out.file = argv[++i];
    } else {
      out.rest.push(a);
    }
  }
  return out;
}

const { file: fileOpt, rest: args } = parseArgs(process.argv.slice(2));
const file = path.resolve(process.cwd(), fileOpt || '.gitignore');
const [cmd, ...rest] = args;

switch (cmd) {
  case '-h':
  case '--help':
  case undefined:
    console.log(HELP);
    break;
  case '-v':
  case '--version':
    console.log(pkg.version);
    break;
  case 'add':
    if (!rest[0]) { console.error('add: missing <pattern>'); process.exit(1); }
    add(file, rest[0]);
    break;
  case 'rm':
    if (!rest[0]) { console.error('rm: missing <pattern>'); process.exit(1); }
    rm(file, rest[0]);
    break;
  default:
    console.error(`unknown command: ${cmd}`);
    console.error(HELP);
    process.exit(1);
}
