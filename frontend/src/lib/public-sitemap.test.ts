import sitemap, { fetchSlugs, PUBLIC_ROUTES } from './public-sitemap';
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });
test('static SEO entries use existing public routes and omit the obsolete visa listing', () => {
  expect(PUBLIC_ROUTES).toContain('/visa');
  expect(PUBLIC_ROUTES).not.toContain('/visa-countries');
  expect(PUBLIC_ROUTES.some((path) => /^\/(admin|auth|newsletter|dashboard)/.test(path))).toBe(false);
});
test('paginates wrapped collections, ignores inactive and unsafe slugs, and deduplicates', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { items: [{ slug: 'tour-one' }, { slug: 'hidden', isActive: false }, { slug: '../unsafe' }], meta: { totalPages: 2 } } })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ slug: 'tour-two' }, { slug: 'tour-one' }], meta: { totalPages: 2 } })));
  await expect(fetchSlugs('tours')).resolves.toEqual(['tour-one', 'tour-two']);
  expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('limit=100&page=1');
  expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain('page=2');
});
test('backend failures retain static routes without fabricating detail pages or modification dates', async () => {
  global.fetch = jest.fn().mockResolvedValue(new Response('Unavailable', { status: 503 }));
  const result = await sitemap();
  expect(result).toHaveLength(PUBLIC_ROUTES.length);
  expect(result.every((entry) => !entry.lastModified)).toBe(true);
});
