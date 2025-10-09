/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { KbnClient } from '@kbn/scout-oblt';

const SETTINGS_OBJECT_TYPE = 'uptime-dynamic-settings';
const SETTINGS_OBJECT_ID = 'uptime-dynamic-settings-singleton';

/**
 * Delete the uptime settings saved object
 * Used to reset settings to defaults between tests
 */
export async function deleteUptimeSettingsObject(kbnClient: KbnClient): Promise<void> {
  try {
    await kbnClient.savedObjects.delete({
      type: SETTINGS_OBJECT_TYPE,
      id: SETTINGS_OBJECT_ID,
    });
  } catch (e: any) {
    // A 404 just means the doc is already missing, which is fine
    if (e.response?.status !== 404) {
      throw new Error(`Failed to delete uptime settings object: ${e.message}`);
    }
  }
}
