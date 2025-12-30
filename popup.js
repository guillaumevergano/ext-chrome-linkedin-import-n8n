/**
 * LinkedIn Prospect → n8n
 * Popup script - handles UI interactions and data sending
 */

// DOM Elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const backBtn = document.getElementById('backBtn');
const mainContent = document.getElementById('mainContent');
const profileCard = document.getElementById('profileCard');
const warningCard = document.getElementById('warningCard');
const prospectForm = document.getElementById('prospectForm');
const settingsForm = document.getElementById('settingsForm');
const webhookUrlInput = document.getElementById('webhookUrl');
const testBtn = document.getElementById('testBtn');
const testResult = document.getElementById('testResult');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Profile elements
const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileTitle = document.getElementById('profileTitle');
const profileCompany = document.getElementById('profileCompany');

// Current profile data
let currentProfile = null;
let currentInterestLevel = 1; // Default to 1 flame

/**
 * Initialize the popup
 */
async function init() {
  // Load saved webhook URL
  const { webhookUrl } = await chrome.storage.sync.get('webhookUrl');
  if (webhookUrl) {
    webhookUrlInput.value = webhookUrl;
  }

  // Check if we're on a LinkedIn profile page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab && isLinkedInProfile(tab.url)) {
    // Get profile data from content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getProfileData' });
      if (response && response.success) {
        currentProfile = response.data;
        displayProfile(currentProfile);
      } else {
        showWarning();
      }
    } catch (error) {
      console.error('Error getting profile data:', error);
      showWarning();
    }
  } else {
    showWarning();
  }
}

/**
 * Check if URL is a LinkedIn profile
 */
function isLinkedInProfile(url) {
  if (!url) return false;
  return url.includes('linkedin.com/in/') || 
         url.includes('linkedin.com/sales/lead/') ||
         url.includes('linkedin.com/sales/people/');
}

/**
 * Display profile data in the card
 */
function displayProfile(profile) {
  profileCard.style.display = 'flex';
  warningCard.style.display = 'none';
  prospectForm.classList.remove('disabled');

  profileName.textContent = profile.name || 'Nom inconnu';
  profileTitle.textContent = profile.title || '-';
  profileCompany.textContent = profile.company || '-';

  // Set avatar if available
  if (profile.avatar) {
    profileAvatar.innerHTML = `<img src="${profile.avatar}" alt="${profile.name}">`;
  }
}

/**
 * Show warning when not on a LinkedIn profile
 */
function showWarning() {
  profileCard.style.display = 'none';
  warningCard.style.display = 'flex';
  prospectForm.classList.add('disabled');
}

/**
 * Toggle settings panel
 */
function toggleSettings(show) {
  if (show) {
    settingsPanel.classList.add('open');
  } else {
    settingsPanel.classList.remove('open');
  }
}

/**
 * Show success message (full screen overlay)
 */
function showSuccess() {
  successMessage.classList.add('show');
  errorMessage.classList.remove('show');
  
  // Fade out after 2 seconds
  setTimeout(() => {
    successMessage.classList.add('fadeOut');
    setTimeout(() => {
      successMessage.classList.remove('show');
      successMessage.classList.remove('fadeOut');
    }, 300);
  }, 2000);
}

/**
 * Show error message (full screen overlay)
 */
function showError(message) {
  errorText.textContent = message;
  errorMessage.classList.add('show');
  successMessage.classList.remove('show');
  
  // Fade out after 3 seconds
  setTimeout(() => {
    errorMessage.classList.add('fadeOut');
    setTimeout(() => {
      errorMessage.classList.remove('show');
      errorMessage.classList.remove('fadeOut');
    }, 300);
  }, 3000);
}

/**
 * Set button loading state
 */
function setLoading(loading) {
  if (loading) {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
  } else {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

/**
 * Send data to n8n webhook
 */
async function sendToWebhook(data) {
  const { webhookUrl } = await chrome.storage.sync.get('webhookUrl');
  
  if (!webhookUrl) {
    throw new Error('URL du webhook non configurée');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  return response;
}

/**
 * Test webhook connection
 */
async function testWebhook() {
  const url = webhookUrlInput.value.trim();
  
  if (!url) {
    testResult.className = 'test-result error';
    testResult.textContent = '✗ Veuillez entrer une URL';
    testResult.style.display = 'block';
    return;
  }

  testBtn.disabled = true;
  testBtn.textContent = 'Test en cours...';
  testResult.style.display = 'none';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: true,
        message: 'Test de connexion depuis LinkedIn Prospect → n8n',
        timestamp: new Date().toISOString()
      }),
    });

    if (response.ok) {
      testResult.className = 'test-result success';
      testResult.textContent = '✓ Connexion réussie !';
      testResult.style.display = 'block';
    } else {
      testResult.className = 'test-result error';
      testResult.textContent = `✗ Erreur HTTP: ${response.status}`;
      testResult.style.display = 'block';
    }
  } catch (error) {
    testResult.className = 'test-result error';
    testResult.textContent = `✗ Erreur: ${error.message}`;
    testResult.style.display = 'block';
  }

  testBtn.disabled = false;
  testBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
    Tester`;
}

// Event Listeners

settingsBtn.addEventListener('click', () => toggleSettings(true));
backBtn.addEventListener('click', () => toggleSettings(false));

// Save settings
settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = webhookUrlInput.value.trim();
  const saveBtn = settingsForm.querySelector('.save-btn');
  
  // Save to storage
  await chrome.storage.sync.set({ webhookUrl: url });
  
  // Visual feedback on button
  const originalHTML = saveBtn.innerHTML;
  saveBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
    Sauvegardé !`;
  saveBtn.style.background = '#057642';
  
  // Show result message
  testResult.className = 'test-result success';
  testResult.textContent = '✓ Paramètres sauvegardés !';
  testResult.style.display = 'block';
  
  setTimeout(() => {
    saveBtn.innerHTML = originalHTML;
    saveBtn.style.background = '';
    testResult.style.display = 'none';
  }, 2000);
});

// Test webhook
testBtn.addEventListener('click', testWebhook);

// Flames rating
const flamesRating = document.getElementById('flamesRating');
const flameButtons = flamesRating.querySelectorAll('.flame-btn');
const interestLevelInput = document.getElementById('interestLevel');

flameButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const value = parseInt(btn.dataset.value);
    currentInterestLevel = value;
    interestLevelInput.value = value;
    
    // Update active states - all flames up to selected value are active
    flameButtons.forEach(b => {
      const btnValue = parseInt(b.dataset.value);
      if (btnValue <= value) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  });
});

// Submit prospect form
prospectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!currentProfile) {
    showError('Aucun profil détecté');
    return;
  }

  const prospectType = document.getElementById('prospectType').value;
  const comment = document.getElementById('comment').value.trim();

  if (!prospectType) {
    showError('Veuillez sélectionner un type de prospect');
    return;
  }

  setLoading(true);

  try {
    // Get current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const payload = {
      // Profile data
      ...currentProfile,
      profileUrl: tab?.url || '',
      
      // User input
      prospectType: prospectType,
      interestLevel: currentInterestLevel,
      action: document.getElementById('action').value,
      comment: comment,
      
      // Metadata
      source: 'linkedin-prospect-n8n',
      capturedAt: new Date().toISOString()
    };

    await sendToWebhook(payload);
    showSuccess();
    
    // Reset form
    document.getElementById('prospectType').value = 'client';
    document.getElementById('action').value = 'none';
    document.getElementById('comment').value = '';
    
    // Reset flames to 1
    currentInterestLevel = 1;
    interestLevelInput.value = 1;
    flameButtons.forEach(b => {
      const btnValue = parseInt(b.dataset.value);
      if (btnValue <= 1) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    
  } catch (error) {
    console.error('Error sending to webhook:', error);
    showError(error.message || 'Erreur lors de l\'envoi');
  }

  setLoading(false);
});

// Initialize on load
init();
