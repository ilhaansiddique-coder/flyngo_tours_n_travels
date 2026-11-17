import { ReferralService } from './referral.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LoyaltyService } from '../loyalty/loyalty.service';

it('initializes referral settings atomically when public requests and signup overlap', async () => {
  const upsert = jest.fn().mockResolvedValue({ tenantId: 'tenant-1', isEnabled: true });
  const service = new ReferralService(
    { referralSetting: { upsert } } as unknown as PrismaService,
    {} as NotificationsService, {} as LoyaltyService,
  );
  await expect(service.getSettings('tenant-1')).resolves.toMatchObject({ tenantId: 'tenant-1' });
  expect(upsert).toHaveBeenCalledWith({ where: { tenantId: 'tenant-1' }, create: { tenantId: 'tenant-1' }, update: { tenantId: 'tenant-1' } });
});
