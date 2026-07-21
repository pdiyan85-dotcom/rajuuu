import React from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FONT      = 'Caveat_400Regular';
const FONT_BOLD = 'Caveat_700Bold';

export type Item = {
  id: string;
  label: string;
  rotate: number;
  image: number;
  dotColor: string;
};

// Each item has a generated illustration and a slight hand-placed rotation.
export const ITEMS: Item[] = [
  { id: 'voice',    label: 'voice',    rotate: -3,   image: require('../assets/images/card-voice.png'),    dotColor: '#e8c4c2' },
  { id: 'bracelet', label: 'bracelet', rotate:  2.5, image: require('../assets/images/card-bracelet.png'), dotColor: '#c2d4e8' },
  { id: 'note',     label: 'note',     rotate: -1.5, image: require('../assets/images/card-note.png'),     dotColor: '#e8dfc2' },
  { id: 'photo',    label: 'photo',    rotate:  3.5, image: require('../assets/images/card-photo.png'),    dotColor: '#c2e8d8' },
  { id: 'news',     label: 'news',     rotate: -2.5, image: require('../assets/images/card-news.png'),     dotColor: '#dcc2e8' },
  { id: 'location', label: 'location', rotate:  4,   image: require('../assets/images/card-location.png'), dotColor: '#c2e8e4' },
  { id: 'gif',      label: 'gif',      rotate: -3.5, image: require('../assets/images/card-gif.png'),      dotColor: '#e8c2d4' },
  { id: 'coupon',   label: 'coupon',   rotate:  1.5, image: require('../assets/images/card-coupon.png'),   dotColor: '#e8e2c2' },
];

const { width: SCREEN_W } = Dimensions.get('window');
const ITEM_W = Math.floor((SCREEN_W - 52) / 2);

// ── Single grid item (extracted so hooks are not called in a loop) ──────────
function GridItem({ item, onPress }: { item: Item; onPress: () => void }) {
  const pressScale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${item.rotate}deg` },
      { scale: pressScale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.card, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { pressScale.value = withSpring(0.93, { damping: 14 }); }}
        onPressOut={() => { pressScale.value = withSpring(1.0, { damping: 12 }); }}
        style={styles.cardPressable}
      >
        {/* Illustration image */}
        <View style={styles.imageWrap}>
          <Image
            source={item.image}
            style={styles.cardImage}
            contentFit="cover"
            transition={200}
          />
        </View>

        {/* Label */}
        <Text style={styles.itemLabel}>{item.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Main grid screen ─────────────────────────────────────────
interface Props {
  onSelectItem: (index: number) => void;
  onOpenFinal:  () => void;
}

export default function GridScreen({ onSelectItem, onOpenFinal }: Props) {
  const insets    = useSafeAreaInsets();
  const topPad    = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 24, paddingBottom: bottomPad + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>your little box{'\n'}of goodies</Text>
      <Text style={styles.subheading}>8 little surprises, just for you</Text>

      <View style={styles.grid}>
        {ITEMS.map((item, i) => (
          <View key={item.id} style={styles.itemWrapper}>
            <GridItem item={item} onPress={() => onSelectItem(i)} />
          </View>
        ))}
      </View>

      {/* Closing note shortcut */}
      <Pressable onPress={onOpenFinal} style={styles.finalBtn}>
        <MaterialCommunityIcons name="heart" size={14} color="#c4706e" />
        <Text style={styles.finalBtnText}>see the closing note</Text>
        <MaterialCommunityIcons name="heart" size={14} color="#c4706e" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#f0e4d3',
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heading: {
    fontFamily: FONT_BOLD,
    fontSize: 34,
    color: '#3d2c1e',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 6,
  },
  subheading: {
    fontFamily: FONT,
    fontSize: 16,
    color: '#8b6f5e',
    marginBottom: 28,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  itemWrapper: {
    width: ITEM_W,
    marginBottom: 20,
    alignItems: 'center',
  },
  card: {
    width: ITEM_W,
    backgroundColor: '#fdf6ee',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#3d2c1e',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 4 },
    elevation: 4,
  },
  cardPressable: {
    width: '100%',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0e8dc',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  itemLabel: {
    fontFamily: FONT_BOLD,
    fontSize: 18,
    color: '#3d2c1e',
    textAlign: 'center',
    paddingVertical: 10,
    letterSpacing: 0.3,
  },
  finalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#ede0d4',
  },
  finalBtnText: {
    fontFamily: FONT,
    fontSize: 16,
    color: '#8b6f5e',
  },
});
