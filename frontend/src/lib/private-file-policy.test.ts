import { isPrivateImageSource } from './private-file-policy';

describe('private image cache policy', () => {
  it.each([
    '/api/v1/media/private/known-id',
    'https://www.flyngo.world/api/v1/media/private/known-id',
    '/api/v1/uploads/.private/known-id',
    '/api/v1/uploads/%75ser-documents/passport.png',
    '/api/v1/uploads/receipts/receipt.jpg',
    '/api/v1/uploads/visa-documents/passport.jpg',
    '/_next/image?url=%2Fapi%2Fv1%2Fmedia%2Fprivate%2Fid',
  ])('blocks optimization of %s', (source) => {
    expect(isPrivateImageSource(source)).toBe(true);
  });
  it.each(['/api/v1/uploads/tours/cover.jpg', '/logo.png', 'https://images.unsplash.com/photo.jpg'])(
    'preserves public image optimization for %s', (source) => {
      expect(isPrivateImageSource(source)).toBe(false);
    });
});
