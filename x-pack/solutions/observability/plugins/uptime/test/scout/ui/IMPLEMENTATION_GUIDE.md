# Uptime Scout Tests - Implementation Guide

This guide explains how to complete the Scout test implementation for the Uptime plugin.

## Overview

The FTR tests have been migrated to Scout skeleton files. To complete the implementation, you need to fill in the test bodies using the provided page objects and helpers.

## Created Files

### Page Objects

- **`fixtures/page_objects/uptime_page.ts`** - Main uptime page object with methods for:
  - Navigation (`goto()`, `goToRoot()`, `goToMonitor()`, `goToCertificates()`, `goToSettings()`)
  - Filters (`setFilterText()`, `selectFilterItems()`, `setStatusFilterUp()`, `resetFilters()`)
  - Settings page (`loadSettings()`, `changeHeartbeatIndicesInput()`, `applySettings()`)
  - Certificates (`hasCertificates()`, `certificateExists()`, `searchCertificates()`)
  - ML Anomaly (`openMLFlyout()`, `createMLJob()`, `deleteMLJob()`)
  - Common utilities (`monitorIdExists()`, `getSnapshotCount()`, `urlContains()`)

### Test Helpers

- **`fixtures/helpers/uptime_test_helpers.ts`** - Data generation utilities:
  - `makeCheck()` - Create a single heartbeat check
  - `makeChecks()` - Create multiple checks over time
  - `getSha256()` - Generate mock SHA-256 hash for TLS
  - `makeTls()` - Create TLS certificate data

### Fixtures

- **`fixtures/index.ts`** - Extends Scout with uptime page objects
- **`fixtures/page_objects/index.ts`** - Registers uptime page object

## Implementation Pattern

### 1. Import from Fixtures

Replace `@kbn/scout-oblt` imports with local fixtures:

```typescript
// OLD
import { test, expect } from '@kbn/scout-oblt';

// NEW
import { test, expect } from '../fixtures';
import { makeCheck, makeChecks, getSha256 } from '../fixtures/helpers';
```

### 2. Use Page Objects

Access uptime methods via `pageObjects.uptime`:

```typescript
test('example test', async ({ pageObjects }) => {
  // Navigate
  await pageObjects.uptime.goto();
  await pageObjects.uptime.goToSettings();

  // Interact
  await pageObjects.uptime.changeHeartbeatIndicesInput('new-index*');
  await pageObjects.uptime.applySettings();

  // Verify
  const settings = await pageObjects.uptime.loadSettings();
  expect(settings.heartbeatIndices).toBe('new-index*');
});
```

### 3. Use ES Archiver (if needed)

For tests that need to load ES archives:

```typescript
test.beforeAll(async ({ esArchiver }) => {
  await esArchiver.load('x-pack/solutions/observability/test/fixtures/es_archives/uptime/full_heartbeat');
});

test.afterAll(async ({ esArchiver }) => {
  await esArchiver.unload('x-pack/solutions/observability/test/fixtures/es_archives/uptime/full_heartbeat');
});
```

### 4. Use Test Helpers

Generate test data:

```typescript
test.beforeEach(async ({ esClient }) => {
  // Create 10 checks for a monitor
  await makeChecks(esClient, 'myMonitor', 10, 1, 10000);
});
```

## Test-by-Test Guide

### `settings.spec.ts`

**Key methods needed:**
- `pageObjects.uptime.goToRoot()`
- `pageObjects.uptime.goToSettings()`
- `pageObjects.uptime.loadSettings()`
- `pageObjects.uptime.changeHeartbeatIndicesInput()`
- `pageObjects.uptime.changeErrorThresholdInput()`
- `pageObjects.uptime.changeWarningThresholdInput()`
- `pageObjects.uptime.applyButtonIsDisabled()`
- `pageObjects.uptime.applySettings()`
- `pageObjects.uptime.getSnapshotCount()`
- `pageObjects.uptime.pageHasDataMissing()`
- `makeChecks()` helper

**Data needed:**
- Import `DYNAMIC_SETTINGS_DEFAULTS` from `'@kbn/uptime-plugin/common/constants'`
- Create checks in beforeEach

### `ml_anomaly.spec.ts`

**Key methods needed:**
- `pageObjects.uptime.openMLFlyout()`
- `pageObjects.uptime.canCreateMLJob()`
- `pageObjects.uptime.hasNoLicenseInfo()`
- `pageObjects.uptime.createMLJob()`
- `pageObjects.uptime.openMLManageMenu()`
- `pageObjects.uptime.deleteMLJob()`
- `pageObjects.uptime.mlJobExists()`

**Setup:**
- Load ES archive in beforeAll
- Navigate to monitor page with date range
- Check/delete existing job

### `overview.spec.ts`

**Key methods needed:**
- `pageObjects.common.navigateToApp()` - navigate with search params
- `pageObjects.uptime.resetFilters()`
- `pageObjects.uptime.selectFilterItems()`
- `pageObjects.uptime.setStatusFilterUp()`
- `pageObjects.uptime.urlContains()`
- `pageObjects.uptime.goToNextPage()`
- `pageObjects.uptime.setMonitorListPageSize()`
- `pageObjects.uptime.getSnapshotCount()`
- `pageObjects.uptime.setFilterText()`
- `pageObjects.uptime.monitorPageLinkExists()` - verify monitor IDs

**Note:** This test needs to verify multiple monitor IDs exist on the page. You may need a retry loop.

### `certificates.spec.ts`

**Key methods needed:**
- `pageObjects.uptime.goToRoot()`
- `pageObjects.uptime.hasViewCertButton()`
- `pageObjects.uptime.goToCertificates()`
- `pageObjects.uptime.displaysEmptyCertificatesMessage()`
- `pageObjects.uptime.hasCertificates()`
- `pageObjects.uptime.certificateExists()`
- `pageObjects.uptime.searchCertificates()`
- `pageObjects.uptime.refreshApp()`
- `makeCheck()` with `tls` option
- `getSha256()` helper

**Setup:**
- Two describe blocks: one with empty certs, one with certs
- Use different ES archives for each

### `uptime_spaces.spec.ts`

**Key methods needed:**
- `kbnClient` - for spaces API (may need spacesService fixture)
- `pageObjects.common.navigateToApp()` with basePath
- Check app menu for 'Uptime' link
- Navigate to uptime and check for test subject

**Note:** This test requires space management. You may need to use the Scout spaces fixture or kbnClient API.

### `uptime_security.spec.ts`

**Key methods needed:**
- `kbnClient.savedObjects` - clean saved objects
- `browserAuth.loginAsCustomUser()` or security service
- Role/user creation via security APIs
- `pageObjects.common.navigateToApp()`
- Check for app in menu
- Check for read-only badge

**Note:** Security tests require creating roles/users. Scout may have a security fixture for this.

### `missing_mappings.spec.ts` ✅ (COMPLETED)

This file is fully implemented as a reference example.

## Common Patterns

### Waiting for Elements

```typescript
// Wait for monitor to exist
await pageObjects.uptime.monitorIdExists('monitor-123');

// Wait for page load
await page.waitForLoadingIndicatorHidden();
```

### Retrying Assertions

```typescript
// Use Playwright's built-in retry
await expect(async () => {
  const count = await pageObjects.uptime.getSnapshotCount();
  expect(count.up).toBe('93');
}).toPass({ timeout: 12000 });
```

### Navigation with Params

```typescript
await pageObjects.common.navigateToApp('uptime', {
  search: 'dateRangeEnd=2019-09-11T19:40:08.078Z&dateRangeStart=2019-09-10T12:40:08.078Z'
});
```

## Next Steps

1. **Review the completed `missing_mappings.spec.ts`** to understand the pattern
2. **Start with simpler tests** like `settings.spec.ts`
3. **Use the uptime page object methods** - they mirror the FTR service methods
4. **Add missing page object methods** if you find gaps
5. **Test incrementally** - run tests as you complete them

## Tips

- The page object methods are named to match FTR service methods where possible
- Use `page.waitForLoadingIndicatorHidden()` after navigation/actions
- Import ONLY what you need from '@kbn/scout' - prefer local fixtures
- ES archives are located at `'x-pack/solutions/observability/test/fixtures/es_archives/uptime/*'`
- For date ranges, you may need to use `pageObjects.datePicker.setAbsoluteRange()`

## Troubleshooting

### "Method not found on page object"

Add the method to `fixtures/page_objects/uptime_page.ts` based on the FTR service implementation.

### "Cannot access pageObjects.uptime"

Ensure you're importing `test` from `'../fixtures'` not `'@kbn/scout-oblt'`.

### "ES Archive not loading"

Check the archive path and ensure esArchiver fixture is available in beforeAll/beforeEach.

## Reference

- **FTR Services:** `x-pack/solutions/observability/test/functional/services/uptime/`
- **FTR Page Object:** `x-pack/solutions/observability/test/functional/page_objects/uptime_page.ts`
- **Scout Docs:** `src/platform/packages/private/kbn-scout-info/llms/`
