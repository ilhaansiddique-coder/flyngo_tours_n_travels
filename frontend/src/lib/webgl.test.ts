import { supportsWebGL2 } from './webgl';

const originalDocument = Object.getOwnPropertyDescriptor(global, 'document');
afterEach(() => {
  if (originalDocument) Object.defineProperty(global, 'document', originalDocument);
  else Reflect.deleteProperty(global, 'document');
});
function canvas(getContext: jest.Mock) {
  Object.defineProperty(global, 'document', { configurable: true, value: { createElement: () => ({ getContext }) } });
}

test('server rendering does not attempt to initialize WebGL', () => {
  Reflect.deleteProperty(global, 'document');
  expect(supportsWebGL2()).toBe(false);
});
test('unsupported WebGL selects the static fallback', () => {
  canvas(jest.fn().mockReturnValue(null));
  expect(supportsWebGL2()).toBe(false);
});
test('context creation errors select the static fallback', () => {
  canvas(jest.fn().mockImplementation(() => { throw new Error('GPU unavailable'); }));
  expect(supportsWebGL2()).toBe(false);
});
test('a supported context is released after the capability check', () => {
  const loseContext = jest.fn();
  canvas(jest.fn().mockReturnValue({ getExtension: () => ({ loseContext }) }));
  expect(supportsWebGL2()).toBe(true);
  expect(loseContext).toHaveBeenCalledTimes(1);
});
