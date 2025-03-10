/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { of } from 'rxjs';
import { v4 } from 'uuid';

import type { Logger, SavedObject } from '@kbn/core/server';
import { elasticsearchServiceMock, savedObjectsClientMock } from '@kbn/core/server/mocks';
import { mlPluginServerMock } from '@kbn/ml-plugin/server/mocks';

import type { IRuleDataClient } from '@kbn/rule-registry-plugin/server';
import { ruleRegistryMocks } from '@kbn/rule-registry-plugin/server/mocks';
import { eventLogServiceMock } from '@kbn/event-log-plugin/server/mocks';
import type { PluginSetupContract as ActionsPluginSetupContract } from '@kbn/actions-plugin/server';
import type { AlertingServerSetup } from '@kbn/alerting-plugin/server';
import type { ConfigType } from '../../../../config';
import type { AlertAttributes } from '../types';
import { createRuleMock } from './rule';
import { listMock } from '@kbn/lists-plugin/server/mocks';
import type { QueryRuleParams, RuleParams } from '../../rule_schema';
// this is only used in tests
import { createDefaultAlertExecutorOptions } from '@kbn/rule-registry-plugin/server/utils/rule_executor.test_helpers';
import { getCompleteRuleMock } from '../../rule_schema/mocks';
import { DEFAULT_MAX_ALERTS } from '@kbn/alerting-plugin/server/config';

export const createRuleTypeMocks = (
  ruleType: string = 'query',
  ruleParams: Partial<RuleParams> = {}
) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let alertExecutor: (...args: any[]) => Promise<any>;

  const mockedConfig$ = of({} as ConfigType);

  const loggerMock = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  const alerting = {
    registerType: ({ executor }) => {
      alertExecutor = executor;
    },
    getConfig: () => ({ run: { alerts: { max: DEFAULT_MAX_ALERTS } } }),
  } as AlertingServerSetup;

  const actions = {
    registerType: jest.fn(),

    registerSubActionConnectorType: jest.fn(),

    isPreconfiguredConnector: (connectorId: string) => false,

    getSubActionConnectorClass: jest.fn(),
    getCaseConnectorClass: jest.fn(),
    getActionsHealth: jest.fn(),
    getActionsConfigurationUtilities: jest.fn(),
    setEnabledConnectorTypes: jest.fn(),
    isActionTypeEnabled: () => true,
  } as ActionsPluginSetupContract;

  const scheduleActions = jest.fn();

  const mockSavedObjectsClient = savedObjectsClientMock.create();
  mockSavedObjectsClient.get.mockResolvedValue({
    id: 'de2f6a49-28a3-4794-bad7-0e9482e075f8',
    type: ruleType,
    references: [],
    attributes: {
      actions: [],
      alertTypeId: 'siem.signals',
      enabled: true,
      name: 'mock rule',
      tags: [],
      createdBy: 'user1',
      createdAt: '',
      updatedBy: 'user2',
      schedule: {
        interval: '30m',
      },
      throttle: '',
      params: createRuleMock(ruleParams),
    },
  } as SavedObject<AlertAttributes>);

  const services = {
    uiSettingsClient: { get: jest.fn().mockResolvedValue([]) },
    savedObjectsClient: mockSavedObjectsClient,
    scopedClusterClient: elasticsearchServiceMock.createScopedClusterClient(),
    alertFactory: {
      create: jest.fn(() => ({ scheduleActions })),
      alertLimit: {
        getValue: jest.fn(() => 1000),
        setLimitReached: jest.fn(() => {}),
      },
      done: jest.fn().mockResolvedValue({}),
    },
    findAlerts: jest.fn(), // TODO: does this stay?
    alertWithPersistence: jest.fn(),
    logger: loggerMock,
    shouldWriteAlerts: () => true,
    getMaintenanceWindowIds: jest.fn().mockResolvedValue([]),
    getDataViews: jest.fn().mockResolvedValue({
      createDataViewLazy: jest.fn().mockResolvedValue({
        getFields: jest.fn().mockResolvedValue({
          getFieldMapSorted: jest.fn().mockReturnValue({}),
        }),
        getSourceFiltering: jest.fn().mockReturnValue({ excludes: [] }),
      }),
    }),
  };

  return {
    dependencies: {
      actions,
      alerting,
      config$: mockedConfig$,
      lists: listMock.createSetup(),
      logger: loggerMock,
      ml: mlPluginServerMock.createSetupContract(),
      ruleDataClient: {
        ...(ruleRegistryMocks.createRuleDataClient('.alerts-security.alerts') as IRuleDataClient),
        getReader: jest.fn((_options?: { namespace?: string }) => ({
          search: jest.fn().mockResolvedValue({
            aggregations: undefined,
          }),
          getDynamicIndexPattern: jest.fn(),
        })),
      },
      eventLogService: eventLogServiceMock.create(),
    },
    services,
    scheduleActions,
    executor: async ({ params }: { params: Record<string, unknown> }) => {
      return alertExecutor({
        ...createDefaultAlertExecutorOptions({
          params,
          alertId: v4(),
          state: {},
          logger: loggerMock,
        }),
        runOpts: {
          completeRule: getCompleteRuleMock(params as QueryRuleParams),
        },
        services,
      });
    },
  };
};
