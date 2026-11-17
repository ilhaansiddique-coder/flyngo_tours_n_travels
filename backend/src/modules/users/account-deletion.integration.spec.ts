import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import { MediaService } from '../media/media.service';
import { MediaDeletionService } from '../media/media-deletion.service';
import { AccountDeletionService } from './account-deletion.service';

// Explicit opt-in; this suite must never run against a production database.
const databaseUrl = process.env.ACCOUNT_DELETION_TEST_DATABASE_URL;
const describeDatabase = databaseUrl ? describe : describe.skip;

describeDatabase('permanent account deletion against PostgreSQL', () => {
  let db: PrismaClient;
  let media: MediaService;
  let worker: MediaDeletionService;
  let deletion: AccountDeletionService;
  const files: string[] = [];

  beforeAll(() => {
    if (!databaseUrl || !['127.0.0.1', 'localhost'].includes(new URL(databaseUrl).hostname)) {
      throw new Error('Account deletion integration tests require an isolated localhost database');
    }
    db = new PrismaClient({ datasourceUrl: databaseUrl });
    media = new MediaService(db as PrismaService, { getOrNull: () => null } as unknown as ConfigService);
    worker = new MediaDeletionService(db as PrismaService, media);
    deletion = new AccountDeletionService(db as PrismaService, media, worker);
  });

  afterAll(async () => {
    for (const url of files) await media.deleteAccountObject(url);
    await db.$disconnect();
  });

  async function fixture() {
    const tenant = await db.tenant.create({ data: { name: 'Deletion test', slug: randomUUID() } });
    const role = await db.role.create({ data: { tenantId: tenant.id, name: 'Customer', code: 'customer' } });
    const target = await db.user.create({ data: {
      tenantId: tenant.id, roleId: role.id, fullName: 'Delete me', phone: '+880 1325169442', phoneKey: '1325169442', email: 'delete@example.invalid',
    } });
    const survivor = await db.user.create({ data: {
      tenantId: tenant.id, roleId: role.id, fullName: 'Keep me', phone: '+880 1325169443', phoneKey: '1325169443', createdByUserId: target.id,
      availablePoints: 350, lifetimePoints: 350,
    } });
    return { tenantId: tenant.id, roleId: role.id, target, survivor };
  }

  async function upload(tenantId: string) {
    const file = await media.upload({ originalname: `${randomUUID()}.pdf`, mimetype: 'application/pdf', size: 8, buffer: Buffer.from('%PDF-1.4') } as Express.Multer.File,
      { tenantId, folder: 'deletion-tests', allowDocuments: true });
    files.push(file.url);
    return file.url;
  }

  function diskPath(url: string) { return path.join(process.cwd(), 'uploads', url.split('/api/v1/uploads/')[1]); }

  it('deletes owned data, anonymous contact records and physical files while preserving other accounts and shared assets', async () => {
    const { tenantId, roleId, target, survivor } = await fixture();
    const privateFile = await upload(tenantId);
    const sharedFile = await upload(tenantId);
    await db.user.update({ where: { id: target.id }, data: { passportUrl: privateFile, avatarUrl: sharedFile } });
    await db.user.update({ where: { id: survivor.id }, data: { avatarUrl: sharedFile } });
    await db.userDocument.create({ data: { tenantId, userId: target.id, url: privateFile, filename: 'passport.pdf' } });
    const booking = await db.booking.create({ data: { tenantId, userId: target.id, bookingCode: randomUUID(), bookingType: 'tour', itemId: 'test-tour', startDate: new Date(), meta: { documents: [privateFile] } } });
    const guest = await db.booking.create({ data: { tenantId, customerPhone: '01325169442', bookingCode: randomUUID(), bookingType: 'visa', itemId: 'test-visa', startDate: new Date() } });
    const otherBooking = await db.booking.create({ data: { tenantId, userId: survivor.id, bookingCode: randomUUID(), bookingType: 'hotel', itemId: 'test-hotel', startDate: new Date() } });
    await db.bookingTraveler.create({ data: { tenantId, bookingId: booking.id, fullName: 'Traveler', passportNumber: 'PRIVATE' } });
    await db.paymentMilestone.create({ data: { tenantId, bookingId: booking.id, stage: 'deposit', label: 'Deposit', amount: 100, dueDate: new Date() } });
    const pilgrimage = await db.hajjUmrahBooking.create({ data: { tenantId, userId: target.id, kind: 'umrah', packageId: 'test-package', packageTitle: 'Test Umrah', packageSlug: 'test-umrah', departureDate: new Date() } });
    await db.pilgrim.create({ data: { bookingId: pilgrimage.id, fullName: 'Pilgrim', passportNumber: 'PRIVATE', passportExpiry: new Date(), dateOfBirth: new Date() } });
    const payment = await db.payment.create({ data: { tenantId, userId: target.id, bookingId: booking.id, amount: 100, method: 'cash', transactionId: randomUUID(), receiptUrls: [privateFile] } });
    await db.invoice.create({ data: { tenantId, userId: target.id, bookingId: booking.id, paymentId: payment.id, invoiceNumber: randomUUID(), subtotal: 100, total: 100, lineItems: [] } });
    await db.deviceToken.create({ data: { tenantId, userId: target.id, token: randomUUID() } });
    await db.passwordReset.create({ data: { tenantId, userId: target.id, tokenHash: randomUUID(), channel: 'email', destination: target.email, expiresAt: new Date() } });
    await db.notification.create({ data: { tenantId, userId: target.id, type: 'email', title: 'Private', body: 'Contact data' } });
    await db.review.create({ data: { tenantId, userId: target.id, itemType: 'tour', itemId: 'test-tour', rating: 5, content: 'Private review' } });
    await db.blogPost.create({ data: { tenantId, authorId: target.id, title: 'Owned post', slug: randomUUID(), content: 'Private', tags: [] } });
    await db.lead.create({ data: { tenantId, fullName: 'Lead', phone: '01325169442', email: target.email } });
    await db.hajjPreRegistration.create({ data: { tenantId, fullName: 'Registration', phone: '+8801325169442' } });
    await db.trackingEvent.create({ data: { tenantId, eventName: 'signup', userId: target.id, email: target.email } });
    await db.trackingEvent.create({ data: { tenantId, eventName: 'lead', phone: '01325169442' } });
    await db.auditLog.create({ data: { tenantId, userId: survivor.id, action: 'create', entity: 'User', entityId: target.id, newValue: { email: target.email } } });
    await db.webhookEventLog.create({ data: { provider: 'stripe', eventId: randomUUID(), payload: { data: { object: { id: payment.transactionId } } } } });
    const affiliate = await db.affiliate.create({ data: { tenantId, userId: target.id, referralCode: randomUUID() } });
    await db.affiliateReferral.create({ data: { tenantId, affiliateId: affiliate.id, referredUserId: survivor.id } });
    await db.affiliateCommission.create({ data: { tenantId, affiliateId: affiliate.id, bookingId: otherBooking.id, amount: 5 } });
    await db.referralPayout.create({ data: { tenantId, affiliateId: affiliate.id, amount: 5, method: 'cash', details: { phone: target.phone } } });
    await db.referralLedger.create({ data: { tenantId, affiliateId: affiliate.id, type: 'signup', amount: 5, referredUserId: target.id } });
    const loyalty = await db.loyaltyAccount.create({ data: { tenantId, userId: target.id } });
    await db.loyaltyTransaction.create({ data: { tenantId, accountId: loyalty.id, type: 'signup', points: 100 } });
    await db.pointTransaction.create({ data: { userId: target.id, type: 'SIGNUP_BONUS', amount: 100, referenceType: 'SIGNUP', referenceId: target.id, idempotencyKey: randomUUID(), balanceAfter: {} } });
    await db.pointTransaction.create({ data: { userId: survivor.id, type: 'SIGNUP_BONUS', amount: 100, referenceType: 'SIGNUP', referenceId: survivor.id, idempotencyKey: randomUUID(), balanceAfter: {} } });
    await db.pointTransaction.create({ data: { userId: survivor.id, type: 'REFERRAL_SIGNUP', amount: 250, referenceType: 'REFERRAL', referenceId: target.id, idempotencyKey: randomUUID(), balanceAfter: {}, metadata: { referredUserId: target.id } } });
    const otherTenant = await db.tenant.create({ data: { name: 'Other tenant', slug: randomUUID() } });
    const foreignLead = await db.lead.create({ data: { tenantId: otherTenant.id, fullName: 'Other tenant lead', phone: '01325169442' } });
    await expect(deletion.remove(target.id, otherTenant.id)).rejects.toThrow('User not found');
    expect(await db.user.findUnique({ where: { id: target.id } })).not.toBeNull();
    await expect(deletion.remove(target.id, tenantId)).resolves.toMatchObject({ deleted: true, permanent: true, pendingFileDeletions: 0 });
    expect(await db.user.findUnique({ where: { id: target.id } })).toBeNull();
    expect(await db.user.findUnique({ where: { id: survivor.id } })).toMatchObject({ createdByUserId: null, availablePoints: 100 });
    expect(await db.booking.findUnique({ where: { id: otherBooking.id } })).not.toBeNull();
    expect(await db.booking.findUnique({ where: { id: booking.id } })).toBeNull();
    expect(await db.booking.findUnique({ where: { id: guest.id } })).toBeNull();
    expect(await db.hajjUmrahBooking.findUnique({ where: { id: pilgrimage.id } })).toBeNull();
    for (const model of ['payment', 'invoice', 'bookingTraveler', 'paymentMilestone', 'notification', 'review', 'blogPost', 'lead', 'hajjPreRegistration', 'trackingEvent', 'auditLog', 'affiliate', 'affiliateReferral', 'affiliateCommission', 'referralPayout', 'referralLedger', 'loyaltyAccount', 'loyaltyTransaction'] as const) {
      expect(await (db[model] as any).count({ where: { tenantId } })).toBe(0);
    }
    expect(await db.pilgrim.count({ where: { bookingId: pilgrimage.id } })).toBe(0);
    for (const model of ['deviceToken', 'passwordReset', 'userDocument', 'pointTransaction'] as const) {
      expect(await (db[model] as any).count({ where: { userId: target.id } })).toBe(0);
    }
    expect(await db.lead.findUnique({ where: { id: foreignLead.id } })).not.toBeNull();
    await expect(fs.access(diskPath(privateFile))).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(fs.access(diskPath(sharedFile))).resolves.toBeUndefined();
    const replacement = await db.user.create({ data: { tenantId, roleId, fullName: 'New account', phone: target.phone, phoneKey: target.phoneKey, email: target.email } });
    expect(replacement.id).not.toBe(target.id);
    await expect(deletion.remove(target.id, otherTenant.id)).rejects.toThrow('User not found');
  }, 60_000);

  it('does not delete guest data belonging to a current owner of a recycled contact', async () => {
    const { tenantId, target, survivor } = await fixture();
    await db.user.update({ where: { id: target.id }, data: { deletedAt: new Date(), phoneKey: null } });
    await db.user.update({ where: { id: survivor.id }, data: { phone: target.phone, phoneKey: target.phoneKey, email: target.email } });
    const lead = await db.lead.create({ data: { tenantId, fullName: 'Current owner', phone: target.phone! } });
    await deletion.remove(target.id, tenantId);
    expect(await db.lead.findUnique({ where: { id: lead.id } })).not.toBeNull();
    expect(await db.user.findUnique({ where: { id: survivor.id } })).not.toBeNull();
  }, 60_000);

  it('rolls the entire database deletion back if a dependent operation fails', async () => {
    const { tenantId, target } = await fixture();
    const booking = await db.booking.create({ data: { tenantId, userId: target.id, bookingCode: randomUUID(), bookingType: 'tour', itemId: 'test', startDate: new Date() } });
    const original = worker.hasLiveReferences.bind(worker);
    const uploadUrl = await upload(tenantId);
    await db.user.update({ where: { id: target.id }, data: { passportUrl: uploadUrl } });
    worker.hasLiveReferences = async () => { throw new Error('Injected failure'); };
    try { await expect(deletion.remove(target.id, tenantId)).rejects.toThrow('Injected failure'); }
    finally { worker.hasLiveReferences = original; }
    expect(await db.user.findUnique({ where: { id: target.id } })).not.toBeNull();
    expect(await db.booking.findUnique({ where: { id: booking.id } })).not.toBeNull();
    await expect(fs.access(diskPath(uploadUrl))).resolves.toBeUndefined();
  }, 60_000);
});
