/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ObltPageObjects, ScoutPage } from '@kbn/scout-oblt';
import { createLazyPageObject } from '@kbn/scout-oblt';
import { UptimePage } from './uptime_page';

export interface UptimePageObjects extends ObltPageObjects {
  uptime: UptimePage;
}

export function extendPageObjects(
  pageObjects: ObltPageObjects,
  page: ScoutPage
): UptimePageObjects {
  return {
    ...pageObjects,
    uptime: createLazyPageObject(UptimePage, page),
  };
}
