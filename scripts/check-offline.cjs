// Optional fallback verification when npm access is unavailable.
// Reads an existing TypeScript + Zod installation without modifying it.
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const dependencyRoot = process.argv[2];
if (!dependencyRoot) throw new Error('Pass the absolute path of an existing node_modules directory containing typescript and zod.');
const dependencyRequire = createRequire(path.join(dependencyRoot, '__offline_check__.cjs'));
const ts = dependencyRequire('typescript');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const module = { exports: {} }; cache.set(file, module);
  const localRequire = name => name.startsWith('@/') ? load(`${name.slice(2)}.ts`) : name.startsWith('.') ? load(path.resolve(path.dirname(file), `${name}.ts`)) : dependencyRequire(name);
  new Function('require', 'module', 'exports', output)(localRequire, module, module.exports);
  return module.exports;
}
const { calculate } = load('lib/calc.ts');
const { fictionalExample } = load('lib/schema.ts');
const base = { ...fictionalExample, promoPrice: 'none' };
assert.deepEqual(calculate(base).paths.map(p => p.total), [770, 610, 1120]);
assert.deepEqual(calculate(fictionalExample).paths.map(p => p.total), [870, 610, 1120]);
assert.equal(calculate(base).crossoverMonth, 3);
assert.equal(calculate(base).abandonmentMostExpensiveMonth, 3);
assert.equal(calculate({ ...base, earlyTerminationFee: 'percent', earlyTerminationValue: 50 }).paths[1].total, 690);
assert.deepEqual(calculate({ ...base, earlyTerminationFee: 'unknown' }).scenarios.map(s => s.paths[1].total), [370, 1010]);
assert.equal(calculate({ ...base, earlyTerminationFee: 'unknown', promoPrice: 'unknown' }).scenarios.length, 4);
assert.deepEqual(calculate({ ...base, contractStatus: 'no_minimum_contract', earlyTerminationValue: 0 }).paths.map(p => p.total), [370, 370, 480]);
const zero = calculate({ ...base, monthsRemaining: 0, earlyTerminationValue: 0, lateFeePerMonth: 0 });
assert.deepEqual(zero.paths.map(p => p.total), [370, 370, 370]);
assert.equal(zero.crossoverMonth, null);
assert.equal(calculate({ ...base, monthsRemaining: 36 }).paths[0].cumulative.length, 37);
for (const patch of [{ monthsRemaining: -1 }, { monthsRemaining: 37 }, { monthsRemaining: 1.5 }, { postpaidMonthlyFee: -1 }, { prepaidMonthlyCost: NaN }, { earlyTerminationFee: 'percent', earlyTerminationValue: 101 }, { monthsRemaining: undefined }]) assert.throws(() => calculate({ ...base, ...patch }));
console.log('Offline calculation smoke checks passed (18 assertions). This does not replace Vitest or next build.');
async function checkRoutes() {
  const { POST } = load('app/api/calculate/route.ts');
  const { GET } = load('app/api/health/route.ts');
  assert.deepEqual(await GET().json(), { ok: true });
  const request = body => new Request('http://localhost/api/calculate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  const success = await POST(request(JSON.stringify(fictionalExample)));
  assert.equal(success.status, 200);
  assert.equal(success.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual((await success.json()).paths.map(p => p.total), [870, 610, 1120]);
  const invalid = await POST(request(JSON.stringify({ ...base, monthsRemaining: 90 })));
  assert.equal(invalid.status, 400);
  assert.ok((await invalid.json()).fieldErrors.monthsRemaining.length);
  assert.equal((await POST(request('{invalid json'))).status, 400);
  console.log('Offline API handler checks passed (7 assertions), using real NextResponse. Server/browser checks still require installation.');
}
checkRoutes().catch(error => { console.error(error); process.exitCode = 1; });
