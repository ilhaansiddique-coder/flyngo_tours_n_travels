import { EmailQueueService } from './email-queue.service';

const mockAdd = jest.fn().mockResolvedValue({ id: 'job-1' });
let mockProcess: (job: any) => Promise<unknown>;
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({ add: mockAdd, close: jest.fn() })),
  Worker: jest.fn().mockImplementation((_name, process) => {
    mockProcess = process;
    return { on: jest.fn(), close: jest.fn() };
  }),
}));

describe('queued email delivery', () => {
  const sendEmail = jest.fn();
  const config = { getBoolean: () => true, get: () => '', getNumber: () => 6379 };
  const job = { data: { to: 'test@example.invalid', subject: 'Test', template: 'custom', data: {} } };

  beforeEach(() => jest.clearAllMocks());

  it('reports queued status without claiming delivery', async () => {
    const service = new EmailQueueService(config as any, { sendEmail } as any);
    await expect(service.addEmail('test@example.invalid', 'Test', 'custom', {})).resolves.toEqual({ status: 'queued', jobId: 'job-1' });
    expect(sendEmail).not.toHaveBeenCalled();
    await service.onModuleDestroy();
  });

  it('fails the worker job for retry if a provider refuses the message', async () => {
    const service = new EmailQueueService(config as any, { sendEmail } as any);
    sendEmail.mockRejectedValueOnce(new Error('SMTP unavailable'));
    await expect(mockProcess(job)).rejects.toThrow('SMTP unavailable');
    sendEmail.mockResolvedValueOnce({ sent: false });
    await expect(mockProcess(job)).rejects.toThrow('not accepted');
    await service.onModuleDestroy();
  });
});
