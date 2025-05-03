# Tukio API Documentation

## Overview

Tukio is a comprehensive campus event management and scheduling platform built with a microservices architecture. This document provides API documentation for all microservices to help with frontend integration.

## Base URL

All API requests should be routed through the API Gateway:

```
http://localhost:8080
```

## Authentication

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/validate` | Validate a JWT token |

### Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "department": "string (optional)",
  "studentId": "string (optional)",
  "graduationYear": "number (optional)",
  "interests": ["string"] (optional)
}
```

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "profilePictureUrl": "string (optional)",
  "bio": "string (optional)",
  "department": "string (optional)",
  "studentId": "string (optional)",
  "graduationYear": "number (optional)",
  "roles": ["string"],
  "interests": ["string"],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "tokenType": "Bearer",
  "userId": "number",
  "username": "string",
  "email": "string",
  "roles": ["string"],
  "expiresIn": "number"
}
```

### Making Authenticated Requests

For all protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

## User Service

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (admin only) |
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/users/me` | Get current user |
| GET | `/api/users/profile/{id}` | Get user public profile |
| GET | `/api/users/search?keyword={keyword}` | Search users by keyword |
| GET | `/api/users/interests?interests={interests}` | Get users by interests |
| PUT | `/api/users/{id}` | Update user |
| PUT | `/api/users/{id}/password` | Change password |
| PUT | `/api/users/{id}/interests` | Update user interests |
| PUT | `/api/users/{userId}/roles/add/{roleName}` | Add role to user (admin only) |
| PUT | `/api/users/{userId}/roles/remove/{roleName}` | Remove role from user (admin only) |
| DELETE | `/api/users/{id}` | Delete user |

### Get User Profile

**Endpoint:** `GET /api/users/profile/{id}`

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "profilePictureUrl": "string (optional)",
  "bio": "string (optional)",
  "department": "string (optional)",
  "graduationYear": "number (optional)",
  "interests": ["string"]
}
```

### Update User

**Endpoint:** `PUT /api/users/{id}`

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "profilePictureUrl": "string (optional)",
  "bio": "string (optional)",
  "department": "string (optional)",
  "graduationYear": "number (optional)",
  "interests": ["string (optional)"]
}
```

**Response:** Updated user DTO (same as register response)

## Venue Service

### Venue Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/venues` | Get all venues |
| GET | `/api/venues/{id}` | Get venue by ID |
| POST | `/api/venues` | Create a venue |
| PUT | `/api/venues/{id}` | Update a venue |
| DELETE | `/api/venues/{id}` | Delete a venue |
| GET | `/api/venues/available` | Find available venues |
| GET | `/api/venues/{id}/schedule` | Get venue schedule |
| GET | `/api/venues/{id}/availability` | Check venue availability |
| POST | `/api/venues/allocate` | Allocate a venue for an event |
| DELETE | `/api/venues/bookings/event/{eventId}` | Cancel venue booking |

### Get All Venues

**Endpoint:** `GET /api/venues`

**Response:**
```json
[
  {
    "id": "number",
    "name": "string",
    "location": "string",
    "capacity": "number",
    "type": "string (enum: CLASSROOM, LECTURE_HALL, AUDITORIUM, etc.)",
    "description": "string (optional)",
    "availabilityStatus": "boolean",
    "amenities": ["string"],
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

### Create Venue

**Endpoint:** `POST /api/venues`

**Request Body:**
```json
{
  "name": "string",
  "location": "string",
  "capacity": "number",
  "type": "string (enum: CLASSROOM, LECTURE_HALL, etc.)",
  "description": "string (optional)",
  "amenities": ["string"]
}
```

**Response:** VenueDTO (same format as in Get All Venues)

### Find Available Venues

**Endpoint:** `GET /api/venues/available`

**Request Body:**
```json
{
  "startTime": "datetime",
  "endTime": "datetime",
  "minCapacity": "number (optional)",
  "venueType": "string (optional)",
  "requiredAmenities": ["string (optional)"],
  "location": "string (optional)"
}
```

**Response:** Array of VenueDTO objects

### Allocate Venue

**Endpoint:** `POST /api/venues/allocate`

**Request Body:**
```json
{
  "eventId": "number",
  "eventName": "string",
  "startTime": "datetime",
  "endTime": "datetime",
  "attendeeCount": "number",
  "requiredAmenities": ["string (optional)"],
  "preferredVenueType": "string (optional)",
  "preferredLocation": "string (optional)",
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "success": "boolean",
  "venueId": "number (optional)",
  "venueName": "string (optional)",
  "message": "string"
}
```

## Event Service

### Event Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/events/{id}` | Get event by ID |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/{id}` | Update an event |
| DELETE | `/api/events/{id}` | Delete an event |
| GET | `/api/events/search` | Search events |
| GET | `/api/events/upcoming` | Get upcoming events |
| GET | `/api/events/organizer/{organizerId}` | Get events by organizer |
| GET | `/api/events/category/{categoryId}` | Get events by category |
| POST | `/api/events/{id}/allocate-venue` | Allocate venue for event |
| GET | `/api/events/{id}/summary` | Get event summary |

### Get All Events

**Endpoint:** `GET /api/events`

**Response:**
```json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "categoryId": "number",
    "categoryName": "string",
    "startTime": "datetime",
    "endTime": "datetime",
    "location": "string",
    "venueId": "number (optional)",
    "venueName": "string (optional)",
    "maxParticipants": "number",
    "organizer": "string",
    "organizerId": "number",
    "imageUrl": "string (optional)",
    "tags": ["string"],
    "status": "string (enum: SCHEDULED, RESCHEDULED, CANCELLED, etc.)",
    "currentRegistrations": "number",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

### Create Event

**Endpoint:** `POST /api/events`

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "categoryId": "number",
  "startTime": "datetime",
  "endTime": "datetime",
  "location": "string",
  "venueId": "number (optional)",
  "maxParticipants": "number",
  "organizer": "string",
  "organizerId": "number",
  "imageUrl": "string (optional)",
  "tags": ["string (optional)"]
}
```

**Response:** EventDTO (same format as in Get All Events)

### Search Events

**Endpoint:** `GET /api/events/search`

**Query Parameters:**
- `categoryId` (optional): Filter by category ID
- `keyword` (optional): Search in title and description
- `startFrom` (optional): Start time lower bound
- `startTo` (optional): Start time upper bound
- `tags` (optional): Filter by tags
- `status` (optional): Filter by status

**Response:** Array of EventDTO objects

### Event Category Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/event-categories` | Get all categories |
| GET | `/api/event-categories/{id}` | Get category by ID |
| POST | `/api/event-categories` | Create a category |
| PUT | `/api/event-categories/{id}` | Update a category |
| DELETE | `/api/event-categories/{id}` | Delete a category |

### Event Registration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/event-registrations` | Get all registrations |
| GET | `/api/event-registrations/{id}` | Get registration by ID |
| GET | `/api/event-registrations/event/{eventId}` | Get registrations by event |
| GET | `/api/event-registrations/user/{userId}` | Get registrations by user |
| GET | `/api/event-registrations/user/{userId}/upcoming` | Get user's upcoming events |
| GET | `/api/event-registrations/user/{userId}/past` | Get user's past events |
| POST | `/api/event-registrations/register` | Register for event |
| PUT | `/api/event-registrations/{id}` | Update registration |
| PUT | `/api/event-registrations/{id}/cancel` | Cancel registration |
| POST | `/api/event-registrations/event/{eventId}/user/{userId}/check-in` | Check in attendee |
| POST | `/api/event-registrations/event/{eventId}/user/{userId}/feedback` | Submit feedback |

### Register For Event

**Endpoint:** `POST /api/event-registrations/register`

**Request Body:**
```json
{
  "eventId": "number",
  "userId": "number",
  "userName": "string",
  "userEmail": "string"
}
```

**Response:**
```json
{
  "id": "number",
  "eventId": "number",
  "eventTitle": "string",
  "userId": "number",
  "userName": "string",
  "userEmail": "string",
  "status": "string",
  "checkInTime": "datetime (optional)",
  "feedback": "string (optional)",
  "rating": "number (optional)",
  "registrationTime": "datetime"
}
```

## Recommendation Service

### Recommendation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recommendations` | Get recommendations |
| GET | `/api/recommendations/user/{userId}` | Get recommendations for user |
| GET | `/api/recommendations/user/{userId}/personalized` | Get personalized recommendations |
| GET | `/api/recommendations/user/{userId}/similar` | Get similar events recommendations |
| GET | `/api/recommendations/popular` | Get popular events recommendations |
| GET | `/api/recommendations/trending` | Get trending events recommendations |
| GET | `/api/recommendations/user/{userId}/location` | Get location-based recommendations |
| GET | `/api/recommendations/user/{userId}/time` | Get time-based recommendations |

### Get Recommendations

**Endpoint:** `POST /api/recommendations`

**Request Body:**
```json
{
  "userId": "number",
  "count": "number",
  "includeUpcoming": "boolean",
  "includePast": "boolean",
  "includeSimilarEvents": "boolean",
  "includePopularEvents": "boolean",
  "includePersonalizedRecommendations": "boolean"
}
```

**Response:**
```json
{
  "userId": "number",
  "upcomingRecommendations": [
    {
      "eventId": "number",
      "title": "string",
      "description": "string",
      "categoryId": "number",
      "categoryName": "string",
      "startTime": "datetime",
      "location": "string",
      "venueId": "number (optional)",
      "venueName": "string (optional)",
      "imageUrl": "string (optional)",
      "tags": ["string"],
      "registrationCount": "number",
      "recommendationType": "string (enum: PERSONALIZED, SIMILAR_EVENTS, POPULAR, etc.)",
      "similarityScore": "number (optional)"
    }
  ],
  "pastRecommendations": [],
  "recommendationTimestamp": "datetime",
  "totalRecommendations": "number"
}
```

### User Activity Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/activities` | Record user activity |
| GET | `/api/activities/user/{userId}` | Get user activities |
| GET | `/api/activities/user/{userId}/type/{activityType}` | Get user activities by type |
| GET | `/api/activities/event/{eventId}` | Get event activities |
| GET | `/api/activities/event/{eventId}/type/{activityType}` | Get event activities by type |
| GET | `/api/activities/event/{eventId}/rating` | Get event average rating |
| GET | `/api/activities/popular` | Get popular events |
| GET | `/api/activities/trending` | Get trending events |

### Record User Activity

**Endpoint:** `POST /api/activities`

**Request Body:**
```json
{
  "userId": "number",
  "eventId": "number",
  "activityType": "string (enum: VIEW, REGISTER, ATTEND, RATE, SHARE, FAVORITE, CANCEL)",
  "rating": "number (optional)",
  "viewDuration": "number (optional)"
}
```

### User Preference Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/preferences/user/{userId}` | Get user preferences |
| GET | `/api/preferences/user/{userId}/category/{categoryId}` | Get user preference for category |
| PUT | `/api/preferences` | Update user preference |
| GET | `/api/preferences/user/{userId}/tags` | Get user preferences by tags |
| GET | `/api/preferences/user/{userId}/categories` | Get favorite categories |
| GET | `/api/preferences/user/{userId}/similar-users` | Find similar users |
| POST | `/api/preferences/user/{userId}/analyze` | Update preferences based on activity |

## Gamification Service

### Gamification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gamification/profile/{userId}` | Get user gamification profile |
| POST | `/api/gamification/activity` | Process activity event |
| POST | `/api/gamification/events/{eventId}/register` | Record event registration |
| POST | `/api/gamification/events/{eventId}/attend` | Record event attendance |
| POST | `/api/gamification/events/{eventId}/rate` | Record event rating |
| POST | `/api/gamification/events/{eventId}/share` | Record event sharing |
| GET | `/api/gamification/leaderboards` | Get leaderboards |
| GET | `/api/gamification/leaderboards/{leaderboardId}` | Get leaderboard |
| GET | `/api/gamification/badges` | Get available badges |
| GET | `/api/gamification/users/{userId}/badges` | Get user badges |
| GET | `/api/gamification/users/{userId}/stats` | Get user activity stats |
| GET | `/api/gamification/users/most-active` | Get most active users |
| GET | `/api/gamification/activities/popular` | Get most popular activities |

### Get User Gamification Profile

**Endpoint:** `GET /api/gamification/profile/{userId}`

**Response:**
```json
{
  "userId": "number",
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "profilePictureUrl": "string (optional)",
  "totalPoints": "number",
  "level": "number",
  "levelProgress": "number",
  "badges": [
    {
      "id": "number",
      "userId": "number",
      "badge": {
        "id": "number",
        "name": "string",
        "description": "string",
        "imageUrl": "string",
        "requiredPoints": "number",
        "category": "string",
        "tier": "string"
      },
      "awardedAt": "datetime",
      "eventId": "number (optional)"
    }
  ],
  "recentTransactions": [],
  "leaderboardRanks": []
}
```

### Points Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/points/users/{userId}` | Get user points |
| POST | `/api/points/add` | Add points |
| GET | `/api/points/users/{userId}/transactions` | Get user transactions |
| GET | `/api/points/users/{userId}/activities/{activityType}` | Get user transactions by activity type |
| GET | `/api/points/level` | Get level info |

### Badges Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/badges` | Get all badges |
| GET | `/api/badges/{badgeId}` | Get badge by ID |
| GET | `/api/badges/category/{category}` | Get badges by category |
| GET | `/api/badges/tier/{tier}` | Get badges by tier |
| GET | `/api/badges/user/{userId}` | Get user badges |
| GET | `/api/badges/user/{userId}/category/{category}` | Get user badges by category |
| POST | `/api/badges/award` | Award badge |
| GET | `/api/badges/user/{userId}/progress/{badgeId}` | Get badge progress |
| GET | `/api/badges/user/{userId}/recent` | Get recent user badges |

### Leaderboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboards` | Get all leaderboards |
| GET | `/api/leaderboards/{leaderboardId}` | Get leaderboard by ID |
| GET | `/api/leaderboards/{leaderboardId}/entries` | Get leaderboard entries |
| GET | `/api/leaderboards/{leaderboardId}/results` | Get leaderboard results |
| GET | `/api/leaderboards/user/{userId}` | Get user rankings |
| GET | `/api/leaderboards/user/{userId}/rank/{leaderboardId}` | Get user rank in leaderboard |
| POST | `/api/leaderboards/create` | Create leaderboard |
| POST | `/api/leaderboards/{leaderboardId}/update` | Update leaderboard |
| POST | `/api/leaderboards/update/all` | Update all leaderboards |
| GET | `/api/leaderboards/top/weekly` | Get top users weekly |
| GET | `/api/leaderboards/top/monthly` | Get top users monthly |
| GET | `/api/leaderboards/top/all-time` | Get top users all time |

## Error Handling

All APIs follow a consistent error response format:

```json
{
  "timestamp": "datetime",
  "status": "number",
  "error": "string",
  "message": "string",
  "path": "string"
}
```

Common HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server-side error

## Data Types

### Event Status Enum

- `DRAFT`: Event is being created, not visible to public
- `SCHEDULED`: Event is scheduled and visible
- `RESCHEDULED`: Event was rescheduled
- `CANCELLED`: Event was cancelled
- `COMPLETED`: Event has completed
- `ONGOING`: Event is currently in progress

### Venue Type Enum

- `CLASSROOM`
- `LECTURE_HALL`
- `AUDITORIUM`
- `LAB`
- `MEETING_ROOM`
- `CONFERENCE_ROOM`
- `OUTDOOR_SPACE`
- `SPORTS_FACILITY`
- `DINING_AREA`
- `MULTIPURPOSE`

### Activity Type Enum

- `VIEW`: User viewed the event details
- `REGISTER`: User registered for the event
- `ATTEND`: User attended the event
- `RATE`: User rated the event
- `SHARE`: User shared the event
- `FAVORITE`: User favorited the event
- `CANCEL`: User cancelled registration

### Badge Category Enum

- `ATTENDANCE`: Attending events
- `REGISTRATION`: Registering for events
- `RATING`: Rating events
- `DIVERSITY`: Attending diverse types of events
- `PARTICIPATION`: Participating actively in events
- `ORGANIZATION`: Helping organize events
- `SOCIAL`: Social sharing and inviting others
- `MILESTONE`: Milestone achievements

### Badge Tier Enum

- `BRONZE`
- `SILVER`
- `GOLD`
- `PLATINUM`

### Recommendation Type Enum

- `PERSONALIZED`: Based on user preferences and past behavior
- `SIMILAR_EVENTS`: Similar to events the user liked
- `POPULAR`: Popular events on campus
- `TRENDING`: Trending events (recent increase in popularity)
- `LOCATION_BASED`: Based on user's preferred location
- `TIME_BASED`: Based on user's preferred time/day

## Integration Examples

### User Authentication Flow

1. Register a new user
2. Login to obtain JWT token
3. Include token in Authorization header for all subsequent requests

```javascript
// Register user
const registerResponse = await fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'securepassword',
    firstName: 'Test',
    lastName: 'User',
    department: 'Computer Science',
    interests: ['technology', 'programming']
  })
});

// Login to get token
const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'testuser',
    password: 'securepassword'
  })
});

const { token } = await loginResponse.json();

// Make authenticated request
const eventsResponse = await fetch('http://localhost:8080/api/events', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Creating and Registering for an Event

```javascript
// Create an event
const createEventResponse = await fetch('http://localhost:8080/api/events', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Tech Workshop',
    description: 'Learn about the latest technologies',
    categoryId: 1,
    startTime: '2025-06-15T14:00:00',
    endTime: '2025-06-15T16:00:00',
    location: 'Main Campus',
    maxParticipants: 50,
    organizer: 'Tech Club',
    organizerId: userId,
    tags: ['technology', 'workshop', 'learning']
  })
});

const event = await createEventResponse.json();

// Register for the event
const registerResponse = await fetch('http://localhost:8080/api/event-registrations/register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    eventId: event.id,
    userId: userId,
    userName: 'Test User',
    userEmail: 'test@example.com'
  })
});
```

### Getting Personalized Recommendations

```javascript
const recommendationsResponse = await fetch(`http://localhost:8080/api/recommendations/user/${userId}?count=5`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const recommendations = await recommendationsResponse.json();
```

### Recording User Activity and Earning Points

```javascript
// Record that the user viewed an event
await fetch('http://localhost:8080/api/activities', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: userId,
    eventId: eventId,
    activityType: 'VIEW'
  })
});

// Record that the user attended an event (also triggers points in gamification service)
await fetch(`http://localhost:8080/api/gamification/events/${eventId}/attend`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: userId
  })
});

// Get user's gamification profile
const gamificationResponse = await fetch(`http://localhost:8080/api/gamification/profile/${userId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const gamificationProfile = await gamificationResponse.json();
```

## Pagination

For endpoints that return potentially large collections, pagination is supported using the following query parameters:

- `page`: Page number (0-based, default: 0)
- `size`: Number of items per page (default: 10)
- `sort`: Property to sort by (default varies by endpoint)
- `direction`: Sort direction (ASC or DESC, default: DESC)

Example:

```
GET /api/events?page=0&size=10&sort=startTime&direction=ASC
```

## Notes for Frontend Integration

1. Always handle authentication expiration gracefully by redirecting to login
2. Implement error handling to display meaningful messages to users
3. Use optimistic UI updates when appropriate for a better user experience
4. Consider implementing local caching for frequently accessed data
5. Use appropriate loading indicators for asynchronous operations
6. Implement proper form validation before submitting requests

## Development Tools

For easier API testing and exploration:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Actuator endpoints: `http://localhost:8080/actuator`

## Further Information

This documentation provides a high-level overview of the Tukio API. For more detailed information, refer to the source code and implementation details of each microservice.
