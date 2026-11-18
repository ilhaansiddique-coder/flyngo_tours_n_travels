import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { googleStrategyProvider as provider } from './strategies/google-provider';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigService } from '../../config/config.service';
import { GoogleOAuthGuard } from './guards/oauth.guards';
import { OAuthRedirectException } from './oauth-redirect.exception';

describe('optional Google OAuth startup', () => {
  const settings = (id: string | null, secret: string | null) => ({
    getOrNull: (key: string) => ({ GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: secret })[key] ?? null,
    get: () => 'https://www.flyngo.world',
  });
  beforeEach(() => jest.spyOn(Logger, 'warn').mockImplementation(() => undefined));
  afterEach(() => jest.restoreAllMocks());

  it.each([[null, null], ['client-id', null], [null, 'client-secret'], [' ', ' ']])('constructs the actual module provider without complete credentials (%s, %s)', async (id, secret) => {
    const module = await Test.createTestingModule({ providers: [provider,
      { provide: ConfigService, useValue: settings(id, secret) },
    ] }).compile();
    expect(module.get(GoogleStrategy)).toBeNull();
    await module.close();
  });
  it('still constructs the real Google strategy when configured', async () => {
    const module = await Test.createTestingModule({ providers: [provider,
      { provide: ConfigService, useValue: settings('test-client.invalid', 'test-secret') },
    ] }).compile();
    expect(module.get(GoogleStrategy)).toBeInstanceOf(GoogleStrategy);
    await module.close();
  });
  it('rejects an unconfigured Google request through the existing browser error flow', () => {
    const guard = new (GoogleOAuthGuard as any)(settings(null, null));
    expect(() => guard.canActivate({})).toThrow(OAuthRedirectException);
  });
});
