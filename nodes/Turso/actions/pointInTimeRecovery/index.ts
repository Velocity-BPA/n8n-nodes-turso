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
 * Create database from point-in-time backup
 */
export async function createRecovery(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const sourceDatabaseName = this.getNodeParameter('sourceDatabaseName', i) as string;
  const targetDatabaseName = this.getNodeParameter('targetDatabaseName', i) as string;
  const timestamp = this.getNodeParameter('timestamp', i) as string;
  const group = this.getNodeParameter('group', i) as string;

  const body: IDataObject = {
    name: targetDatabaseName,
    group,
    seed: {
      type: 'database',
      name: sourceDatabaseName,
      timestamp,
    },
  };

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/databases`,
    body,
  );
  return wrapData(response.database as IDataObject || response);
}
