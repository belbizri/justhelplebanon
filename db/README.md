# MongoDB Setup Documentation

## Overview

This project uses MongoDB Atlas for data persistence. The database layer is built with professional infrastructure including:

- **Connection Management**: Singleton pattern for MongoDB connection management
- **Repository Pattern**: Clean separation of concerns with dedicated data access layers
- **Service Layer**: Business logic orchestration
- **Schema Validation**: Mongoose schemas with validation rules
- **Error Handling**: Comprehensive error handling and connection resilience

## Directory Structure

```
db/
├── database.js                 # MongoDB connection manager (singleton)
├── models/                     # Mongoose schemas
│   ├── User.js                 # User schema
│   ├── Donation.js             # Donation schema
│   └── Organization.js         # Organization schema
├── repositories/               # Data access layer
│   ├── BaseRepository.js        # Base class with CRUD operations
│   ├── UserRepository.js        # User-specific data access
│   ├── DonationRepository.js    # Donation-specific data access with analytics
│   └── OrganizationRepository.js # Organization-specific data access
├── services/                   # Business logic layer
│   └── DataService.js          # Service orchestration
└── routes/                     # API endpoints
    └── api.js                  # Express API routes
```

## Setup Instructions

### 1. Environment Variables

Create or update `.env` file with your MongoDB credentials:

```env
MONGODB_URI=mongodb+srv://basselbizri_db_user:s0yDBBckAY2QMT4R@cluster0.majgmas.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=justhelplebanon
NODE_ENV=development
PORT=3000
```

### 2. Initialize Database Connection

In your `server.js`, initialize the database connection:

```javascript
import dbConnection from './db/database.js';

// Connect to MongoDB at startup
await dbConnection.connect();

// Check database health
const health = await dbConnection.healthCheck();
console.log('Database health:', health);
```

### 3. Use Data Services in Routes

```javascript
import { organizationService, donationService } from './db/services/DataService.js';

// Get all organizations
app.get('/api/organizations', async (req, res) => {
  const orgs = await organizationService.getAllOrganizations();
  res.json(orgs);
});

// Record a donation
app.post('/api/donations', async (req, res) => {
  const donation = await donationService.recordDonation(req.body);
  res.json(donation);
});
```

## Database Collections

### Users Collection

Stores user information with roles and activity status.

**Fields:**
- `email` (String, unique, required)
- `firstName` (String)
- `lastName` (String)
- `phone` (String)
- `country` (String)
- `isActive` (Boolean, default: true)
- `roles` (Array: 'user', 'admin', 'moderator')
- `createdAt`, `updatedAt` (timestamps)

**Queries:**
```javascript
// Find user by email
const user = await userRepository.findByEmail('user@example.com');

// Get all active users
const active = await userRepository.getActiveUsers();

// Search users
const results = await userRepository.search('john');
```

### Donations Collection

Records all donations with transaction tracking and analytics.

**Fields:**
- `donor` (Object: email, firstName, lastName, country)
- `organization` (Object: name, slug, category)
- `amount` (Number)
- `currency` (String, default: 'USD')
- `transactionId` (String, unique)
- `paymentMethod` (String: 'credit_card', 'paypal', 'bank_transfer', 'other')
- `status` (String: 'pending', 'completed', 'failed', 'refunded')
- `notes` (String)
- `metadata` (Object)
- `createdAt`, `updatedAt` (timestamps)

**Queries:**
```javascript
// Get donations for organization
const orgDonations = await donationRepository.findByOrganization('red-crescent');

// Get total by organization
const stats = await donationRepository.getTotalByOrganization('red-crescent');
// Returns: { total: 50000, count: 150, average: 333.33 }

// Get overall statistics
const overall = await donationRepository.getStatistics();
// Returns: { totalAmount, totalDonations, averageDonation, uniqueDonorCount, ... }

// Get top donors
const topDonors = await donationRepository.getTopDonors(10);

// Get donation timeline (last 30 days)
const timeline = await donationRepository.getDonationTimeline(30);
```

### Organizations Collection

Stores organization/NGO information with donation statistics.

**Fields:**
- `name` (String, unique)
- `slug` (String, unique)
- `category` (String)
- `description` (String)
- `website` (String)
- `logo` (String)
- `featured` (Boolean)
- `verified` (Boolean)
- `stats` (Object)
  - `totalDonations` (Number)
  - `donorCount` (Number)
  - `totalAmount` (Number)
- `socialLinks` (Object: instagram, facebook, twitter, whatsapp)
- `contact` (Object: email, phone)
- `metadata` (Object)
- `createdAt`, `updatedAt` (timestamps)

**Queries:**
```javascript
// Find by slug
const org = await organizationRepository.findBySlug('lebanese-red-cross');

// Get featured organizations
const featured = await organizationRepository.getFeatured();

// Get by category
const medical = await organizationRepository.findByCategory('Food & Medical Aid');

// Search
const results = await organizationRepository.search('red cross');

// Top organizations by donations
const top = await organizationRepository.getTopByDonations(10);

// Update donation stats
await organizationRepository.addDonation('red-crescent', 500);
```

## API Endpoints

### Organizations
- `GET /api/organizations` - List all organizations
- `GET /api/organizations/featured` - Get featured organizations
- `GET /api/organizations/top` - Get top organizations by donations
- `GET /api/organizations/search?q=query` - Search organizations
- `GET /api/organizations/:slug` - Get specific organization

### Donations
- `POST /api/donations` - Record a new donation
- `GET /api/donations/organization/:slug` - Get donations for organization
- `GET /api/donations/stats/overall` - Get overall statistics
- `GET /api/donations/stats/timeline?days=30` - Get donation timeline
- `GET /api/donations/top-donors?limit=10` - Get top donors

### Health
- `GET /api/health` - Check API and database health

## Service Layer Usage

### Organization Service

```javascript
import { organizationService } from './db/services/DataService.js';

// Get all organizations with pagination
const orgs = await organizationService.getAllOrganizations({
  limit: 50,
  skip: 0,
});

// Get by slug
const org = await organizationService.getOrganizationBySlug('red-crescent');

// Get featured
const featured = await organizationService.getFeaturedOrganizations();

// Search
const results = await organizationService.searchOrganizations('food');

// Get statistics
const stats = await organizationService.getStatistics();

// Get grouped by category
const byCategory = await organizationService.getGroupedByCategory();
```

### Donation Service

```javascript
import { donationService } from './db/services/DataService.js';

// Record donation
const donation = await donationService.recordDonation({
  donor: {
    email: 'donor@example.com',
    firstName: 'John',
    lastName: 'Doe',
    country: 'USA'
  },
  organization: {
    name: 'Lebanese Red Cross',
    slug: 'lebanese-red-cross',
    category: 'Food & Medical Aid'
  },
  amount: 100,
  currency: 'USD',
  paymentMethod: 'credit_card'
});

// Get organization stats
const stats = await donationService.getOrganizationStats('red-crescent');

// Get overall stats
const overall = await donationService.getOverallStats();

// Get top donors
const topDonors = await donationService.getTopDonors(10);

// Get timeline
const timeline = await donationService.getDonationTimeline(30);
```

### User Service

```javascript
import { userService } from './db/services/DataService.js';

// Create user
const user = await userService.createUser({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  country: 'USA'
});

// Get by email
const user = await userService.getUserByEmail('user@example.com');

// Update user
const updated = await userService.updateUser(userId, {
  firstName: 'Jane'
});

// Delete user
await userService.deleteUser(userId);
```

## Connection Management

### Connect to Database

```javascript
import dbConnection from './db/database.js';

try {
  await dbConnection.connect();
  console.log('Connected to MongoDB');
} catch (error) {
  console.error('Failed to connect:', error);
  process.exit(1);
}
```

### Check Connection Status

```javascript
const status = dbConnection.getStatus();
console.log(status);
// Output: {
//   isConnected: true,
//   readyState: 1,
//   db: 'justhelplebanon',
//   host: 'cluster0.majgmas.mongodb.net'
// }
```

### Health Check

```javascript
const health = await dbConnection.healthCheck();
console.log(health);
// Output: { healthy: true, message: 'MongoDB is responsive' }
```

### Disconnect

```javascript
import dbConnection from './db/database.js';

// Graceful shutdown
process.on('SIGINT', async () => {
  await dbConnection.disconnect();
  process.exit(0);
});
```

## Error Handling

All repository operations include error handling:

```javascript
try {
  const org = await organizationRepository.findBySlug('invalid');
} catch (error) {
  console.error('Error:', error.message);
  // Handle error appropriately
}
```

## Connection Pooling

MongoDB connection is configured with:
- **maxPoolSize**: 10
- **minPoolSize**: 5
- **socketTimeoutMS**: 45000
- **serverSelectionTimeoutMS**: 5000
- **socketKeepAliveMS**: 30000

This ensures optimal performance with automatic reconnection handling.

## Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use environment variables** - All credentials should be environment-based
3. **Database User Permissions** - The user `basselbizri_db_user` has atlasAdmin permissions
4. **IP Whitelist** - MongoDB Atlas IP access list is configured (72.53.112.100)
5. **Connection String Security** - Password is URL-encoded in the connection string

## Monitoring

Monitor your MongoDB cluster at:
- **MongoDB Atlas Dashboard**: https://cloud.mongodb.com/
- **Project**: justhelplebanon
- **Cluster**: Cluster0

## Troubleshooting

### Connection Failed
- Check `.env` file has correct credentials
- Verify IP address is whitelisted in MongoDB Atlas
- Check network connectivity

### Slow Queries
- Review indexes (created on frequently queried fields)
- Use `getStatistics()` and `getDonationTimeline()` for insights
- Monitor cluster performance in Atlas dashboard

### Memory Issues
- Connection pool sizes may need adjustment
- Monitor active connections in Atlas dashboard
- Consider query optimization

## Next Steps

1. Update `server.js` to initialize database connection
2. Import and use API routes from `db/routes/api.js`
3. Create additional models and repositories as needed
4. Implement authentication and authorization
5. Set up logging and monitoring
