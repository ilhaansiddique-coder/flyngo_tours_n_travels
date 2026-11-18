import { Request } from 'express';
import { ConfigService } from '../../config/config.service';
import { assertSessionOrigin } from './session-http';

const config = (values: Record<string, string>) => ({ get: (key: string, fallback = '') => values[key] ?? fallback }) as ConfigService;
const request = (origin: string, marker = 'Flyngo', extra: Record<string, string> = {}) => ({
  get: (key: string) => ({ Origin: origin, 'X-Requested-With': marker, ...extra })[key],
}) as Request;

describe('session origin trust behind the production redirect', () => {
  it.each(['https://flyngo.world', 'https://www.flyngo.world'])('accepts both owned production hosts when FRONTEND_URL is %s', (frontend) => {
    for (const origin of ['https://flyngo.world', 'https://www.flyngo.world']) {
      expect(() => assertSessionOrigin(request(origin), config({ FRONTEND_URL: frontend }))).not.toThrow();
    }
  });
  it.each(['', 'null', 'http://www.flyngo.world', 'https://api.flyngo.world', 'https://flyngo.world.attacker.invalid', 'https://www.flyngo.world:444'])('rejects untrusted origin %s', (origin) => {
    expect(() => assertSessionOrigin(request(origin), config({ FRONTEND_URL: 'https://flyngo.world' }))).toThrow('Untrusted session request');
  });
  it('still requires the custom session header', () => {
    expect(() => assertSessionOrigin(request('https://www.flyngo.world', ''), config({ FRONTEND_URL: 'https://flyngo.world' }))).toThrow();
  });
  it('does not infer aliases for other deployments or trust forwarded host headers', () => {
    expect(() => assertSessionOrigin(request('https://www.customer.test', 'Flyngo', { Host: 'www.customer.test', 'X-Forwarded-Host': 'www.customer.test' }), config({ FRONTEND_URL: 'https://customer.test' }))).toThrow();
  });
  it('supports explicit additional origins without inheriting broad CORS trust', () => {
    const settings = config({ FRONTEND_URL: 'https://customer.test', SESSION_ALLOWED_ORIGINS: ' https://admin.customer.test,not-a-url,*', CORS_ORIGINS: '*' });
    expect(() => assertSessionOrigin(request('https://admin.customer.test'), settings)).not.toThrow();
    expect(() => assertSessionOrigin(request('https://untrusted.test'), settings)).toThrow();
  });
});
