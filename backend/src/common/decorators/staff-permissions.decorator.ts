import { SetMetadata } from '@nestjs/common';

export const STAFF_PERMISSIONS_KEY = 'staff-permissions';

/** Explicit permission alternatives to @Roles for an operational endpoint.
 * Any listed permission admits a staff role. Customer accounts never qualify.
 * Endpoints without this decorator keep their existing role restrictions.
 */
export const StaffPermissions = (...permissions: string[]) =>
  SetMetadata(STAFF_PERMISSIONS_KEY, permissions);
