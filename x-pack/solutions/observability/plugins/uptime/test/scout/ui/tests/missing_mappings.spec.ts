/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect, test } from '@kbn/scout-oblt';

test.describe('missing mappings', () => {
  test.beforeAll(async ({ esClient, pageObjects, browserAuth }) => {
    // TODO: Implement test setup
    // 1. Create a check using makeCheck helper with es client
    // 2. Navigate to uptime app
  });

  test('redirects to mappings error page', async ({ page, pageObjects }) => {
    // TODO: Implement test
    // 1. Verify uptime service shows mappings error
    // 2. Use uptimeService.common.hasMappingsError() method
  });
});
