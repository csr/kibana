/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ScoutPage } from '@kbn/scout-oblt';
import type { DynamicSettings } from '../../../../../common/runtime_types';

/**
 * Page object for Uptime application
 * Provides methods to interact with the Uptime UI
 */
export class UptimePage {
  constructor(private readonly page: ScoutPage) {}

  /**
   * Navigate to the uptime application
   * @param search - Optional query string parameters (e.g., 'dateRangeEnd=...&dateRangeStart=...')
   */
  async goto(search?: string) {
    if (search) {
      await this.page.gotoApp('uptime', { hash: `/?${search}` });
    } else {
      await this.page.gotoApp('uptime');
    }
    await this.page.waitForLoadingIndicatorHidden();
  }

  /**
   * Navigate to a specific monitor page
   */
  async goToMonitor(monitorId: string) {
    await this.page.testSubj.click(`monitor-page-link-${monitorId}`);
  }

  /**
   * Navigate to the certificates page
   */
  async goToCertificates() {
    await this.page.gotoApp('uptime/certificates');
  }

  /**
   * Navigate to the settings page
   */
  async goToSettings() {
    await this.page.testSubj.click('settings-page-link', { timeout: 5000 });
  }

  /**
   * Check if a monitor ID exists on the page
   */
  async monitorIdExists(monitorId: string) {
    await this.page.testSubj.waitFor(monitorId, { state: 'visible', timeout: 10000 });
  }

  /**
   * Check if a monitor page link exists
   */
  async monitorPageLinkExists(monitorId: string) {
    await this.page.testSubj.waitFor(`monitor-page-link-${monitorId}`, { state: 'visible' });
  }

  /**
   * Verify that the page displays the expected monitor IDs
   * @param monitorIds - Array of monitor IDs that should be visible on the page
   */
  async pageHasExpectedIds(monitorIds: string[]): Promise<void> {
    await this.page.waitForLoadingIndicatorHidden();

    for (const monitorId of monitorIds) {
      await this.monitorPageLinkExists(monitorId);
    }
  }

  /**
   * Check if URL contains a specific value
   * @param value - The value to check for in the URL
   * @param shouldContain - Whether the URL should contain the value (default: true)
   */
  async pageUrlContains(value: string, shouldContain: boolean = true): Promise<void> {
    const url = this.page.url();
    const contains = url.includes(value);
    if (shouldContain && !contains) {
      throw new Error(`Expected URL to contain "${value}", but it doesn't. URL: ${url}`);
    }
    if (!shouldContain && contains) {
      throw new Error(`Expected URL not to contain "${value}", but it does. URL: ${url}`);
    }
  }

  /**
   * Check if the page shows data missing message
   */
  async pageHasDataMissing() {
    return await this.page.testSubj.locator('data-missing').isVisible({ timeout: 5000 });
  }

  /**
   * Check if the page has mappings error
   */
  async hasMappingsError() {
    await this.page.testSubj.waitFor('uptimeMappingsErrorCallout', { state: 'visible' });
  }

  /**
   * Wait until data is fully loaded on the page
   * Used to ensure the page is ready before interacting with elements
   */
  async waitUntilDataIsLoaded() {
    await this.page.waitForLoadingIndicatorHidden();
    // Retry logic to handle data-missing state
    const maxRetries = 30; // 60 seconds total (30 * 2s)
    for (let i = 0; i < maxRetries; i++) {
      const dataMissingExists = await this.page.testSubj
        .locator('data-missing')
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      if (!dataMissingExists) {
        return; // Data is loaded
      }

      // Refresh and wait
      await this.page.reload();
      await this.page.waitForLoadingIndicatorHidden();
    }

    throw new Error('Data failed to load after 60 seconds');
  }

  /**
   * Set filter text in the query input
   */
  async setFilterText(filterQuery: string) {
    await this.page.testSubj.click('queryInput');
    await this.page.testSubj.fill('queryInput', filterQuery);
    await this.page.keyboard.press('Enter');
  }

  /**
   * Reset all filters
   */
  async resetFilters() {
    await this.setFilterText('');
    await this.resetStatusFilter();
  }

  /**
   * Set filter query text in the query bar
   * Alias for setFilterText for compatibility with FTR tests
   */
  async inputFilterQuery(filterQuery: string) {
    await this.setFilterText(filterQuery);
  }

  /**
   * Set status filter to 'up'
   */
  async setStatusFilterUp() {
    await this.page.testSubj.click('xpack.synthetics.filterBar.filterStatusUp');
  }

  /**
   * Set status filter to 'down'
   */
  async setStatusFilterDown() {
    await this.page.testSubj.click('xpack.synthetics.filterBar.filterStatusDown');
  }

  /**
   * Set status filter by value ('up' or 'down')
   * @param status - The status filter to set ('up' or 'down')
   */
  async setStatusFilter(status: 'up' | 'down') {
    if (status === 'up') {
      await this.setStatusFilterUp();
    } else {
      await this.setStatusFilterDown();
    }
  }

  /**
   * Reset the status filter (clear any active filters)
   */
  async resetStatusFilter() {
    const upFilter = this.page.testSubj.locator('xpack.synthetics.filterBar.filterStatusUp');
    if ((await upFilter.locator('.euiFilterButton-hasActiveFilters').count()) > 0) {
      await this.setStatusFilterUp();
    }

    const downFilter = this.page.testSubj.locator('xpack.synthetics.filterBar.filterStatusDown');
    if ((await downFilter.locator('.euiFilterButton-hasActiveFilters').count()) > 0) {
      await this.setStatusFilterDown();
    }
  }

  /**
   * Select filter items for a given filter type
   */
  async selectFilterItem(filterType: string, item: string) {
    // Click filter popover button
    const filterButton = this.page.locator(
      `[aria-label="expands filter group for ${filterType} filter"]`
    );
    await filterButton.click();

    // Select item
    await this.page.locator(`li[title="${item}"]`).click();

    // Apply filter
    const applyButton = this.page.locator(
      `[aria-label="Apply the selected filters for ${filterType}"]`
    );
    await applyButton.click();
  }

  /**
   * Select multiple filter items
   */
  async selectFilterItems(filters: Record<string, string[]>) {
    for (const [filterType, items] of Object.entries(filters)) {
      for (const item of items) {
        await this.selectFilterItem(filterType, item);
      }
    }
  }

  /**
   * Get snapshot counts (up/down)
   */
  async getSnapshotCount(): Promise<{ up: string; down: string }> {
    const up = await this.page.testSubj
      .locator('xpack.synthetics.snapshot.donutChart.up')
      .innerText();
    const down = await this.page.testSubj
      .locator('xpack.synthetics.snapshot.donutChart.down')
      .innerText();
    return { up, down };
  }

  /**
   * Go to next page
   */
  async goToNextPage() {
    await this.page.testSubj.click('xpack.uptime.monitorList.nextButton', { timeout: 5000 });
  }

  /**
   * Change pagination page
   * @param direction - The direction to navigate ('next' or 'prev')
   */
  async changePage(direction: 'next' | 'prev') {
    if (direction === 'next') {
      await this.goToNextPage();
    } else {
      await this.page.testSubj.click('xpack.uptime.monitorList.prevButton', { timeout: 5000 });
    }
  }

  /**
   * Set monitor list page size
   */
  async setMonitorListPageSize(size: number) {
    await this.page.testSubj.click('tablePaginationPopoverButton');
    await this.page.testSubj.click(`tablePagination-${size}-rows`);
  }

  /**
   * SETTINGS PAGE METHODS
   */

  /**
   * Load settings field values
   */
  async loadSettings(): Promise<DynamicSettings> {
    const heartbeatIndices = await this.page.testSubj
      .locator('heartbeat-indices-input-loaded')
      .inputValue();
    const certExpirationThreshold = await this.page.testSubj
      .locator('expiration-threshold-input-loaded')
      .inputValue();
    const certAgeThreshold = await this.page.testSubj
      .locator('age-threshold-input-loaded')
      .inputValue();

    return {
      heartbeatIndices,
      certExpirationThreshold: parseInt(certExpirationThreshold, 10),
      certAgeThreshold: parseInt(certAgeThreshold, 10),
      defaultConnectors: [],
    };
  }

  /**
   * Change heartbeat indices input
   */
  async changeHeartbeatIndicesInput(text: string) {
    const input = this.page.testSubj.locator('heartbeat-indices-input-loaded');
    await input.clear();
    await input.fill(text);
  }

  /**
   * Change error threshold input
   */
  async changeErrorThresholdInput(text: string) {
    const input = this.page.testSubj.locator('expiration-threshold-input-loaded');
    await input.clear();
    await input.fill(text);
  }

  /**
   * Change warning threshold input
   */
  async changeWarningThresholdInput(text: string) {
    const input = this.page.testSubj.locator('age-threshold-input-loaded');
    await input.clear();
    await input.fill(text);
  }

  /**
   * Check if apply button is disabled
   */
  async applyButtonIsDisabled(): Promise<boolean> {
    return await this.page.testSubj.locator('apply-settings-button').isDisabled();
  }

  /**
   * Click apply button on settings page
   */
  async applySettings() {
    await this.page.testSubj.click('apply-settings-button');
    // Wait for form to be enabled again (indicates submission complete)
    await this.page.testSubj.locator('heartbeat-indices-input-loaded').waitFor({
      state: 'attached',
      timeout: 10000,
    });
  }

  /**
   * CERTIFICATES PAGE METHODS
   */

  /**
   * Check if view certificates button exists
   */
  async hasViewCertButton() {
    await this.page.locator('[href="/app/uptime/certificates"]').waitFor({
      state: 'visible',
      timeout: 15000,
    });
  }

  /**
   * Check if certificates are displayed
   */
  async hasCertificates() {
    const totalCerts = await this.page.testSubj.locator('uptimeCertTotal').innerText();
    if (parseInt(totalCerts, 10) < 1) {
      throw new Error('No certificates found');
    }
  }

  /**
   * Check if a specific certificate exists
   * Retries with refresh if certificate is not initially found
   */
  async certificateExists(certId: string, monitorId: string) {
    const maxRetries = 30; // 60 seconds total (30 * 2s)

    for (let i = 0; i < maxRetries; i++) {
      const certExists = await this.page.testSubj
        .locator(certId)
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (certExists) {
        // Certificate found, now check for monitor link
        this.page.testSubj.locator(`monitor-page-link-${monitorId}`).waitFor({
          state: 'visible',
          timeout: 5000,
        });
        return;
      }

      // Certificate not found, refresh and retry
      await this.refreshApp();
      await this.page.waitForLoadingIndicatorHidden();
    }

    throw new Error(`Certificate ${certId} not found after 60 seconds`);
  }

  /**
   * Search for certificates
   */
  async searchCertificates(searchText: string) {
    const input = this.page.testSubj.locator('uptimeCertSearch');
    await input.clear();
    await input.fill(searchText);
    await this.page.waitForLoadingIndicatorHidden();
  }

  /**
   * Check if empty certificates message is displayed
   */
  async displaysEmptyCertificatesMessage() {
    await this.page.testSubj.locator('uptimeCertsEmptyMessage').waitFor({ state: 'visible' });
    const text = await this.page.testSubj.locator('uptimeCertsEmptyMessage').innerText();
    if (text !== 'No Certificates found.') {
      throw new Error(`Expected empty message, got: ${text}`);
    }
  }

  /**
   * ML ANOMALY METHODS
   */

  /**
   * Open ML flyout
   */
  async openMLFlyout() {
    await this.page.testSubj.click('uptimeEnableAnomalyBtn');
    await this.page.testSubj.locator('uptimeMLFlyout').waitFor({ state: 'visible' });
  }

  /**
   * Check if ML job already exists
   */
  async mlJobExists(): Promise<boolean> {
    return await this.page.testSubj.locator('uptimeManageMLJobBtn').isVisible();
  }

  /**
   * Create ML job
   */
  async createMLJob() {
    await this.page.testSubj.click('uptimeMLCreateJobBtn');
    await this.page.testSubj.locator('uptimeMLJobSuccessfullyCreated').waitFor({
      state: 'visible',
      timeout: 30000,
    });
  }

  /**
   * Open ML manage menu
   */
  async openMLManageMenu() {
    // Close any open flyouts first
    if (await this.page.testSubj.locator('euiFlyoutCloseButton').isVisible()) {
      await this.page.testSubj.click('euiFlyoutCloseButton');
    }

    await this.page.testSubj.click('uptimeManageMLJobBtn');
    await this.page.testSubj.locator('uptimeManageMLContextMenu').waitFor({
      state: 'visible',
      timeout: 30000,
    });
  }

  /**
   * Delete ML job
   */
  async deleteMLJob() {
    await this.page.testSubj.click('uptimeDeleteMLJobBtn');
    await this.page.testSubj.click('uptimeMLJobDeleteConfirmModel > confirmModalConfirmButton');
    await this.page.testSubj.locator('uptimeMLJobSuccessfullyDeleted').waitFor({
      state: 'visible',
      timeout: 10000,
    });
  }

  /**
   * Check if user can create ML job
   */
  async canCreateMLJob(): Promise<boolean> {
    return !(await this.page.testSubj.locator('uptimeMLCreateJobBtn').isDisabled());
  }

  /**
   * Check if license info is missing
   */
  async hasNoLicenseInfo(): Promise<boolean> {
    return !(await this.page.testSubj.locator('uptimeMLLicenseInfo').isVisible({ timeout: 1000 }));
  }
}
