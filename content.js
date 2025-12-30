/**
 * LinkedIn Prospect → n8n
 * Content script - extracts profile data from LinkedIn pages
 */

/**
 * Extract profile data from regular LinkedIn profile page
 */
function extractLinkedInProfile() {
  const data = {
    name: null,
    title: null,
    company: null,
    location: null,
    avatar: null,
    isConnected: false
  };

  try {
    // Name - multiple selectors for different LinkedIn layouts
    const nameSelectors = [
      'h1.text-heading-xlarge',
      'h1.inline.t-24',
      '.pv-text-details__left-panel h1',
      '.ph5 h1',
      '[data-anonymize="person-name"]'
    ];
    
    for (const selector of nameSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        data.name = el.textContent.trim();
        break;
      }
    }

    // Title/Headline
    const titleSelectors = [
      '.text-body-medium.break-words',
      '.pv-text-details__left-panel .text-body-medium',
      '.ph5 .text-body-medium',
      '[data-anonymize="headline"]'
    ];
    
    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        data.title = el.textContent.trim();
        break;
      }
    }

    // Company - try to extract from title
    if (data.title) {
      const atMatch = data.title.match(/(?:@|at|chez|à)\s+(.+?)(?:\s*[|·]|$)/i);
      if (atMatch) {
        data.company = atMatch[1].trim();
      }
    }

    // Location
    const locationSelectors = [
      '.text-body-small.inline.t-black--light.break-words',
      '.pv-text-details__left-panel span.text-body-small',
      '[data-anonymize="location"]'
    ];
    
    for (const selector of locationSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim() && !el.textContent.includes('Contact info')) {
        data.location = el.textContent.trim();
        break;
      }
    }

    // Avatar
    const avatarSelectors = [
      '.pv-top-card-profile-picture__image',
      '.pv-top-card__photo img',
      'img.presence-entity__image',
      '.profile-photo-edit__preview'
    ];
    
    for (const selector of avatarSelectors) {
      const el = document.querySelector(selector);
      if (el && el.src && !el.src.includes('ghost')) {
        data.avatar = el.src;
        break;
      }
    }

    // Check for connection status
    const messageBtn = document.querySelector('button[aria-label*="Message"], button.message-anywhere-button');
    const connectBtn = document.querySelector('button[aria-label*="Connect"], button[aria-label*="Se connecter"]');
    
    if (messageBtn && !connectBtn) {
      data.isConnected = true;
    } else if (connectBtn) {
      data.isConnected = false;
    }

  } catch (error) {
    console.error('Error extracting LinkedIn profile:', error);
  }

  return data;
}

/**
 * Extract profile data from Sales Navigator
 */
function extractSalesNavigatorProfile() {
  const data = {
    name: null,
    title: null,
    company: null,
    location: null,
    avatar: null,
    isConnected: false
  };

  try {
    // Name
    const nameSelectors = [
      '[data-anonymize="person-name"]',
      '.profile-topcard-person-entity__name',
      'h1.profile-topcard__name'
    ];
    
    for (const selector of nameSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        data.name = el.textContent.trim();
        break;
      }
    }

    // Title
    const titleSelectors = [
      '[data-anonymize="headline"]',
      '.profile-topcard__summary-position',
      '.profile-topcard__headline'
    ];
    
    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        data.title = el.textContent.trim();
        break;
      }
    }

    // Company
    const companySelectors = [
      '[data-anonymize="company-name"]',
      '.profile-topcard__summary-position-company'
    ];
    
    for (const selector of companySelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        data.company = el.textContent.trim();
        break;
      }
    }

    // Location
    const locationSelectors = [
      '[data-anonymize="location"]',
      '.profile-topcard__location-data'
    ];
    
    for (const selector of locationSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        data.location = el.textContent.trim();
        break;
      }
    }

    // Avatar
    const avatarEl = document.querySelector('.profile-topcard__photo-wrapper img, [data-anonymize="profile-photo"] img');
    if (avatarEl && avatarEl.src && !avatarEl.src.includes('ghost')) {
      data.avatar = avatarEl.src;
    }

  } catch (error) {
    console.error('Error extracting Sales Navigator profile:', error);
  }

  return data;
}

/**
 * Main function to extract profile based on current page
 */
function extractProfile() {
  const url = window.location.href;
  
  if (url.includes('/sales/')) {
    return extractSalesNavigatorProfile();
  } else {
    return extractLinkedInProfile();
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProfileData' || request.action === 'extractProfile') {
    const profileData = extractProfile();
    sendResponse({ success: true, data: profileData });
  }
  return true;
});

// Log that content script is loaded
console.log('LinkedIn Prospect → n8n: Content script loaded');
