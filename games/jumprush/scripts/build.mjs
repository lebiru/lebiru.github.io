import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';

const root = resolve(import.meta.dirname, '..');
const assets = resolve(root, 'assets');
await rm(assets, { recursive: true, force: true });
await mkdir(assets, { recursive: true });
await cp(resolve(root, 'index.template.html'), resolve(root, 'index.html'));
await build({ configFile: resolve(root, 'vite.config.ts'), root });
const page = resolve(root, 'index.html');
let html = await readFile(page, 'utf8');
const stylesheet = html.match(/<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+)">/);
if (stylesheet) {
  const css = await readFile(resolve(root, stylesheet[1]), 'utf8');
  html = html.replace(stylesheet[0], `<style>${css}</style>`);
}
html = html.replace('<script type="module" crossorigin ', '<script ');
await writeFile(page, html);
const stale = (await readdir(assets)).filter((file) => !file.startsWith('jumprush-'));
await Promise.all(stale.map((file) => rm(resolve(assets, file), { recursive: true, force: true })));
