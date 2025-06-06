/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { createTestConfig } from '../../config.base';

export default createTestConfig({
  serverlessProject: 'oblt',
  junit: {
    reportName: 'Serverless Observability Logs Essentials Functional Tests',
  },
  suiteTags: { exclude: ['skipSvlObltLogsEssentials'] },
  // add feature flags
  kbnServerArgs: ['--pricing.tiers.enabled=true', '--pricing.tiers.products.tier=essentials'],
  // load tests in the index file
  testFiles: [require.resolve('./logs_essentials')],

  // include settings from project controller
  // https://github.com/elastic/project-controller/blob/main/internal/project/observability/config/elasticsearch.yml
  esServerArgs: ['xpack.ml.dfa.enabled=false', 'xpack.security.authc.native_roles.enabled=true'],
});
