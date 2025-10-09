/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { expect, test } from '@kbn/scout-oblt';

test.describe('spaces', () => {
  test.describe('space with no features disabled', () => {
    test.beforeAll(async ({ kbnClient }) => {
      // TODO: Implement test setup
      // 1. Create space with id 'custom_space', name 'custom_space', and disabledFeatures: []
      // 2. Use spacesService.create() method
    });

    test.afterAll(async ({ kbnClient }) => {
      // TODO: Implement cleanup
      // 1. Delete space 'custom_space'
      // 2. Use spacesService.delete() method
    });

    test('shows uptime navlink', async ({ page, pageObjects }) => {
      // TODO: Implement test
      // 1. Navigate to home app with basePath '/s/custom_space'
      // 2. Read app menu links
      // 3. Extract text from links
      // 4. Verify links contain 'Uptime'
    });

    test('can navigate to Uptime app', async ({ page, pageObjects }) => {
      // TODO: Implement test
      // 1. Navigate to uptime app
      // 2. Verify 'uptimeApp' test subject exists with 10000ms timeout
    });
  });

  test.describe('space with Uptime disabled', () => {
    test.beforeAll(async ({ kbnClient }) => {
      // TODO: Implement test setup
      // 1. Create space with id 'custom_space', name 'custom_space', and disabledFeatures: ['uptime']
      // 2. Use spacesService.create() method
    });

    test.afterAll(async ({ kbnClient }) => {
      // TODO: Implement cleanup
      // 1. Delete space 'custom_space'
      // 2. Use spacesService.delete() method
    });

    test("doesn't show uptime navlink", async ({ page, pageObjects }) => {
      // TODO: Implement test
      // 1. Navigate to home app with basePath '/s/custom_space'
      // 2. Read app menu links
      // 3. Extract text from links
      // 4. Verify links do not contain 'Uptime'
    });

    test('renders not found page', async ({ page, pageObjects }) => {
      // TODO: Implement test
      // 1. Navigate to 'uptime' with empty route
      // 2. Use basePath '/s/custom_space'
      // 3. Set ensureCurrentUrl: false
      // 4. Set shouldLoginIfPrompted: false
      // 5. Verify error page shows 'Not Found'
    });
  });
});
