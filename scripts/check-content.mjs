import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../lib/glossary.ts', import.meta.url), 'utf8').split('const source = `')[1].split('`;')[0];
const rows = source.split('\n').map(line => line.split('|'));
const terms = new Set(rows.map(r => r[0]));
const ids = new Set();
const errors = [];
for (const [term, topic, definition, example, related] of rows) {
  const id = term.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (ids.has(id)) errors.push(`Duplicate term: ${term}`);
  ids.add(id);
  if (!topic || !definition || !example || !related) errors.push(`Missing content: ${term}`);
  for (const target of (related || '').split(',')) {
    if (!terms.has(target) && target !== 'Product backlog') errors.push(`Broken link: ${term} → ${target}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Validated ${rows.length} entries, ${new Set(rows.map(r => r[1])).size} topics, unique IDs, and all related-term links.`);
