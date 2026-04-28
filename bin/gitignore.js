#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');

const HELP = `gitignore - manage .gitignore entries

Usage:
  gitignore [options] add <pattern>...   Add one or more patterns (idempotent)
  gitignore [options] rm  <pattern>...   Remove one or more patterns (exact match)
  gitignore -h, --help                 Show this help
  gitignore -v, --version              Show version

Options:
  -f, --file <path>   Path to gitignore file (default: ./.gitignore)

Examples:
  gitignore add ./venv
  gitignore add 'data/*.png' .env dist node_modules
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

function add(file, patterns) {
  const lines = read(file);
  if (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  const existing = new Set(lines.map(l => l.trim()));
  for (const p of patterns) {
    if (existing.has(p)) {
      console.log(`already present: ${p}`);
      continue;
    }
    lines.push(p);
    existing.add(p);
    console.log(`added: ${p}`);
  }
  write(file, lines);
  console.log(`-> ${file}`);
}

function rm(file, patterns) {
  if (!fs.existsSync(file)) {
    console.error(`no gitignore at ${file}`);
    process.exit(1);
  }
  let lines = read(file);
  let missing = 0;
  for (const p of patterns) {
    const next = lines.filter(l => l.trim() !== p);
    if (next.length === lines.length) {
      console.error(`not found: ${p}`);
      missing++;
    } else {
      console.log(`removed: ${p}`);
    }
    lines = next;
  }
  write(file, lines);
  console.log(`<- ${file}`);
  if (missing) process.exit(1);
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
    if (!rest.length) { console.error('add: missing <pattern>'); process.exit(1); }
    add(file, rest);
    break;
  case 'rm':
    if (!rest.length) { console.error('rm: missing <pattern>'); process.exit(1); }
    rm(file, rest);
    break;
  default:
    console.error(`unknown command: ${cmd}`);
    console.error(HELP);
    process.exit(1);
}
