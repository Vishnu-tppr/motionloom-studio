import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
export function findChrome(explicit) {
  const names = [explicit, process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'].filter(Boolean);
  for (const n of names) if (existsSync(n)) return n;
  for (const bin of ['google-chrome','chromium','chromium-browser']) try { return execFileSync(process.platform === 'win32' ? 'where' : 'which', [bin], { encoding:'utf8' }).trim().split(/\r?\n/)[0]; } catch {}
  throw new Error('Chrome/Chromium not found. Set CHROME_PATH or pass --chrome=/path/to/chrome.');
}
export function argsOf(argv) { return Object.fromEntries(argv.map(v => { const [k,...rest] = v.replace(/^--/,'').split('='); return [k, rest.length ? rest.join('=') : true]; })); }
export const sleep = ms => new Promise(r => setTimeout(r, ms));
