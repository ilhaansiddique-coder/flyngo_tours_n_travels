import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('admin-only customer attribution', () => {
  const guard = new RolesGuard(new Reflector());
  const context = (handler: 'listUsers' | 'createUser', role?: string) => ({
    getHandler: () => UsersController.prototype[handler],
    getClass: () => UsersController,
    switchToHttp: () => ({ getRequest: () => ({ user: role ? { roleCode: role } : undefined }) }),
  } as unknown as ExecutionContext);

  it.each(['admin', 'super_admin'])('allows %s to read creation data', (role) => {
    expect(guard.canActivate(context('listUsers', role))).toBe(true);
  });

  it.each([undefined, 'customer', 'vendor'])('blocks %s from the customer list and staff creation route', (role) => {
    expect(() => guard.canActivate(context('listUsers', role))).toThrow();
    expect(() => guard.canActivate(context('createUser', role))).toThrow();
  });

  it('passes the authenticated ID instead of a body-supplied creator', async () => {
    const createUser = jest.fn().mockResolvedValue({ id: 'new-customer' });
    const controller = new UsersController({ createUser } as unknown as UsersService);
    const body = { fullName: 'Customer', createdByUserId: 'forged' };
    await controller.createUser('tenant-1', body, { id: 'signed-in-admin' });
    expect(createUser).toHaveBeenCalledWith('tenant-1', body, 'signed-in-admin');
  });
});
