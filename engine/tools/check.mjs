import { readFileSync, readdirSync, statSync } from 'node:fs'; import { join, resolve } from 'node:path'; import { fileURLToPath } from 'node:url';
import { normalizeProject, validateTimeline } from '../src/project-contract.js';
const root = resolve(fileURLToPath(new URL('../../', import.meta.url))); const errors = []; const files = [];
function walk(d) {
  for (const n of readdirSync(d)) {
    if (['node_modules', '.git', 'out', 'proof-of-concept', '.claude', '.motionloom'].includes(n)) continue;
    const p = join(d, n), s = statSync(p);
    s.isDirectory() ? walk(p) : files.push(p);
  }
}
walk(root);
for(const f of files.filter(f=>/\.(js|mjs)$/.test(f))) {
  // Exclude tool files + dev harness from strict renderer checks
  const isEngineSrc = f.replace(/\\/g, '/').includes('/engine/src/');
  const isDevHarness = f.replace(/\\/g, '/').includes('studio.js') || !isEngineSrc;

  if (isDevHarness) continue;

  const lines=readFileSync(f,'utf8').split('\n');
  lines.forEach((lineText, index) => {
    const t=String(lineText).replace(/\/\/.*$/, '');
    if(/Math\.random\s*\(/.test(t))errors.push(`${f}:${index + 1}: use seeded rng(), not Math.random()`);
    if(/Date\.now\s*\(|new Date\s*\(/.test(t))errors.push(`${f}:${index + 1}: renderer must not depend on wall clock`);
    if(/fetch\s*\(|https?:\/\//.test(t))errors.push(`${f}:${index + 1}: runtime network dependency is forbidden`);
  });
}
for(const required of ['.claude-plugin/plugin.json','skills/motionloom/SKILL.md','engine/studio.html','engine/src/scenes/demo.js','engine/data/project.json','engine/src/project-contract.js']){try{statSync(join(root,required))}catch{errors.push(`missing ${required}`)}}
try {
  const canonical = normalizeProject(JSON.parse(readFileSync(join(root, 'engine/data/project.json'), 'utf8')));
  const legacy = normalizeProject(JSON.parse(readFileSync(join(root, 'engine/project.motion.json'), 'utf8')));
  for (const [label, project] of [['engine/data/project.json', canonical], ['engine/project.motion.json', legacy]]) {
    for (const finding of validateTimeline(project).filter((item) => item.severity === 'error')) {
      errors.push(`${label}: ${finding.code} ${finding.message}`);
    }
  }
} catch (error) {
  errors.push(`project contract: ${error instanceof Error ? error.message : String(error)}`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log(`MotionLoom checks passed (${files.length} files scanned).`);
