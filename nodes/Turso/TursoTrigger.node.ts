/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IDataObject,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IPollFunctions,
} from 'n8n-workflow';

import { tursoApiRequest, emitLicenseNotice, getOrganizationSlug } from './transport';
import { POLLING_EVENTS } from './constants';
import { detectChanges } from './utils';

export class TursoTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Turso Trigger',
    name: 'tursoTrigger',
    icon: 'file:turso.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Starts workflow when Turso events occur',
    defaults: {
      name: 'Turso Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'tursoApi',
        required: true,
      },
    ],
    polling: true,
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        options: POLLING_EVENTS,
        default: 'database.created',
        description: 'Event to watch for',
      },
      {
        displayName: 'Organization Slug',
        name: 'organizationSlug',
        type: 'string',
        default: '',
        description: 'Organization slug. Leave empty to use the one from credentials.',
      },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    emitLicenseNotice(this);

    const event = this.getNodeParameter('event') as string;
    const organizationSlugParam = this.getNodeParameter('organizationSlug', '') as string;
    const organizationSlug = organizationSlugParam || (await getOrganizationSlug(this));

    const staticData = this.getWorkflowStaticData('node') as IDataObject;

    const events: INodeExecutionData[] = [];

    switch (event) {
      case 'database.created':
      case 'database.deleted': {
        const response = await tursoApiRequest.call(
          this,
          'GET',
          `/organizations/${organizationSlug}/databases`,
        );

        const databases = (response.databases as IDataObject[]) || [];
        const currentDatabaseNames = databases.map((d) => d.Name as string);
        const previousDatabaseNames = (staticData.databases as string[]) || [];

        if (previousDatabaseNames.length > 0) {
          const { added, removed } = detectChanges(previousDatabaseNames, currentDatabaseNames);

          if (event === 'database.created') {
            for (const name of added) {
              const dbDetails = databases.find((d) => d.Name === name);
              events.push({
                json: {
                  event: 'database.created',
                  database: dbDetails || { Name: name },
                  timestamp: new Date().toISOString(),
                },
              });
            }
          }

          if (event === 'database.deleted') {
            for (const name of removed) {
              events.push({
                json: {
                  event: 'database.deleted',
                  databaseName: name,
                  timestamp: new Date().toISOString(),
                },
              });
            }
          }
        }

        staticData.databases = currentDatabaseNames;
        break;
      }

      case 'group.created':
      case 'group.deleted': {
        const response = await tursoApiRequest.call(
          this,
          'GET',
          `/organizations/${organizationSlug}/groups`,
        );

        const groups = (response.groups as IDataObject[]) || [];
        const currentGroupNames = groups.map((g) => g.name as string);
        const previousGroupNames = (staticData.groups as string[]) || [];

        if (previousGroupNames.length > 0) {
          const { added, removed } = detectChanges(previousGroupNames, currentGroupNames);

          if (event === 'group.created') {
            for (const name of added) {
              const groupDetails = groups.find((g) => g.name === name);
              events.push({
                json: {
                  event: 'group.created',
                  group: groupDetails || { name },
                  timestamp: new Date().toISOString(),
                },
              });
            }
          }

          if (event === 'group.deleted') {
            for (const name of removed) {
              events.push({
                json: {
                  event: 'group.deleted',
                  groupName: name,
                  timestamp: new Date().toISOString(),
                },
              });
            }
          }
        }

        staticData.groups = currentGroupNames;
        break;
      }

      case 'member.added':
      case 'member.removed': {
        const response = await tursoApiRequest.call(
          this,
          'GET',
          `/organizations/${organizationSlug}/members`,
        );

        const members = (response.members as IDataObject[]) || [];
        const currentMemberNames = members.map((m) => m.username as string);
        const previousMemberNames = (staticData.members as string[]) || [];

        if (previousMemberNames.length > 0) {
          const { added, removed } = detectChanges(previousMemberNames, currentMemberNames);

          if (event === 'member.added') {
            for (const username of added) {
              const memberDetails = members.find((m) => m.username === username);
              events.push({
                json: {
                  event: 'member.added',
                  member: memberDetails || { username },
                  timestamp: new Date().toISOString(),
                },
              });
            }
          }

          if (event === 'member.removed') {
            for (const username of removed) {
              events.push({
                json: {
                  event: 'member.removed',
                  username,
                  timestamp: new Date().toISOString(),
                },
              });
            }
          }
        }

        staticData.members = currentMemberNames;
        break;
      }
    }

    staticData.lastPoll = new Date().toISOString();

    if (events.length > 0) {
      return [events];
    }

    return null;
  }
}
