import typescript from '@rollup/plugin-typescript';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';

export default defineConfig({
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.cjs.js', format: 'cjs', strict: true },
    { file: 'dist/index.esm.js', format: 'esm', strict: true },
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.build.json',
    }),
    copy({
      targets: [
        { src: 'README.md', dest: 'dist' },
        { src: 'LICENSE', dest: 'dist' },
      ],
    }),
    {
      name: 'modify-package-json',
      async generateBundle(opts) {
        // Read the copied package.json
        const srcPackageJsonPath = resolve(import.meta.dirname, 'package.json');
        const dstPackageJsonPath = join(import.meta.dirname, 'dist', 'package.json');
        const isPackageJsonExists = existsSync(dstPackageJsonPath);
        let packageJson = {};
        if (!isPackageJsonExists) {
          const content = readFileSync(srcPackageJsonPath, { encoding: 'utf-8' });
          Object.assign(packageJson, JSON.parse(content));
          delete packageJson.devDependencies;
          delete packageJson.scripts;
          delete packageJson.private;
          delete packageJson.type; // to support both CJS & ESM
          packageJson.types = 'index.d.ts';
          mkdirSync(dirname(dstPackageJsonPath), { recursive: true });
        } else {
          const content = readFileSync(dstPackageJsonPath, { encoding: 'utf-8' });
          Object.assign(packageJson, JSON.parse(content));
        }

        const filename = opts.file.replace(/\/?dist\//, '');
        if (opts.format === 'es') {
          packageJson.module = filename;
        } else if (opts.format === 'cjs') {
          packageJson.main = filename;
        }

        writeFileSync(dstPackageJsonPath, JSON.stringify(packageJson, null, 2));
      },
    },
  ],
  external: ['p-limit'],
});
