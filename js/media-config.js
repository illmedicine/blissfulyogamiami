/* ============================================================
   media-config.js — Blissful Yoga Miami Media Configuration
   Central source of truth for all images, CDN paths, and
   Instagram integration. Update URLs here to change site-wide.
   ============================================================ */

var BYM = window.BYM || {};

BYM.config = {
  /* ---------- CDN from existing blissfulyogamiami.com ---------- */
  cdnBase: 'https://assets.cdn.filesafe.space/UIQ0VKqOtTyVeSA1fPGU/media/',

  /* Brand assets */
  brand: {
    logo: 'https://assets.cdn.filesafe.space/UIQ0VKqOtTyVeSA1fPGU/media/6888cf098934ce0beffff4db.png',
  },

  /* Service hero images from the live site */
  services: {
    prenatalYoga:   'https://assets.cdn.filesafe.space/UIQ0VKqOtTyVeSA1fPGU/media/68a62351280b9e36d0b27ebd.jpeg',
    hypnobirthing:  'https://assets.cdn.filesafe.space/UIQ0VKqOtTyVeSA1fPGU/media/68a61ddd280b9e2c79b187ab.jpeg',
    doulaServices:  'https://assets.cdn.filesafe.space/UIQ0VKqOtTyVeSA1fPGU/media/68a62031a6c93d668e146bcb.jpeg',
  },

  /* ---------- Instagram Configuration ---------- */
  instagram: {
    handle: 'blissfulyogamiami',
    profileUrl: 'https://www.instagram.com/blissfulyogamiami/',

    /*  Instagram Graph API token (refresh every 60 days).
        Generate at: https://developers.facebook.com/tools/explorer/
        Permissions needed: instagram_basic, pages_show_list
        Leave empty to use embed fallback instead. */
    accessToken: '',

    /* Number of recent posts to display */
    postsToShow: 12,

    /* Specific post URLs for manual embed mode (used when no API token).
       Update these periodically or whenever Paola posts key content.
       The Instagram embed.js script will render these as rich cards. */
    featuredPosts: [
      'https://www.instagram.com/p/DSqDJ77j7wS/',
      // Add more post URLs here as Paola publishes new content
      // 'https://www.instagram.com/p/XXXXXXX/',
    ],
  },

  /* ---------- Existing Website Scraping ---------- */
  existingSite: {
    baseUrl: 'https://blissfulyogamiami.com',
    pages: {
      home:              '/home',
      about:             '/about',
      prenatalYoga:      '/prenatalyoga',
      hypnobirthing:     '/hypnobirthing',
      doulaServices:     '/doulaservices',
      childbirthCoaching:'/childbirthcoaching',
      teacherTraining:   '/PrenatalYogaTeacherTraining',
      yogaClasses:       '/yogagroupclasses',
    },
  },

  /* ---------- Social Links ---------- */
  social: {
    instagram: 'https://www.instagram.com/blissfulyogamiami/',
    facebook:  'https://www.facebook.com/BlissFulYogaMiami',
    whatsapp:  'https://wa.me/17863266621',
    google:    'https://share.google/5hUd3KEQOZOcqMCqq',
  },

  /* ---------- Real Testimonials from Google Reviews ---------- */
  testimonials: [
    {
      text: "Wonderful Paola, wonderful prenatal yoga! Paola knows a lot about prenatal care, she is ready to support and she is really care about everybody. All her classes are different, so I don't need to do the same boring poses every times, I can try to do something new. Thank you!",
      name: 'Elena Lukina',
      source: 'Google Reviews',
      initials: 'EL',
    },
    {
      text: "Great place to start your yoga path, Paola her owner is amazing, she will be there to assist you and give you the best tips.",
      name: 'Santiago Arbelaez',
      source: 'Google Reviews',
      initials: 'SA',
    },
    {
      text: "Really nice studio, I was there today for the first time with Paola and liked her class very much.",
      name: 'Lucy Keme',
      source: 'Google Reviews',
      initials: 'LK',
    },
  ],

  /* ---------- Zoom Meeting SDK Configuration ---------- */
  zoom: {
    /*  Zoom Meeting SDK Key (Client ID) from Zoom Marketplace.
        Create a "Meeting SDK" app at https://marketplace.zoom.us/
        This is a public key — safe to expose in client code. */
    sdkKey: '',

    /*  Paola's Personal Meeting ID (PMI) — her persistent Zoom room.
        Users will join this meeting for consultations.
        Find it in Zoom > Profile > Personal Meeting ID. */
    meetingNumber: '',

    /*  Meeting passcode (if required). */
    meetingPassword: '',

    /*  Signature endpoint URL — a serverless function that generates
        the meeting SDK signature. Set up on Vercel/Netlify using:
        https://github.com/zoom/meetingsdk-auth-endpoint-sample
        Example: 'https://your-app.vercel.app/api/signature' */
    signatureEndpoint: '',

    /*  Paola's display name in the meeting. */
    hostName: 'Paola — Blissful Yoga Miami',

    /*  Join link fallback — if SDK isn't configured, this URL
        opens Zoom's web client directly. Format:
        https://zoom.us/j/MEETING_ID?pwd=PASSWORD */
    joinUrl: '',
  },

  /* ---------- Hero Collage Images ---------- */
  heroCollage: [
    'https://assets.cdn.filesafe.space/UIQ0VKqOtTyVeSA1fPGU/media/68a62351280b9e36d0b27ebd.jpeg',
    'https://assets.cdn.filesafe.space/UIQ0VKqOtTyVeSA1fPGU/media/68a61ddd280b9e2c79b187ab.jpeg',
    'https://assets.cdn.filesafe.space/UIQ0VKqOtTyVeSA1fPGU/media/68a62031a6c93d668e146bcb.jpeg',
  ],
};

window.BYM = BYM;
