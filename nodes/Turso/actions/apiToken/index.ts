/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { tursoApiRequest } from '../../transport';
import { wrapData } from '../../utils';

/**
 * List all platform API tokens
 */
export async function list(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
  const response = await tursoApiRequest.call(this, 'GET', '/auth/api-tokens');
  const tokens = (response.tokens as IDataObject[]) || [];
  return wrapData(tokens);
}

/**
 * Create a new API token
 */
export async function create(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const tokenName = this.getNodeParameter('tokenName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/auth/api-tokens/${encodeURIComponent(tokenName)}`,
  );
  return wrapData(response as IDataObject);
}

/**
 * Validate current token
 */
export async function validate(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
  const response = await tursoApiRequest.call(this, 'GET', '/auth/validate');
  return wrapData(response as IDataObject);
}

/**
 * Revoke an API token
 */
export async function revoke(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const tokenName = this.getNodeParameter('tokenName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'DELETE',
    `/auth/api-tokens/${encodeURIComponent(tokenName)}`,
  );
  return wrapData(response as IDataObject || { success: true, tokenName });
}
