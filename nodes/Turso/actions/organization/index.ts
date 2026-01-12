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
 * List all organizations the token has access to
 */
export async function list(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
  const response = await tursoApiRequest.call(this, 'GET', '/organizations');
  const organizations = (response.organizations as IDataObject[]) || [];
  return wrapData(organizations);
}

/**
 * Get organization details
 */
export async function get(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}`,
  );
  return wrapData(response.organization as IDataObject || response);
}

/**
 * List organization members
 */
export async function listMembers(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/members`,
  );
  const members = (response.members as IDataObject[]) || [];
  return wrapData(members);
}

/**
 * Add member to organization
 */
export async function addMember(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const username = this.getNodeParameter('username', i) as string;
  const role = this.getNodeParameter('role', i) as string;

  const body = buildRequestBody({
    username,
    role,
  });

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/members`,
    body,
  );
  return wrapData(response.member as IDataObject || response);
}

/**
 * Remove member from organization
 */
export async function removeMember(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const username = this.getNodeParameter('username', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'DELETE',
    `/organizations/${organizationSlug}/members/${username}`,
  );
  return wrapData(response as IDataObject || { success: true, username });
}

/**
 * Update member role
 */
export async function updateMember(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const username = this.getNodeParameter('username', i) as string;
  const role = this.getNodeParameter('role', i) as string;

  const body = buildRequestBody({ role });

  const response = await tursoApiRequest.call(
    this,
    'PATCH',
    `/organizations/${organizationSlug}/members/${username}`,
    body,
  );
  return wrapData(response.member as IDataObject || response);
}

/**
 * List pending invitations
 */
export async function listInvites(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));

  const response = await tursoApiRequest.call(
    this,
    'GET',
    `/organizations/${organizationSlug}/invites`,
  );
  const invites = (response.invites as IDataObject[]) || [];
  return wrapData(invites);
}

/**
 * Create organization invitation
 */
export async function createInvite(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const email = this.getNodeParameter('email', i) as string;
  const role = this.getNodeParameter('role', i) as string;

  const body = buildRequestBody({
    email,
    role,
  });

  const response = await tursoApiRequest.call(
    this,
    'POST',
    `/organizations/${organizationSlug}/invites`,
    body,
  );
  return wrapData(response.invite as IDataObject || response);
}

/**
 * Delete invitation
 */
export async function deleteInvite(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const organizationSlug =
    this.getNodeParameter('organizationSlug', i, '') as string ||
    (await getOrganizationSlug(this));
  const email = this.getNodeParameter('email', i) as string;

  const response = await tursoApiRequest.call(
    this,
    'DELETE',
    `/organizations/${organizationSlug}/invites/${encodeURIComponent(email)}`,
  );
  return wrapData(response as IDataObject || { success: true, email });
}
