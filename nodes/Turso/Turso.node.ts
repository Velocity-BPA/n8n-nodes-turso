/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

import { emitLicenseNotice } from './transport';
import {
  TURSO_LOCATIONS,
  TURSO_MEMBER_ROLES,
  TURSO_TOKEN_AUTHORIZATION,
  TURSO_TOKEN_EXPIRATION,
  TURSO_EXTENSIONS,
} from './constants';

import * as organization from './actions/organization';
import * as group from './actions/group';
import * as database from './actions/database';
import * as databaseToken from './actions/databaseToken';
import * as location from './actions/location';
import * as apiToken from './actions/apiToken';
import * as auditLog from './actions/auditLog';
import * as invoice from './actions/invoice';
import * as groupToken from './actions/groupToken';
import * as databaseStatistics from './actions/databaseStatistics';
import * as schemaDatabase from './actions/schemaDatabase';
import * as pointInTimeRecovery from './actions/pointInTimeRecovery';

export class Turso implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Turso',
    name: 'turso',
    icon: 'file:turso.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Turso distributed SQLite database platform',
    defaults: {
      name: 'Turso',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'tursoApi',
        required: true,
      },
    ],
    properties: [
      // Resource Selection
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'API Token', value: 'apiToken' },
          { name: 'Audit Log', value: 'auditLog' },
          { name: 'Database', value: 'database' },
          { name: 'Database Statistics', value: 'databaseStatistics' },
          { name: 'Database Token', value: 'databaseToken' },
          { name: 'Group', value: 'group' },
          { name: 'Group Token', value: 'groupToken' },
          { name: 'Invoice', value: 'invoice' },
          { name: 'Location', value: 'location' },
          { name: 'Organization', value: 'organization' },
          { name: 'Point-in-Time Recovery', value: 'pointInTimeRecovery' },
          { name: 'Schema Database', value: 'schemaDatabase' },
        ],
        default: 'database',
      },

      // ==================== ORGANIZATION OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['organization'] },
        },
        options: [
          { name: 'Add Member', value: 'addMember', description: 'Add a member to the organization', action: 'Add member to organization' },
          { name: 'Create Invite', value: 'createInvite', description: 'Create an organization invitation', action: 'Create organization invite' },
          { name: 'Delete Invite', value: 'deleteInvite', description: 'Delete a pending invitation', action: 'Delete organization invite' },
          { name: 'Get', value: 'get', description: 'Get organization details', action: 'Get organization' },
          { name: 'List', value: 'list', description: 'List all organizations', action: 'List organizations' },
          { name: 'List Invites', value: 'listInvites', description: 'List pending invitations', action: 'List organization invites' },
          { name: 'List Members', value: 'listMembers', description: 'List organization members', action: 'List organization members' },
          { name: 'Remove Member', value: 'removeMember', description: 'Remove a member from the organization', action: 'Remove member from organization' },
          { name: 'Update Member', value: 'updateMember', description: 'Update member role', action: 'Update organization member' },
        ],
        default: 'list',
      },

      // ==================== GROUP OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['group'] },
        },
        options: [
          { name: 'Add Location', value: 'addLocation', description: 'Add a location to a group', action: 'Add location to group' },
          { name: 'Create', value: 'create', description: 'Create a new group', action: 'Create group' },
          { name: 'Delete', value: 'delete', description: 'Delete a group', action: 'Delete group' },
          { name: 'Get', value: 'get', description: 'Get group details', action: 'Get group' },
          { name: 'List', value: 'list', description: 'List all groups', action: 'List groups' },
          { name: 'Remove Location', value: 'removeLocation', description: 'Remove a location from a group', action: 'Remove location from group' },
          { name: 'Transfer', value: 'transfer', description: 'Transfer group to another organization', action: 'Transfer group' },
          { name: 'Unarchive', value: 'unarchive', description: 'Unarchive a group', action: 'Unarchive group' },
          { name: 'Update', value: 'update', description: 'Update group settings', action: 'Update group' },
        ],
        default: 'list',
      },

      // ==================== DATABASE OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['database'] },
        },
        options: [
          { name: 'Create', value: 'create', description: 'Create a new database', action: 'Create database' },
          { name: 'Create From Seed', value: 'createFromSeed', description: 'Create database from seed', action: 'Create database from seed' },
          { name: 'Delete', value: 'delete', description: 'Delete a database', action: 'Delete database' },
          { name: 'Get', value: 'get', description: 'Get database details', action: 'Get database' },
          { name: 'Get Configuration', value: 'getConfiguration', description: 'Get database configuration', action: 'Get database configuration' },
          { name: 'Get Instance', value: 'getInstance', description: 'Get instance details', action: 'Get database instance' },
          { name: 'Get Usage', value: 'getUsage', description: 'Get database usage statistics', action: 'Get database usage' },
          { name: 'List', value: 'list', description: 'List all databases', action: 'List databases' },
          { name: 'List Instances', value: 'listInstances', description: 'List database instances', action: 'List database instances' },
          { name: 'Update', value: 'update', description: 'Update database configuration', action: 'Update database' },
          { name: 'Update Version', value: 'updateVersion', description: 'Update libSQL version', action: 'Update database version' },
        ],
        default: 'list',
      },

      // ==================== DATABASE TOKEN OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['databaseToken'] },
        },
        options: [
          { name: 'Create', value: 'create', description: 'Create a new database auth token', action: 'Create database token' },
          { name: 'List', value: 'list', description: 'List tokens for a database', action: 'List database tokens' },
          { name: 'Revoke All', value: 'revokeAll', description: 'Revoke all tokens for a database', action: 'Revoke all database tokens' },
          { name: 'Validate', value: 'validate', description: 'Validate a token', action: 'Validate database token' },
        ],
        default: 'list',
      },

      // ==================== LOCATION OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['location'] },
        },
        options: [
          { name: 'Get Closest', value: 'getClosest', description: 'Get closest location to client', action: 'Get closest location' },
          { name: 'List', value: 'list', description: 'List all available locations', action: 'List locations' },
        ],
        default: 'list',
      },

      // ==================== API TOKEN OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['apiToken'] },
        },
        options: [
          { name: 'Create', value: 'create', description: 'Create a new API token', action: 'Create API token' },
          { name: 'List', value: 'list', description: 'List all platform API tokens', action: 'List API tokens' },
          { name: 'Revoke', value: 'revoke', description: 'Revoke an API token', action: 'Revoke API token' },
          { name: 'Validate', value: 'validate', description: 'Validate current token', action: 'Validate API token' },
        ],
        default: 'list',
      },

      // ==================== AUDIT LOG OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['auditLog'] },
        },
        options: [
          { name: 'List', value: 'list', description: 'List audit logs for organization', action: 'List audit logs' },
        ],
        default: 'list',
      },

      // ==================== INVOICE OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['invoice'] },
        },
        options: [
          { name: 'Get', value: 'get', description: 'Get specific invoice details', action: 'Get invoice' },
          { name: 'List', value: 'list', description: 'List invoices for organization', action: 'List invoices' },
        ],
        default: 'list',
      },

      // ==================== GROUP TOKEN OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['groupToken'] },
        },
        options: [
          { name: 'Create', value: 'create', description: 'Create token for all databases in a group', action: 'Create group token' },
          { name: 'Invalidate', value: 'invalidate', description: 'Invalidate all tokens for a group', action: 'Invalidate group tokens' },
        ],
        default: 'create',
      },

      // ==================== DATABASE STATISTICS OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['databaseStatistics'] },
        },
        options: [
          { name: 'Get Range Stats', value: 'getRangeStats', description: 'Get statistics over a time range', action: 'Get range statistics' },
          { name: 'Get Top Queries', value: 'getTopQueries', description: 'Get top queries by various metrics', action: 'Get top queries' },
          { name: 'Get Usage', value: 'getUsage', description: 'Get database usage stats', action: 'Get database usage stats' },
        ],
        default: 'getUsage',
      },

      // ==================== SCHEMA DATABASE OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['schemaDatabase'] },
        },
        options: [
          { name: 'Create', value: 'create', description: 'Create a schema database', action: 'Create schema database' },
          { name: 'Create Child', value: 'createChild', description: 'Create a child database from schema', action: 'Create child database' },
          { name: 'List Children', value: 'listChildren', description: 'List databases using this schema', action: 'List child databases' },
        ],
        default: 'create',
      },

      // ==================== POINT-IN-TIME RECOVERY OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['pointInTimeRecovery'] },
        },
        options: [
          { name: 'Create Recovery', value: 'createRecovery', description: 'Create database from point-in-time backup', action: 'Create recovery database' },
        ],
        default: 'createRecovery',
      },

      // ==================== SHARED PARAMETERS ====================

      // Organization Slug (used by many resources)
      {
        displayName: 'Organization Slug',
        name: 'organizationSlug',
        type: 'string',
        default: '',
        description: 'Organization slug. Leave empty to use the one from credentials.',
        displayOptions: {
          show: {
            resource: ['organization', 'group', 'database', 'databaseToken', 'auditLog', 'invoice', 'groupToken', 'databaseStatistics', 'schemaDatabase', 'pointInTimeRecovery'],
          },
          hide: {
            resource: ['organization'],
            operation: ['list'],
          },
        },
      },

      // ==================== ORGANIZATION PARAMETERS ====================

      // Username for member operations
      {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        required: true,
        default: '',
        description: 'Member username',
        displayOptions: {
          show: {
            resource: ['organization'],
            operation: ['addMember', 'removeMember', 'updateMember'],
          },
        },
      },

      // Email for invite operations
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'name@email.com',
        description: 'Email address for invitation',
        displayOptions: {
          show: {
            resource: ['organization'],
            operation: ['createInvite', 'deleteInvite'],
          },
        },
      },

      // Role for member operations
      {
        displayName: 'Role',
        name: 'role',
        type: 'options',
        required: true,
        options: TURSO_MEMBER_ROLES,
        default: 'member',
        description: 'Member role in the organization',
        displayOptions: {
          show: {
            resource: ['organization'],
            operation: ['addMember', 'updateMember', 'createInvite'],
          },
        },
      },

      // ==================== GROUP PARAMETERS ====================

      // Group Name
      {
        displayName: 'Group Name',
        name: 'groupName',
        type: 'string',
        required: true,
        default: '',
        description: 'Name of the group',
        displayOptions: {
          show: {
            resource: ['group'],
            operation: ['create', 'get', 'delete', 'addLocation', 'removeLocation', 'transfer', 'unarchive', 'update'],
          },
        },
      },
      {
        displayName: 'Group Name',
        name: 'groupName',
        type: 'string',
        required: true,
        default: '',
        description: 'Name of the group',
        displayOptions: {
          show: {
            resource: ['groupToken'],
          },
        },
      },

      // Location for group operations
      {
        displayName: 'Location',
        name: 'location',
        type: 'options',
        required: true,
        options: TURSO_LOCATIONS,
        default: 'ord',
        description: 'Location code for the group',
        displayOptions: {
          show: {
            resource: ['group'],
            operation: ['create', 'addLocation', 'removeLocation'],
          },
        },
      },

      // Target Organization for transfer
      {
        displayName: 'Target Organization',
        name: 'targetOrganization',
        type: 'string',
        required: true,
        default: '',
        description: 'Target organization slug for transfer',
        displayOptions: {
          show: {
            resource: ['group'],
            operation: ['transfer'],
          },
        },
      },

      // Additional Fields for group create
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['group'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'Extensions',
            name: 'extensions',
            type: 'multiOptions',
            options: TURSO_EXTENSIONS,
            default: [],
            description: 'SQLite extensions to enable',
          },
          {
            displayName: 'Version',
            name: 'version',
            type: 'string',
            default: '',
            description: 'libSQL version',
          },
        ],
      },

      // Update Fields for group update
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['group'],
            operation: ['update'],
          },
        },
        options: [
          {
            displayName: 'Extensions',
            name: 'extensions',
            type: 'multiOptions',
            options: TURSO_EXTENSIONS,
            default: [],
            description: 'SQLite extensions to enable',
          },
        ],
      },

      // ==================== DATABASE PARAMETERS ====================

      // Database Name
      {
        displayName: 'Database Name',
        name: 'databaseName',
        type: 'string',
        required: true,
        default: '',
        description: 'Name of the database',
        displayOptions: {
          show: {
            resource: ['database'],
            operation: ['create', 'get', 'delete', 'listInstances', 'getInstance', 'getUsage', 'updateVersion', 'createFromSeed', 'update', 'getConfiguration'],
          },
        },
      },
      {
        displayName: 'Database Name',
        name: 'databaseName',
        type: 'string',
        required: true,
        default: '',
        description: 'Name of the database',
        displayOptions: {
          show: {
            resource: ['databaseToken', 'databaseStatistics', 'schemaDatabase'],
          },
          hide: {
            resource: ['schemaDatabase'],
            operation: ['createChild'],
          },
        },
      },

      // Group for database operations
      {
        displayName: 'Group',
        name: 'group',
        type: 'string',
        required: true,
        default: 'default',
        description: 'Group name to assign database',
        displayOptions: {
          show: {
            resource: ['database'],
            operation: ['create', 'createFromSeed'],
          },
        },
      },
      {
        displayName: 'Group',
        name: 'group',
        type: 'string',
        required: true,
        default: 'default',
        description: 'Group name',
        displayOptions: {
          show: {
            resource: ['schemaDatabase', 'pointInTimeRecovery'],
          },
        },
      },

      // Instance Name
      {
        displayName: 'Instance Name',
        name: 'instanceName',
        type: 'string',
        required: true,
        default: '',
        description: 'Name of the database instance',
        displayOptions: {
          show: {
            resource: ['database'],
            operation: ['getInstance'],
          },
        },
      },

      // Filters for database list
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['database'],
            operation: ['list'],
          },
        },
        options: [
          {
            displayName: 'Group',
            name: 'group',
            type: 'string',
            default: '',
            description: 'Filter by group name',
          },
          {
            displayName: 'Schema',
            name: 'schema',
            type: 'string',
            default: '',
            description: 'Filter by schema database',
          },
        ],
      },

      // Additional Fields for database create
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['database'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'Is Schema',
            name: 'isSchema',
            type: 'boolean',
            default: false,
            description: 'Whether to mark as schema database',
          },
          {
            displayName: 'Schema',
            name: 'schema',
            type: 'string',
            default: '',
            description: 'Schema database for branching',
          },
          {
            displayName: 'Size Limit',
            name: 'sizeLimit',
            type: 'string',
            default: '',
            placeholder: '5gb',
            description: 'Database size limit (e.g., "5gb")',
          },
        ],
      },

      // Update Fields for database update
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['database'],
            operation: ['update'],
          },
        },
        options: [
          {
            displayName: 'Allow Attach',
            name: 'allowAttach',
            type: 'boolean',
            default: false,
            description: 'Whether to allow ATTACH queries',
          },
          {
            displayName: 'Block Reads',
            name: 'blockReads',
            type: 'boolean',
            default: false,
            description: 'Whether to block read operations',
          },
          {
            displayName: 'Block Writes',
            name: 'blockWrites',
            type: 'boolean',
            default: false,
            description: 'Whether to block write operations',
          },
          {
            displayName: 'Size Limit',
            name: 'sizeLimit',
            type: 'string',
            default: '',
            placeholder: '5gb',
            description: 'Database size limit (e.g., "5gb")',
          },
        ],
      },

      // Seed Type for createFromSeed
      {
        displayName: 'Seed Type',
        name: 'seedType',
        type: 'options',
        required: true,
        options: [
          { name: 'Database', value: 'database' },
          { name: 'Dump File', value: 'dump' },
        ],
        default: 'database',
        description: 'Type of seed to create database from',
        displayOptions: {
          show: {
            resource: ['database'],
            operation: ['createFromSeed'],
          },
        },
      },

      // Seed Options
      {
        displayName: 'Seed Options',
        name: 'seedOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            resource: ['database'],
            operation: ['createFromSeed'],
          },
        },
        options: [
          {
            displayName: 'Seed Database',
            name: 'seedDatabase',
            type: 'string',
            default: '',
            description: 'Source database name (for database seed type)',
          },
          {
            displayName: 'Dump URL',
            name: 'dumpUrl',
            type: 'string',
            default: '',
            description: 'URL of dump file (for dump seed type)',
          },
          {
            displayName: 'Timestamp',
            name: 'timestamp',
            type: 'dateTime',
            default: '',
            description: 'Point in time to restore from (for PITR)',
          },
        ],
      },

      // ==================== DATABASE TOKEN PARAMETERS ====================

      // Expiration
      {
        displayName: 'Expiration',
        name: 'expiration',
        type: 'options',
        options: TURSO_TOKEN_EXPIRATION,
        default: 'never',
        description: 'Token expiration time',
        displayOptions: {
          show: {
            resource: ['databaseToken', 'groupToken'],
            operation: ['create'],
          },
        },
      },

      // Authorization
      {
        displayName: 'Authorization',
        name: 'authorization',
        type: 'options',
        options: TURSO_TOKEN_AUTHORIZATION,
        default: 'full-access',
        description: 'Token authorization level',
        displayOptions: {
          show: {
            resource: ['databaseToken', 'groupToken'],
            operation: ['create'],
          },
        },
      },

      // Additional Options for database token
      {
        displayName: 'Additional Options',
        name: 'additionalOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
          show: {
            resource: ['databaseToken'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'Permissions',
            name: 'permissions',
            type: 'json',
            default: '{}',
            description: 'Fine-grained permissions configuration (JSON)',
          },
        ],
      },

      // ==================== API TOKEN PARAMETERS ====================

      // Token Name
      {
        displayName: 'Token Name',
        name: 'tokenName',
        type: 'string',
        required: true,
        default: '',
        description: 'Name for the API token',
        displayOptions: {
          show: {
            resource: ['apiToken'],
            operation: ['create', 'revoke'],
          },
        },
      },

      // ==================== AUDIT LOG PARAMETERS ====================

      // Return All
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        default: false,
        description: 'Whether to return all results or only up to a given limit',
        displayOptions: {
          show: {
            resource: ['auditLog'],
            operation: ['list'],
          },
        },
      },

      // Limit
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        description: 'Max number of results to return',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        displayOptions: {
          show: {
            resource: ['auditLog'],
            operation: ['list'],
            returnAll: [false],
          },
        },
      },

      // Filters for audit log
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['auditLog'],
            operation: ['list'],
          },
        },
        options: [
          {
            displayName: 'Page',
            name: 'page',
            type: 'number',
            default: 1,
            description: 'Page number',
          },
          {
            displayName: 'Per Page',
            name: 'perPage',
            type: 'number',
            default: 50,
            description: 'Items per page',
          },
        ],
      },

      // ==================== INVOICE PARAMETERS ====================

      // Invoice ID
      {
        displayName: 'Invoice ID',
        name: 'invoiceId',
        type: 'string',
        required: true,
        default: '',
        description: 'Invoice ID',
        displayOptions: {
          show: {
            resource: ['invoice'],
            operation: ['get'],
          },
        },
      },

      // ==================== DATABASE STATISTICS PARAMETERS ====================

      // Filters for range stats
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
          show: {
            resource: ['databaseStatistics'],
            operation: ['getRangeStats'],
          },
        },
        options: [
          {
            displayName: 'From',
            name: 'from',
            type: 'dateTime',
            default: '',
            description: 'Start of time range',
          },
          {
            displayName: 'To',
            name: 'to',
            type: 'dateTime',
            default: '',
            description: 'End of time range',
          },
        ],
      },

      // ==================== SCHEMA DATABASE PARAMETERS ====================

      // Schema Database for createChild
      {
        displayName: 'Schema Database',
        name: 'schemaDatabase',
        type: 'string',
        required: true,
        default: '',
        description: 'Name of the schema database',
        displayOptions: {
          show: {
            resource: ['schemaDatabase'],
            operation: ['createChild'],
          },
        },
      },

      // Child Database Name
      {
        displayName: 'Child Database Name',
        name: 'childDatabaseName',
        type: 'string',
        required: true,
        default: '',
        description: 'Name for the new child database',
        displayOptions: {
          show: {
            resource: ['schemaDatabase'],
            operation: ['createChild'],
          },
        },
      },

      // ==================== POINT-IN-TIME RECOVERY PARAMETERS ====================

      // Source Database Name
      {
        displayName: 'Source Database Name',
        name: 'sourceDatabaseName',
        type: 'string',
        required: true,
        default: '',
        description: 'Name of the source database to recover from',
        displayOptions: {
          show: {
            resource: ['pointInTimeRecovery'],
            operation: ['createRecovery'],
          },
        },
      },

      // Target Database Name
      {
        displayName: 'Target Database Name',
        name: 'targetDatabaseName',
        type: 'string',
        required: true,
        default: '',
        description: 'Name for the recovered database',
        displayOptions: {
          show: {
            resource: ['pointInTimeRecovery'],
            operation: ['createRecovery'],
          },
        },
      },

      // Timestamp
      {
        displayName: 'Timestamp',
        name: 'timestamp',
        type: 'dateTime',
        required: true,
        default: '',
        description: 'Point in time to recover to',
        displayOptions: {
          show: {
            resource: ['pointInTimeRecovery'],
            operation: ['createRecovery'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    emitLicenseNotice(this);

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: INodeExecutionData[] = [];

        switch (resource) {
          case 'organization':
            switch (operation) {
              case 'list':
                result = await organization.list.call(this);
                break;
              case 'get':
                result = await organization.get.call(this, i);
                break;
              case 'listMembers':
                result = await organization.listMembers.call(this, i);
                break;
              case 'addMember':
                result = await organization.addMember.call(this, i);
                break;
              case 'removeMember':
                result = await organization.removeMember.call(this, i);
                break;
              case 'updateMember':
                result = await organization.updateMember.call(this, i);
                break;
              case 'listInvites':
                result = await organization.listInvites.call(this, i);
                break;
              case 'createInvite':
                result = await organization.createInvite.call(this, i);
                break;
              case 'deleteInvite':
                result = await organization.deleteInvite.call(this, i);
                break;
            }
            break;

          case 'group':
            switch (operation) {
              case 'list':
                result = await group.list.call(this, i);
                break;
              case 'create':
                result = await group.create.call(this, i);
                break;
              case 'get':
                result = await group.get.call(this, i);
                break;
              case 'delete':
                result = await group.deleteGroup.call(this, i);
                break;
              case 'addLocation':
                result = await group.addLocation.call(this, i);
                break;
              case 'removeLocation':
                result = await group.removeLocation.call(this, i);
                break;
              case 'transfer':
                result = await group.transfer.call(this, i);
                break;
              case 'unarchive':
                result = await group.unarchive.call(this, i);
                break;
              case 'update':
                result = await group.update.call(this, i);
                break;
            }
            break;

          case 'database':
            switch (operation) {
              case 'list':
                result = await database.list.call(this, i);
                break;
              case 'create':
                result = await database.create.call(this, i);
                break;
              case 'get':
                result = await database.get.call(this, i);
                break;
              case 'delete':
                result = await database.deleteDatabase.call(this, i);
                break;
              case 'listInstances':
                result = await database.listInstances.call(this, i);
                break;
              case 'getInstance':
                result = await database.getInstance.call(this, i);
                break;
              case 'getUsage':
                result = await database.getUsage.call(this, i);
                break;
              case 'updateVersion':
                result = await database.updateVersion.call(this, i);
                break;
              case 'createFromSeed':
                result = await database.createFromSeed.call(this, i);
                break;
              case 'update':
                result = await database.update.call(this, i);
                break;
              case 'getConfiguration':
                result = await database.getConfiguration.call(this, i);
                break;
            }
            break;

          case 'databaseToken':
            switch (operation) {
              case 'list':
                result = await databaseToken.list.call(this, i);
                break;
              case 'create':
                result = await databaseToken.create.call(this, i);
                break;
              case 'validate':
                result = await databaseToken.validate.call(this, i);
                break;
              case 'revokeAll':
                result = await databaseToken.revokeAll.call(this, i);
                break;
            }
            break;

          case 'location':
            switch (operation) {
              case 'list':
                result = await location.list.call(this);
                break;
              case 'getClosest':
                result = await location.getClosest.call(this);
                break;
            }
            break;

          case 'apiToken':
            switch (operation) {
              case 'list':
                result = await apiToken.list.call(this);
                break;
              case 'create':
                result = await apiToken.create.call(this, i);
                break;
              case 'validate':
                result = await apiToken.validate.call(this);
                break;
              case 'revoke':
                result = await apiToken.revoke.call(this, i);
                break;
            }
            break;

          case 'auditLog':
            switch (operation) {
              case 'list':
                result = await auditLog.list.call(this, i);
                break;
            }
            break;

          case 'invoice':
            switch (operation) {
              case 'list':
                result = await invoice.list.call(this, i);
                break;
              case 'get':
                result = await invoice.get.call(this, i);
                break;
            }
            break;

          case 'groupToken':
            switch (operation) {
              case 'create':
                result = await groupToken.create.call(this, i);
                break;
              case 'invalidate':
                result = await groupToken.invalidate.call(this, i);
                break;
            }
            break;

          case 'databaseStatistics':
            switch (operation) {
              case 'getUsage':
                result = await databaseStatistics.getUsage.call(this, i);
                break;
              case 'getTopQueries':
                result = await databaseStatistics.getTopQueries.call(this, i);
                break;
              case 'getRangeStats':
                result = await databaseStatistics.getRangeStats.call(this, i);
                break;
            }
            break;

          case 'schemaDatabase':
            switch (operation) {
              case 'create':
                result = await schemaDatabase.create.call(this, i);
                break;
              case 'listChildren':
                result = await schemaDatabase.listChildren.call(this, i);
                break;
              case 'createChild':
                result = await schemaDatabase.createChild.call(this, i);
                break;
            }
            break;

          case 'pointInTimeRecovery':
            switch (operation) {
              case 'createRecovery':
                result = await pointInTimeRecovery.createRecovery.call(this, i);
                break;
            }
            break;
        }

        returnData.push(...result);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
