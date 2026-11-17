import { NotificationsService } from './notifications.service';
import { EmailQueueService } from './email-queue.service';
import { NotificationsController } from './notifications.controller';

const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({ createTransport: () => ({ sendMail: mockSendMail }) }));

describe('notification delivery acknowledgements', () => {
  const originalFetch = global.fetch;
  const db = { deviceToken: { findMany: jest.fn() } };
  const makeService = (values: Record<string, string> = {}) => new NotificationsService(
    db as any, { getOrNull: (key: string) => values[key] ?? null } as any,
  );
  const smtp = { SMTP_HOST: 'localhost', SMTP_USER: 'mailer', SMTP_PASSWORD: 'test' };

  beforeEach(() => jest.clearAllMocks());
  afterEach(() => { global.fetch = originalFetch; });

  it('rejects email, raw email and SMS when no provider is configured', async () => {
    const service = makeService();
    await expect(service.sendEmail('test@example.invalid', 'Test', 'custom')).rejects.toThrow('Email delivery is unavailable');
    await expect(service.sendRawHtmlEmail('test@example.invalid', 'Test', '<p>Test</p>')).rejects.toThrow('Email delivery is unavailable');
    await expect(service.sendSms('01712345678', 'Test')).rejects.toThrow('SMS delivery is unavailable');
    await expect(makeService({ SMS_API_KEY: 'test-key' }).sendSms('01712345678', 'Test')).rejects.toThrow('SMS delivery is unavailable');
    expect(service.getDeliveryStatus()).toMatchObject({ email: { configured: false }, sms: { configured: false }, push: { configured: false } });
  });

  it.each([false, true])('does not hide Resend failure with raw=%s when SMTP is absent', async (raw) => {
    global.fetch = jest.fn().mockResolvedValue(new global.Response('{"message":"rejected"}', { status: 403 }));
    const service = makeService({ RESEND_API_KEY: 'test-key' });
    await expect(raw ? service.sendRawHtmlEmail('test@example.invalid', 'Test', '<p>Test</p>')
      : service.sendEmail('test@example.invalid', 'Test', 'custom')).rejects.toThrow('Email delivery is unavailable');
  });

  it('requires an acknowledgement ID from Resend', async () => {
    global.fetch = jest.fn().mockResolvedValue(new global.Response('{}', { status: 200 }));
    await expect(makeService({ RESEND_API_KEY: 'test-key' }).sendEmail('test@example.invalid', 'Test', 'custom')).rejects.toThrow('unavailable');
  });

  it('accepts a valid Resend acknowledgement and sends raw-email attachments', async () => {
    global.fetch = jest.fn().mockResolvedValue(new global.Response('{"id":"email-1"}', { status: 200 }));
    const result = await makeService({ RESEND_API_KEY: 'test-key' }).sendRawHtmlEmail('test@example.invalid', 'Test', '<p>Test</p>', {
      filename: 'invoice.pdf', content: Buffer.from('pdf'), contentType: 'application/pdf',
    });
    expect(result).toEqual({ sent: true, provider: 'resend', id: 'email-1' });
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.attachments[0].content).toBe(Buffer.from('pdf').toString('base64'));
  });

  it.each([{ accepted: [] }, { accepted: ['test@example.invalid'] }])('rejects SMTP nonacceptance or partial rejection: %j', async ({ accepted }) => {
    mockSendMail.mockResolvedValue({ messageId: 'mail-1', accepted, rejected: ['other@example.invalid'] });
    await expect(makeService(smtp).sendEmail('test@example.invalid', 'Test', 'custom')).rejects.toThrow('SMTP did not accept all recipients');
  });

  it('falls back from rejected Resend to an SMTP acknowledgement', async () => {
    global.fetch = jest.fn().mockResolvedValue(new global.Response('{}', { status: 500 }));
    mockSendMail.mockResolvedValue({ messageId: 'mail-1', accepted: ['test@example.invalid'], rejected: [] });
    await expect(makeService({ ...smtp, RESEND_API_KEY: 'test-key' }).sendEmail('test@example.invalid', 'Test', 'custom'))
      .resolves.toEqual({ sent: true, provider: 'smtp', id: 'mail-1' });
  });

  it.each([202, '202'])('accepts SMS success code %j', async (code) => {
    global.fetch = jest.fn().mockResolvedValue(new global.Response(JSON.stringify({ code }), { status: 200 }));
    await expect(makeService({ SMS_API_KEY: 'test-key', SMS_SENDER_ID: 'approved-sender' }).sendSms('01712345678', 'Test'))
      .resolves.toMatchObject({ sent: true, provider: 'bulksmsbd' });
  });

  it.each([['{"code":1002}', 200], ['not json', 200], ['{"code":202}', 503]])('rejects unsuccessful SMS responses', async (body, status) => {
    global.fetch = jest.fn().mockResolvedValue(new global.Response(body as string, { status: status as number }));
    await expect(makeService({ SMS_API_KEY: 'test-key', SMS_SENDER_ID: 'approved-sender' }).sendSms('01712345678', 'Test')).rejects.toThrow('SMS provider did not accept');
  });

  it('does not report push delivery without tokens or Firebase configuration', async () => {
    const service = makeService();
    db.deviceToken.findMany.mockResolvedValue([]);
    await expect(service.sendPushNotification('user', 'Test', 'Test')).resolves.toMatchObject({ sent: false });
    db.deviceToken.findMany.mockResolvedValue([{ token: 'device' }]);
    await expect(service.sendPushNotification('user', 'Test', 'Test')).resolves.toMatchObject({ sent: false });
  });

  it('propagates email non-delivery through the inline queue path', async () => {
    const queue = new EmailQueueService({ getBoolean: () => false } as any, makeService());
    await expect(queue.addEmail('test@example.invalid', 'Test', 'custom', {})).rejects.toThrow('Email delivery is unavailable');
  });

  it('labels a synchronous provider acknowledgement as accepted', async () => {
    const queue = new EmailQueueService({ getBoolean: () => false } as any, {
      sendEmail: jest.fn().mockResolvedValue({ sent: true, provider: 'smtp', id: 'mail-1' }),
    } as any);
    await expect(queue.addEmail('test@example.invalid', 'Test', 'custom', {})).resolves.toEqual({ status: 'accepted', provider: 'smtp', id: 'mail-1' });
  });

  it.each(['email', 'sms', 'push'])('rejects the unimplemented admin %s broadcast', async (type) => {
    const createNotification = jest.fn();
    const controller = new NotificationsController({ createNotification } as any);
    await expect(controller.send('tenant-1', { type, title: 'Test', body: 'Test' })).rejects.toThrow('external broadcasts are unavailable');
    expect(createNotification).not.toHaveBeenCalled();
  });
});
