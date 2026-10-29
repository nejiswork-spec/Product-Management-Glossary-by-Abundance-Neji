'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { categories, entries, resolveTerm, type Entry } from '../lib/glossary';

function Icon({ name, size = 18 }: { name: string; size?: number }) {
 const paths: Record<string, React.ReactNode> = { search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>, copy: <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4"/></>, link: <><path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 2 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(2 1)"/></>, arrow: <path d="m9 5 7 7-7 7"/>, menu: <path d="M4 6h16M4 12h16M4 18h16"/>, close: <path d="m6 6 12 12M6 18 18 6"/>, check: <path d="m5 12 4 4L19 6"/>, up: <path d="m6 14 6-6 6 6"/>, book: <><path d="M12 5C8 2 4 3 2 4v15c3-1 6-1 10 1 4-2 7-2 10-1V4c-3-1-6-1-10 1Z"/><path d="M12 5v15"/></> };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.book}</svg>;
}
function LinkedText({ text, self }: { text: string; self: string }) {
 const targets = entries.filter(e => e.id !== self).flatMap(e => [e.term, ...e.aliases].filter(t => t.length > 3).map(label => ({ label, id: e.id }))).sort((a,b) => b.label.length-a.label.length);
 const pattern = new RegExp(`\\b(${targets.map(t => t.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
 return <>{text.split(pattern).map((part, i) => { const match = targets.find(t => t.label.toLowerCase() === part.toLowerCase()); return match ? <a key={i} href={`#${match.id}`}>{part}</a> : part; })}</>;
}
function Term({ entry, onCopy }: { entry: Entry; onCopy: (text: string, message: string) => void }) {
 return <article className="term" id={entry.id} aria-labelledby={`${entry.id}-heading`}>
  <div className="term-heading"><h3 id={`${entry.id}-heading`}>{entry.term}</h3><div className="term-actions"><button aria-label={`Copy link to ${entry.term}`} title="Copy link" onClick={() => onCopy(`${location.origin}${location.pathname}#${entry.id}`, 'Link copied')}><Icon name="link" size={17}/></button><button aria-label={`Copy ${entry.term} definition`} title="Copy definition" onClick={() => onCopy(`${entry.term}\n\n${entry.definition}${entry.formula ? `\n\n${entry.formula}` : ''}\n\nExample: ${entry.example}\n\nRelated: ${entry.related.join(', ')}`, 'Definition copied')}><Icon name="copy" size={17}/></button></div></div>
  <div className="term-meta"><span className={`tag tag-${entry.category.toLowerCase()}`}>#{entry.category.toLowerCase()}</span>{entry.aliases.length > 0 && <span className="aliases">Also known as {entry.aliases.join(', ')}</span>}</div>
  <p><LinkedText text={entry.definition} self={entry.id}/></p>
  {entry.formula && <div className="formula">{entry.formula}</div>}
  <details><summary><Icon name="arrow" size={14}/> See an example</summary><div className="example"><p><LinkedText text={entry.example} self={entry.id}/></p></div></details>
  <div className="related"><span>See also</span>{entry.related.map(term => { const target = resolveTerm(term); return target ? <a key={term} href={`#${target.id}`}>{term}<span aria-hidden="true">↗</span></a> : null; })}</div>
 </article>;
}
export default function Page() {
 const [query, setQuery] = useState(''); const [category, setCategory] = useState('All topics'); const [active, setActive] = useState('A'); const [mobile, setMobile] = useState(false); const [notice, setNotice] = useState('');
 const input = useRef<HTMLInputElement>(null); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
 const fuse = useMemo(() => new Fuse(entries, { keys: [{name:'term',weight:4},{name:'aliases',weight:3},{name:'definition',weight:1},{name:'category',weight:1}], threshold:0.3, ignoreLocation:true }), []);
 const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); const exact = entries.filter(e => [e.term, ...e.aliases].some(t => t.toLowerCase() === needle)); const matches = needle ? (exact.length ? exact : fuse.search(needle).map(r => r.item)) : entries; return matches.filter(e => category === 'All topics' || e.category === category).sort((a,b) => a.term.localeCompare(b.term)); }, [query,category,fuse]);
 const letters = [...new Set(filtered.map(e => e.term[0].toUpperCase()))];
 useEffect(() => { const key = (e: KeyboardEvent) => { if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'k')) && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)) { e.preventDefault(); input.current?.focus(); } if(e.key === 'Escape') { setMobile(false); input.current?.blur(); } }; window.addEventListener('keydown',key); return () => window.removeEventListener('keydown',key); }, []);
 useEffect(() => { const observer = new IntersectionObserver(items => { const visible = items.filter(i => i.isIntersecting); if(visible.length) setActive((visible[0].target as HTMLElement).dataset.letter!); }, {rootMargin:'-100px 0px -65% 0px'}); document.querySelectorAll('[data-letter]').forEach(el => observer.observe(el)); return () => observer.disconnect(); },[filtered]);
 useEffect(() => { if (!query && category === 'All topics' && location.hash) { requestAnimationFrame(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView()); } }, [query, category]);
 async function copy(text: string, message: string) { try { await navigator.clipboard.writeText(text); setNotice(message); } catch { setNotice('Select the text and use Ctrl+C to copy.'); } if(timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setNotice(''),2500); }
 function resetFilters() { setQuery(''); setCategory('All topics'); }
 // Cross-references should always reveal their destination, even when filters hide it.
 useEffect(() => { const navigate = (event: MouseEvent) => { const anchor = (event.target as HTMLElement).closest('a[href^="#"]'); if(!anchor) return; const id = anchor.getAttribute('href')!.slice(1); if(entries.some(e => e.id === id) && !document.getElementById(id)) { resetFilters(); requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView()); } }; document.addEventListener('click',navigate); return () => document.removeEventListener('click',navigate); }, []);
 return <>
  <a className="skip" href="#main">Skip to glossary</a>
  <header className="header"><div className="brand"><a href="/">Product Management</a></div><button className="mobile-toggle" aria-label={mobile ? 'Close term navigation' : 'Open term navigation'} aria-expanded={mobile} onClick={() => setMobile(!mobile)}><Icon name={mobile ? 'close' : 'menu'}/></button></header>
  <div className="subnav"><span className="subnav-current"><Icon name="book" size={16}/> Glossary</span></div>
  {mobile && <button className="backdrop" aria-label="Close navigation" onClick={() => setMobile(false)}/>}
  <aside className={`sidebar ${mobile ? 'is-open' : ''}`} aria-label="Glossary navigation"><div className="sidebar-top"><label className="search"><Icon name="search" size={17}/><input ref={input} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the glossary" aria-label="Search the glossary"/>{query ? <button onClick={() => setQuery('')} aria-label="Clear search"><Icon name="close" size={14}/></button> : <kbd>/</kbd>}</label><label className="topic-label" htmlFor="topic">Topic</label><select id="topic" value={category} onChange={e => setCategory(e.target.value)}><option>All topics</option>{categories.map(c => <option key={c}>{c}</option>)}</select><div className="index-heading"><span>{query || category !== 'All topics' ? 'Matching terms' : 'All terms'}</span><span>{filtered.length}</span></div></div><nav className="term-index">{letters.map(letter => <div key={letter}><a className="index-letter" href={`#letter-${letter}`} onClick={() => setMobile(false)}>{letter}</a>{filtered.filter(e => e.term[0] === letter).map(e => <a key={e.id} href={`#${e.id}`} onClick={() => { setActive(letter); setMobile(false); }}>{e.term}</a>)}</div>)}{!filtered.length && <p className="index-empty">No matching terms.</p>}</nav></aside>
  <div className="page-grid"><main id="main"><div className="breadcrumbs"><a href="/">Product Management</a><Icon name="arrow" size={12}/><span>Glossary</span></div><h1>Product Management Glossary</h1><p className="intro">This glossary defines product management terms.</p><nav className="alphabet" aria-label="Jump to letter">{'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => letters.includes(l) ? <a className={active === l ? 'selected' : ''} key={l} href={`#letter-${l}`} onClick={() => setActive(l)}>{l}</a> : <span key={l}>{l}</span>)}</nav>
  {(query || category !== 'All topics') && <div className="results-bar"><span>{filtered.length} {filtered.length === 1 ? 'term' : 'terms'}{query && <> for <strong>“{query}”</strong></>}{category !== 'All topics' && ` in ${category}`}</span><button onClick={resetFilters}>Clear filters <Icon name="close" size={13}/></button></div>}
  {letters.map(letter => <section className="letter-section" key={letter} id={`letter-${letter}`} data-letter={letter} aria-label={`Terms starting with ${letter}`}><div className="section-heading"><h2>{letter}</h2></div>{filtered.filter(e => e.term[0] === letter).map(e => <Term key={e.id} entry={e} onCopy={copy}/>)}</section>)}
  {!filtered.length && <div className="empty"><Icon name="search" size={32}/><h2>No terms found</h2><p>Try a different term, an acronym, or a broader topic.</p><button onClick={resetFilters}>Show all terms</button></div>}
  <footer className="main-footer"><span>Product Management Glossary · By Abundance</span><a href="#main">Back to top ↑</a></footer></main>
  <aside className="on-page" aria-label="On this page"><h2>On this page</h2><a className="on-page-title" href="#main">Product Management Glossary</a><nav>{letters.map(letter => <a key={letter} href={`#letter-${letter}`} className={active === letter ? 'active' : ''} onClick={() => setActive(letter)}>{letter}</a>)}</nav></aside></div>
  {notice && <div className="toast" role="status"><Icon name="check" size={16}/>{notice}</div>}
 </>;
}
