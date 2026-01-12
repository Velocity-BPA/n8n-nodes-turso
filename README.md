# n8n-nodes-turso

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Turso, the distributed SQLite database platform powered by libSQL. Automate database management, group operations, token management, and organization administration through Turso's Platform REST API.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **12 Resource Categories** with 50+ operations
- **Organization Management** - List organizations, manage members, handle invitations
- **Group Operations** - Create, manage, and replicate database groups across locations
- **Database Management** - Full CRUD operations with seeding and branching support
- **Token Management** - Database tokens, API tokens, and group tokens with fine-grained permissions
- **Location Management** - List and select from 29 global edge locations
- **Audit Logs & Invoices** - Track activity and manage billing
- **Schema Databases** - Database branching for development workflows
- **Point-in-Time Recovery** - Restore databases from any timestamp
- **Statistics & Analytics** - Usage stats, top queries, and range analytics
- **Trigger Node** - Polling-based event detection for databases, groups, and members

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-turso`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-turso

# Restart n8n
```

### Development Installation

```bash
# Clone or extract the package
cd n8n-nodes-turso

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-turso

# Restart n8n
```

## Credentials Setup

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| API Token | string | Yes | Platform API token from Turso CLI or Dashboard |
| Organization Slug | string | Yes | Organization identifier (e.g., "personal", "my-org") |

### Getting Your API Token

1. **Via Turso CLI:**
   ```bash
   # Install Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Authenticate
   turso auth login
   
   # Create API token
   turso auth api-tokens mint my-n8n-token
   ```

2. **Via Dashboard:**
   - Go to Turso Dashboard > Account Settings > API Tokens
   - Click "Create Token"
   - Copy the generated token

### Getting Your Organization Slug

```bash
# List your organizations
turso org list
```

Or find it in your Turso Dashboard URL: `https://turso.tech/app/{organization-slug}/...`

## Resources & Operations

### Organization

| Operation | Description |
|-----------|-------------|
| List | List all organizations |
| Get | Get organization details |
| List Members | List organization members |
| Add Member | Add member to organization |
| Remove Member | Remove member from organization |
| Update Member | Update member role |
| List Invites | List pending invitations |
| Create Invite | Create organization invitation |
| Delete Invite | Delete pending invitation |

### Group

| Operation | Description |
|-----------|-------------|
| List | List all groups |
| Create | Create a new group |
| Get | Get group details |
| Delete | Delete a group |
| Add Location | Add a location to group |
| Remove Location | Remove location from group |
| Transfer | Transfer group to another organization |
| Unarchive | Unarchive a group |
| Update | Update group settings |

### Database

| Operation | Description |
|-----------|-------------|
| List | List all databases |
| Create | Create a new database |
| Get | Get database details |
| Delete | Delete a database |
| List Instances | List database instances (replicas) |
| Get Instance | Get instance details |
| Get Usage | Get database usage statistics |
| Update Version | Update libSQL version |
| Create From Seed | Create from dump or another database |
| Update | Update database settings |
| Get Configuration | Get database configuration |

### Database Token

| Operation | Description |
|-----------|-------------|
| List | List tokens for a database |
| Create | Create a new auth token |
| Validate | Validate a token |
| Revoke All | Revoke all tokens |

### Location

| Operation | Description |
|-----------|-------------|
| List | List all 29 available locations |
| Get Closest | Get closest location to client |

### API Token

| Operation | Description |
|-----------|-------------|
| List | List all platform API tokens |
| Create | Create a new API token |
| Validate | Validate current token |
| Revoke | Revoke an API token |

### Audit Log

| Operation | Description |
|-----------|-------------|
| List | List audit logs with pagination |

### Invoice

| Operation | Description |
|-----------|-------------|
| List | List organization invoices |
| Get | Get specific invoice details |

### Group Token

| Operation | Description |
|-----------|-------------|
| Create | Create token for all databases in group |
| Invalidate | Invalidate all group tokens |

### Database Statistics

| Operation | Description |
|-----------|-------------|
| Get Usage | Get database usage stats |
| Get Top Queries | Get top queries by metrics |
| Get Range Stats | Get statistics over time range |

### Schema Database (Branching)

| Operation | Description |
|-----------|-------------|
| Create | Create a schema database |
| List Children | List databases using this schema |
| Create Child | Create a child database from schema |

### Point-in-Time Recovery

| Operation | Description |
|-----------|-------------|
| Create Recovery | Create database from point-in-time backup |

## Trigger Node

The Turso Trigger node uses polling to detect changes:

| Event | Description |
|-------|-------------|
| database.created | New database created |
| database.deleted | Database deleted |
| group.created | New group created |
| group.deleted | Group deleted |
| member.added | Member added to organization |
| member.removed | Member removed from organization |

## Usage Examples

### Create a Database

```json
{
  "resource": "database",
  "operation": "create",
  "databaseName": "my-app-db",
  "groupName": "default"
}
```

### Create Database with Size Limit

```json
{
  "resource": "database",
  "operation": "create",
  "databaseName": "limited-db",
  "groupName": "default",
  "sizeLimit": "1gb"
}
```

### Create Database Token

```json
{
  "resource": "databaseToken",
  "operation": "create",
  "databaseName": "my-app-db",
  "authorization": "read-only",
  "expiration": "1w"
}
```

### Create Multi-Region Group

```json
{
  "resource": "group",
  "operation": "create",
  "groupName": "global-group",
  "location": "lhr",
  "extensions": ["vector", "fts5"]
}
```

### Add Location to Group

```json
{
  "resource": "group",
  "operation": "addLocation",
  "groupName": "global-group",
  "location": "sin"
}
```

## Turso Concepts

### Groups
Groups are collections of databases that share the same geographic locations. When you add a location to a group, all databases in that group get replicas in that location.

### Locations
Turso offers 29 global edge locations:

| Code | Location | Code | Location |
|------|----------|------|----------|
| ams | Amsterdam | mad | Madrid |
| iad | Ashburn | mia | Miami |
| bog | Bogotá | bom | Mumbai |
| bos | Boston | cdg | Paris |
| ord | Chicago | phx | Phoenix |
| dfw | Dallas | gig | Rio de Janeiro |
| den | Denver | sjc | San Jose |
| fra | Frankfurt | scl | Santiago |
| gdl | Guadalajara | gru | São Paulo |
| hkg | Hong Kong | sea | Seattle |
| jnb | Johannesburg | sin | Singapore |
| lhr | London | arn | Stockholm |
| lax | Los Angeles | syd | Sydney |
| nrt | Tokyo | yyz | Toronto |
| waw | Warsaw | | |

### Schema Databases (Branching)
Schema databases enable Git-like branching for databases. Create a schema database, then create child databases that inherit its schema for development and testing workflows.

### SQLite Extensions
Enable additional SQLite functionality:
- `vector` - Vector similarity search
- `fts5` - Full-text search
- `uuid` - UUID generation
- `crypto` - Cryptographic functions
- `fuzzy` - Fuzzy string matching
- `math` - Advanced math functions
- `stats` - Statistical functions
- `regexp` - Regular expressions
- `unicode` - Unicode support

## Error Handling

The node handles common API errors:

| Status | Description | Action |
|--------|-------------|--------|
| 400 | Bad Request | Check parameter values |
| 401 | Unauthorized | Verify API token |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource exists |
| 409 | Conflict | Resource already exists |
| 429 | Rate Limited | Automatic retry with backoff |
| 500 | Server Error | Retry or contact support |

## Security Best Practices

1. **Use Environment Variables** - Store API tokens in n8n credentials, never hardcode
2. **Minimal Permissions** - Create tokens with only required permissions
3. **Token Rotation** - Regularly rotate API and database tokens
4. **Audit Logs** - Monitor audit logs for suspicious activity
5. **Read-Only Tokens** - Use read-only tokens when write access isn't needed

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-turso/issues)
- **Documentation**: [Turso Docs](https://docs.turso.tech)
- **API Reference**: [Turso Platform API](https://docs.turso.tech/api-reference)

## Acknowledgments

- [Turso](https://turso.tech) - The distributed SQLite platform
- [libSQL](https://github.com/tursodatabase/libsql) - Open source SQLite fork
- [n8n](https://n8n.io) - Workflow automation platform
