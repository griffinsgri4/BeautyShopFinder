# BeautyShopFinder Data Storage and Configuration Guide

## Firebase Realtime Database Structure

### Shops Collection
```json
{
  "shops": {
    "[shopId]": {
      "id": "string",
      "name": "string",
      "type": "salon|barbershop",
      "distance": "number",
      "waitTime": "number",
      "rating": "number",
      "queueSize": "number",
      "isOpen": "boolean",
      "services": ["string"],
      "location": {
        "latitude": "number",
        "longitude": "number"
      },
      "address": "string",
      "operatingHours": {
        "open": "string (HH:mm)",
        "close": "string (HH:mm)"
      }
    }
  }
}
```

### Users Collection
```json
{
  "users": {
    "[userId]": {
      "id": "string",
      "email": "string",
      "displayName": "string",
      "phoneNumber": "string",
      "preferences": {
        "favoriteShops": ["shopId"],
        "notifications": "boolean"
      },
      "appointments": ["appointmentId"]
    }
  }
}
```

### Appointments Collection
```json
{
  "appointments": {
    "[appointmentId]": {
      "userId": "string",
      "shopId": "string",
      "service": "string",
      "datetime": "timestamp",
      "status": "pending|confirmed|completed|cancelled",
      "queueNumber": "number"
    }
  }
}
```

### Reviews Collection
```json
{
  "reviews": {
    "[reviewId]": {
      "userId": "string",
      "shopId": "string",
      "rating": "number",
      "comment": "string",
      "timestamp": "timestamp"
    }
  }
}
```

## Configuration Requirements

### Firebase Configuration (src/config/firebase.ts)
- Firebase app initialization
- Authentication setup with AsyncStorage persistence
- Firestore and Realtime Database initialization
- Security rules configuration

### Environment Configuration (src/config/env.ts)
- API keys
- Environment-specific variables
- Feature flags

### Service Configurations

#### Queue Management (src/services/queueService.ts)
- Real-time queue updates
- Queue position tracking
- Wait time calculations

#### Service Availability (src/services/serviceAvailabilityService.ts)
- Shop operating hours
- Service scheduling
- Capacity management

#### Shop Recommendations (src/services/shopRecommendationService.ts)
- Location-based filtering
- Rating-based sorting
- Availability filtering

## Security Considerations

### Firebase Security Rules
```javascript
{
  "rules": {
    "shops": {
      ".read": true,
      ".write": "auth != null && auth.token.admin === true"
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "appointments": {
      "$appointmentId": {
        ".read": "auth != null && (data.child('userId').val() === auth.uid || root.child('shops').child(data.child('shopId').val()).child('ownerId').val() === auth.uid)",
        ".write": "auth != null && !data.exists() || data.child('userId').val() === auth.uid"
      }
    },
    "reviews": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## Local Storage (AsyncStorage)
- User session data
- App preferences
- Cached shop data for offline access

## Data Sync Strategy
- Real-time updates for queue and availability
- Periodic sync for shop details
- Immediate sync for appointments and reviews
- Background sync for user preferences