import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Product Management Glossary · Abundance', description: 'An interconnected field guide to product management. Explore definitions, practical examples, frameworks, and metrics.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Google+Sans:400,500|Roboto:400,400italic,500,500italic,700,700italic|Roboto+Mono:400,500,700&amp;display=swap"/></head><body>{children}</body></html>; }
