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

  it.each(['admin', 'super_admin'])('allows %s to read the full user list', async (roleCode) => {
    const listUsers = jest.fn().mockResolvedValue({ items: [] });
    const controller = new UsersController({ listUsers } as unknown as UsersService);
    await controller.listUsers('tenant-1', { page: 1, limit: 20 }, { roleCode });
    expect(listUsers).toHaveBeenCalledWith('tenant-1', 1, 20, undefined, false);
  });

  it.each([undefined, 'customer', 'vendor'])('blocks %s without staff read access', async (role) => {
    const listUsers = jest.fn();
    const controller = new UsersController({ listUsers } as unknown as UsersService);
    await expect(controller.listUsers('tenant-1', { page: 1, limit: 20 }, { roleCode: role }))
      .rejects.toThrow('Customer read access required');
    expect(listUsers).not.toHaveBeenCalled();
    expect(() => guard.canActivate(context('createUser', role))).toThrow();
  });

  it.each([
    { roleCode: 'manager' },
    { roleCode: 'moderator' },
    { roleCode: 'agent', permissions: ['users.read'] },
    { roleCode: 'custom_staff', permissions: ['users.read'] },
  ])('limits $roleCode to customer contacts', async (actor) => {
    const listUsers = jest.fn().mockResolvedValue({ items: [] });
    const controller = new UsersController({ listUsers } as unknown as UsersService);
    await controller.listUsers('tenant-1', { page: 2, limit: 10, q: 'name' }, actor);
    expect(listUsers).toHaveBeenCalledWith('tenant-1', 2, 10, 'name', true);
    expect(() => guard.canActivate(context('createUser', actor.roleCode))).toThrow();
  });

  it('does not admit customers even if users.read was assigned', async () => {
    const controller = new UsersController({} as UsersService);
    await expect(controller.listUsers('tenant-1', { page: 1, limit: 20 }, {
      roleCode: 'customer', permissions: ['users.read'],
    })).rejects.toThrow('Customer read access required');
  });

  it('passes the authenticated ID instead of a body-supplied creator', async () => {
    const createUser = jest.fn().mockResolvedValue({ id: 'new-customer' });
    const controller = new UsersController({ createUser } as unknown as UsersService);
    const body = { fullName: 'Customer', createdByUserId: 'forged' };
    await controller.createUser('tenant-1', body, { id: 'signed-in-admin' });
    expect(createUser).toHaveBeenCalledWith('tenant-1', body, 'signed-in-admin');
  });
});
