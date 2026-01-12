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
 * List invoices for organization
 */
export async function list(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/invoices`,
  );
  const invoices = (response.invoices as IDataObject[]) || [];
  return wrapData(invoices);
}

/**
 * Get specific invoice details
 */
export async function get(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const invoiceId = this.getNodeParameter('invoiceId', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/invoices/${invoiceId}`,
  );
  return wrapData(response.invoice as IDataObject || response);
}
