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
 * Get database usage stats
 */
export async function getUsage(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/databases/${databaseName}/stats`,
  );
  return wrapData(response as IDataObject);
}

/**
 * Get top queries by various metrics
 */
export async function getTopQueries(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/databases/${databaseName}/top-queries`,
  );
  const queries = (response.top_queries as IDataObject[]) || [];
  return wrapData(queries);
}

/**
 * Get statistics over a time range
 */
export async function getRangeStats(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

  const query: IDataObject = {};

  if (filters.from) {
    query.from = filters.from;
  }

  if (filters.to) {
    query.to = filters.to;
  }

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/usage`,
    undefined,
    query,
  );
  return wrapData(response.organization as IDataObject || response);
}
