/* ============================================================
   instagram-feed.js — Blissful Yoga Miami Dynamic Content Loader
   Fetches & renders Instagram posts, populates dynamic images,
   and keeps site content fresh from Paola's social presence.
   ============================================================ */

(function () {
  'use strict';

  var config = (window.BYM && window.BYM.config) || {};
  var ig = config.instagram || {};
  var services = config.services || {};
  var brand = config.brand || {};

  /* ====================================================
     1) BRAND LOGO — Replace SVG placeholder with real logo
     ==================================================== */
  function applyBrandLogo() {
    if (!brand.logo) return;

    document.querySelectorAll('.nav-brand .logo-icon').forEach(function (svg) {
      var img = document.createElement('img');
      img.src = brand.logo;
      img.alt = 'Blissful Yoga Miami';
      img.className = 'logo-icon';
      img.style.cssText = 'width: 40px; height: 40px; object-fit: contain; border-radius: 50%;';
      svg.parentNode.replaceChild(img, svg);
    });
  }

  /* ====================================================
     2) DYNAMIC SERVICE IMAGES — Swap data-src-key images
     ==================================================== */
  function applyServiceImages() {
    document.querySelectorAll('[data-src-key]').forEach(function (img) {
      var key = img.getAttribute('data-src-key');
      var url = services[key] || config.cdnBase;
      if (url && url !== config.cdnBase) {
        img.src = url;
        img.classList.add('loaded');
      }
    });
  }

  /* ====================================================
     3) INSTAGRAM FEED — Graph API or Embed fallback
     ==================================================== */

  /**
   * Mode A: Instagram Graph API (requires valid access token)
   * Fetches recent posts and renders them into containers
   * marked with data-ig-feed attribute.
   */
  function fetchInstagramAPI() {
    if (!ig.accessToken) return false;

    var url = 'https://graph.instagram.com/me/media'
      + '?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp'
      + '&limit=' + (ig.postsToShow || 12)
      + '&access_token=' + encodeURIComponent(ig.accessToken);

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.data) return;
        renderInstagramPosts(data.data);
      })
      .catch(function () {
        // Token expired or invalid — fall back to embeds
        loadInstagramEmbeds();
      });

    return true;
  }

  /**
   * Render API-fetched posts into carousel and feed containers.
   */
  function renderInstagramPosts(posts) {
    /* --- CAROUSEL on index.html --- */
    var carousel = document.getElementById('instaCarousel');
    if (carousel) {
      carousel.innerHTML = '';
      posts.slice(0, 8).forEach(function (post) {
        var mediaUrl = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
        if (!mediaUrl) return;

        var card = document.createElement('div');
        card.className = 'carousel-item';
        card.innerHTML =
          '<a href="' + escapeAttr(post.permalink) + '" target="_blank" rel="noopener" class="ig-post-link">' +
            '<img src="' + escapeAttr(mediaUrl) + '" alt="Instagram post" class="item-media" loading="lazy">' +
          '</a>' +
          '<div class="item-body">' +
            '<div class="item-meta">' +
              '<span class="ig-icon">📸</span>' +
              '<span class="handle">@' + escapeHtml(ig.handle) + '</span>' +
            '</div>' +
            '<p class="item-caption">' + truncate(escapeHtml(post.caption || ''), 140) + '</p>' +
          '</div>';
        carousel.appendChild(card);
      });
    }

    /* --- GRID FEED on testimonials.html, social-hub.html --- */
    document.querySelectorAll('[data-ig-feed]').forEach(function (container) {
      var count = parseInt(container.getAttribute('data-ig-count'), 10) || 6;
      container.innerHTML = '';
      posts.slice(0, count).forEach(function (post) {
        var mediaUrl = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
        if (!mediaUrl) return;

        var card = document.createElement('div');
        card.className = 'ig-feed-card fade-up visible';
        card.innerHTML =
          '<a href="' + escapeAttr(post.permalink) + '" target="_blank" rel="noopener">' +
            '<div class="ig-card-media">' +
              '<img src="' + escapeAttr(mediaUrl) + '" alt="Instagram post" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--radius-sm);">' +
              (post.media_type === 'VIDEO' ? '<span class="ig-video-badge">▶</span>' : '') +
            '</div>' +
            '<div class="ig-card-footer">' +
              '<span class="ig-icon-sm">📸</span>' +
              '<span>@' + escapeHtml(ig.handle) + '</span>' +
            '</div>' +
          '</a>';

        if (post.caption) {
          var captionEl = document.createElement('p');
          captionEl.className = 'ig-card-caption';
          captionEl.textContent = truncate(post.caption, 100);
          card.querySelector('a').appendChild(captionEl);
        }
        container.appendChild(card);
      });
    });
  }

  /**
   * Mode B: Instagram oEmbed/Embed.js (no token required for public posts)
   * Embeds actual Instagram post cards using their official embed script.
   */
  function loadInstagramEmbeds() {
    var posts = ig.featuredPosts || [];
    if (!posts.length) return;

    /* --- CAROUSEL — Render as embedded IG posts --- */
    var carousel = document.getElementById('instaCarousel');
    if (carousel) {
      carousel.innerHTML = '';
      carousel.classList.add('ig-embed-mode');
      posts.forEach(function (url) {
        var wrapper = document.createElement('div');
        wrapper.className = 'carousel-item ig-embed-item';
        wrapper.innerHTML =
          '<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="' + escapeAttr(url) + '"' +
          ' style="max-width:400px;min-width:280px;width:100%;margin:0;padding:0;">' +
          '</blockquote>';
        carousel.appendChild(wrapper);
      });
      loadEmbedScript();
    }

    /* --- Grid feeds --- */
    document.querySelectorAll('[data-ig-feed]').forEach(function (container) {
      container.innerHTML = '';
      container.classList.add('ig-embed-mode');
      posts.forEach(function (url) {
        var wrapper = document.createElement('div');
        wrapper.className = 'ig-feed-card ig-embed-item';
        wrapper.innerHTML =
          '<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="' + escapeAttr(url) + '"' +
          ' style="max-width:100%;min-width:280px;width:100%;margin:0;padding:0;">' +
          '</blockquote>';
        container.appendChild(wrapper);
      });
      loadEmbedScript();
    });
  }

  /**
   * Load Instagram's embed.js script (once) to render blockquotes as rich embeds.
   */
  var embedScriptLoaded = false;
  function loadEmbedScript() {
    if (embedScriptLoaded) {
      if (window.instgrm) window.instgrm.Embeds.process();
      return;
    }
    embedScriptLoaded = true;
    var script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.onload = function () {
      if (window.instgrm) window.instgrm.Embeds.process();
    };
    document.body.appendChild(script);
  }

  /* ====================================================
     4) TESTIMONIALS — Render real Google reviews
     ==================================================== */
  function renderRealTestimonials() {
    var container = document.getElementById('realTestimonials');
    if (!container || !config.testimonials) return;

    config.testimonials.forEach(function (t) {
      var card = document.createElement('div');
      card.className = 'testimonial-card fade-up visible';
      card.innerHTML =
        '<div class="stars">★★★★★</div>' +
        '<p class="quote-text">"' + escapeHtml(t.text) + '"</p>' +
        '<div class="reviewer">' +
          '<div class="reviewer-avatar initials-avatar">' + escapeHtml(t.initials) + '</div>' +
          '<div class="reviewer-info">' +
            '<div class="name">' + escapeHtml(t.name) + '</div>' +
            '<div class="source">via ' + escapeHtml(t.source) + '</div>' +
          '</div>' +
        '</div>';
      container.appendChild(card);
    });
  }

  /* ====================================================
     5) PROFILE AVATAR — Use initials for testimonial avatars
     ==================================================== */
  function replaceAvatarsWithInitials() {
    document.querySelectorAll('.reviewer-avatar[data-initials]').forEach(function (el) {
      var initials = el.getAttribute('data-initials');
      if (!initials) return;
      var div = document.createElement('div');
      div.className = 'reviewer-avatar initials-avatar';
      div.textContent = initials;
      el.parentNode.replaceChild(div, el);
    });
  }

  /* ====================================================
     HELPERS
     ==================================================== */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '…' : str;
  }

  /* ====================================================
     INIT — Run on DOM ready
     ==================================================== */
  function init() {
    applyBrandLogo();
    applyServiceImages();
    replaceAvatarsWithInitials();
    renderRealTestimonials();

    // Try Graph API first, fall back to embeds
    if (!fetchInstagramAPI()) {
      loadInstagramEmbeds();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
