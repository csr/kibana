/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect } from '@kbn/scout-oblt';
import { makeCheck } from '@kbn/test-suites-xpack-observability/api_integration/apis/uptime/rest/helper/make_checks';
import { test } from '../fixtures';
import { getSha256 } from '../fixtures/helpers';
import { deleteUptimeSettingsObject } from '../fixtures/helpers/uptime_api_services';

const UPTIME_HEARTBEAT_DATA =
  'x-pack/solutions/observability/test/fixtures/es_archives/uptime/full_heartbeat';
const BLANK_INDEX_PATH = 'x-pack/solutions/observability/test/fixtures/es_archives/uptime/blank';

test.describe('certificates', { tag: ['@ess', '@svlOblt'] }, () => {
  test.describe('empty certificates', () => {
    test.beforeAll(async ({ esArchiver, kbnClient }) => {
      deleteUptimeSettingsObject(kbnClient);
      await esArchiver.loadIfNeeded(UPTIME_HEARTBEAT_DATA);
    });

    test.beforeEach(async ({ pageObjects, browserAuth }) => {
      await browserAuth.loginAsAdmin();
      await pageObjects.uptime.goto();
    });

    test('go to certs page', async ({ page, pageObjects }) => {
      await pageObjects.uptime.waitUntilDataIsLoaded();
      await pageObjects.uptime.hasViewCertButton();
      await pageObjects.uptime.goToCertificates();

      // Verify we're on the certificates page
      await expect(page.testSubj.locator('uptimeCertificatesPage')).toBeVisible();
    });

    test('displays empty message', async ({ page, pageObjects }) => {
      await pageObjects.uptime.goToCertificates();
      await pageObjects.uptime.displaysEmptyCertificatesMessage();

      // Verify empty message text
      await expect(page.testSubj.locator('uptimeCertsEmptyMessage')).toHaveText(
        'No Certificates found.'
      );
    });
  });

  test.describe('with certs', () => {
    test.beforeAll(async ({ esArchiver }) => {
      await esArchiver.loadIfNeeded(BLANK_INDEX_PATH);
    });

    test.beforeEach(async ({ esClient, pageObjects, browserAuth }) => {
      await browserAuth.loginAsAdmin();
      await pageObjects.uptime.goto();
      await makeCheck({ es: esClient, tls: true });
    });

    test('can navigate to cert page', async ({ page, pageObjects }) => {
      await pageObjects.uptime.waitUntilDataIsLoaded();
      await pageObjects.uptime.hasViewCertButton();
      await pageObjects.uptime.goToCertificates();

      // Verify we're on the certificates page
      await expect(page.testSubj.locator('uptimeCertificatesPage')).toBeVisible();
    });

    test.describe('page', () => {
      test.beforeEach(async ({ pageObjects }) => {
        await pageObjects.uptime.goToCertificates();
        // await pageObjects.uptime.refreshApp();
      });

      test('displays certificates', async ({ page, pageObjects }) => {
        await pageObjects.uptime.hasCertificates();

        // Verify certificates are actually displayed
        await expect(page.testSubj.locator('uptimeCertTotal')).not.toHaveText('0');
      });

      test('displays specific certificates', async ({ page, pageObjects, esClient }) => {
        const certId = getSha256();
        const { monitorId } = await makeCheck({
          es: esClient,
          tls: { sha256: certId },
        });

        // await pageObjects.uptime.refreshApp();
        await pageObjects.uptime.certificateExists(certId, monitorId);

        // Verify the certificate and monitor link are visible
        await expect(page.testSubj.locator(certId)).toBeVisible();
        await expect(page.testSubj.locator(`monitor-page-link-${monitorId}`)).toBeVisible();
      });

      test('performs search against monitor id', async ({ page, pageObjects, esClient }) => {
        const certId = getSha256();
        const { monitorId } = await makeCheck({
          es: esClient,
          monitorId: 'cert-test-check-id',
          fields: {
            monitor: {
              name: 'Cert Test Check',
            },
            url: {
              full: 'https://site-to-check.com/',
            },
          },
          tls: { sha256: certId },
        });

        // await pageObjects.uptime.refreshApp();
        await pageObjects.uptime.searchCertificates(monitorId);
        await pageObjects.uptime.hasCertificates();

        // Verify only 1 certificate is shown
        await expect(page.testSubj.locator('uptimeCertTotal')).toHaveText('1');
      });
    });
  });
});
