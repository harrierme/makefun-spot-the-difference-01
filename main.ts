// SELISIH — the entry program (Node 22, standard library only).
// It hands the game in: copies game/ and screenshots/ from beside this file
// into the output directory and writes /output/dossier.json with the
// vendored make.fun library, so the sealed scorer can read the entry.
//
// Run locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader MAKEFUN_OUTPUT_DIR is unset and /output is used.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTreeInto(srcDir: string, destDir: string): void {
  mkdirSync(destDir, { recursive: true });
  for (const name of readdirSync(srcDir)) {
    cpSync(join(srcDir, name), join(destDir, name), { recursive: true });
  }
}

function handIn(): void {
  mkdirSync(outDir, { recursive: true });
  copyTreeInto(join(repoRoot, 'game'), join(outDir, 'game'));
  const shots = join(repoRoot, 'screenshots');
  if (existsSync(shots)) copyTreeInto(shots, join(outDir, 'screenshots'));

  // The scorer's caps for this bounty (see the kit's RULES.txt): the text
  // budget shapes the dossier bytes; the rest refuse an entry the scorer
  // would refuse, so an entry that hands in cleanly here is shaped to pass.
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

handIn();
