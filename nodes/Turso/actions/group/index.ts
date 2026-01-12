/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { tursoApiRequest, getOrganizationSlug } from '../../transport';
import { wrapData, buildRequestBody } from '../../utils';

/**
 * List all groups in organization
 */
export async function list(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/groups`,
  );
  const groups = (response.groups as IDataObject[]) || [];
  return wrapData(groups);
}

/**
 * Create a new group
 */
export async function create(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const groupName = this.getNodeParameter('groupName', i) as string;
  const location = this.getNodeParameter('location', i) as string;
  const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

  const body: IDataObject = {
    name: groupName,
    location,
  };

  if (additionalFields.extensions) {
    body.extensions = additionalFields.extensions;
  }

  if (additionalFields.version) {
    body.version = additionalFields.version;
  }

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/groups`,
    body,
  );
  return wrapData(response.group as IDataObject || response);
}

/**
 * Get group details
 */
export async function get(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const groupName = this.getNodeParameter('groupName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/groups/${groupName}`,
  );
  return wrapData(response.group as IDataObject || response);
}

/**
 * Delete a group
 */
export async function deleteGroup(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const groupName = this.getNodeParameter('groupName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'DELETE',
    `/organizations/${organizationSlug}/groups/${groupName}`,
  );
  return wrapData(response as IDataObject || { success: true, groupName });
}

/**
 * Add a location to a group
 */
export async function addLocation(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const groupName = this.getNodeParameter('groupName', i) as string;
  const location = this.getNodeParameter('location', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/groups/${groupName}/locations/${location}`,
  );
  return wrapData(response.group as IDataObject || response);
}

/**
 * Remove a location from a group
 */
export async function removeLocation(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const groupName = this.getNodeParameter('groupName', i) as string;
  const location = this.getNodeParameter('location', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'DELETE',
    `/organizations/${organizationSlug}/groups/${groupName}/locations/${location}`,
  );
  return wrapData(response.group as IDataObject || response);
}

/**
 * Transfer group to another organization
 */
export async function transfer(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const groupName = this.getNodeParameter('groupName', i) as string;
  const targetOrganization = this.getNodeParameter('targetOrganization', i) as string;

  const body = buildRequestBody({
    organization: targetOrganization,
  });

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/groups/${groupName}/transfer`,
    body,
  );
  return wrapData(response.group as IDataObject || response);
}

/**
 * Unarchive a group
 */
export async function unarchive(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const groupName = this.getNodeParameter('groupName', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/groups/${groupName}/unarchive`,
  );
  return wrapData(response.group as IDataObject || response);
}

/**
 * Update group
 */
export async function update(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const groupName = this.getNodeParameter('groupName', i) as string;
  const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

  const body = buildRequestBody(updateFields);

  const response = await tursoApiRequest.call(
    this,
    'PATCH',
    `/organizations/${organizationSlug}/groups/${groupName}`,
    body,
  );
  return wrapData(response.group as IDataObject || response);
}
