import { cp, mkdir, rm } from 'node:fs/promises';
await import('./check.mjs');
await rm(new URL('../dist/',import.meta.url),{recursive:true,force:true,maxRetries:3,retryDelay:100});
await mkdir(new URL('../dist/',import.meta.url));
for(const f of ['index.html','src']) await cp(new URL(`../${f}`,import.meta.url),new URL(`../dist/${f}`,import.meta.url),{recursive:true});
await cp(new URL('../public/',import.meta.url),new URL('../dist/',import.meta.url),{recursive:true});
console.log('Static output ready: dist/ (not deployed).');
