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
 * Create token for all databases in a group
 */
export async function create(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const groupName = this.getNodeParameter('groupName', i) as string;
  const expiration = this.getNodeParameter('expiration', i, 'never') as string;
  const authorization = this.getNodeParameter('authorization', i, 'full-access') as string;

  const query: IDataObject = {};

  if (expiration && expiration !== 'never') {
    query.expiration = expiration;
  }

  if (authorization) {
    query.authorization = authorization;
  }

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/groups/${groupName}/auth/tokens`,
    undefined,
    query,
  );
  return wrapData(response as IDataObject);
}

/**
 * Invalidate all tokens for a group
 */
export async function invalidate(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const groupName = this.getNodeParameter('groupName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/groups/${groupName}/auth/rotate`,
  );
  return wrapData(response as IDataObject || { success: true, groupName });
}
