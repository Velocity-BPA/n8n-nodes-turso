/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { tursoApiRequest, getOrganizationSlug } from '../../transport';
import { wrapData } from '../../utils';

/**
 * List all databases in organization
 */
export async function list(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

  const query: IDataObject = {};
  if (filters.group) {
    query.group = filters.group;
  }
  if (filters.schema) {
    query.schema = filters.schema;
  }

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/databases`,
    undefined,
    query,
  );
  const databases = (response.databases as IDataObject[]) || [];
  return wrapData(databases);
}

/**
 * Create a new database
 */
export async function create(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;
  const group = this.getNodeParameter('group', i) as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  const body: IDataObject = {
    name: databaseName,
    group,
  };

  if (additionalFields.isSchema !== undefined) {
    body.is_schema = additionalFields.isSchema;
  }

  if (additionalFields.schema) {
    body.schema = additionalFields.schema;
  }

  if (additionalFields.sizeLimit) {
    body.size_limit = additionalFields.sizeLimit;
  }

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/databases`,
    body,
  );
  return wrapData(response.database as IDataObject || response);
}

/**
 * Get database details
 */
export async function get(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/databases/${databaseName}`,
  );
  return wrapData(response.database as IDataObject || response);
}

/**
 * Delete a database
 */
export async function deleteDatabase(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'DELETE',
    `/organizations/${organizationSlug}/databases/${databaseName}`,
  );
  return wrapData(response as IDataObject || { success: true, databaseName });
}

/**
 * List database instances (replicas)
 */
export async function listInstances(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/databases/${databaseName}/instances`,
  );
  const instances = (response.instances as IDataObject[]) || [];
  return wrapData(instances);
}

/**
 * Get instance details
 */
export async function getInstance(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;
  const instanceName = this.getNodeParameter('instanceName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/databases/${databaseName}/instances/${instanceName}`,
  );
  return wrapData(response.instance as IDataObject || response);
}

/**
 * Get database usage statistics
 */
export async function getUsage(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/databases/${databaseName}/usage`,
  );
  return wrapData(response.database as IDataObject || response);
}

/**
 * Update database libSQL version
 */
export async function updateVersion(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/databases/${databaseName}/update`,
  );
  return wrapData(response.database as IDataObject || response);
}

/**
 * Create database from seed
 */
export async function createFromSeed(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;
  const group = this.getNodeParameter('group', i) as string;
  const seedType = this.getNodeParameter('seedType', i) as string;
  const seedOptions = this.getNodeParameter('seedOptions', i, {}) as IDataObject;

  const body: IDataObject = {
    name: databaseName,
    group,
    seed: {
      type: seedType,
    },
  };

  if (seedType === 'database' && seedOptions.seedDatabase) {
    (body.seed as IDataObject).name = seedOptions.seedDatabase;
  }

  if (seedType === 'dump' && seedOptions.dumpUrl) {
    (body.seed as IDataObject).url = seedOptions.dumpUrl;
  }

  if (seedOptions.timestamp) {
    (body.seed as IDataObject).timestamp = seedOptions.timestamp;
  }

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/databases`,
    body,
  );
  return wrapData(response.database as IDataObject || response);
}

/**
 * Update database configuration
 */
export async function update(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;
  const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

  const body: IDataObject = {};

  if (updateFields.allowAttach !== undefined) {
    body.allow_attach = updateFields.allowAttach;
  }

  if (updateFields.blockReads !== undefined) {
    body.block_reads = updateFields.blockReads;
  }

  if (updateFields.blockWrites !== undefined) {
    body.block_writes = updateFields.blockWrites;
  }

  if (updateFields.sizeLimit) {
    body.size_limit = updateFields.sizeLimit;
  }

  const response = await tursoApiRequest.call(
    this,
    'PATCH',
    `/organizations/${organizationSlug}/databases/${databaseName}/configuration`,
    body,
  );
  return wrapData(response.database as IDataObject || response);
}

/**
 * Get database configuration
 */
export async function getConfiguration(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/databases/${databaseName}/configuration`,
  );
  return wrapData(response as IDataObject);
}
