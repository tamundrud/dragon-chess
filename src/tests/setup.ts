/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';

// Mock matchMedia for jsdom if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock HTMLCanvasElement getContext for basic Phaser/DOM tests in jsdom
Object.defineProperty(window, 'CanvasRenderingContext2D', {
  writable: true,
  value: function CanvasRenderingContext2D() {},
});

const mock2DContext = new Proxy({
  fillStyle: '#000000',
  fillRect: () => {},
  getImageData: () => ({ data: new Uint8ClampedArray([0, 0, 0, 0]) }),
  putImageData: () => {},
  createImageData: () => ({ data: new Uint8ClampedArray(4) }),
  setTransform: () => {},
  drawImage: () => {},
  save: () => {},
  restore: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  stroke: () => {},
  fill: () => {},
  clearRect: () => {},
  measureText: () => ({ width: 0 }),
}, {
  get(target, prop) {
    if (prop in target) return (target as any)[prop];
    return () => {};
  },
  set(target, prop, value) {
    (target as any)[prop] = value;
    return true;
  }
});

HTMLCanvasElement.prototype.getContext = function (type: string) {
  if (type !== '2d') return null;
  return mock2DContext as any;
} as any;
HTMLCanvasElement.prototype.toDataURL = () => '';
