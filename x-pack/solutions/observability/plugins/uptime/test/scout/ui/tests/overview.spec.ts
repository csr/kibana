/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect, test } from '../fixtures';

const UPTIME_HEARTBEAT_DATA =
  'x-pack/solutions/observability/test/fixtures/es_archives/uptime/full_heartbeat';
const DEFAULT_NAVIGATION_SEARCH =
  'dateRangeEnd=2019-09-11T19:40:08.078Z&dateRangeStart=2019-09-10T12:40:08.078Z';

test.describe('overview page', { tag: ['@ess', '@svlOblt'] }, () => {
  test.beforeAll(async ({ esArchiver }) => {
    await esArchiver.loadIfNeeded(UPTIME_HEARTBEAT_DATA);
  });

  test.beforeEach(async ({ pageObjects }) => {
    await pageObjects.uptime.goto(DEFAULT_NAVIGATION_SEARCH);
    await pageObjects.uptime.resetFilters();
  });

  test('loads and displays uptime data based on date range', async ({ pageObjects }) => {
    await pageObjects.uptime.pageHasExpectedIds(['0000-intermittent']);
  });

  test('applies filters for multiple fields', async ({ pageObjects }) => {
    await pageObjects.uptime.selectFilterItems({
      Location: ['mpls'],
      Port: ['5678'],
      Scheme: ['http'],
    });
    await pageObjects.uptime.pageHasExpectedIds([
      '0000-intermittent',
      '0001-up',
      '0002-up',
      '0003-up',
      '0004-up',
      '0005-up',
      '0006-up',
      '0007-up',
      '0008-up',
      '0009-up',
    ]);
  });

  test('pagination is cleared when filter criteria changes', async ({ pageObjects }) => {
    await pageObjects.uptime.goto(
      `${DEFAULT_NAVIGATION_SEARCH}&pagination={"cursorDirection":"AFTER","sortOrder":"ASC","cursorKey":{"monitor_id":"0009-up"}}`
    );
    await pageObjects.uptime.pageHasExpectedIds([
      '0010-down',
      '0011-up',
      '0012-up',
      '0013-up',
      '0014-up',
      '0015-intermittent',
      '0016-up',
      '0017-up',
      '0018-up',
      '0019-up',
    ]);
    // There should now be pagination data in the URL
    await pageObjects.uptime.pageUrlContains('pagination');
    await pageObjects.uptime.setStatusFilter('up');
    await pageObjects.uptime.pageHasExpectedIds([
      '0000-intermittent',
      '0001-up',
      '0002-up',
      '0003-up',
      '0004-up',
      '0005-up',
      '0006-up',
      '0007-up',
      '0008-up',
      '0009-up',
    ]);
    // Ensure that pagination is removed from the URL
    await pageObjects.uptime.pageUrlContains('pagination', false);
  });

  test('clears pagination parameters when size changes', async ({ page, pageObjects }) => {
    await pageObjects.uptime.changePage('next');
    await expect(async () => {
      await pageObjects.uptime.pageUrlContains('pagination');
    }).toPass();
    await pageObjects.uptime.setMonitorListPageSize(50);
    // The pagination parameter should be cleared after a size change
    await page.waitForTimeout(1000);
    await expect(async () => {
      await pageObjects.uptime.pageUrlContains('pagination', false);
    }).toPass();
  });

  test('pagination size updates to reflect current selection', async ({ pageObjects }) => {
    await pageObjects.uptime.pageHasExpectedIds([
      '0000-intermittent',
      '0001-up',
      '0002-up',
      '0003-up',
      '0004-up',
      '0005-up',
      '0006-up',
      '0007-up',
      '0008-up',
      '0009-up',
    ]);
    await pageObjects.uptime.setMonitorListPageSize(50);
    await pageObjects.uptime.pageHasExpectedIds([
      '0000-intermittent',
      '0001-up',
      '0002-up',
      '0003-up',
      '0004-up',
      '0005-up',
      '0006-up',
      '0007-up',
      '0008-up',
      '0009-up',
      '0010-down',
      '0011-up',
      '0012-up',
      '0013-up',
      '0014-up',
      '0015-intermittent',
      '0016-up',
      '0017-up',
      '0018-up',
      '0019-up',
      '0020-down',
      '0021-up',
      '0022-up',
      '0023-up',
      '0024-up',
      '0025-up',
      '0026-up',
      '0027-up',
      '0028-up',
      '0029-up',
      '0030-intermittent',
      '0031-up',
      '0032-up',
      '0033-up',
      '0034-up',
      '0035-up',
      '0036-up',
      '0037-up',
      '0038-up',
      '0039-up',
      '0040-down',
      '0041-up',
      '0042-up',
      '0043-up',
      '0044-up',
      '0045-intermittent',
      '0046-up',
      '0047-up',
      '0048-up',
      '0049-up',
    ]);
  });

  test.describe('snapshot counts', () => {
    test('should not update when status filter is set to down', async ({ pageObjects }) => {
      await pageObjects.uptime.setStatusFilter('down');

      await expect(async () => {
        const counts = await pageObjects.uptime.getSnapshotCount();
        expect(counts).toStrictEqual({ up: '93', down: '7' });
      }).toPass({ timeout: 12000 });
    });

    test('should not update when status filter is set to up', async ({ pageObjects }) => {
      await pageObjects.uptime.setStatusFilter('up');

      await expect(async () => {
        const counts = await pageObjects.uptime.getSnapshotCount();
        expect(counts).toStrictEqual({ up: '93', down: '7' });
      }).toPass({ timeout: 12000 });
    });

    test('can change query syntax to kql', async ({ page }) => {
      await page.testSubj.click('switchQueryLanguageButton');
      await page.testSubj.click('kqlLanguageMenuItem');
      // Verify the button text changed to indicate KQL mode
      const buttonText = await page.testSubj.locator('switchQueryLanguageButton').innerText();
      expect(buttonText).toContain('KQL');
    });

    test('runs filter query without issues', async ({ pageObjects }) => {
      await pageObjects.uptime.inputFilterQuery(
        'monitor.status:up and monitor.id:"0000-intermittent"'
      );
      await pageObjects.uptime.pageHasExpectedIds(['0000-intermittent']);
      await pageObjects.uptime.resetFilters();
    });
  });
});
