/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject } from 'n8n-workflow';

// Organization Types
export interface ITursoOrganization {
  name: string;
  slug: string;
  type: string;
  overages: boolean;
  blocked_reads: boolean;
  blocked_writes: boolean;
}

export interface ITursoMember {
  username: string;
  role: 'owner' | 'admin' | 'member';
  email?: string;
}

export interface ITursoInvite {
  email: string;
  role: string;
  accepted: boolean;
  created_at: string;
}

// Group Types
export interface ITursoGroup {
  name: string;
  uuid: string;
  locations: string[];
  primary: string;
  archived: boolean;
  version?: string;
}

// Database Types
export interface ITursoDatabase {
  Name: string;
  DbId: string;
  Hostname: string;
  block_reads: boolean;
  block_writes: boolean;
  allow_attach: boolean;
  regions: string[];
  primaryRegion: string;
  type: string;
  version: string;
  group: string;
  is_schema?: boolean;
  schema?: string;
  sleeping?: boolean;
}

export interface ITursoDatabaseInstance {
  uuid: string;
  name: string;
  type: string;
  region: string;
  hostname: string;
}

export interface ITursoDatabaseUsage {
  uuid: string;
  instances: {
    uuid: string;
    usage: {
      rows_read: number;
      rows_written: number;
      storage_bytes: number;
    };
  }[];
  total: {
    rows_read: number;
    rows_written: number;
    storage_bytes: number;
  };
}

// Token Types
export interface ITursoToken {
  id: string;
  name: string;
}

export interface ITursoDatabaseToken {
  jwt: string;
}

// Location Types
export interface ITursoLocation {
  code: string;
  name: string;
}

// API Token Types
export interface ITursoApiToken {
  id: string;
  name: string;
}

// Audit Log Types
export interface ITursoAuditLog {
  code: string;
  message: string;
  origin: string;
  author: string;
  created_at: string;
  data?: IDataObject;
}

// Invoice Types
export interface ITursoInvoice {
  invoice_number: string;
  amount_due: number;
  due_date: string;
  paid_at?: string;
  payment_failed_at?: string;
  invoice_pdf?: string;
}

// Statistics Types
export interface ITursoQueryStats {
  query: string;
  rows_read: number;
  rows_written: number;
}

export interface ITursoRangeStats {
  rows_read: number;
  rows_written: number;
  storage_bytes: number;
  databases: number;
}

// Seed Types
export interface ITursoSeed {
  type: 'database' | 'dump';
  name?: string;
  url?: string;
  timestamp?: string;
}

// API Response Types
export interface ITursoApiResponse<T> {
  [key: string]: T | T[];
}

export interface ITursoErrorResponse {
  error: string | { code: string; message: string };
}

// Request Options
export interface ITursoRequestOptions {
  method: string;
  endpoint: string;
  body?: IDataObject;
  query?: IDataObject;
}

// Polling State
export interface ITursoPollingState {
  databases?: string[];
  groups?: string[];
  members?: string[];
  lastPoll?: string;
}
