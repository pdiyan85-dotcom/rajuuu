import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ITEMS } from '@/components/GridScreen';
import {
  BRACELET_CAPTION,
  BRACELET_MEANING,
  COUPONS,
  GIF_CAPTION,
  GIF_URL,
  LOCATION_COORDINATES,
  LOCATION_NAME,
  LOCATION_NOTE,
  LOCATION_TAGLINE,
  NEWS_BODY,
  NEWS_DATE,
  NEWS_HEADLINE,
  NEWS_SUBHEADLINE,
  NOTE_MESSAGE,
  PHOTO_CAPTION,
  PHOTO_IMAGE,
  VOICE_CAPTION,
  VOICE_NOTE,
} from '@/constants/content';

const FONT = 'Caveat_400Regular';
const FONT_BOLD = 'Caveat_700Bold';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_W = Math.min(SCREEN_W - 48, 360);
const CARD_MAX_H = SCREEN_H * 0.72;

interface Props {
  itemIndex: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
  onReachEnd: () => void;
}

export default function CardOverlay({ itemIndex, onClose, onNavigate, onReachEnd }: Props) {
  const cardScale = useSharedValue(0.82);
  const cardOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    cardScale.value = 0.82;
    cardOpacity.value = 0;
    overlayOpacity.value = withTiming(1, { duration: 200 });
    cardScale.value = withSpring(1, { damping: 17, stiffness: 220 });
    cardOpacity.value = withTiming(1, { duration: 220 });
  }, [itemIndex]);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 200 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // Swipe gesture
  const panRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx < -50) {
          // swipe left = next
          handleNextRef.current();
        } else if (g.dx > 50) {
          // swipe right = prev
          handlePrevRef.current();
        }
      },
    }),
  ).current;

  const handleNextRef = useRef(() => {});
  const handlePrevRef = useRef(() => {});

  // update refs without re-creating panResponder
  handleNextRef.current = () => {
    if (itemIndex < ITEMS.length - 1) {
      onNavigate(itemIndex + 1);
    } else {
      onReachEnd();
    }
  };
  handlePrevRef.current = () => {
    if (itemIndex > 0) onNavigate(itemIndex - 1);
  };

  const item = ITEMS[itemIndex];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dim overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.dimOverlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Card */}
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <Animated.View
          style={[styles.card, cardStyle]}
          {...panRef.panHandlers}
        >
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={20} color="#8b6f5e" />
          </TouchableOpacity>

          {/* Card content */}
          <CardContent itemId={item.id} />

          {/* Caption label */}
          <Text style={styles.cardCaption}>{item.label}</Text>

          {/* Navigation arrows */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, { opacity: itemIndex > 0 ? 1 : 0.2 }]}
              onPress={handlePrevRef.current}
              disabled={itemIndex === 0}
            >
              <Feather name="chevron-left" size={22} color="#8b6f5e" />
            </TouchableOpacity>

            <View style={styles.dotRow}>
              {ITEMS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === itemIndex ? '#c4706e' : '#d4b8a0' },
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={handleNextRef.current}
            >
              <Feather name="chevron-right" size={22} color="#8b6f5e" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

// ── Card content switcher ────────────────────────────────────
function CardContent({ itemId }: { itemId: string }) {
  switch (itemId) {
    case 'voice': return <VoiceContent />;
    case 'bracelet': return <BraceletContent />;
    case 'note': return <NoteContent />;
    case 'photo': return <PhotoContent />;
    case 'news': return <NewsContent />;
    case 'location': return <LocationContent />;
    case 'gif': return <GifContent />;
    case 'coupon': return <CouponContent />;
    default: return null;
  }
}

// ── VOICE ────────────────────────────────────────────────────
function VoiceContent() {
  const [playing, setPlaying] = useState(false);

  return (
    <View style={cardContentStyles.padded}>
      {/* Cassette tape illustration */}
      <View style={voiceStyles.cassette}>
        <View style={voiceStyles.cassetteInner}>
          {/* Left reel */}
          <View style={voiceStyles.reel}>
            <View style={voiceStyles.reelHub} />
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <View
                key={i}
                style={[voiceStyles.reelSpoke, { transform: [{ rotate: `${deg}deg` }] }]}
              />
            ))}
          </View>
          {/* Center tape window */}
          <View style={voiceStyles.tapeWindow}>
            <View style={voiceStyles.tapeStrip} />
          </View>
          {/* Right reel */}
          <View style={voiceStyles.reel}>
            <View style={voiceStyles.reelHub} />
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <View
                key={i}
                style={[voiceStyles.reelSpoke, { transform: [{ rotate: `${deg}deg` }] }]}
              />
            ))}
          </View>
        </View>
        {/* Cassette label */}
        <View style={voiceStyles.cassetteLabel}>
          <Text style={voiceStyles.cassetteLabelText}>Side A</Text>
          <View style={voiceStyles.cassetteScrews}>
            <View style={voiceStyles.screw} />
            <View style={voiceStyles.screw} />
          </View>
        </View>
      </View>

      {/* Play button */}
      <TouchableOpacity
        style={voiceStyles.playBtn}
        onPress={() => setPlaying(!playing)}
      >
        <Feather name={playing ? 'pause' : 'play'} size={26} color="#fdf6ee" />
      </TouchableOpacity>

      <Text style={[cardContentStyles.title, { textAlign: 'center' }]}>{VOICE_CAPTION}</Text>
      <Text style={[cardContentStyles.body, { textAlign: 'center' }]}>{VOICE_NOTE}</Text>
    </View>
  );
}

// ── BRACELET ─────────────────────────────────────────────────
function BraceletContent() {
  return (
    <View style={cardContentStyles.padded}>
      <View style={braceletStyles.imageArea}>
        {/* Bracelet illustration using icon */}
        <View style={braceletStyles.braceletCircle}>
          <MaterialCommunityIcons name="link-variant" size={52} color="#8b6f5e" />
        </View>
        {/* Bead dots */}
        <View style={braceletStyles.beadRow}>
          {['#e8c4c2','#c2d4e8','#e8dfc2','#dcc2e8','#c2e8d8','#e8c2d4'].map((c, i) => (
            <View key={i} style={[braceletStyles.bead, { backgroundColor: c }]} />
          ))}
        </View>
      </View>
      <Text style={cardContentStyles.title}>{BRACELET_CAPTION}</Text>
      <Text style={cardContentStyles.body}>{BRACELET_MEANING}</Text>
    </View>
  );
}

// ── NOTE ─────────────────────────────────────────────────────
function NoteContent() {
  return (
    <View style={noteStyles.paper}>
      {/* Lines */}
      {Array.from({ length: 7 }).map((_, i) => (
        <View key={i} style={[noteStyles.line, { top: 48 + i * 32 }]} />
      ))}
      {/* Corner doodles */}
      <MaterialCommunityIcons name="heart" size={13} color="#c4706e" style={noteStyles.dTL} />
      <MaterialCommunityIcons name="star" size={13} color="#c4706e" style={noteStyles.dTR} />
      <MaterialCommunityIcons name="star-outline" size={11} color="#d4b8a0" style={noteStyles.dBL} />
      <MaterialCommunityIcons name="heart-outline" size={11} color="#d4b8a0" style={noteStyles.dBR} />
      <Text style={noteStyles.message}>{NOTE_MESSAGE}</Text>
    </View>
  );
}

// ── PHOTO ────────────────────────────────────────────────────
function PhotoContent() {
  return (
    <View style={cardContentStyles.padded}>
      <View style={photoStyles.polaroid}>
        {PHOTO_IMAGE !== null ? (
          <Image source={PHOTO_IMAGE} style={photoStyles.photo} contentFit="cover" />
        ) : (
          <View style={photoStyles.placeholder}>
            <Feather name="camera" size={36} color="#d4b8a0" />
            <Text style={photoStyles.placeholderHint}>
              add your photo in{'\n'}constants/content.ts
            </Text>
          </View>
        )}
      </View>
      <Text style={photoStyles.caption}>{PHOTO_CAPTION}</Text>
    </View>
  );
}

// ── NEWS ─────────────────────────────────────────────────────
function NewsContent() {
  return (
    <ScrollView style={newsStyles.paper} showsVerticalScrollIndicator={false}>
      <Text style={newsStyles.masthead}>THE LITTLE TIMES</Text>
      <View style={newsStyles.hairline} />
      <Text style={newsStyles.date}>{NEWS_DATE} · Special Edition</Text>
      <View style={newsStyles.hairline} />
      <Text style={newsStyles.headline}>{NEWS_HEADLINE}</Text>
      <Text style={newsStyles.subline}>{NEWS_SUBHEADLINE}</Text>
      <View style={newsStyles.hairline} />
      <Text style={newsStyles.body}>{NEWS_BODY}</Text>
    </ScrollView>
  );
}

// ── LOCATION ─────────────────────────────────────────────────
function LocationContent() {
  return (
    <View style={locationStyles.postcard}>
      {/* Stamp corner */}
      <View style={locationStyles.stamp}>
        <MaterialCommunityIcons name="map-marker" size={18} color="#c4706e" />
      </View>

      <View style={locationStyles.pinRow}>
        <Feather name="map-pin" size={22} color="#c4706e" />
      </View>
      <Text style={locationStyles.locName}>{LOCATION_NAME}</Text>
      <Text style={locationStyles.tagline}>{LOCATION_TAGLINE}</Text>
      <View style={locationStyles.divider} />
      <Text style={locationStyles.note}>{LOCATION_NOTE}</Text>
      <Text style={locationStyles.coords}>{LOCATION_COORDINATES}</Text>
    </View>
  );
}

// ── GIF ──────────────────────────────────────────────────────
function GifContent() {
  return (
    <View style={cardContentStyles.padded}>
      <View style={gifStyles.frame}>
        <Image
          source={{ uri: GIF_URL }}
          style={gifStyles.gif}
          contentFit="cover"
          autoplay
        />
      </View>
      <Text style={[cardContentStyles.title, { textAlign: 'center', marginTop: 12 }]}>{GIF_CAPTION}</Text>
    </View>
  );
}

// ── COUPON ────────────────────────────────────────────────────
function CouponContent() {
  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12 }}>
      {COUPONS.map((c, i) => (
        <View key={i} style={couponStyles.ticket}>
          {/* Left tear stub */}
          <View style={couponStyles.stub}>
            <Text style={couponStyles.stubNum}>{i + 1}</Text>
          </View>
          {/* Dashed separator */}
          <View style={couponStyles.dash} />
          {/* Body */}
          <View style={couponStyles.body}>
            <Text style={couponStyles.goodFor}>GOOD FOR</Text>
            <Text style={couponStyles.title}>{c.title}</Text>
            <Text style={couponStyles.finePrint}>{c.finePrint}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ── Shared card content styles ────────────────────────────────
const cardContentStyles = StyleSheet.create({
  padded: { padding: 20, flex: 1 },
  title: {
    fontFamily: FONT_BOLD,
    fontSize: 20,
    color: '#3d2c1e',
    marginTop: 8,
    marginBottom: 4,
  },
  body: {
    fontFamily: FONT,
    fontSize: 16,
    color: '#8b6f5e',
    lineHeight: 22,
  },
});

// ── Voice styles ──────────────────────────────────────────────
const voiceStyles = StyleSheet.create({
  cassette: {
    backgroundColor: '#3a302a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cassetteInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reel: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2a2220',
    borderWidth: 2,
    borderColor: '#5a4838',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelHub: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4a3828',
    position: 'absolute',
  },
  reelSpoke: {
    position: 'absolute',
    width: 2,
    height: 18,
    backgroundColor: '#4a3828',
    top: 17,
    left: 25,
    transformOrigin: 'bottom center',
  },
  tapeWindow: {
    flex: 1,
    height: 30,
    marginHorizontal: 8,
    backgroundColor: '#1a1410',
    borderRadius: 4,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapeStrip: {
    width: '80%',
    height: 6,
    backgroundColor: '#2a2018',
    borderRadius: 3,
  },
  cassetteLabel: {
    backgroundColor: '#f8f0e0',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cassetteLabelText: {
    fontFamily: FONT_BOLD,
    fontSize: 14,
    color: '#3d2c1e',
  },
  cassetteScrews: { flexDirection: 'row', gap: 8 },
  screw: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#8b6f5e',
  },
  playBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#c4706e',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
    shadowColor: '#c4706e',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});

// ── Bracelet styles ───────────────────────────────────────────
const braceletStyles = StyleSheet.create({
  imageArea: { alignItems: 'center', marginBottom: 12 },
  braceletCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#f0e8dc',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2, borderColor: '#e0ccb8',
  },
  beadRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bead: {
    width: 18, height: 18, borderRadius: 9,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3,
    elevation: 2,
  },
});

// ── Note styles ───────────────────────────────────────────────
const noteStyles = StyleSheet.create({
  paper: {
    flex: 1,
    backgroundColor: '#fdf8f0',
    padding: 20,
    paddingTop: 36,
  },
  line: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#e8d8c4',
  },
  dTL: { position: 'absolute', top: 10, left: 10 },
  dTR: { position: 'absolute', top: 10, right: 10 },
  dBL: { position: 'absolute', bottom: 10, left: 10 },
  dBR: { position: 'absolute', bottom: 10, right: 10 },
  message: {
    fontFamily: FONT,
    fontSize: 19,
    color: '#3d2c1e',
    lineHeight: 31,
    zIndex: 1,
  },
});

// ── Photo styles ──────────────────────────────────────────────
const photoStyles = StyleSheet.create({
  polaroid: {
    backgroundColor: '#ffffff',
    padding: 10,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 4 },
    elevation: 6,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  photo: {
    width: CARD_W - 80,
    height: CARD_W - 80,
    borderRadius: 1,
  },
  placeholder: {
    width: CARD_W - 80,
    height: CARD_W - 80,
    backgroundColor: '#f0e8dc',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderHint: {
    fontFamily: FONT,
    fontSize: 13,
    color: '#b8a090',
    textAlign: 'center',
  },
  caption: {
    fontFamily: FONT_BOLD,
    fontSize: 20,
    color: '#3d2c1e',
    textAlign: 'center',
  },
});

// ── News styles ───────────────────────────────────────────────
const newsStyles = StyleSheet.create({
  paper: {
    flex: 1,
    backgroundColor: '#f8f4e8',
    padding: 18,
  },
  masthead: {
    fontFamily: FONT_BOLD,
    fontSize: 22,
    color: '#3d2c1e',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 6,
  },
  hairline: {
    height: 1,
    backgroundColor: '#3d2c1e',
    marginVertical: 5,
  },
  date: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#8b6f5e',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  headline: {
    fontFamily: FONT_BOLD,
    fontSize: 20,
    color: '#3d2c1e',
    marginTop: 10,
    marginBottom: 4,
    lineHeight: 26,
  },
  subline: {
    fontFamily: FONT,
    fontSize: 14,
    color: '#5a4838',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  body: {
    fontFamily: FONT,
    fontSize: 15,
    color: '#3d2c1e',
    lineHeight: 22,
  },
});

// ── Location styles ───────────────────────────────────────────
const locationStyles = StyleSheet.create({
  postcard: {
    flex: 1,
    backgroundColor: '#fdf8ee',
    padding: 22,
  },
  stamp: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 52,
    backgroundColor: '#ede0d4',
    borderWidth: 1,
    borderColor: '#d4b8a0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  pinRow: { marginBottom: 8 },
  locName: {
    fontFamily: FONT_BOLD,
    fontSize: 26,
    color: '#3d2c1e',
    marginBottom: 4,
    marginRight: 56,
  },
  tagline: {
    fontFamily: FONT,
    fontSize: 15,
    color: '#8b6f5e',
    fontStyle: 'italic',
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0cbb8',
    marginBottom: 14,
  },
  note: {
    fontFamily: FONT,
    fontSize: 18,
    color: '#3d2c1e',
    lineHeight: 26,
    marginBottom: 16,
  },
  coords: {
    fontFamily: FONT,
    fontSize: 12,
    color: '#b8a090',
    letterSpacing: 0.5,
  },
});

// ── Gif styles ────────────────────────────────────────────────
const gifStyles = StyleSheet.create({
  frame: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ede0d4',
    alignSelf: 'center',
    width: CARD_W - 48,
    height: CARD_W - 80,
  },
  gif: {
    width: '100%',
    height: '100%',
  },
});

// ── Coupon styles ─────────────────────────────────────────────
const couponStyles = StyleSheet.create({
  ticket: {
    flexDirection: 'row',
    backgroundColor: '#fdf6ee',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#3d2c1e',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  stub: {
    width: 40,
    backgroundColor: '#c4706e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stubNum: {
    fontFamily: FONT_BOLD,
    fontSize: 20,
    color: '#ffffff',
    transform: [{ rotate: '-90deg' }],
  },
  dash: {
    width: 1,
    backgroundColor: '#e8d5c4',
    borderStyle: 'dashed',
    borderLeftWidth: 2,
    borderColor: '#d4b8a0',
  },
  body: {
    flex: 1,
    padding: 14,
  },
  goodFor: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#b8a090',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  title: {
    fontFamily: FONT_BOLD,
    fontSize: 20,
    color: '#3d2c1e',
    marginBottom: 3,
  },
  finePrint: {
    fontFamily: FONT,
    fontSize: 13,
    color: '#8b6f5e',
    fontStyle: 'italic',
  },
});

// ── Overlay / card wrapper styles ─────────────────────────────
const styles = StyleSheet.create({
  dimOverlay: {
    backgroundColor: 'rgba(30, 20, 15, 0.6)',
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: CARD_W,
    maxHeight: CARD_MAX_H,
    backgroundColor: '#fdf6ee',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3d2c1e',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0e4d3',
    borderRadius: 16,
  },
  cardCaption: {
    fontFamily: FONT_BOLD,
    fontSize: 15,
    color: '#8b6f5e',
    textAlign: 'center',
    letterSpacing: 1.2,
    paddingBottom: 6,
    paddingTop: 2,
    textTransform: 'lowercase',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#ede0d4',
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
