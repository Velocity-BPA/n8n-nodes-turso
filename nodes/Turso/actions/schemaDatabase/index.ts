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
 * Create a schema database
 */
export async function create(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;
  const group = this.getNodeParameter('group', i) as string;

  const body: IDataObject = {
    name: databaseName,
    group,
    is_schema: true,
  };

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/databases`,
    body,
  );
  return wrapData(response.database as IDataObject || response);
}

/**
 * List databases using this schema (child databases)
 */
export async function listChildren(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;

  // Get all databases and filter by schema
  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/databases`,
    undefined,
    { schema: databaseName },
  );
  const databases = (response.databases as IDataObject[]) || [];
  return wrapData(databases);
}

/**
 * Create a child database from a schema database
 */
export async function createChild(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const schemaDatabase = this.getNodeParameter('schemaDatabase', i) as string;
  const childDatabaseName = this.getNodeParameter('childDatabaseName', i) as string;
  const group = this.getNodeParameter('group', i) as string;

  const body: IDataObject = {
    name: childDatabaseName,
    group,
    schema: schemaDatabase,
  };

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/databases`,
    body,
  );
  return wrapData(response.database as IDataObject || response);
}
