/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { test as base } from '@kbn/scout-oblt';
import type { ScoutPage, ObltTestFixtures, ObltWorkerFixtures } from '@kbn/scout-oblt';
import { extendPageObjects, type UptimePageObjects } from './page_objects';

export interface UptimeTestFixtures extends ObltTestFixtures {
  pageObjects: UptimePageObjects;
}

export const test = base.extend<UptimeTestFixtures, ObltWorkerFixtures>({
  pageObjects: async (
    { pageObjects, page }: { pageObjects: UptimePageObjects; page: ScoutPage },
    use: (pageObjects: UptimePageObjects) => Promise<void>
  ) => {
    const extendedPageObjects = extendPageObjects(pageObjects, page);
    await use(extendedPageObjects);
  },
});

export { expect } from '@kbn/scout-oblt';
