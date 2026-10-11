import { open } from 'node:fs/promises';
import { importOpenApi, ImportError } from './provider-openapi-import.js';

const file = process.argv[2];
if (!file) {
  console.error('Usage: npm run provider:import -- path/to/spec.json-or-yaml');
  process.exitCode = 1;
} else {
  try {
    const handle = await open(file, 'r');
    let source: string;
    try {
      const stat = await handle.stat();
      if (!stat.isFile() || stat.size > 1024 * 1024) throw new ImportError([{ field: '$', message: 'Input must be a regular file of at most 1 MiB' }]);
      source = await handle.readFile('utf8');
    } finally { await handle.close(); }
    console.log(JSON.stringify({ data: await importOpenApi(source) }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ error: { code: error instanceof ImportError ? error.code : 'IMPORT_FILE_UNREADABLE', message: error instanceof ImportError ? error.message : 'Cannot read import file', details: error instanceof ImportError ? error.details : [] } }));
    process.exitCode = 1;
  }
}
