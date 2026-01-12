/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Convert items to n8n execution data format
 */
export function wrapData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
  if (!Array.isArray(data)) {
    return [{ json: data }];
  }
  return data.map((item) => ({ json: item }));
}

/**
 * Validate required fields
 */
export function validateRequired(
  params: IDataObject,
  requiredFields: string[],
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (params[field] === undefined || params[field] === null || params[field] === '') {
      missing.push(field);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Build query parameters, filtering out undefined values
 */
export function buildQueryParams(params: IDataObject): IDataObject {
  const query: IDataObject = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query[key] = value;
    }
  }

  return query;
}

/**
 * Build request body, filtering out undefined values
 */
export function buildRequestBody(params: IDataObject): IDataObject {
  const body: IDataObject = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      body[key] = value;
    }
  }

  return body;
}

/**
 * Parse database name from various formats
 */
export function parseDatabaseName(input: string): string {
  // Handle full hostname format: my-database-org.turso.io
  if (input.includes('.turso.io')) {
    return input.split('-')[0];
  }
  return input;
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Parse size limit string to bytes
 */
export function parseSizeLimit(sizeLimit: string): number {
  const match = sizeLimit.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb)?$/);

  if (!match) {
    throw new Error(`Invalid size format: ${sizeLimit}`);
  }

  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';

  const multipliers: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
    tb: 1024 * 1024 * 1024 * 1024,
  };

  return Math.floor(value * multipliers[unit]);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an array has changed (for polling)
 */
export function detectChanges(
  previous: string[],
  current: string[],
): { added: string[]; removed: string[] } {
  const previousSet = new Set(previous);
  const currentSet = new Set(current);

  const added = current.filter((item) => !previousSet.has(item));
  const removed = previous.filter((item) => !currentSet.has(item));

  return { added, removed };
}

/**
 * Format ISO timestamp for API
 */
export function formatTimestamp(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString();
}

/**
 * Sanitize database name (lowercase, alphanumeric and hyphens only)
 */
export function sanitizeDatabaseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Sanitize group name (lowercase, alphanumeric and hyphens only)
 */
export function sanitizeGroupName(name: string): string {
  return sanitizeDatabaseName(name);
}
