import {afterEach, vi} from 'vitest';
import {cleanup} from '@testing-library/react';

Object.defineProperty(window, 'matchMedia', {writable: true, value: vi.fn((query: string) => ({matches: false, media: query, onchange: null, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn()}))});
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
HTMLElement.prototype.scrollIntoView = vi.fn();
window.scrollTo = vi.fn();
HTMLDialogElement.prototype.showModal = function() {this.setAttribute('open', '');};
HTMLDialogElement.prototype.close = function() {this.removeAttribute('open');};
export class FakeViewer extends HTMLElement {
  zoom = vi.fn();
  jumpCameraToGoal = vi.fn();
  cameraOrbit = '';
  cameraTarget = '';
  fieldOfView = '';
  set src(_value: string) {queueMicrotask(() => this.dispatchEvent(new Event('load')));}
}
customElements.define('model-viewer', FakeViewer);
afterEach(() => {cleanup(); vi.unstubAllGlobals(); history.replaceState(null, '', '/');});
