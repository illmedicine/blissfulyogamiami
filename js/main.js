/* ============================================================
   main.js — Blissful Yoga Miami Core JavaScript
   Nav, carousel, tabs, scroll animations, chat widget
   ============================================================ */

(function () {
  'use strict';

  /* ------ NAVBAR ------ */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  // Shrink navbar on scroll
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  /* ------ CAROUSEL ------ */
  const carousel = document.querySelector('.carousel-track');
  if (carousel) {
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const cards = carousel.querySelectorAll('.carousel-card');
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        carousel.scrollBy({ left: -320, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        carousel.scrollBy({ left: 320, behavior: 'smooth' });
      });
    }

    // Mouse drag
    carousel.addEventListener('mousedown', function (e) {
      isDragging = true;
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      carousel.style.cursor = 'grabbing';
    });

    carousel.addEventListener('mouseleave', stopDrag);
    carousel.addEventListener('mouseup', stopDrag);

    carousel.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      e.preventDefault();
      var x = e.pageX - carousel.offsetLeft;
      var walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
    });

    function stopDrag() {
      isDragging = false;
      carousel.style.cursor = 'grab';
    }

    // Touch drag
    carousel.addEventListener('touchstart', function (e) {
      startX = e.touches[0].pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    }, { passive: true });

    carousel.addEventListener('touchmove', function (e) {
      var x = e.touches[0].pageX - carousel.offsetLeft;
      var walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
    }, { passive: true });
  }

  /* ------ INTERSECTION OBSERVER (Scroll Animations) ------ */
  var animatedEls = document.querySelectorAll('.fade-up, .fade-in');
  if (animatedEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    animatedEls.forEach(function (el) { observer.observe(el); });
  }

  /* ------ TAB SYSTEM ------ */
  document.querySelectorAll('.tab-nav').forEach(function (nav) {
    nav.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tabId = this.getAttribute('data-tab');
        if (!tabId) return;

        // Deactivate siblings
        nav.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        // Find parent section
        var section = nav.closest('section') || nav.parentElement;
        section.querySelectorAll('.tab-content').forEach(function (tc) {
          tc.classList.remove('active');
        });

        var target = document.getElementById('tab-' + tabId);
        if (target) target.classList.add('active');
      });
    });
  });

  /* ------ CHAT WIDGET ------ */
  var chatToggle = document.getElementById('chatToggle');
  var chatBox = document.getElementById('chatBox');
  var chatClose = document.getElementById('chatClose');
  var chatInput = document.getElementById('chatInput');
  var chatSend = document.getElementById('chatSend');
  var chatMessages = document.getElementById('chatMessages');

  if (chatToggle && chatBox) {
    chatToggle.addEventListener('click', function () {
      chatBox.classList.toggle('open');
    });
  }
  if (chatClose && chatBox) {
    chatClose.addEventListener('click', function () {
      chatBox.classList.remove('open');
    });
  }

  if (chatSend && chatInput && chatMessages) {
    function sendChat() {
      var msg = chatInput.value.trim();
      if (!msg) return;

      // Sanitize text
      var div = document.createElement('div');
      div.textContent = msg;
      var safeMsg = div.innerHTML;

      var bubble = document.createElement('div');
      bubble.className = 'chat-msg user';
      bubble.innerHTML = '<span>' + safeMsg + '</span>';
      chatMessages.appendChild(bubble);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Auto reply
      setTimeout(function () {
        var reply = document.createElement('div');
        reply.className = 'chat-msg bot';
        reply.innerHTML = '<span>Namaste! 🙏 Paola will be with you shortly. In the meantime, you can <a href="pages/consultation.html">book a free consultation</a>.</span>';
        chatMessages.appendChild(reply);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1200);
    }

    chatSend.addEventListener('click', sendChat);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendChat();
    });
  }

  /* ------ NEWSLETTER FORM ------ */
  var newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        var btn = newsletterForm.querySelector('button');
        if (btn) {
          btn.textContent = '✓ Subscribed!';
          btn.disabled = true;
        }
        emailInput.value = '';
        setTimeout(function () {
          if (btn) {
            btn.textContent = 'Subscribe ✨';
            btn.disabled = false;
          }
        }, 3000);
      }
    });
  }

  /* ------ MEMBERS AUTH (simple client-side demo) ------ */
  var loginForm = document.getElementById('loginForm');
  var registerForm = document.getElementById('registerForm');
  var loginBtn = document.getElementById('loginBtn');
  var registerBtn = document.getElementById('registerBtn');
  var logoutBtn = document.getElementById('logoutBtn');
  var dashboardTab = document.getElementById('dashboardTab');
  var switchToRegister = document.getElementById('switchToRegister');
  var memberNameEl = document.getElementById('memberName');
  var membershipTiers = document.getElementById('membershipTiers');
  var saveSettingsBtn = document.getElementById('saveSettings');

  if (switchToRegister) {
    switchToRegister.addEventListener('click', function (e) {
      e.preventDefault();
      var regTab = document.querySelector('[data-tab="register"]');
      if (regTab) regTab.click();
    });
  }

  function showDashboard(name) {
    if (dashboardTab) {
      dashboardTab.style.display = '';
      dashboardTab.click();
    }
    if (memberNameEl) memberNameEl.textContent = name || 'Beautiful Soul';
    if (membershipTiers) membershipTiers.style.display = 'none';
    // Hide login/register tabs
    var loginTab = document.querySelector('[data-tab="login"]');
    var regTab = document.querySelector('[data-tab="register"]');
    if (loginTab) loginTab.style.display = 'none';
    if (regTab) regTab.style.display = 'none';
  }

  function showAuth() {
    if (dashboardTab) {
      dashboardTab.style.display = 'none';
    }
    if (membershipTiers) membershipTiers.style.display = '';
    var loginTab = document.querySelector('[data-tab="login"]');
    var regTab = document.querySelector('[data-tab="register"]');
    if (loginTab) {
      loginTab.style.display = '';
      loginTab.click();
    }
    if (regTab) regTab.style.display = '';
  }

  // Check session on load
  var storedName = sessionStorage.getItem('bym_member_name');
  if (storedName) {
    showDashboard(storedName);
  }

  if (loginBtn && loginForm) {
    loginBtn.addEventListener('click', function () {
      var email = document.getElementById('loginEmail');
      var pw = document.getElementById('loginPassword');
      if (!email || !pw || !email.value || !pw.value) return;
      // Demo only — in production, validate server-side
      var name = email.value.split('@')[0];
      sessionStorage.setItem('bym_member_name', name);
      showDashboard(name);
    });
  }

  if (registerBtn && registerForm) {
    registerBtn.addEventListener('click', function () {
      var nameInput = document.getElementById('regName');
      var emailInput = document.getElementById('regEmail');
      var pwInput = document.getElementById('regPassword');
      if (!nameInput || !emailInput || !pwInput) return;
      if (!nameInput.value || !emailInput.value || !pwInput.value) return;
      sessionStorage.setItem('bym_member_name', nameInput.value);
      showDashboard(nameInput.value);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      sessionStorage.removeItem('bym_member_name');
      showAuth();
    });
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function () {
      var nameInput = document.getElementById('settingsName');
      if (nameInput && nameInput.value) {
        sessionStorage.setItem('bym_member_name', nameInput.value);
        if (memberNameEl) memberNameEl.textContent = nameInput.value;
      }
      saveSettingsBtn.textContent = '✓ Saved!';
      setTimeout(function () {
        saveSettingsBtn.textContent = 'Save Settings';
      }, 2000);
    });
  }

  /* ------ SMOOTH SCROLL for anchor links ------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id.length <= 1) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
