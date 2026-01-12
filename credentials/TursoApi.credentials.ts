/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class TursoApi implements ICredentialType {
  name = 'tursoApi';
  displayName = 'Turso API';
  documentationUrl = 'https://docs.turso.tech/api-reference';
  properties: INodeProperties[] = [
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description:
        'Platform API token from Turso CLI or Dashboard. Create via: turso auth api-tokens mint {token-name}',
    },
    {
      displayName: 'Organization Slug',
      name: 'organizationSlug',
      type: 'string',
      default: 'personal',
      required: true,
      description:
        'Organization slug/name (e.g., "personal", "my-org"). Find this in your Turso Dashboard.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiToken}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.turso.tech/v1',
      url: '/auth/validate',
      method: 'GET',
    },
  };
}
