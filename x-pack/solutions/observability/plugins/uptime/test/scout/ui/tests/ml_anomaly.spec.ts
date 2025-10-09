/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect, test } from '@kbn/scout-oblt';

const ARCHIVE = 'x-pack/solutions/observability/test/fixtures/es_archives/uptime/full_heartbeat';

test.describe('uptime ml anomaly', () => {
  test.describe.configure({ tag: 'skipFirefox' });

  const dateStart = 'Sep 10, 2019 @ 12:40:08.078';
  const dateEnd = 'Sep 11, 2019 @ 19:40:08.078';
  const monitorId = '0000-intermittent';

  test.beforeAll(async ({ esClient, pageObjects, browserAuth, kbnClient }) => {
    // TODO: Implement test setup
    // 1. Load ES archive 'x-pack/solutions/observability/test/fixtures/es_archives/uptime/full_heartbeat'
    // 2. Load data and navigate to uptime root page
    // 3. Navigate to monitor page for dateStart, dateEnd, and monitorId
    // 4. Check if ML job already exists using uptime.ml.alreadyHasJob()
    // 5. If job exists, delete it to start fresh using uptime.ml.deleteMLJob()
  });

  test.afterAll(async ({ esClient }) => {
    // TODO: Implement cleanup
    // 1. Unload ES archive 'x-pack/solutions/observability/test/fixtures/es_archives/uptime/full_heartbeat'
  });

  test('can open ml flyout', async ({ page, pageObjects }) => {
    // TODO: Implement test
    // 1. Open ML flyout using uptime.ml.openMLFlyout()
  });

  test('has permission to create job', async ({ page, pageObjects }) => {
    // TODO: Implement test
    // 1. Check if user can create ML job using uptime.ml.canCreateJob()
    // 2. Verify result equals true
    // 3. Check if license info is missing using uptime.ml.hasNoLicenseInfo()
    // 4. Verify result equals false
  });

  test('can create job successfully', async ({ page, pageObjects }) => {
    // TODO: Implement test
    // 1. Create ML job using uptime.ml.createMLJob()
  });

  test('can open ML Manage Menu', async ({ page, pageObjects }) => {
    // TODO: Implement test
    // 1. Open ML Manage Menu using uptime.ml.openMLManageMenu()
  });

  test('can delete job successfully', async ({ page, pageObjects }) => {
    // TODO: Implement test
    // 1. Delete ML job using uptime.ml.deleteMLJob()
  });
});
