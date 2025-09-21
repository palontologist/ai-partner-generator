# API Documentation - TeamMate Finder

## Overview

The TeamMate Finder API provides endpoints for profile management, matching algorithms, and collaboration features. All endpoints return JSON responses and use REST conventions.

## Base URL
```
Production: https://api.teammatefinder.com/v1
Development: http://localhost:3000/api/v1
```

## Authentication

### JWT Token
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### API Key (for integrations)
```http
X-API-Key: YOUR_API_KEY
```

## Core Endpoints

### User Profiles

#### Create Profile
```http
POST /profiles
Content-Type: application/json

{
  "basicInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Passionate entrepreneur",
    "location": "San Francisco, CA",
    "timezone": "America/Los_Angeles"
  },
  "categories": ["business", "travel"],
  "skills": [
    {
      "name": "JavaScript",
      "level": "expert",
      "yearsExperience": 5
    }
  ],
  "goals": [
    {
      "category": "business",
      "description": "Launch a SaaS product",
      "timeline": "6 months",
      "commitment": "full-time"
    }
  ],
  "preferences": {
    "workingStyle": "collaborative",
    "communicationStyle": "direct",
    "availability": "weekdays",
    "location": "remote"
  }
}
```

#### Get Profile
```http
GET /profiles/{profileId}
```

#### Update Profile
```http
PUT /profiles/{profileId}
```

### Matching System

#### Find Matches
```http
POST /matches/find
Content-Type: application/json

{
  "profileId": "user123",
  "category": "business",
  "filters": {
    "location": "San Francisco",
    "skills": ["marketing", "design"],
    "availability": "part-time",
    "experience": "intermediate"
  },
  "limit": 20
}
```

**Response:**
```json
{
  "matches": [
    {
      "profileId": "user456",
      "compatibilityScore": 0.92,
      "matchReasons": [
        "Complementary skills: Technical + Business",
        "Shared goal: SaaS development",
        "Compatible working styles"
      ],
      "profile": {
        "name": "Jane Smith",
        "bio": "Marketing strategist with tech background",
        "skills": ["Marketing", "Product Management"],
        "goals": ["Launch SaaS product"]
      }
    }
  ],
  "totalCount": 15,
  "hasMore": false
}
```

#### Get Match Details
```http
GET /matches/{matchId}
```

### Categories & Skills

#### Get Categories
```http
GET /categories
```

**Response:**
```json
{
  "categories": [
    {
      "id": "business",
      "name": "Business & Entrepreneurship",
      "description": "Co-founders, business partners, startup teams",
      "subcategories": [
        {
          "id": "startup",
          "name": "Startup Development",
          "requiredFields": ["businessStage", "industry", "fundingStatus"]
        }
      ]
    }
  ]
}
```

#### Get Skills by Category
```http
GET /categories/{categoryId}/skills
```

### Communication

#### Send Connection Request
```http
POST /connections/request
Content-Type: application/json

{
  "fromProfileId": "user123",
  "toProfileId": "user456",
  "message": "Hi! I'd love to collaborate on a SaaS project.",
  "category": "business"
}
```

#### Accept/Decline Connection
```http
POST /connections/{connectionId}/respond
Content-Type: application/json

{
  "action": "accept", // or "decline"
  "message": "Looking forward to working together!"
}
```

#### Get Conversations
```http
GET /conversations?profileId=user123
```

### Team Building

#### Create Team
```http
POST /teams
Content-Type: application/json

{
  "name": "SaaS Startup Team",
  "description": "Building a productivity SaaS for remote teams",
  "category": "business",
  "requiredSkills": ["Frontend Development", "Backend Development", "Marketing"],
  "maxMembers": 4,
  "goals": [
    {
      "description": "MVP launch",
      "deadline": "2024-06-01"
    }
  ]
}
```

#### Join Team
```http
POST /teams/{teamId}/join
Content-Type: application/json

{
  "profileId": "user123",
  "message": "I'd love to contribute as the frontend developer",
  "skillsOffering": ["React", "TypeScript", "UI/UX Design"]
}
```

### Analytics & Insights

#### Get Compatibility Analysis
```http
GET /analytics/compatibility?profile1=user123&profile2=user456
```

**Response:**
```json
{
  "overallCompatibility": 0.89,
  "breakdown": {
    "skillsCompatibility": 0.95,
    "goalsAlignment": 0.85,
    "workingStyleMatch": 0.92,
    "personalityFit": 0.84
  },
  "strengths": [
    "Highly complementary technical skills",
    "Shared vision for product development"
  ],
  "considerations": [
    "Different communication preferences",
    "Time zone difference of 3 hours"
  ],
  "recommendations": [
    "Schedule regular check-ins",
    "Use async communication tools"
  ]
}
```

#### Get Success Metrics
```http
GET /analytics/success?profileId=user123
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid request data
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- **Standard users**: 100 requests per hour
- **Premium users**: 1000 requests per hour
- **API integrations**: 10,000 requests per hour

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

Configure webhooks to receive real-time updates:

### Events
- `connection.requested`: New connection request
- `connection.accepted`: Connection accepted
- `match.found`: New high-compatibility match
- `team.invitation`: Team invitation received
- `message.received`: New message in conversation

### Webhook Payload
```json
{
  "event": "connection.requested",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "connectionId": "conn123",
    "fromProfile": "user456",
    "toProfile": "user123",
    "category": "business"
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @teammatefinder/sdk
```

```typescript
import { TeamMateFinderAPI } from '@teammatefinder/sdk'

const api = new TeamMateFinderAPI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.teammatefinder.com/v1'
})

const matches = await api.findMatches({
  profileId: 'user123',
  category: 'business'
})
```

### Python
```bash
pip install teammatefinder-python
```

```python
from teammatefinder import TeamMateFinderAPI

api = TeamMateFinderAPI(api_key='your-api-key')
matches = api.find_matches(
    profile_id='user123',
    category='business'
)
```

## Pagination

Use cursor-based pagination for large result sets:

```http
GET /matches/find?cursor=eyJpZCI6InVzZXI0NTYifQ&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6InVzZXI3ODkifQ",
    "hasMore": true,
    "limit": 20
  }
}
```

## Testing

### Sandbox Environment
Use the sandbox environment for testing:
```
Sandbox Base URL: https://api-sandbox.teammatefinder.com/v1
```

### Test Data
The sandbox includes sample profiles and realistic matching scenarios for testing your integration.

## Support

- **API Documentation**: [docs.teammatefinder.com](https://docs.teammatefinder.com)
- **Developer Support**: developers@teammatefinder.com
- **Status Page**: [status.teammatefinder.com](https://status.teammatefinder.com)
- **Discord**: Join our developer community

---

*Build amazing collaboration experiences with the TeamMate Finder API* 🚀