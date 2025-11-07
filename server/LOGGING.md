# Backend Logging Documentation

## Overview
The backend now includes comprehensive request/response logging to help with debugging, monitoring, and analytics.

## Features

### 1. Request/Response Logging
Every API request and response is logged with detailed information including:

- **Timestamp**: ISO 8601 format
- **HTTP Method**: GET, POST, PUT, DELETE, etc.
- **Route/URL**: The endpoint that was called
- **Status Code**: Response status (200, 404, 500, etc.)
- **Response Time**: How long the request took to process
- **User Information**: If authenticated, shows user name, email, and role
- **Request Body**: For POST/PUT requests (sensitive fields are hidden)
- **Query Parameters**: URL query strings
- **Response Size**: Size of the response in bytes/KB/MB
- **Response Data**: Summary of response data (full details for errors)
- **IP Address**: Client IP address

### 2. Color-Coded Console Output
The logs use color coding for easy reading:

- **🟢 Green**: Successful responses (2xx)
- **🟡 Yellow**: Client errors (4xx)
- **🔴 Red**: Server errors (5xx)
- **🔵 Blue**: GET requests
- **🟢 Green**: POST requests
- **🟡 Yellow**: PUT requests
- **🔴 Red**: DELETE requests

### 3. Error Logging
Detailed error logs include:
- Error name and message
- Request route and method
- User information (if authenticated)
- Full stack trace
- Timestamp

### 4. Request Statistics
Track server statistics:
- Total requests
- Requests by method (GET, POST, etc.)
- Requests by status code (2xx, 4xx, 5xx)
- Error count
- Server uptime
- Memory usage

### 5. Statistics Endpoint
Access server statistics via API:
```
GET /api/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1234,
    "byMethod": {
      "GET": 800,
      "POST": 300,
      "PUT": 100,
      "DELETE": 34
    },
    "byStatus": {
      "2xx": 1100,
      "4xx": 120,
      "5xx": 14
    },
    "errors": 134,
    "uptime": 3600,
    "memory": {
      "rss": 50331648,
      "heapTotal": 20971520,
      "heapUsed": 15728640
    }
  }
}
```

## Example Logs

### Successful GET Request
```
────────────────────────────────────────────────────────────────────────────────
[2025-11-07T10:30:45.123Z] GET /api/books 200 45ms
🔍 Query: {"search":"javascript","page":"1"}
📤 Response Size: 2.5 KB
💬 Message: Books retrieved successfully
📊 Data: Array with 15 items
🌐 IP: ::1
────────────────────────────────────────────────────────────────────────────────
```

### Authenticated POST Request
```
────────────────────────────────────────────────────────────────────────────────
[2025-11-07T10:35:12.456Z] POST /api/books 201 120ms
👤 User: John Doe (admin) [admin@eelibrary.com]
📥 Request Body:
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884"
}
📤 Response Size: 1.2 KB
💬 Message: Book created successfully
📊 Data: Object with keys: _id, title, author, isbn, createdAt
🌐 IP: ::1
────────────────────────────────────────────────────────────────────────────────
```

### Error Response
```
────────────────────────────────────────────────────────────────────────────────
[2025-11-07T10:40:23.789Z] POST /api/transactions/issue 400 15ms
👤 User: Jane Smith (student) [student@eelibrary.com]
📥 Request Body:
{
  "bookId": "507f1f77bcf86cd799439011"
}
📤 Response Size: 85 B
💬 Message: Book is not available
❌ Error: Book is currently issued to another user
🌐 IP: ::1
────────────────────────────────────────────────────────────────────────────────
```

### Critical Error
```
 ERROR 
────────────────────────────────────────────────────────────────────────────────
[2025-11-07T10:45:00.000Z]
MongoNetworkError: Connection to database failed
Route: GET /api/books
User: admin@eelibrary.com (admin)
Stack Trace:
MongoNetworkError: Connection to database failed
    at Function.create (/path/to/node_modules/mongodb/lib/core/error.js:45:12)
    at Socket.<anonymous> (/path/to/node_modules/mongodb/lib/core/connection/connection.js:276:22)
    ...
────────────────────────────────────────────────────────────────────────────────
```

## Configuration

### Enable Periodic Statistics Logging
Add to your `.env` file:
```bash
ENABLE_STATS_LOGGING=true
```

This will log server statistics every 60 minutes to the console.

### Example Statistics Output
```
📊 SERVER STATISTICS
────────────────────────────────────────────────────────────────────────────────
Total Requests: 5432
Errors: 123
Uptime: 120 minutes

By Method:
  GET: 3200
  POST: 1800
  PUT: 300
  DELETE: 132

By Status:
  2xx: 4900
  4xx: 450
  5xx: 82
────────────────────────────────────────────────────────────────────────────────
```

## Security & Privacy

### Sensitive Data Protection
The logging middleware automatically hides sensitive information:
- Passwords are replaced with `***`
- Password reset tokens are replaced with `***`
- Other sensitive fields can be configured in `middleware/logger.js`

### Production Considerations
- Response bodies are only logged in detail for errors or in development mode
- Consider using a logging service (like Winston or Bunyan) for production
- Set `NODE_ENV=production` to reduce verbose logging
- Monitor log file sizes and implement rotation if needed

## Development vs Production

### Development Mode (`NODE_ENV=development`)
- Full response bodies logged
- Detailed error messages
- Stack traces visible
- Color-coded console output

### Production Mode (`NODE_ENV=production`)
- Only error responses logged in detail
- Generic error messages to clients
- Stack traces not exposed to clients
- Consider integrating with logging services (Sentry, LogRocket, etc.)

## Integration with Monitoring Tools

The logging middleware can be extended to integrate with:
- **Application Performance Monitoring (APM)**: New Relic, Datadog
- **Error Tracking**: Sentry, Rollbar
- **Log Aggregation**: ELK Stack, Splunk
- **Analytics**: Custom analytics dashboards

## Customization

### Modify Logging Behavior
Edit `server/middleware/logger.js` to:
- Add custom log formats
- Filter specific routes
- Add custom metrics
- Change color schemes
- Add additional metadata

### Example: Skip Logging for Health Checks
```javascript
const requestLogger = (req, res, next) => {
    // Skip logging for health check endpoints
    if (req.url === '/health' || req.url === '/') {
        return next();
    }
    
    // ... rest of logging logic
};
```

## Benefits

1. **Debugging**: Quickly identify issues with detailed request/response logs
2. **Monitoring**: Track API usage patterns and performance
3. **Analytics**: Understand user behavior and popular endpoints
4. **Security**: Audit trail of all API access
5. **Performance**: Identify slow endpoints and optimize
6. **Compliance**: Meet audit and compliance requirements

## Best Practices

1. **Regular Monitoring**: Check logs regularly for errors and anomalies
2. **Performance Tracking**: Monitor response times and optimize slow endpoints
3. **Error Analysis**: Review error logs to identify and fix issues
4. **Security Audits**: Check for suspicious activity patterns
5. **Capacity Planning**: Use statistics to plan for scaling

## Troubleshooting

### Logs Not Appearing
- Check that middleware is loaded before routes in `index.js`
- Verify server is running in terminal that supports color output
- Ensure requests are actually reaching the server

### Too Much Output
- Disable `ENABLE_STATS_LOGGING` in `.env`
- Set `NODE_ENV=production` to reduce verbosity
- Filter specific routes in the logger middleware

### Performance Impact
- Logging adds minimal overhead (~1-5ms per request)
- For high-traffic applications, consider async logging
- Use sampling for non-critical routes

## Next Steps

Consider implementing:
1. **Log Rotation**: Prevent log files from growing too large
2. **Centralized Logging**: Send logs to external service
3. **Real-time Monitoring**: Dashboard for live statistics
4. **Alerting**: Notifications for errors or performance issues
5. **Custom Metrics**: Track business-specific KPIs
