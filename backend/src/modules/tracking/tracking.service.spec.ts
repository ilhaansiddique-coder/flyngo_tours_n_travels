import { TrackingService } from './tracking.service';

describe('TrackingService Meta CAPI forwarding', () => {
  it('sends the saved Meta token in the Authorization header', async () => {
    const service = new TrackingService({} as any, {} as any);
    const fetchMock = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      text: async () => '',
    } as any);

    await service['forwardToMetaCapi'](
      {
        eventName: 'lead',
        eventId: 'evt_123',
        createdAt: new Date('2026-10-26T00:00:00Z'),
        url: 'https://example.com/',
        userAgent: 'jest',
        email: 'user@example.com',
        phone: '+1234567890',
        fullName: 'Test User',
        consent: 'all',
        value: 10,
        currency: 'USD',
        contentName: 'Landing page',
        contentIds: ['offer_1'],
      },
      {
        metaPixelId: '1234567890',
        metaCapiToken: 'super-secret-token',
        metaCapiTestCode: 'TEST123',
        metaLduEnabled: false,
      },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://graph.facebook.com/v18.0/1234567890/events',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer super-secret-token',
        }),
      }),
    );

    fetchMock.mockRestore();
  });
});
