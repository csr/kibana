/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { makeChecks } from '@kbn/test-suites-xpack-observability/api_integration/apis/uptime/rest/helper/make_checks';
import { expect, test } from '../fixtures';
import { DYNAMIC_SETTINGS_DEFAULTS } from '../../../../common/constants';
import { deleteUptimeSettingsObject } from '../fixtures/helpers/uptime_api_services';

const BLANK_ARCHIVE = 'x-pack/solutions/observability/test/fixtures/es_archives/uptime/blank';

test.describe('uptime settings page', { tag: ['@ess', '@svlOblt'] }, () => {
  test.beforeAll(async ({ esArchiver, kbnClient }) => {
    await esArchiver.loadIfNeeded(BLANK_ARCHIVE);
    await deleteUptimeSettingsObject(kbnClient);
  });

  test.beforeEach(async ({ pageObjects, esClient, browserAuth }) => {
    await browserAuth.loginAsAdmin();
    await makeChecks(esClient, 'myMonitor', 1, 1, 1);
    await pageObjects.uptime.goToRoot(true);
  });

  test('loads the default settings', async ({ pageObjects }) => {
    await pageObjects.uptime.goToSettings();
    const settings = await pageObjects.uptime.loadSettings();

    expect(settings.heartbeatIndices).toBe(DYNAMIC_SETTINGS_DEFAULTS.heartbeatIndices);
    expect(settings.certAgeThreshold).toBe(DYNAMIC_SETTINGS_DEFAULTS.certAgeThreshold);
    expect(settings.certExpirationThreshold).toBe(
      DYNAMIC_SETTINGS_DEFAULTS.certExpirationThreshold
    );
    expect(settings.defaultConnectors).toStrictEqual(DYNAMIC_SETTINGS_DEFAULTS.defaultConnectors);
  });

  test('should disable the apply button when invalid or unchanged', async ({ pageObjects }) => {
    await pageObjects.uptime.goToSettings();

    // Disabled because it's the original value
    expect(await pageObjects.uptime.applyButtonIsDisabled()).toBe(true);

    // Enabled because it's a new, different, value
    await pageObjects.uptime.changeHeartbeatIndicesInput('somethingNew');
    expect(await pageObjects.uptime.applyButtonIsDisabled()).toBe(false);

    // Disabled because it's blank
    await pageObjects.uptime.changeHeartbeatIndicesInput('');
    expect(await pageObjects.uptime.applyButtonIsDisabled()).toBe(true);
  });

  test('changing index pattern setting is reflected elsewhere in UI', async ({ pageObjects }) => {
    const originalCount = await pageObjects.uptime.getSnapshotCount();
    // We should find 1 monitor up with the default index pattern
    // expect(originalCount.up).toBe('1');

    await pageObjects.uptime.goToSettings();

    const newHeartbeatIndices = 'new*';
    await pageObjects.uptime.changeHeartbeatIndicesInput(newHeartbeatIndices);
    await pageObjects.uptime.applySettings();

    await pageObjects.uptime.goToRoot(true);

    // We should no longer find any monitors since the new pattern matches nothing
    expect(await pageObjects.uptime.pageHasDataMissing()).toBe(true);

    // Verify that the settings page shows the value we previously saved
    await pageObjects.uptime.goToSettings();
    const settings = await pageObjects.uptime.loadSettings();
    expect(settings.heartbeatIndices).toBe(newHeartbeatIndices);
  });

  test('changing certificate expiration error threshold is reflected in settings page', async ({
    pageObjects,
  }) => {
    await pageObjects.uptime.goToSettings();

    const newExpirationThreshold = '5';
    await pageObjects.uptime.changeErrorThresholdInput(newExpirationThreshold);
    await pageObjects.uptime.applySettings();

    await pageObjects.uptime.goToRoot();

    // Verify that the settings page shows the value we previously saved
    await pageObjects.uptime.goToSettings();
    const settings = await pageObjects.uptime.loadSettings();
    expect(settings.certExpirationThreshold).toBe(parseInt(newExpirationThreshold, 10));
  });

  test('changing certificate expiration threshold is reflected in settings page', async ({
    pageObjects,
  }) => {
    await pageObjects.uptime.goToSettings();

    const newAgeThreshold = '15';
    await pageObjects.uptime.changeWarningThresholdInput(newAgeThreshold);
    await pageObjects.uptime.applySettings();

    await pageObjects.uptime.goToRoot();

    // Verify that the settings page shows the value we previously saved
    await pageObjects.uptime.goToSettings();
    const settings = await pageObjects.uptime.loadSettings();
    expect(settings.certAgeThreshold).toBe(parseInt(newAgeThreshold, 10));
  });
});
