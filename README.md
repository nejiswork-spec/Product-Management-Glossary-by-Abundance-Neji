# Product Management Glossary by Abundance

A searchable, interconnected reference built with Next.js, React, TypeScript, Tailwind CSS, and Fuse.js. No account or database is required.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Use `/` or Ctrl/Cmd+K to focus search. Search covers terms, aliases, topics, and definitions. Topic filters can be combined with search. Each entry has copy-definition and copy-link controls, related concepts, and an expandable practical example. Text is selectable throughout.

## Content

Edit `lib/glossary.ts` to maintain the original glossary content. Each line has pipe-separated fields: term, topic, definition, example, related terms, optional formula, and optional semicolon-separated aliases. Related terms must resolve to an existing entry. IDs derive from term names, so renaming a term changes its shareable URL fragment.

## Validation

```sh
npm run typecheck
npm run build
```

The layout is inspired by the Google for Developers glossary, with original product-management content and Abundance branding. The glossary is educational reference material; formulas state simplifying assumptions where relevant.
