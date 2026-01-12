/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { tursoApiRequest, tursoApiRequestAllItems, getOrganizationSlug } from '../../transport';
import { wrapData } from '../../utils';

/**
 * List audit logs for organization
 */
export async function list(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
  const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

  const query: IDataObject = {};

  if (filters.page) {
    query.page = filters.page;
  }

  if (filters.perPage) {
    query.per_page = filters.perPage;
  }

  if (returnAll) {
    const auditLogs = await tursoApiRequestAllItems.call(
      this,
      'GET',
      `/organizations/${organizationSlug}/audit-logs`,
      'audit_logs',
      undefined,
      query,
    );
    return wrapData(auditLogs);
  }

  const limit = this.getNodeParameter('limit', i, 50) as number;
  query.per_page = limit;

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/audit-logs`,
    undefined,
    query,
  );
  const auditLogs = (response.audit_logs as IDataObject[]) || [];
  return wrapData(auditLogs);
}
