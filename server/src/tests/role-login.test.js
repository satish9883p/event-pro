import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveLoginIdentifier, normalizeRole, isAdminCredentials } from '../utils/authHelpers.js';

test('admin login accepts username as well as email', () => {
  assert.equal(resolveLoginIdentifier('admin'), 'admin');
  assert.equal(resolveLoginIdentifier('admin@eventpro.com'), 'admin@eventpro.com');
  assert.equal(isAdminCredentials('admin', 'admin123'), true);
});

test('role normalization keeps venue-owner and user workflows separate', () => {
  assert.equal(normalizeRole('venue_owner'), 'venue_owner');
  assert.equal(normalizeRole('VENUE_OWNER'), 'venue_owner');
  assert.equal(normalizeRole('user'), 'user');
});
