// ============================================================
//  PERSONALIZE YOUR LITTLE BOX OF GOODIES
// ============================================================
//  All your customizable content lives here.
//  Change any value and the app updates automatically!
// ============================================================

// ── NAMES ────────────────────────────────────────────────────
// These appear on the shipping label on the box screen.
export const RECIPIENT_NAME = 'Jamie';
export const SENDER_NAME   = 'Alex';

// ════════════════════════════════════════════════════════════
//  VOICE MESSAGE
//  How to add your own voice note:
//   1. Record a voice memo on your phone (any app).
//   2. Transfer the .mp3 or .m4a file into:
//        artifacts/mobile/assets/audio/
//      (rename it to something like "voice-message.mp3")
//   3. Uncomment the VOICE_AUDIO line below and update the filename.
// ════════════════════════════════════════════════════════════
export const VOICE_CAPTION = 'a little voice note, just for you';
export const VOICE_NOTE    = 'press play to hear my voice';

// Uncomment + change the filename once you've added your audio file:
// export const VOICE_AUDIO: number = require('../assets/audio/voice-message.mp3');
export const VOICE_AUDIO: number | null = null;

// ════════════════════════════════════════════════════════════
//  FRIENDSHIP BRACELET
//  How to add a photo of your bracelet:
//   1. Add your photo to: artifacts/mobile/assets/images/my-bracelet.jpg
//   2. Uncomment BRACELET_IMAGE below and update the filename.
//   OR: Tap the camera icon inside the app to pick from your gallery!
// ════════════════════════════════════════════════════════════
export const BRACELET_CAPTION = 'I made this for you';
export const BRACELET_MEANING =
  'Every bead I chose with you in mind. This is a little piece of my heart on your wrist. Wear it and think of me!';

// Uncomment to use a local file instead of gallery picker:
// export const BRACELET_IMAGE: number = require('../assets/images/my-bracelet.jpg');
export const BRACELET_IMAGE: number | null = null;

// ════════════════════════════════════════════════════════════
//  HANDWRITTEN NOTE
// ════════════════════════════════════════════════════════════
export const NOTE_MESSAGE =
  'Hey you!\n\nI hope this little box finds you smiling. You deserve all the softness and warmth in the world.\n\nKeep going — you are doing absolutely amazing, and I am so proud of you every single day.\n\nLots of love xo';

// ════════════════════════════════════════════════════════════
//  PHOTO
//  How to add your own photo:
//   Option A — In-app: Tap the camera button inside the Photo card
//              to pick from your gallery. It saves automatically.
//   Option B — File: Add to assets/images/ and uncomment below:
//   export const PHOTO_IMAGE: number = require('../assets/images/our-photo.jpg');
// ════════════════════════════════════════════════════════════
export const PHOTO_CAPTION = 'us being us ✨';
export const PHOTO_IMAGE: number | null = null;

// ════════════════════════════════════════════════════════════
//  NEWSPAPER CLIPPING
// ════════════════════════════════════════════════════════════
export const NEWS_DATE       = 'July 21, 2026';
export const NEWS_HEADLINE   = 'LOCAL PERSON IS THE MOST\nWONDERFUL HUMAN ON EARTH';
export const NEWS_SUBHEADLINE = 'Sources confirm they light up every room they enter';
export const NEWS_BODY =
  'In a landmark study conducted by absolutely everyone who knows them, experts have unanimously confirmed that this person is, in fact, incredibly special. Witnesses describe a warm presence, a contagious laugh, and an uncanny ability to make everyone feel seen and loved. The findings have been peer-reviewed. More at 11.';

// ════════════════════════════════════════════════════════════
//  LOCATION / POSTCARD
// ════════════════════════════════════════════════════════════
export const LOCATION_NAME        = 'Our Favorite Spot';
export const LOCATION_TAGLINE     = 'the place that holds all our best memories';
export const LOCATION_NOTE        = 'This is where I always think of when I think of us. I hope we go back someday soon.';
export const LOCATION_COORDINATES = '40.7128° N, 74.0060° W';

// ════════════════════════════════════════════════════════════
//  GIF / ANIMATION
//  Swap GIF_URL for any direct .gif link from giphy.com or tenor.com
// ════════════════════════════════════════════════════════════
export const GIF_URL     = 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif';
export const GIF_CAPTION = 'this is literally us';

// ════════════════════════════════════════════════════════════
//  COUPONS
//  Add, remove or edit coupons below.
//  Each entry needs a "title" and "finePrint" field.
// ════════════════════════════════════════════════════════════
export const COUPONS: { title: string; finePrint: string }[] = [
  {
    title:     'One Free Hug',
    finePrint: 'redeemable anytime, any place, no expiry',
  },
  {
    title:     'One Movie Night',
    finePrint: 'your pick, my snacks, guaranteed good time',
  },
  {
    title:     'One Full Vent Session',
    finePrint: 'fully here, fully listening, no time limit',
  },
];

// ════════════════════════════════════════════════════════════
//  CLOSING NOTE  (the final screen)
// ════════════════════════════════════════════════════════════
export const CLOSING_MESSAGE =
  "you're doing amazing.\nyou're my star and my heart's home.\n\nthank you for being you — the world is so much better because you're in it.";
