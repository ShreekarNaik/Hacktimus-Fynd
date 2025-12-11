# FyndGames Exit-Intent Popup Script

This script enables exit-intent detection on Fynd storefronts to trigger game popups for cart recovery.

## Quick Start

### Option 1: Script Tag with Configuration

```html
<!-- Add before closing </body> tag -->
<script>
  window.FyndGamesConfig = {
    companyId: 'YOUR_COMPANY_ID',
    applicationId: 'YOUR_APP_ID',
    gameUrl: 'https://fyndgames.example.com',
    game: 'sandfall',
    debug: true  // Enable console logging
  };
</script>
<script src="https://your-cdn.com/popup.js"></script>
```

### Option 2: Data Attributes

```html
<script 
  src="https://your-cdn.com/popup.js" 
  data-company-id="YOUR_COMPANY_ID"
  data-application-id="YOUR_APP_ID"
  data-game-url="https://fyndgames.example.com">
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `companyId` | string | `''` | Your Fynd company ID |
| `applicationId` | string | `''` | Your Fynd application ID |
| `gameUrl` | string | `'http://localhost:5173'` | FyndGames frontend URL |
| `game` | string | `'sandfall'` | Game to show (sandfall, spin, scratch, quiz) |
| `triggerOnce` | boolean | `true` | Only show popup once per session |
| `exitThreshold` | number | `20` | Mouse Y position to trigger (px from top) |
| `minCartValue` | number | `0` | Minimum cart value to show popup |
| `cookieExpiry` | number | `86400000` | Cookie expiry in ms (24 hours) |
| `debug` | boolean | `false` | Enable console logging |

## How It Works

1. **Detection**: Script monitors mouse movement toward the browser's exit area
2. **Cart Check**: Verifies the user has items in their cart (via Fynd SDK or DOM inspection)
3. **Popup**: Opens an iframe with the FyndGames app in "popup" mode
4. **Game Play**: User plays a quick game to earn a discount
5. **Reward**: Coupon code is provided, optionally auto-applied to cart

## JavaScript API

The script exposes a global `window.FyndGames` object:

```javascript
// Manually trigger the popup
window.FyndGames.trigger();

// Close the popup
window.FyndGames.close();

// Access current configuration
console.log(window.FyndGames.config);
```

## PostMessage Communication

The iframe communicates with the parent page via `postMessage`:

### Incoming (from iframe)

```javascript
// Close popup
{ type: 'fyndgames:close' }

// Reward earned
{ type: 'fyndgames:reward', data: { couponCode: 'WIN20_ABC123' } }

// Redirect to URL
{ type: 'fyndgames:redirect', data: { url: 'https://store.com/cart' } }
```

### Frontend Implementation

To send messages from the FyndGames frontend:

```javascript
// Close popup from game
window.parent.postMessage({ type: 'fyndgames:close' }, '*');

// Send reward
window.parent.postMessage({
  type: 'fyndgames:reward',
  data: { couponCode: 'WIN20_ABC123', discountPercentage: 20 }
}, '*');
```

## Testing Locally

1. Start the FyndGames frontend:
   ```bash
   cd frontend && pnpm dev
   ```

2. Create a test HTML file:
   ```html
   <!DOCTYPE html>
   <html>
   <head><title>Test Store</title></head>
   <body>
     <h1>Test Store</h1>
     <div data-cart-count>2</div> <!-- Simulates cart with items -->
     
     <script>
       window.FyndGamesConfig = {
         gameUrl: 'http://localhost:5173',
         debug: true
       };
     </script>
     <script src="./popup.js"></script>
   </body>
   </html>
   ```

3. Open the test file and move your mouse toward the top of the browser window.

## Fynd Theme Integration

For production integration with a Fynd storefront theme:

1. Add the script to your theme's `<head>` or before `</body>`
2. Configure with your company/application IDs
3. Host the script on your CDN or use the FyndGames CDN URL

## Security Notes

- The script only runs on pages where it's explicitly included
- Iframe is sandboxed and only communicates via postMessage
- No sensitive data is stored; only a session cookie tracks if popup was shown
- Cart information is read-only (via Fynd SDK if available)

## Troubleshooting

### Popup not triggering
- Check browser console for `[FyndGames]` log messages (enable `debug: true`)
- Verify cart detection is working (ensure cart has items)
- Check if session cookie is blocking (`fyndgames_played=true`)

### Iframe not loading
- Verify `gameUrl` is correct and accessible
- Check browser console for CORS or CSP errors
- Ensure the FyndGames frontend is running

### Cart not detected
- The Fynd SDK (`window.fpi`) must be loaded before this script
- Fallback detection looks for `.cart-count` or `[data-cart-count]` elements
