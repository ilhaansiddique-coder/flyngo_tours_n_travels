import { createServer, Server, Socket } from 'net';
import { NotificationsService } from './notifications.service';

/** Real Nodemailer transport, with a disposable localhost sink; no external mail is sent. */
describe('patched SMTP transport compatibility', () => {
  let server: Server;
  const sockets = new Set<Socket>();
  const commands: string[] = [];
  let message = '';
  let port: number;

  beforeAll(async () => {
    server = createServer((socket) => {
      sockets.add(socket);
      socket.on('close', () => sockets.delete(socket));
      socket.setEncoding('utf8');
      socket.write('220 localhost ESMTP integration sink\r\n');
      let pending = '';
      let inData = false;
      const lines: string[] = [];
      socket.on('data', (chunk) => {
        pending += chunk;
        let end: number;
        while ((end = pending.indexOf('\r\n')) >= 0) {
          const line = pending.slice(0, end);
          pending = pending.slice(end + 2);
          if (inData) {
            if (line === '.') { message = lines.join('\r\n'); inData = false; socket.write('250 Message accepted\r\n'); }
            else lines.push(line);
            continue;
          }
          commands.push(line);
          if (/^EHLO /i.test(line)) socket.write('250-localhost\r\n250-AUTH PLAIN\r\n250 SIZE 10485760\r\n');
          else if (/^AUTH PLAIN/i.test(line)) socket.write('235 Authentication successful\r\n');
          else if (/^DATA$/i.test(line)) { inData = true; socket.write('354 End with a dot\r\n'); }
          else if (/^QUIT$/i.test(line)) socket.end('221 Bye\r\n');
          else socket.write('250 OK\r\n');
        }
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = (server.address() as { port: number }).port;
  });
  afterAll(async () => {
    for (const socket of sockets) socket.destroy();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('authenticates and submits a payment email with the correct recipient and content', async () => {
    const values: Record<string, string> = { SMTP_HOST: '127.0.0.1', SMTP_PORT: String(port), SMTP_SECURE: 'false',
      SMTP_USER: 'test-mailer', SMTP_PASSWORD: 'test-password', EMAIL_FROM: 'Flyngo <noreply@example.invalid>' };
    const service = new NotificationsService({} as any, { getOrNull: (key: string) => values[key] || null } as any);
    await expect(service.sendEmail('customer@example.invalid', 'Payment received', 'payment-receipt', {
      fullName: 'Customer', amount: 100, currency: 'BDT', bookingCode: 'TEST-1',
    })).resolves.toMatchObject({ sent: true, provider: 'smtp' });
    expect(commands).toContain('MAIL FROM:<noreply@example.invalid>');
    expect(commands).toContain('RCPT TO:<customer@example.invalid>');
    expect(message).toContain('Subject: Payment received');
    expect(message).toContain('Payment of 100 BDT');
  });
});
