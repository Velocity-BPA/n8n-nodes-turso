/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  IHttpRequestMethods,
  ILoadOptionsFunctions,
  IPollFunctions,
  IRequestOptions,
  NodeApiError,
} from 'n8n-workflow';
import { TURSO_API_BASE_URL } from '../constants';

/**
 * Emit licensing notice (once per node load)
 */
let licenseNoticeEmitted = false;

export function emitLicenseNotice(
  context: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
): void {
  if (!licenseNoticeEmitted) {
    context.logger?.warn(
      '[Velocity BPA Licensing Notice] This n8n node is licensed under the Business Source License 1.1 (BSL 1.1). ' +
        'Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA. ' +
        'For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.',
    );
    licenseNoticeEmitted = true;
  }
}

/**
 * Make an API request to Turso
 */
export async function tursoApiRequest(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  query?: IDataObject,
): Promise<IDataObject> {
  const credentials = await this.getCredentials('tursoApi');

  const options: IRequestOptions = {
    method,
    uri: `${TURSO_API_BASE_URL}${endpoint}`,
    headers: {
      Authorization: `Bearer ${credentials.apiToken}`,
      'Content-Type': 'application/json',
    },
    json: true,
  };

  if (body && Object.keys(body).length > 0) {
    options.body = body;
  }

  if (query && Object.keys(query).length > 0) {
    options.qs = query;
  }

  try {
    const response = await this.helpers.request(options);
    return response as IDataObject;
  } catch (error: unknown) {
    const err = error as { message?: string; description?: string };
    throw new NodeApiError(this.getNode(), { message: err.message || 'Unknown error' }, {
      message: err.message || 'Unknown error',
      description: err.description || 'Failed to make request to Turso API',
    });
  }
}

/**
 * Make an API request and return all items (handles pagination)
 */
export async function tursoApiRequestAllItems(
  this: IExecuteFunctions | IHookFunctions | IPollFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  dataKey: string,
  body?: IDataObject,
  query?: IDataObject,
): Promise<IDataObject[]> {
  const returnData: IDataObject[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const qs: IDataObject = { ...query, page, per_page: perPage };
    const response = await tursoApiRequest.call(this, method, endpoint, body, qs);

    const items = response[dataKey];
    if (items && Array.isArray(items)) {
      returnData.push(...(items as IDataObject[]));

      // If we got fewer items than requested, we're done
      if ((items as IDataObject[]).length < perPage) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }

    page++;
  }

  return returnData;
}

/**
 * Build an endpoint with organization slug
 */
export function buildEndpoint(organizationSlug: string, path: string): string {
  return path.replace('{organizationSlug}', organizationSlug);
}

/**
 * Get organization slug from credentials
 */
export async function getOrganizationSlug(
  context: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
): Promise<string> {
  const credentials = await context.getCredentials('tursoApi');
  return credentials.organizationSlug as string;
}

/**
 * Handle rate limiting with exponential backoff
 */
export async function handleRateLimit<T>(
  context: IExecuteFunctions | IHookFunctions,
  requestFn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Check if it's a rate limit error (429)
      if ((error as NodeApiError).httpCode === '429') {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // For other errors, throw immediately
      throw error;
    }
  }

  throw lastError;
}

/**
 * Simplify response by extracting nested data
 */
export function simplifyResponse(response: IDataObject, key?: string): IDataObject | IDataObject[] {
  if (key && response[key] !== undefined) {
    return response[key] as IDataObject | IDataObject[];
  }
  return response;
}
