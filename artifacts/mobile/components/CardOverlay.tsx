import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
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
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ITEMS } from '@/components/GridScreen';
import {
  BRACELET_CAPTION,
  BRACELET_IMAGE,
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
  VOICE_AUDIO,
  VOICE_CAPTION,
  VOICE_NOTE,
} from '@/constants/content';

const FONT      = 'Caveat_400Regular';
const FONT_BOLD = 'Caveat_700Bold';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_W    = Math.min(SCREEN_W - 40, 370);
const CARD_MAX_H = SCREEN_H * 0.74;

interface Props {
  itemIndex:   number;
  onClose:     () => void;
  onNavigate:  (newIndex: number) => void;
  onReachEnd:  () => void;
}

export default function CardOverlay({ itemIndex, onClose, onNavigate, onReachEnd }: Props) {
  const cardScale   = useSharedValue(0.82);
  const cardOpacity = useSharedValue(0);
  const overlayOp   = useSharedValue(0);

  useEffect(() => {
    overlayOp.value = withTiming(1, { duration: 200 });
  }, []);

  useEffect(() => {
    cardScale.value   = 0.82;
    cardOpacity.value = 0;
    cardScale.value   = withSpring(1, { damping: 17, stiffness: 220 });
    cardOpacity.value = withTiming(1, { duration: 220 });
  }, [itemIndex]);

  const cardStyle    = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOp.value }));

  // Keep navigate/end callbacks in refs so PanResponder doesn't go stale
  const handleNextRef = useRef(() => {});
  const handlePrevRef = useRef(() => {});
  handleNextRef.current = () => {
    if (itemIndex < ITEMS.length - 1) onNavigate(itemIndex + 1);
    else onReachEnd();
  };
  handlePrevRef.current = () => {
    if (itemIndex > 0) onNavigate(itemIndex - 1);
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx < -50) handleNextRef.current();
        else if (g.dx > 50) handlePrevRef.current();
      },
    }),
  ).current;

  const item = ITEMS[itemIndex];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dim backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.dimOverlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Card */}
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View style={[styles.card, cardStyle]} {...pan.panHandlers}>

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={19} color="#8b6f5e" />
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.contentArea}>
            <CardContent itemId={item.id} />
          </View>

          {/* Caption */}
          <Text style={styles.cardCaption}>{item.label}</Text>

          {/* Navigation */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, { opacity: itemIndex > 0 ? 1 : 0.25 }]}
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

            <TouchableOpacity style={styles.navBtn} onPress={handleNextRef.current}>
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
    case 'voice':    return <VoiceContent />;
    case 'bracelet': return <BraceletContent />;
    case 'note':     return <NoteContent />;
    case 'photo':    return <PhotoContent />;
    case 'news':     return <NewsContent />;
    case 'location': return <LocationContent />;
    case 'gif':      return <GifContent />;
    case 'coupon':   return <CouponContent />;
    default:         return null;
  }
}

// ── VOICE ────────────────────────────────────────────────────
function VoiceContent() {
  const [sound,   setSound]   = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set audio mode once
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
    return () => {
      sound?.unloadAsync().catch(() => {});
    };
  }, [sound]);

  const handlePlay = async () => {
    if (VOICE_AUDIO === null) {
      // No file yet — just toggle UI state as a demo
      setPlaying(p => !p);
      return;
    }
    if (playing) {
      await sound?.pauseAsync();
      setPlaying(false);
      return;
    }
    if (sound) {
      await sound.playAsync();
      setPlaying(true);
      return;
    }
    setLoading(true);
    try {
      const { sound: s } = await Audio.Sound.createAsync(VOICE_AUDIO as number);
      s.setOnPlaybackStatusUpdate((st) => {
        if (st.isLoaded && st.didJustFinish) setPlaying(false);
      });
      setSound(s);
      await s.playAsync();
      setPlaying(true);
    } catch {
      // silently fail if file missing
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={v.wrap}>
      {/* Cassette */}
      <View style={v.cassette}>
        <View style={v.inner}>
          <Reel />
          <View style={v.window}><View style={v.tape} /></View>
          <Reel />
        </View>
        <View style={v.label}>
          <Text style={v.labelText}>Side A</Text>
          <View style={v.screws}>
            <View style={v.screw} /><View style={v.screw} />
          </View>
        </View>
      </View>

      {/* Play button */}
      <TouchableOpacity style={v.playBtn} onPress={handlePlay} disabled={loading}>
        <Feather name={playing ? 'pause' : 'play'} size={26} color="#fdf6ee" />
      </TouchableOpacity>

      <Text style={[cc.title, { textAlign: 'center' }]}>{VOICE_CAPTION}</Text>
      <Text style={[cc.body, { textAlign: 'center' }]}>
        {VOICE_AUDIO === null
          ? 'Add your audio file in constants/content.ts to enable playback'
          : VOICE_NOTE}
      </Text>
    </View>
  );
}

function Reel() {
  return (
    <View style={v.reel}>
      <View style={v.hub} />
    </View>
  );
}

// ── BRACELET ─────────────────────────────────────────────────
function BraceletContent() {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('bracelet_photo').then(s => { if (s) setUri(s); }).catch(() => {});
  }, []);

  const pickImage = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!r.canceled && r.assets[0]) {
      setUri(r.assets[0].uri);
      AsyncStorage.setItem('bracelet_photo', r.assets[0].uri).catch(() => {});
    }
  };

  const source = uri ? { uri } : BRACELET_IMAGE;

  return (
    <View style={cc.padded}>
      <View style={br.imageArea}>
        {source ? (
          <View style={br.photoFrame}>
            <Image source={source} style={br.photo} contentFit="cover" />
            <TouchableOpacity style={br.editBtn} onPress={pickImage}>
              <Feather name="edit-2" size={13} color="#8b6f5e" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={br.placeholder} onPress={pickImage}>
            <View style={br.beads}>
              {['#e8c4c2','#c2d4e8','#e8dfc2','#dcc2e8','#c2e8d8','#e8c2d4','#e8e2c2'].map((c, i) => (
                <View key={i} style={[br.bead, { backgroundColor: c }]} />
              ))}
            </View>
            <MaterialCommunityIcons name="camera-plus-outline" size={28} color="#b8a090" />
            <Text style={br.hint}>tap to add a photo of your bracelet</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={cc.title}>{BRACELET_CAPTION}</Text>
      <Text style={cc.body}>{BRACELET_MEANING}</Text>
    </View>
  );
}

// ── NOTE ─────────────────────────────────────────────────────
function NoteContent() {
  return (
    <View style={nt.paper}>
      {Array.from({ length: 7 }).map((_, i) => (
        <View key={i} style={[nt.line, { top: 48 + i * 32 }]} />
      ))}
      <MaterialCommunityIcons name="heart"        size={13} color="#c4706e" style={nt.dTL} />
      <MaterialCommunityIcons name="star"         size={13} color="#c4706e" style={nt.dTR} />
      <MaterialCommunityIcons name="star-outline" size={11} color="#d4b8a0" style={nt.dBL} />
      <MaterialCommunityIcons name="heart-outline"size={11} color="#d4b8a0" style={nt.dBR} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <Text style={nt.message}>{NOTE_MESSAGE}</Text>
      </ScrollView>
    </View>
  );
}

// ── PHOTO ────────────────────────────────────────────────────
function PhotoContent() {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('photo_card').then(s => { if (s) setUri(s); }).catch(() => {});
  }, []);

  const pickImage = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!r.canceled && r.assets[0]) {
      setUri(r.assets[0].uri);
      AsyncStorage.setItem('photo_card', r.assets[0].uri).catch(() => {});
    }
  };

  const source = uri ? { uri } : PHOTO_IMAGE;
  const photoSize = CARD_W - 80;

  return (
    <View style={cc.padded}>
      <View style={ph.polaroid}>
        {source ? (
          <>
            <Image source={source} style={[ph.photo, { width: photoSize, height: photoSize }]} contentFit="cover" />
            <TouchableOpacity style={ph.changeBtn} onPress={pickImage}>
              <Feather name="edit-2" size={13} color="#8b6f5e" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={pickImage}
            style={[ph.placeholder, { width: photoSize, height: photoSize }]}
          >
            <Feather name="camera" size={36} color="#d4b8a0" />
            <Text style={ph.hint}>tap to add your photo</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={ph.caption}>{PHOTO_CAPTION}</Text>
    </View>
  );
}

// ── NEWS ─────────────────────────────────────────────────────
function NewsContent() {
  return (
    <ScrollView style={nw.paper} showsVerticalScrollIndicator={false}>
      <Text style={nw.masthead}>THE LITTLE TIMES</Text>
      <View style={nw.line} />
      <Text style={nw.date}>{NEWS_DATE} · Special Edition</Text>
      <View style={nw.line} />
      <Text style={nw.headline}>{NEWS_HEADLINE}</Text>
      <Text style={nw.subline}>{NEWS_SUBHEADLINE}</Text>
      <View style={nw.line} />
      <Text style={nw.body}>{NEWS_BODY}</Text>
    </ScrollView>
  );
}

// ── LOCATION ─────────────────────────────────────────────────
function LocationContent() {
  return (
    <View style={lc.postcard}>
      <View style={lc.stamp}>
        <MaterialCommunityIcons name="map-marker" size={18} color="#c4706e" />
      </View>
      <Feather name="map-pin" size={22} color="#c4706e" style={{ marginBottom: 8 }} />
      <Text style={lc.name}>{LOCATION_NAME}</Text>
      <Text style={lc.tag}>{LOCATION_TAGLINE}</Text>
      <View style={lc.div} />
      <Text style={lc.note}>{LOCATION_NOTE}</Text>
      <Text style={lc.coords}>{LOCATION_COORDINATES}</Text>
    </View>
  );
}

// ── GIF ──────────────────────────────────────────────────────
function GifContent() {
  const size = CARD_W - 48;
  return (
    <View style={cc.padded}>
      <View style={[gf.frame, { width: size, height: size * 0.75 }]}>
        <Image source={{ uri: GIF_URL }} style={gf.gif} contentFit="cover" autoplay />
      </View>
      <Text style={[cc.title, { textAlign: 'center', marginTop: 12 }]}>{GIF_CAPTION}</Text>
    </View>
  );
}

// ── COUPON ────────────────────────────────────────────────────
function CouponContent() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 14, gap: 12 }}
    >
      {COUPONS.map((c, i) => (
        <View key={i} style={cp.ticket}>
          <View style={cp.stub}>
            <Text style={cp.stubNum}>{i + 1}</Text>
          </View>
          <View style={cp.body}>
            <Text style={cp.goodFor}>GOOD FOR</Text>
            <Text style={cp.title}>{c.title}</Text>
            <Text style={cp.fine}>{c.finePrint}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Style sheets
// ═══════════════════════════════════════════════════════════════

// Shared card content
const cc = StyleSheet.create({
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

// Voice
const v = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 20, flex: 1 },
  cassette: {
    backgroundColor: '#3a302a',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reel: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#2a2220',
    borderWidth: 2, borderColor: '#5a4838',
    alignItems: 'center', justifyContent: 'center',
  },
  hub: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#4a3828',
  },
  window: {
    flex: 1, height: 28, marginHorizontal: 8,
    backgroundColor: '#1a1410',
    borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  tape: {
    width: '80%', height: 5,
    backgroundColor: '#2e2418', borderRadius: 3,
  },
  label: {
    backgroundColor: '#f8f0e0',
    borderRadius: 5,
    paddingVertical: 5, paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelText: { fontFamily: FONT_BOLD, fontSize: 14, color: '#3d2c1e' },
  screws: { flexDirection: 'row', gap: 8 },
  screw: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8b6f5e' },
  playBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#c4706e',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#c4706e',
    shadowOpacity: 0.35, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
});

// Bracelet
const br = StyleSheet.create({
  imageArea: { alignItems: 'center', marginBottom: 12 },
  photoFrame: {
    width: CARD_W - 80, height: CARD_W - 80,
    borderRadius: 12, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  photo: { width: '100%', height: '100%' },
  editBtn: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: '#fdf6ee',
    borderRadius: 12, padding: 5,
  },
  placeholder: {
    width: CARD_W - 80, height: CARD_W - 100,
    borderRadius: 12,
    backgroundColor: '#f0e8dc',
    alignItems: 'center', justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5, borderColor: '#e0cbb8', borderStyle: 'dashed',
  },
  beads: {
    flexDirection: 'row', gap: 5, marginBottom: 4,
  },
  bead: {
    width: 16, height: 16, borderRadius: 8,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1,
  },
  hint: {
    fontFamily: FONT, fontSize: 14, color: '#b8a090', textAlign: 'center',
  },
});

// Note
const nt = StyleSheet.create({
  paper: {
    flex: 1,
    backgroundColor: '#fdf8f0',
    padding: 20, paddingTop: 36,
  },
  line: {
    position: 'absolute', left: 20, right: 20,
    height: 1, backgroundColor: '#e8d8c4',
  },
  dTL: { position: 'absolute', top: 10, left: 10 },
  dTR: { position: 'absolute', top: 10, right: 10 },
  dBL: { position: 'absolute', bottom: 10, left: 10 },
  dBR: { position: 'absolute', bottom: 10, right: 10 },
  message: {
    fontFamily: FONT, fontSize: 19, color: '#3d2c1e', lineHeight: 31,
  },
});

// Photo
const ph = StyleSheet.create({
  polaroid: {
    backgroundColor: '#ffffff',
    padding: 10, paddingBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15, shadowRadius: 8,
    shadowOffset: { width: 2, height: 4 },
    elevation: 6, borderRadius: 2,
    alignSelf: 'center', marginBottom: 10,
  },
  photo: { borderRadius: 1 },
  changeBtn: {
    position: 'absolute', bottom: 14, right: 6,
    backgroundColor: '#fdf6ee',
    borderRadius: 12, padding: 5,
  },
  placeholder: {
    backgroundColor: '#f0e8dc',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  hint: {
    fontFamily: FONT, fontSize: 14, color: '#b8a090', textAlign: 'center',
  },
  caption: {
    fontFamily: FONT_BOLD, fontSize: 20,
    color: '#3d2c1e', textAlign: 'center',
  },
});

// News
const nw = StyleSheet.create({
  paper: { flex: 1, backgroundColor: '#f8f4e8', padding: 18 },
  masthead: {
    fontFamily: FONT_BOLD, fontSize: 22, color: '#3d2c1e',
    textAlign: 'center', letterSpacing: 3, marginBottom: 6,
  },
  line: { height: 1, backgroundColor: '#3d2c1e', marginVertical: 5 },
  date: {
    fontFamily: FONT, fontSize: 11, color: '#8b6f5e',
    textAlign: 'center', letterSpacing: 0.5, marginBottom: 2,
  },
  headline: {
    fontFamily: FONT_BOLD, fontSize: 20, color: '#3d2c1e',
    marginTop: 10, marginBottom: 4, lineHeight: 26,
  },
  subline: {
    fontFamily: FONT, fontSize: 14, color: '#5a4838',
    fontStyle: 'italic', marginBottom: 8,
  },
  body: {
    fontFamily: FONT, fontSize: 15, color: '#3d2c1e', lineHeight: 22,
  },
});

// Location
const lc = StyleSheet.create({
  postcard: { flex: 1, backgroundColor: '#fdf8ee', padding: 22 },
  stamp: {
    position: 'absolute', top: 12, right: 12,
    width: 44, height: 52,
    backgroundColor: '#ede0d4',
    borderWidth: 1, borderColor: '#d4b8a0',
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 3,
  },
  name: {
    fontFamily: FONT_BOLD, fontSize: 26, color: '#3d2c1e',
    marginBottom: 4, marginRight: 56,
  },
  tag: {
    fontFamily: FONT, fontSize: 15, color: '#8b6f5e',
    fontStyle: 'italic', marginBottom: 14,
  },
  div: { height: 1, backgroundColor: '#e0cbb8', marginBottom: 14 },
  note: {
    fontFamily: FONT, fontSize: 18, color: '#3d2c1e',
    lineHeight: 26, marginBottom: 16,
  },
  coords: {
    fontFamily: FONT, fontSize: 12, color: '#b8a090', letterSpacing: 0.5,
  },
});

// Gif
const gf = StyleSheet.create({
  frame: {
    borderRadius: 16, overflow: 'hidden',
    backgroundColor: '#ede0d4', alignSelf: 'center',
  },
  gif: { width: '100%', height: '100%' },
});

// Coupon
const cp = StyleSheet.create({
  ticket: {
    flexDirection: 'row',
    backgroundColor: '#fdf6ee',
    borderRadius: 10, overflow: 'hidden',
    shadowColor: '#3d2c1e',
    shadowOpacity: 0.1, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  stub: {
    width: 40, backgroundColor: '#c4706e',
    alignItems: 'center', justifyContent: 'center',
  },
  stubNum: {
    fontFamily: FONT_BOLD, fontSize: 20, color: '#fff',
    transform: [{ rotate: '-90deg' }],
  },
  body: { flex: 1, padding: 14 },
  goodFor: {
    fontFamily: FONT, fontSize: 11, color: '#b8a090',
    letterSpacing: 1.5, marginBottom: 3,
  },
  title: {
    fontFamily: FONT_BOLD, fontSize: 20, color: '#3d2c1e', marginBottom: 3,
  },
  fine: {
    fontFamily: FONT, fontSize: 13, color: '#8b6f5e', fontStyle: 'italic',
  },
});

// ── Overlay shell ─────────────────────────────────────────────
const styles = StyleSheet.create({
  dimOverlay: { backgroundColor: 'rgba(30,20,15,0.62)' },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  card: {
    width: CARD_W,
    maxHeight: CARD_MAX_H,
    backgroundColor: '#fdf6ee',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#3d2c1e',
    shadowOpacity: 0.28, shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  contentArea: { flex: 1 },
  closeBtn: {
    position: 'absolute', top: 10, right: 10, zIndex: 10,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#f0e4d3',
    alignItems: 'center', justifyContent: 'center',
  },
  cardCaption: {
    fontFamily: FONT_BOLD, fontSize: 14, color: '#8b6f5e',
    textAlign: 'center', letterSpacing: 1.2,
    paddingVertical: 5, textTransform: 'lowercase',
  },
  navRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12, paddingBottom: 12, paddingTop: 4,
    borderTopWidth: 1, borderTopColor: '#ede0d4',
  },
  navBtn: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  dotRow: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
});
