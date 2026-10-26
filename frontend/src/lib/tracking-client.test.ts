jest.mock('./api', () => ({
  api: {
    get: jest.fn(),
  },
}));

import { api } from './api';
import { invalidateTrackingSettingsCache, loadTrackingSettings } from './tracking-client';

describe('tracking client settings cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    invalidateTrackingSettingsCache();
  });

  it('reloads fresh settings after invalidation', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({ metaPixelId: 'old-pixel' })
      .mockResolvedValueOnce({ metaPixelId: 'new-pixel' });

    await expect(loadTrackingSettings()).resolves.toMatchObject({ metaPixelId: 'old-pixel' });

    invalidateTrackingSettingsCache();

    await expect(loadTrackingSettings()).resolves.toMatchObject({ metaPixelId: 'new-pixel' });
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
