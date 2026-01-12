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
 * List all available locations
 */
export async function list(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
  const response = await tursoApiRequest.call(this, 'GET', '/locations');
  const locations = response.locations as IDataObject;
  
  // Convert locations object to array format for easier processing
  if (locations && typeof locations === 'object') {
    const locationArray = Object.entries(locations).map(([code, name]) => ({
      code,
      name,
    }));
    return wrapData(locationArray);
  }
  
  return wrapData([]);
}

/**
 * Get closest location to client
 */
export async function getClosest(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
  const response = await tursoApiRequest.call(this, 'GET', '/locations/closest');
  return wrapData(response as IDataObject);
}
