# B2B Dealer Portal Integration Guide

This document explains how to integrate the external B2B dealer portal with the Reliable Drapes e-commerce application using iframe embedding and `postMessage` communication.

## Overview

The trader login page (`/trader-login`) embeds an external B2B portal in an iframe. The B2B system communicates authentication events to the parent window using the `postMessage` API.

## Setup

### Environment Variable

Configure the B2B portal URL in your environment:

```env
# .env.local
NEXT_PUBLIC_TRADER_PORTAL_URL=https://your-b2b-portal-url.com
```

Without this variable, the trader login page will display a "coming soon" message.

## postMessage Events

The B2B system should send the following `postMessage` events to communicate authentication state changes.

### Successful Login

When a dealer successfully authenticates, send:

```javascript
window.parent.postMessage(
  {
    type: "B2B_LOGIN_SUCCESS",
    payload: {
      userId: "dealer-123",
      email: "dealer@company.com",
      companyName: "ABC Textiles",
      token: "jwt-token-here",
    },
  },
  "*",
);
```

**Payload Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | Unique dealer identifier |
| `email` | string | Yes | Dealer's email address |
| `companyName` | string | No | Company/business name |
| `token` | string | No | JWT or session token |

### Login Failure

When authentication fails:

```javascript
window.parent.postMessage(
  {
    type: "B2B_LOGIN_FAILURE",
    payload: {
      message: "Invalid credentials",
    },
  },
  "*",
);
```

### Logout

When the dealer logs out from the B2B system:

```javascript
window.parent.postMessage(
  {
    type: "B2B_LOGOUT",
  },
  "*",
);
```

## Session Storage

The parent application stores the dealer session in `localStorage` under the key `dealer_session`:

```json
{
  "isAuthenticated": true,
  "userId": "dealer-123",
  "email": "dealer@company.com",
  "companyName": "ABC Textiles",
  "token": "jwt-token-here",
  "loginTime": "2024-01-15T10:30:00.000Z"
}
```

### Alternative: localStorage Polling

If `postMessage` is not available, the B2B system can write directly to `localStorage`, and the parent app will detect changes:

```javascript
// In B2B portal, after successful login
localStorage.setItem(
  "dealer_session",
  JSON.stringify({
    isAuthenticated: true,
    userId: "dealer-123",
    email: "dealer@company.com",
    companyName: "ABC Textiles",
    token: "jwt-token-here",
    loginTime: new Date().toISOString(),
  }),
);
```

## Security Considerations

### Origin Validation

In production, validate the message origin:

```javascript
// In the parent window
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    // Validate origin in production
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_TRADER_PORTAL_URL,
      'https://your-b2b-portal-url.com'
    ];

    if (!allowedOrigins.includes(event.origin)) {
      console.warn('Received message from untrusted origin:', event.origin);
      return;
    }

    // Process the message...
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### Token Handling

- Tokens should be transmitted securely
- Consider using short-lived tokens with refresh mechanisms
- Validate tokens on the server side for any privileged operations

## Code Examples

### B2B Portal Login Handler (React)

```jsx
// In your B2B portal's login success handler
const handleLoginSuccess = (userData) => {
  // Notify parent window
  window.parent.postMessage(
    {
      type: "B2B_LOGIN_SUCCESS",
      payload: {
        userId: userData.id,
        email: userData.email,
        companyName: userData.companyName,
        token: userData.token,
      },
    },
    "*",
  );

  // Also save to localStorage as fallback
  localStorage.setItem(
    "dealer_session",
    JSON.stringify({
      isAuthenticated: true,
      userId: userData.id,
      email: userData.email,
      companyName: userData.companyName,
      token: userData.token,
      loginTime: new Date().toISOString(),
    }),
  );
};
```

### B2B Portal Logout Handler

```jsx
const handleLogout = () => {
  // Notify parent window
  window.parent.postMessage(
    {
      type: "B2B_LOGOUT",
    },
    "*",
  );

  // Clear localStorage
  localStorage.removeItem("dealer_session");
};
```

## Testing

1. Set `NEXT_PUBLIC_TRADER_PORTAL_URL` to your B2B portal URL
2. Navigate to `/trader-login`
3. Verify the iframe loads your B2B portal
4. Test login flow and verify dealer prices appear on products
5. Test logout flow and verify session is cleared

## Troubleshooting

### Iframe Not Loading

- Check that the B2B portal URL is correct and accessible
- Verify the B2B portal allows iframe embedding (check `X-Frame-Options` header)

### Session Not Persisting

- Check browser console for `postMessage` events
- Verify localStorage is being written correctly
- Check for CORS issues

### Prices Not Updating

- Verify the dealer session is stored in the auth store
- Check that `dealer_price` is set on products in the database
