import { cp } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
await cp(resolve(root, 'index.template.html'), resolve(root, 'index.html'));
