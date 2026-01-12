/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const TURSO_API_BASE_URL = 'https://api.turso.tech/v1';

export const TURSO_LOCATIONS = [
  { name: 'Amsterdam (ams)', value: 'ams' },
  { name: 'Ashburn (iad)', value: 'iad' },
  { name: 'Bogota (bog)', value: 'bog' },
  { name: 'Boston (bos)', value: 'bos' },
  { name: 'Chicago (ord)', value: 'ord' },
  { name: 'Dallas (dfw)', value: 'dfw' },
  { name: 'Denver (den)', value: 'den' },
  { name: 'Frankfurt (fra)', value: 'fra' },
  { name: 'Guadalajara (gdl)', value: 'gdl' },
  { name: 'Hong Kong (hkg)', value: 'hkg' },
  { name: 'Johannesburg (jnb)', value: 'jnb' },
  { name: 'London (lhr)', value: 'lhr' },
  { name: 'Los Angeles (lax)', value: 'lax' },
  { name: 'Madrid (mad)', value: 'mad' },
  { name: 'Miami (mia)', value: 'mia' },
  { name: 'Mumbai (bom)', value: 'bom' },
  { name: 'Paris (cdg)', value: 'cdg' },
  { name: 'Phoenix (phx)', value: 'phx' },
  { name: 'Rio de Janeiro (gig)', value: 'gig' },
  { name: 'San Jose (sjc)', value: 'sjc' },
  { name: 'Santiago (scl)', value: 'scl' },
  { name: 'Sao Paulo (gru)', value: 'gru' },
  { name: 'Seattle (sea)', value: 'sea' },
  { name: 'Singapore (sin)', value: 'sin' },
  { name: 'Stockholm (arn)', value: 'arn' },
  { name: 'Sydney (syd)', value: 'syd' },
  { name: 'Tokyo (nrt)', value: 'nrt' },
  { name: 'Toronto (yyz)', value: 'yyz' },
  { name: 'Warsaw (waw)', value: 'waw' },
];

export const TURSO_MEMBER_ROLES = [
  { name: 'Owner', value: 'owner' },
  { name: 'Admin', value: 'admin' },
  { name: 'Member', value: 'member' },
];

export const TURSO_TOKEN_AUTHORIZATION = [
  { name: 'Full Access', value: 'full-access' },
  { name: 'Read Only', value: 'read-only' },
];

export const TURSO_TOKEN_EXPIRATION = [
  { name: 'Never', value: 'never' },
  { name: '1 Day', value: '1d' },
  { name: '1 Week', value: '1w' },
  { name: '2 Weeks', value: '2w' },
  { name: '1 Month', value: '1m' },
  { name: '3 Months', value: '3m' },
  { name: '6 Months', value: '6m' },
  { name: '1 Year', value: '1y' },
];

export const TURSO_EXTENSIONS = [
  { name: 'Vector (libsql_vector)', value: 'vector' },
  { name: 'Full-Text Search (fts5)', value: 'fts5' },
  { name: 'UUID', value: 'uuid' },
  { name: 'Crypto', value: 'crypto' },
  { name: 'Fuzzy', value: 'fuzzy' },
  { name: 'Math', value: 'math' },
  { name: 'Stats', value: 'stats' },
  { name: 'Regexp', value: 'regexp' },
  { name: 'Unicode', value: 'unicode' },
];

export const POLLING_EVENTS = [
  { name: 'Database Created', value: 'database.created' },
  { name: 'Database Deleted', value: 'database.deleted' },
  { name: 'Group Created', value: 'group.created' },
  { name: 'Group Deleted', value: 'group.deleted' },
  { name: 'Member Added', value: 'member.added' },
  { name: 'Member Removed', value: 'member.removed' },
];
