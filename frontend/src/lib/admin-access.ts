// Panel admission is separate from permission to read or change admin data.
// The API checks each operation; custom staff roles must also reach the shell.
export function canAccessAdminPanel(role: string | null | undefined): boolean {
  return typeof role === 'string' && role.trim().length > 0 && role !== 'customer';
}

export function canViewAdminOverview(role: string | null | undefined, permissions: string[] = []): boolean {
  return role === 'admin' || role === 'super_admin' ||
    (canAccessAdminPanel(role) && permissions.includes('analytics.read'));
}

// These scopes mirror the operational endpoints' StaffPermissions decorators.
// Unmapped sections retain their existing admin-only policy.
const routePermissions: Record<string, string> = {
  '/admin/tours': 'tours.read',
  '/admin/hotels': 'hotels.read',
  '/admin/flights': 'flights.read',
  '/admin/visa': 'visa.read',
  '/admin/bookings': 'bookings.read',
  '/admin/payments': 'payments.read',
  '/admin/coupons': 'marketing.read',
  '/admin/marketing': 'marketing.read',
  '/admin/tracking': 'marketing.read',
  '/admin/reports': 'analytics.read',
  '/admin/settings': 'settings.read',
  '/admin/cms': 'cms.read',
  '/admin/site': 'cms.read',
};

export function canAccessAdminRoute(pathname: string, role: string | null | undefined, permissions: string[] = []): boolean {
  if (!canAccessAdminPanel(role)) return false;
  if (role === 'admin' || role === 'super_admin') return true;
  if (pathname === '/admin' || pathname === '/admin/dashboard') return true;
  if (pathname === '/admin/customers') return canReadCustomerContacts(role, permissions);
  // These roles already have access to booking and payment operations in the API.
  if (['manager', 'moderator'].includes(role!) &&
      ['/admin/bookings', '/admin/payments'].some((path) => pathname === path || pathname.startsWith(path + '/'))) return true;
  const path = Object.keys(routePermissions).find((path) => pathname === path || pathname.startsWith(path + '/'));
  return !!path && permissions.includes(routePermissions[path]);
}

export function canReadCustomerContacts(role: string | null | undefined, permissions: string[] = []): boolean {
  return canAccessAdminPanel(role) && (
    canViewAdminOverview(role) || role === 'manager' || role === 'moderator' || permissions.includes('users.read')
  );
}
