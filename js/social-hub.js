/* ============================================================
   social-hub.js — Blissful Yoga Miami Social Media Aggregate
   Feed filtering, replies, compose, analytics integration
   ============================================================ */

(function () {
  'use strict';

  /* ------ FEED FILTERING ------ */
  var sortSelect = document.getElementById('feedSort');
  var searchInput = document.getElementById('feedSearch');
  var commentCards = document.querySelectorAll('.social-comment');

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      sortFeed(this.value);
    });
  }

  if (searchInput) {
    var searchTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(searchTimer);
      var query = this.value;
      searchTimer = setTimeout(function () { filterFeed(query); }, 300);
    });
  }

  function filterFeed(query) {
    var normalizedQuery = query.toLowerCase().trim();
    commentCards.forEach(function (card) {
      var text = card.textContent.toLowerCase();
      card.style.display = text.includes(normalizedQuery) ? '' : 'none';
    });
  }

  function sortFeed(order) {
    var container = document.querySelector('.social-feed-list');
    if (!container) return;

    var cards = Array.from(container.querySelectorAll('.social-comment'));
    cards.sort(function (a, b) {
      var dateA = a.getAttribute('data-date') || '';
      var dateB = b.getAttribute('data-date') || '';
      if (order === 'oldest') return dateA.localeCompare(dateB);
      return dateB.localeCompare(dateA);
    });

    cards.forEach(function (card) {
      container.appendChild(card);
    });
  }

  /* ------ REPLY SYSTEM ------ */
  document.querySelectorAll('.reply-submit').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = this.closest('.reply-input-group');
      if (!group) return;
      var input = group.querySelector('input');
      if (!input || !input.value.trim()) return;

      var card = this.closest('.social-comment');
      var platform = card ? card.getAttribute('data-platform') : 'unknown';
      var replyText = input.value.trim();

      // Show confirmation
      var confirmation = document.createElement('div');
      confirmation.className = 'reply-confirmation';
      confirmation.style.cssText = 'padding: 8px 12px; margin-top: 8px; background: rgba(74,124,89,0.1); border-radius: 8px; font-size: 0.82rem; color: #4a7c59;';
      confirmation.textContent = '✓ Reply queued for ' + platform + '. Will be posted shortly.';
      group.parentNode.appendChild(confirmation);
      input.value = '';

      // Remove confirmation after 3s
      setTimeout(function () {
        if (confirmation.parentNode) {
          confirmation.parentNode.removeChild(confirmation);
        }
      }, 3000);

      // In production: POST to your API that interfaces with Instagram Graph API / YouTube Data API
    });
  });

  // Submit reply on Enter
  document.querySelectorAll('.reply-input-group input').forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var btn = this.parentNode.querySelector('.reply-submit');
        if (btn) btn.click();
      }
    });
  });

  /* ------ COMPOSE FORM ------ */
  var composeForm = document.getElementById('composeForm');
  var composeText = document.getElementById('composeText');
  var charCount = document.getElementById('charCount');
  var quickChips = document.querySelectorAll('.quick-chip');

  if (composeText && charCount) {
    composeText.addEventListener('input', function () {
      var len = this.value.length;
      charCount.textContent = len + '/2200';
      charCount.style.color = len > 2000 ? '#e74c3c' : '';
    });
  }

  // Quick response chips
  quickChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (!composeText) return;
      var text = this.getAttribute('data-text') || this.textContent;
      composeText.value += (composeText.value ? ' ' : '') + text;
      composeText.dispatchEvent(new Event('input'));
      composeText.focus();
    });
  });

  if (composeForm) {
    composeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var platform = document.getElementById('composePlatform');
      var text = composeText;
      if (!platform || !text || !text.value.trim()) return;

      var msg = text.value.trim();
      var target = platform.value;

      // Show success
      var btn = composeForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = '✓ Sent to ' + target + '!';
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = 'Post Reply';
          btn.disabled = false;
        }, 3000);
      }

      text.value = '';
      if (charCount) charCount.textContent = '0/2200';

      // In production: POST to platform API via backend
    });
  }

  /* ------ LOAD MORE ------ */
  var loadMoreBtn = document.getElementById('loadMoreComments');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      this.textContent = 'Loading...';
      this.disabled = true;

      // Simulate loading delay
      var self = this;
      setTimeout(function () {
        self.textContent = 'No more comments';
        self.disabled = true;
        self.style.opacity = '0.5';

        // In production: fetch next page from API
      }, 1000);
    });
  }

  /* ------ PLATFORM TAB FILTERING ------ */
  var hubTabs = document.querySelectorAll('#hubTabs button, .hub-tab-btn');
  hubTabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var platform = this.getAttribute('data-platform');
      if (!platform) return;

      commentCards.forEach(function (card) {
        if (platform === 'all') {
          card.style.display = '';
        } else {
          card.style.display = card.getAttribute('data-platform') === platform ? '' : 'none';
        }
      });
    });
  });

})();
