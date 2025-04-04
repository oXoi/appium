import sinon from 'sinon';
import _ from 'lodash';
import {MockStore} from './mock-utils';

/**
 * @template {Record<string,any>|{mocks: Record<string,any>}} Mocks
 * @param {Mocks} mockDefs
 * @param {(sandboxStore: SandboxStore) => void} fn
 * @returns {() => void}
 */
export function withSandbox(mockDefs, fn) {
  // backwards-compat
  if (!_.isEmpty(mockDefs.mocks)) {
    mockDefs = mockDefs.mocks;
  }
  return () => {
    /** @type {SandboxStore} */
    const sbx = new SandboxStore();
    // eslint-disable-next-line mocha/no-top-level-hooks
    beforeEach(function beforeEach() {
      sbx.createSandbox(mockDefs);
    });
    // eslint-disable-next-line mocha/no-top-level-hooks
    afterEach(function afterEach() {
      sbx.reset();
    });
    fn(sbx);
  };
}

/**
 * Convenience function for calling {@linkcode SandboxStore.verify}.
 * @param {SandboxStore|MockStore} sbxOrMocks
 */
export function verifySandbox(sbxOrMocks) {
  sbxOrMocks.verify();
}

/**
 * @template {Record<string,any>} Mocks
 */
export class SandboxStore {
  /** @type {MockStore<Record<string,any>>} */
  mocks;

  /** @type {SinonSandbox|undefined} */
  sandbox;

  /**
   * Uses a sandbox if one is provided
   * @param {SinonSandbox} [sandbox]
   */
  constructor(sandbox) {
    this.sandbox = sandbox;
  }

  /**
   * @param {Mocks} mocks
   */
  createSandbox(mocks = /** @type {Mocks} */ ({})) {
    this.sandbox = this.sandbox ?? sinon.createSandbox();
    this.mocks = new MockStore(this.sandbox).createMocks(mocks);
  }

  /**
   * Calls {@linkcode SinonSandbox.verify} on the `sandbox` prop, if it exists
   */
  verify() {
    if (!this.sandbox) {
      throw new ReferenceError(
        'Cannot verify mocks before they are created; call `createMocks()` first'
      );
    }
    this.sandbox.verify();
  }

  reset() {
    this.mocks?.reset();
    delete this.sandbox;
  }
}

/**
 * @typedef {import('sinon').SinonSandbox} SinonSandbox
 */
