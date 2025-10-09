/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { merge } from 'lodash';
import type { Client } from '@elastic/elasticsearch';

/**
 * Generate a mock SHA-256 hash for TLS testing
 */
export const getSha256 = (): string => {
  return crypto.randomBytes(64).toString('hex').toUpperCase();
};

interface TlsProps {
  valid?: boolean;
  commonName?: string;
  expiry?: string;
  sha256?: string;
}

/**
 * Create TLS certificate data for testing
 */
export const makeTls = ({
  valid = true,
  commonName = '*.elastic.co',
  expiry,
  sha256,
}: TlsProps = {}) => {
  const expiryDate =
    expiry ?? new Date(Date.now() + (valid ? 60 : -60) * 24 * 60 * 60 * 1000).toISOString();

  return {
    version: '1.3',
    cipher: 'TLS-AES-128-GCM-SHA256',
    server: {
      x509: {
        not_before: '2020-03-01T00:00:00.000Z',
        not_after: expiryDate,
        issuer: {
          distinguished_name:
            'CN=DigiCert SHA2 High Assurance Server CA,OU=www.digicert.com,O=DigiCert Inc,C=US',
          common_name: 'DigiCert SHA2 High Assurance Server CA',
        },
        subject: {
          common_name: commonName,
          distinguished_name: `CN=${commonName},O=Test Inc.,L=Test City,ST=Test State,C=US`,
        },
        serial_number: '10043199409725537507026285099403602396',
        signature_algorithm: 'SHA256-RSA',
        public_key_algorithm: 'ECDSA',
      },
      hash: {
        sha1: 'b7b4b89ef0d0caf39d223736f0fdbb03c7b426f1',
        sha256: sha256 ?? getSha256(),
      },
    },
  };
};

interface PingFields {
  [key: string]: any;
}

/**
 * Create a single heartbeat ping document
 */
const makePing = async (
  es: Client,
  monitorId: string,
  fields: PingFields = {},
  tls: boolean | TlsProps = false,
  customIndex?: string
): Promise<any> => {
  const timestamp = fields['@timestamp'] ?? new Date().toISOString();

  const baseDoc = {
    '@timestamp': timestamp,
    monitor: {
      id: monitorId,
      type: 'http',
      status: 'up',
      check_group: uuidv4(),
      ...(fields.monitor ?? {}),
    },
    url: {
      full: 'https://example.com',
      ...(fields.url ?? {}),
    },
    ...(tls && { tls: typeof tls === 'boolean' ? makeTls() : makeTls(tls) }),
    ...fields,
  };

  const indexName = customIndex ?? 'heartbeat-8*';

  await es.index({
    index: indexName,
    document: baseDoc,
    refresh: 'wait_for',
  });

  return baseDoc;
};

interface CheckProps {
  es: Client;
  monitorId?: string;
  numIps?: number;
  fields?: PingFields;
  tls?: boolean | TlsProps;
  customIndex?: string;
}

/**
 * Create a single check with multiple IPs
 */
export const makeCheck = async ({
  es,
  monitorId = `monitor-${Math.random().toString(36).substring(7)}`,
  numIps = 1,
  fields = {},
  tls = false,
  customIndex,
}: CheckProps): Promise<{ monitorId: string; docs: any[] }> => {
  const checkGroup = uuidv4();
  const docs: any[] = [];

  for (let i = 0; i < numIps; i++) {
    const pingFields = merge({}, fields, {
      monitor: {
        check_group: checkGroup,
        ip: `127.0.0.${i}`,
      },
    });

    const doc = await makePing(es, monitorId, pingFields, tls, customIndex);
    docs.push(doc);
  }

  return { monitorId, docs };
};

/**
 * Create multiple checks over time
 */
export const makeChecks = async (
  es: Client,
  monitorId: string,
  numChecks: number = 1,
  numIps: number = 1,
  every: number = 10000, // milliseconds between checks
  fields: PingFields = {},
  customIndex?: string
): Promise<any[]> => {
  const checks: any[] = [];
  const oldestTime = Date.now() - numChecks * every;

  for (let i = 0; i < numChecks; i++) {
    const checkTime = new Date(oldestTime + i * every);
    const checkFields = merge({}, fields, {
      '@timestamp': checkTime.toISOString(),
      monitor: {
        timespan: {
          gte: checkTime.toISOString(),
          lt: new Date(checkTime.getTime() + every).toISOString(),
        },
      },
    });

    const { docs } = await makeCheck({
      es,
      monitorId,
      numIps,
      fields: checkFields,
      customIndex,
    });

    checks.push(docs);
  }

  await es.indices.refresh({ index: customIndex ?? 'heartbeat-8*' });

  return checks;
};
