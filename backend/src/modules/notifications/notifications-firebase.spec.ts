jest.mock('firebase-admin/app', () => ({ cert: jest.fn().mockReturnValue('credential'), getApps: jest.fn().mockReturnValue([]), initializeApp: jest.fn() }));
jest.mock('firebase-admin/messaging', () => ({ getMessaging: jest.fn() }));
import { cert, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { NotificationsService } from './notifications.service';

describe('Firebase 14 modular API compatibility', () => {
  it('initializes credentials and sends through the modular messaging API', async () => {
    const values: Record<string, string> = { FIREBASE_PROJECT_ID: 'project', FIREBASE_CLIENT_EMAIL: 'service@example.invalid', FIREBASE_PRIVATE_KEY: 'line1\\nline2' };
    const db: any = { deviceToken: { findMany: jest.fn().mockResolvedValue([{ token: 'device-1' }]), deleteMany: jest.fn() } };
    const sendEachForMulticast = jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0, responses: [{ success: true }] });
    (getMessaging as jest.Mock).mockReturnValue({ sendEachForMulticast });
    const service = new NotificationsService(db, { getOrNull: (key: string) => values[key] || null } as any);
    await service.sendPushNotification('user-1', 'Booking confirmed', 'Your booking is ready', { bookingId: 123 });
    expect(cert).toHaveBeenCalledWith({ projectId: 'project', clientEmail: 'service@example.invalid', privateKey: 'line1\nline2' });
    expect(initializeApp).toHaveBeenCalledWith({ credential: 'credential' });
    expect(sendEachForMulticast).toHaveBeenCalledWith({ tokens: ['device-1'], notification: { title: 'Booking confirmed', body: 'Your booking is ready' }, data: { bookingId: '123' } });
  });
});
