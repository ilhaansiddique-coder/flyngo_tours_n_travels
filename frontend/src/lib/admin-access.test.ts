import { canAccessAdminPanel, canViewAdminOverview, canReadCustomerContacts, canAccessAdminRoute } from './admin-access';

const managerPermissions = ['tours', 'hotels', 'flights', 'visa', 'bookings', 'cms', 'marketing']
  .flatMap((group) => ['read', 'create', 'update', 'delete'].map((action) => `${group}.${action}`));

test.each([
  '/admin/dashboard', '/admin/customers', '/admin/bookings', '/admin/payments',
  '/admin/tours', '/admin/hotels', '/admin/flights', '/admin/visa',
  '/admin/cms/pages', '/admin/cms/blogs', '/admin/cms/media', '/admin/cms/hero',
  '/admin/cms/seo', '/admin/site/navbar', '/admin/site/footer',
  '/admin/coupons', '/admin/marketing', '/admin/tracking',
])('a seeded manager can open %s', (path) => {
  expect(canAccessAdminRoute(path, 'manager', managerPermissions)).toBe(true);
});

test.each(['/admin/users', '/admin/settings', '/admin/audit-logs', '/admin/trash', '/admin/unknown'])(
  'manager cannot mount ungranted section %s',
  (path) => expect(canAccessAdminRoute(path, 'manager', managerPermissions)).toBe(false),
);

test('route matching checks path boundaries and honours custom role permissions', () => {
  expect(canAccessAdminRoute('/admin/tours/edit/123', 'custom_staff', ['tours.read'])).toBe(true);
  expect(canAccessAdminRoute('/admin/tours-extra', 'custom_staff', ['tours.read'])).toBe(false);
  expect(canAccessAdminRoute('/admin/hotels', 'custom_staff', ['tours.read'])).toBe(false);
  expect(canAccessAdminRoute('/admin/cms/pages', 'customer', ['cms.read'])).toBe(false);
  expect(canAccessAdminRoute('/admin/users', 'custom_staff', ['admin.access', 'roles.read'])).toBe(false);
});

test('analytics permission enables the overview but does not grant account management', () => {
  expect(canViewAdminOverview('analyst', ['analytics.read'])).toBe(true);
  expect(canAccessAdminRoute('/admin/reports', 'analyst', ['analytics.read'])).toBe(true);
  expect(canAccessAdminRoute('/admin/customers', 'analyst', ['analytics.read'])).toBe(false);
  expect(canViewAdminOverview('customer', ['analytics.read'])).toBe(false);
});

test.each(['admin', 'super_admin', 'manager', 'moderator'])(
  '%s can read customer contacts',
  (role) => expect(canReadCustomerContacts(role)).toBe(true),
);

test('other staff require users.read and customers remain excluded', () => {
  expect(canReadCustomerContacts('agent', ['users.read'])).toBe(true);
  expect(canReadCustomerContacts('custom_staff', ['users.read'])).toBe(true);
  expect(canReadCustomerContacts('custom_staff', ['tours.read'])).toBe(false);
  expect(canReadCustomerContacts('customer', ['users.read'])).toBe(false);
  expect(canReadCustomerContacts(undefined, ['users.read'])).toBe(false);
});

test.each(['super_admin', 'admin', 'manager', 'agent', 'moderator', 'custom_staff'])(
  '%s can enter the staff panel',
  (role) => expect(canAccessAdminPanel(role)).toBe(true),
);

test.each(['customer', '', '   ', null, undefined])(
  '%s cannot enter the staff panel',
  (role) => expect(canAccessAdminPanel(role)).toBe(false),
);

test.each(['super_admin', 'admin'])(
  '%s can load the restricted dashboard and customer search',
  (role) => expect(canViewAdminOverview(role)).toBe(true),
);

test.each(['manager', 'agent', 'moderator', 'custom_staff', 'customer', null, undefined])(
  '%s cannot load the restricted dashboard or customer search',
  (role) => expect(canViewAdminOverview(role)).toBe(false),
);
