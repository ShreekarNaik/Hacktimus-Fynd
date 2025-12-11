/**
 * FyndGames Exit-Intent Popup Script
 * 
 * This script is injected into the Fynd storefront to detect exit intent
 * and trigger the game popup for cart recovery.
 * 
 * Usage:
 *   <script src="https://your-backend.com/popup.js" data-company-id="YOUR_COMPANY_ID"></script>
 * 
 * Or include with configuration:
 *   <script>
 *     window.FyndGamesConfig = {
 *       companyId: 'YOUR_COMPANY_ID',
 *       applicationId: 'YOUR_APP_ID',
 *       gameUrl: 'https://fyndgames.example.com',
 *       game: 'sandfall',
 *       triggerOnce: true,
 *       debug: false
 *     };
 *   </script>
 *   <script src="https://your-backend.com/popup.js"></script>
 */

(function() {
  'use strict';

  // =============================================================================
  // CONFIGURATION
  // =============================================================================

  const DEFAULT_CONFIG = {
    companyId: '',
    applicationId: '',
    gameUrl: 'http://localhost:5173',  // FyndGames frontend URL
    game: 'sandfall',                   // Default game for cart recovery
    triggerOnce: true,                  // Only show popup once per session
    exitThreshold: 20,                  // Mouse Y position to trigger (pixels from top)
    minCartValue: 0,                    // Minimum cart value to show popup (0 = any)
    cookieExpiry: 24 * 60 * 60 * 1000,  // Cookie expiry in ms (24 hours)
    debug: false
  };

  // Merge user config with defaults
  const config = Object.assign({}, DEFAULT_CONFIG, window.FyndGamesConfig || {});

  // Get config from script tag data attributes (fallback)
  const scriptTag = document.currentScript || document.querySelector('script[data-company-id]');
  if (scriptTag) {
    config.companyId = scriptTag.getAttribute('data-company-id') || config.companyId;
    config.applicationId = scriptTag.getAttribute('data-application-id') || config.applicationId;
    config.gameUrl = scriptTag.getAttribute('data-game-url') || config.gameUrl;
  }

  // =============================================================================
  // STATE
  // =============================================================================

  let hasTriggered = false;
  let iframeContainer = null;

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  function log(...args) {
    if (config.debug) {
      console.log('[FyndGames]', ...args);
    }
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function setCookie(name, value, ms) {
    const expires = new Date(Date.now() + ms).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }

  function hasPlayedThisSession() {
    return getCookie('fyndgames_played') === 'true';
  }

  function markAsPlayed() {
    setCookie('fyndgames_played', 'true', config.cookieExpiry);
  }

  // =============================================================================
  // CART DETECTION
  // =============================================================================

  /**
   * Attempt to detect cart contents from Fynd storefront
   * This uses the Fynd SDK if available, or falls back to DOM inspection
   */
  function getCartInfo() {
    // Try to get cart from Fynd SDK (window.fpi if available)
    if (window.fpi && window.fpi.cart) {
      try {
        const cart = window.fpi.cart.getCart();
        return {
          hasItems: cart && cart.items && cart.items.length > 0,
          itemCount: cart?.items?.length || 0,
          cartValue: cart?.breakup_values?.raw?.total || 0,
          cartId: cart?.id || null,
          userId: window.fpi.auth?.getUserId?.() || null
        };
      } catch (e) {
        log('Failed to get cart from Fynd SDK:', e);
      }
    }

    // Fallback: Try to detect cart from URL or DOM
    // This is a heuristic approach for when SDK is not available
    const cartBadge = document.querySelector('[data-cart-count], .cart-count, .cart-badge');
    const cartCount = cartBadge ? parseInt(cartBadge.textContent, 10) || 0 : 0;

    return {
      hasItems: cartCount > 0 || window.location.pathname.includes('/cart'),
      itemCount: cartCount,
      cartValue: 0,  // Cannot determine without SDK
      cartId: null,
      userId: null
    };
  }

  // =============================================================================
  // POPUP UI
  // =============================================================================

  function createPopupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .fyndgames-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 999998;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .fyndgames-overlay.visible {
        opacity: 1;
      }
      .fyndgames-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        width: 90%;
        max-width: 420px;
        height: 80%;
        max-height: 700px;
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        z-index: 999999;
        overflow: hidden;
        opacity: 0;
        transition: all 0.3s ease;
      }
      .fyndgames-container.visible {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      .fyndgames-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      .fyndgames-title {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }
      .fyndgames-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      .fyndgames-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      .fyndgames-iframe {
        width: 100%;
        height: calc(100% - 52px);
        border: none;
      }
    `;
    document.head.appendChild(style);
  }

  function createPopup(gameUrl) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'fyndgames-overlay';
    overlay.onclick = closePopup;

    // Create container
    const container = document.createElement('div');
    container.className = 'fyndgames-container';

    // Create header
    const header = document.createElement('div');
    header.className = 'fyndgames-header';
    header.innerHTML = `
      <h3 class="fyndgames-title">🎮 Play & Win a Discount!</h3>
      <button class="fyndgames-close" onclick="window.FyndGames.close()">&times;</button>
    `;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'fyndgames-iframe';
    iframe.src = gameUrl;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope';

    container.appendChild(header);
    container.appendChild(iframe);

    iframeContainer = { overlay, container };

    document.body.appendChild(overlay);
    document.body.appendChild(container);

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('visible');
      container.classList.add('visible');
    });

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    if (!iframeContainer) return;

    const { overlay, container } = iframeContainer;
    
    overlay.classList.remove('visible');
    container.classList.remove('visible');

    setTimeout(() => {
      overlay.remove();
      container.remove();
      document.body.style.overflow = '';
      iframeContainer = null;
    }, 300);
  }

  // =============================================================================
  // EXIT INTENT DETECTION
  // =============================================================================

  function handleMouseLeave(e) {
    // Only trigger if mouse is moving toward the top of the page
    if (e.clientY > config.exitThreshold) return;

    // Check if already triggered this session
    if (config.triggerOnce && (hasTriggered || hasPlayedThisSession())) {
      log('Already triggered this session, skipping');
      return;
    }

    // Check cart status
    const cartInfo = getCartInfo();
    log('Cart info:', cartInfo);

    if (!cartInfo.hasItems) {
      log('No items in cart, skipping popup');
      return;
    }

    if (config.minCartValue > 0 && cartInfo.cartValue < config.minCartValue) {
      log('Cart value below threshold, skipping popup');
      return;
    }

    // Trigger the popup!
    triggerPopup(cartInfo);
  }

  function triggerPopup(cartInfo) {
    hasTriggered = true;
    markAsPlayed();

    log('Triggering game popup for cart recovery');

    // Build the game URL with context
    const gameUrl = new URL(`/game/${config.game}`, config.gameUrl);
    gameUrl.searchParams.set('mode', 'popup');
    gameUrl.searchParams.set('isCartRecovery', 'true');
    
    if (cartInfo.userId) {
      gameUrl.searchParams.set('userId', cartInfo.userId);
    }
    if (cartInfo.cartId) {
      gameUrl.searchParams.set('cartId', cartInfo.cartId);
    }
    if (config.companyId) {
      gameUrl.searchParams.set('companyId', config.companyId);
    }

    createPopup(gameUrl.toString());
  }

  // =============================================================================
  // MESSAGE HANDLING (Communication with iframe)
  // =============================================================================

  function handleMessage(event) {
    // Only accept messages from our game URL
    if (!event.origin.includes(new URL(config.gameUrl).hostname)) return;

    const { type, data } = event.data || {};

    switch (type) {
      case 'fyndgames:close':
        closePopup();
        break;
      case 'fyndgames:reward':
        log('Reward received:', data);
        closePopup();
        // Optionally: Apply coupon automatically
        if (data.couponCode && window.fpi?.cart?.applyCoupon) {
          window.fpi.cart.applyCoupon(data.couponCode);
        }
        break;
      case 'fyndgames:redirect':
        if (data.url) {
          window.location.href = data.url;
        }
        break;
    }
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  function init() {
    log('Initializing with config:', config);

    // Create styles
    createPopupStyles();

    // Listen for exit intent
    document.addEventListener('mouseleave', handleMouseLeave);

    // Listen for messages from iframe
    window.addEventListener('message', handleMessage);

    // Expose public API
    window.FyndGames = {
      trigger: () => {
        const cartInfo = getCartInfo();
        if (cartInfo.hasItems) {
          triggerPopup(cartInfo);
        } else {
          log('Cannot trigger: no items in cart');
        }
      },
      close: closePopup,
      config: config
    };

    log('Initialized successfully');
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
