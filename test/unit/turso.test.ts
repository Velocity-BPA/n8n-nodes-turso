/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Turso } from '../../nodes/Turso/Turso.node';
import { TursoTrigger } from '../../nodes/Turso/TursoTrigger.node';
import {
  wrapData,
  validateRequired,
  buildQueryParams,
  buildRequestBody,
  parseDatabaseName,
  formatBytes,
  parseSizeLimit,
  detectChanges,
  sanitizeDatabaseName,
} from '../../nodes/Turso/utils';
import {
  TURSO_API_BASE_URL,
  TURSO_LOCATIONS,
  TURSO_MEMBER_ROLES,
  TURSO_TOKEN_AUTHORIZATION,
  TURSO_TOKEN_EXPIRATION,
} from '../../nodes/Turso/constants';

describe('Turso Node', () => {
  let tursoNode: Turso;

  beforeEach(() => {
    tursoNode = new Turso();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(tursoNode.description.displayName).toBe('Turso');
    });

    it('should have correct name', () => {
      expect(tursoNode.description.name).toBe('turso');
    });

    it('should require tursoApi credentials', () => {
      expect(tursoNode.description.credentials).toEqual([
        { name: 'tursoApi', required: true },
      ]);
    });

    it('should have all required resources', () => {
      const resourceProperty = tursoNode.description.properties.find(
        (p) => p.name === 'resource',
      );
      expect(resourceProperty).toBeDefined();
      expect(resourceProperty?.type).toBe('options');

      const resourceOptions = (resourceProperty as any).options.map(
        (opt: any) => opt.value,
      );
      expect(resourceOptions).toContain('organization');
      expect(resourceOptions).toContain('group');
      expect(resourceOptions).toContain('database');
      expect(resourceOptions).toContain('databaseToken');
      expect(resourceOptions).toContain('location');
      expect(resourceOptions).toContain('apiToken');
      expect(resourceOptions).toContain('auditLog');
      expect(resourceOptions).toContain('invoice');
      expect(resourceOptions).toContain('groupToken');
      expect(resourceOptions).toContain('databaseStatistics');
      expect(resourceOptions).toContain('schemaDatabase');
      expect(resourceOptions).toContain('pointInTimeRecovery');
    });

    it('should have database operations', () => {
      const operationProperties = tursoNode.description.properties.filter(
        (p) => p.name === 'operation',
      );

      const databaseOperations = operationProperties.find(
        (p) => (p.displayOptions?.show?.resource as string[])?.includes('database'),
      );

      expect(databaseOperations).toBeDefined();
      const operations = (databaseOperations as any).options.map((opt: any) => opt.value);
      expect(operations).toContain('list');
      expect(operations).toContain('create');
      expect(operations).toContain('get');
      expect(operations).toContain('delete');
      expect(operations).toContain('listInstances');
    });
  });
});

describe('Turso Trigger Node', () => {
  let tursoTrigger: TursoTrigger;

  beforeEach(() => {
    tursoTrigger = new TursoTrigger();
  });

  describe('Trigger Description', () => {
    it('should have correct display name', () => {
      expect(tursoTrigger.description.displayName).toBe('Turso Trigger');
    });

    it('should have correct name', () => {
      expect(tursoTrigger.description.name).toBe('tursoTrigger');
    });

    it('should be a polling trigger', () => {
      expect(tursoTrigger.description.polling).toBe(true);
    });

    it('should have event options', () => {
      const eventProperty = tursoTrigger.description.properties.find(
        (p) => p.name === 'event',
      );
      expect(eventProperty).toBeDefined();
      expect(eventProperty?.type).toBe('options');
    });
  });
});

describe('Constants', () => {
  it('should have correct API base URL', () => {
    expect(TURSO_API_BASE_URL).toBe('https://api.turso.tech/v1');
  });

  it('should have location options', () => {
    expect(TURSO_LOCATIONS.length).toBeGreaterThan(0);
    expect(TURSO_LOCATIONS).toContainEqual({ name: 'Chicago (ord)', value: 'ord' });
    expect(TURSO_LOCATIONS).toContainEqual({ name: 'London (lhr)', value: 'lhr' });
  });

  it('should have member role options', () => {
    expect(TURSO_MEMBER_ROLES).toContainEqual({ name: 'Owner', value: 'owner' });
    expect(TURSO_MEMBER_ROLES).toContainEqual({ name: 'Admin', value: 'admin' });
    expect(TURSO_MEMBER_ROLES).toContainEqual({ name: 'Member', value: 'member' });
  });

  it('should have token authorization options', () => {
    expect(TURSO_TOKEN_AUTHORIZATION).toContainEqual({ name: 'Full Access', value: 'full-access' });
    expect(TURSO_TOKEN_AUTHORIZATION).toContainEqual({ name: 'Read Only', value: 'read-only' });
  });

  it('should have token expiration options', () => {
    expect(TURSO_TOKEN_EXPIRATION).toContainEqual({ name: 'Never', value: 'never' });
    expect(TURSO_TOKEN_EXPIRATION).toContainEqual({ name: '1 Day', value: '1d' });
    expect(TURSO_TOKEN_EXPIRATION).toContainEqual({ name: '1 Week', value: '1w' });
  });
});

describe('Utility Functions', () => {
  describe('wrapData', () => {
    it('should wrap single object', () => {
      const data = { id: 1, name: 'test' };
      const result = wrapData(data);
      expect(result).toEqual([{ json: data }]);
    });

    it('should wrap array of objects', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = wrapData(data);
      expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
    });
  });

  describe('validateRequired', () => {
    it('should return valid for complete params', () => {
      const params = { name: 'test', group: 'default' };
      const result = validateRequired(params, ['name', 'group']);
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should return invalid for missing params', () => {
      const params = { name: 'test' };
      const result = validateRequired(params, ['name', 'group']);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('group');
    });

    it('should detect empty string as missing', () => {
      const params = { name: '', group: 'default' };
      const result = validateRequired(params, ['name', 'group']);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('name');
    });
  });

  describe('buildQueryParams', () => {
    it('should filter out undefined values', () => {
      const params = { a: 'test', b: undefined, c: null, d: '' };
      const result = buildQueryParams(params);
      expect(result).toEqual({ a: 'test' });
    });

    it('should keep valid values', () => {
      const params = { page: 1, perPage: 50 };
      const result = buildQueryParams(params);
      expect(result).toEqual({ page: 1, perPage: 50 });
    });
  });

  describe('buildRequestBody', () => {
    it('should filter out undefined values', () => {
      const params = { name: 'test', optional: undefined };
      const result = buildRequestBody(params);
      expect(result).toEqual({ name: 'test' });
    });
  });

  describe('parseDatabaseName', () => {
    it('should extract name from hostname', () => {
      const result = parseDatabaseName('mydb-org.turso.io');
      expect(result).toBe('mydb');
    });

    it('should return original if not hostname', () => {
      const result = parseDatabaseName('mydb');
      expect(result).toBe('mydb');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('parseSizeLimit', () => {
    it('should parse size limits correctly', () => {
      expect(parseSizeLimit('1024b')).toBe(1024);
      expect(parseSizeLimit('1kb')).toBe(1024);
      expect(parseSizeLimit('1mb')).toBe(1048576);
      expect(parseSizeLimit('5gb')).toBe(5368709120);
    });

    it('should throw on invalid format', () => {
      expect(() => parseSizeLimit('invalid')).toThrow();
    });
  });

  describe('detectChanges', () => {
    it('should detect added items', () => {
      const previous = ['a', 'b'];
      const current = ['a', 'b', 'c'];
      const result = detectChanges(previous, current);
      expect(result.added).toEqual(['c']);
      expect(result.removed).toEqual([]);
    });

    it('should detect removed items', () => {
      const previous = ['a', 'b', 'c'];
      const current = ['a', 'b'];
      const result = detectChanges(previous, current);
      expect(result.added).toEqual([]);
      expect(result.removed).toEqual(['c']);
    });

    it('should detect both added and removed', () => {
      const previous = ['a', 'b'];
      const current = ['b', 'c'];
      const result = detectChanges(previous, current);
      expect(result.added).toEqual(['c']);
      expect(result.removed).toEqual(['a']);
    });
  });

  describe('sanitizeDatabaseName', () => {
    it('should convert to lowercase', () => {
      expect(sanitizeDatabaseName('MyDatabase')).toBe('mydatabase');
    });

    it('should replace invalid characters with hyphens', () => {
      expect(sanitizeDatabaseName('my_database')).toBe('my-database');
      expect(sanitizeDatabaseName('my database')).toBe('my-database');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(sanitizeDatabaseName('-mydb-')).toBe('mydb');
    });

    it('should collapse multiple hyphens', () => {
      expect(sanitizeDatabaseName('my--db')).toBe('my-db');
    });
  });
});
