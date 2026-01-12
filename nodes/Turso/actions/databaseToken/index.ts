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
 * List tokens for a database
 */
export async function list(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/databases/${databaseName}/auth/tokens`,
  );
  const tokens = (response.tokens as IDataObject[]) || [];
  return wrapData(tokens);
}

/**
 * Create a new database auth token
 */
export async function create(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;
  const expiration = this.getNodeParameter('expiration', i, 'never') as string;
  const authorization = this.getNodeParameter('authorization', i, 'full-access') as string;
  const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

  const query: IDataObject = {};

  if (expiration && expiration !== 'never') {
    query.expiration = expiration;
  }

  if (authorization) {
    query.authorization = authorization;
  }

  // Handle permissions for fine-grained access control
  let body: IDataObject | undefined;
  if (additionalOptions.permissions) {
    body = {
      permissions: additionalOptions.permissions,
    };
  }

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/databases/${databaseName}/auth/tokens`,
    body,
    query,
  );
  return wrapData(response as IDataObject);
}

/**
 * Validate a database token
 */
export async function validate(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/databases/${databaseName}/auth/tokens/validate`,
  );
  return wrapData(response as IDataObject);
}

/**
 * Revoke all tokens for a database
 */
export async function revokeAll(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const databaseName = this.getNodeParameter('databaseName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/databases/${databaseName}/auth/rotate`,
  );
  return wrapData(response as IDataObject || { success: true, databaseName });
}
