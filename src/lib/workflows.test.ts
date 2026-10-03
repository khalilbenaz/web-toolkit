import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const dir = new URL('../../.github/workflows/', import.meta.url);
const files = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));

describe('workflows GitHub Actions', () => {
  it('workflows_present_auMoinsUnFichierCi', () => {
    expect(files).toContain('ci.yml');
  });

  it('uses_chaqueAction_estEpingleSurUnSha40AvecCommentaireDeVersion', () => {
    const bad: string[] = [];
    for (const f of files) {
      for (const line of readFileSync(new URL(f, dir), 'utf8').split('\n')) {
        const m = line.match(/^\s*-?\s*uses:\s*(\S+)(.*)$/);
        if (!m || m[1].startsWith('./')) continue;
        const pinned = /@[0-9a-f]{40}$/.test(m[1]) && /^\s+#\s*v\d+\.\d+\.\d+\s*$/.test(m[2]);
        if (!pinned) bad.push(`${f}: ${line.trim()}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('ci_etapesAttendues_tscLintTestBuildEtAudit', () => {
    const ci = readFileSync(new URL('ci.yml', dir), 'utf8');
    for (const cmd of ['npm ci', 'npm run typecheck', 'npm run lint', 'npm test', 'npm run build', 'npm audit --omit=dev']) {
      expect(ci).toContain(cmd);
    }
  });

  it('ci_permissions_lectureSeule', () => {
    const ci = readFileSync(new URL('ci.yml', dir), 'utf8');
    expect(ci).toMatch(/permissions:\s*\n\s+contents: read/);
  });
});
