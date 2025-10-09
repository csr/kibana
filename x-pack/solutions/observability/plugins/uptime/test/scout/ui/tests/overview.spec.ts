/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect, test } from '@kbn/scout-oblt';

const UPTIME_HEARTBEAT_DATA =
  'x-pack/solutions/observability/test/fixtures/es_archives/uptime/full_heartbeat';
const DEFAULT_NAVIGATION_SEARCH =
  'dateRangeEnd=2019-09-11T19:40:08.078Z&dateRangeStart=2019-09-10T12:40:08.078Z';

test.describe('overview page', () => {
  test.beforeAll(async ({ esClient }) => {
    // TODO: Implement test setup
    // 1. Load ES archive 'x-pack/solutions/observability/test/fixtures/es_archives/uptime/full_heartbeat' if needed
  });

  test.afterAll(async ({ esClient }) => {
    // TODO: Implement cleanup
    // 1. Unload ES archive 'x-pack/solutions/observability/test/fixtures/es_archives/uptime/full_heartbeat'
  });

  test.beforeEach(async ({ page, pageObjects }) => {
    // TODO: Implement test setup
    // 1. Navigate to uptime app with search params: 'dateRangeEnd=2019-09-11T19:40:08.078Z&dateRangeStart=2019-09-10T12:40:08.078Z'
    // 2. Reset filters using uptime.resetFilters()
  });

  test('loads and displays uptime data based on date range', async ({ page, pageObjects }) => {
    // TODO: Implement test
    // 1. Verify page has expected monitor IDs: ['0000-intermittent']
    // 2. Use uptime.pageHasExpectedIds() method
  });

  test('applies filters for multiple fields', async ({ page, pageObjects }) => {
    // TODO: Implement test
    // 1. Select filter items: Location: ['mpls'], Port: ['5678'], Scheme: ['http']
    // 2. Use uptime.selectFilterItems() method
    // 3. Verify page has expected monitor IDs: ['0000-intermittent', '0001-up', '0002-up', '0003-up', '0004-up', '0005-up', '0006-up', '0007-up', '0008-up', '0009-up']
  });

  test('pagination is cleared when filter criteria changes', async ({ page, pageObjects }) => {
    // TODO: Implement test
    // 1. Navigate to uptime app with pagination search params
    // 2. Search string: 'dateRangeEnd=2019-09-11T19:40:08.078Z&dateRangeStart=2019-09-10T12:40:08.078Z&pagination={"cursorDirection":"AFTER","sortOrder":"ASC","cursorKey":{"monitor_id":"0009-up"}}'
    // 3. Verify page has expected IDs: ['0010-down', '0011-up', '0012-up', '0013-up', '0014-up', '0015-intermittent', '0016-up', '0017-up', '0018-up', '0019-up']
    // 4. Verify URL contains 'pagination'
    // 5. Set status filter to 'up'
    // 6. Verify page has expected IDs: ['0000-intermittent', '0001-up', '0002-up', '0003-up', '0004-up', '0005-up', '0006-up', '0007-up', '0008-up', '0009-up']
    // 7. Verify URL does not contain 'pagination'
  });

  test('clears pagination parameters when size changes', async ({ page, pageObjects }) => {
    // TODO: Implement test
    // 1. Change page to 'next' using uptime.changePage()
    // 2. Retry until URL contains 'pagination'
    // 3. Set monitor list page size to 50
    // 4. Sleep for 1000ms
    // 5. Retry until URL does not contain 'pagination'
  });

  test('pagination size updates to reflect current selection', async ({ page, pageObjects }) => {
    // TODO: Implement test
    // 1. Verify page has expected IDs (10 monitors: '0000-intermittent' to '0009-up')
    // 2. Set monitor list page size to 50
    // 3. Verify page has expected IDs (50 monitors: '0000-intermittent' to '0049-up')
  });

  test.describe('snapshot counts', () => {
    test('should not update when status filter is set to down', async ({ page, pageObjects }) => {
      // TODO: Implement test
      // 1. Set status filter to 'down'
      // 2. Retry for 12000ms to get snapshot count
      // 3. Verify counts equal { up: '93', down: '7' }
    });

    test('should not update when status filter is set to up', async ({ page, pageObjects }) => {
      // TODO: Implement test
      // 1. Set status filter to 'up'
      // 2. Retry for 12000ms to get snapshot count
      // 3. Verify counts equal { up: '93', down: '7' }
    });

    test('can change query syntax to kql', async ({ page, pageObjects }) => {
      // TODO: Implement test
      // 1. Click test subject 'switchQueryLanguageButton'
      // 2. Click test subject 'kqlLanguageMenuItem'
    });

    test('runs filter query without issues', async ({ page, pageObjects }) => {
      // TODO: Implement test
      // 1. Input filter query: 'monitor.status:up and monitor.id:"0000-intermittent"'
      // 2. Verify page has expected IDs: ['0000-intermittent']
      // 3. Reset filters
    });
  });
});
