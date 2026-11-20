const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const [productionPath, developmentPath] = process.argv.slice(2);
assert.ok(productionPath && developmentPath, 'Pass production and development docker compose config JSON files');
const production = JSON.parse(readFileSync(productionPath, 'utf8'));
const development = JSON.parse(readFileSync(developmentPath, 'utf8'));

assert.equal(production.networks.coolify.external, true, 'Production must use the existing proxy network');
for (const [name, port] of [['backend', 4000], ['frontend', 3000]]) {
  const service = production.services[name];
  assert.equal((service.ports || []).length, 0, `${name} must not reserve a host port`);
  assert.ok(service.expose.includes(String(port)), `${name} must expose its internal port`);
  assert.ok(Object.hasOwn(service.networks, 'coolify'), `${name} must join the proxy network`);
  assert.equal(service.labels[`traefik.http.services.${name}.loadbalancer.server.port`], String(port));
  assert.ok(development.services[name].ports.some((mapping) => mapping.target === port && Number(mapping.published) === port), `${name} development port must remain available`);
}
console.log('Compose routing verified: internal production ports, proxy targets and development host mappings');
