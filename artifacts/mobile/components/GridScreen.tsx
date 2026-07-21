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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const FONT = 'Caveat_400Regular';
const FONT_BOLD = 'Caveat_700Bold';

type FeatherName = React.ComponentProps<typeof Feather>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type Item = {
  id: string;
  label: string;
  icon: FeatherName | MCIName;
  iconSet: 'feather' | 'mci';
  dotColor: string;
  rotate: number;
};

export const ITEMS: Item[] = [
  { id: 'voice', label: 'voice', icon: 'mic' as FeatherName, iconSet: 'feather', dotColor: '#e8c4c2', rotate: -3 },
  { id: 'bracelet', label: 'bracelet', icon: 'link-2' as FeatherName, iconSet: 'feather', dotColor: '#c2d4e8', rotate: 2.5 },
  { id: 'note', label: 'note', icon: 'file-text' as FeatherName, iconSet: 'feather', dotColor: '#e8dfc2', rotate: -1.5 },
  { id: 'photo', label: 'photo', icon: 'camera' as FeatherName, iconSet: 'feather', dotColor: '#c2e8d8', rotate: 3.5 },
  { id: 'news', label: 'news', icon: 'book-open' as FeatherName, iconSet: 'feather', dotColor: '#dcc2e8', rotate: -2.5 },
  { id: 'location', label: 'location', icon: 'map-pin' as FeatherName, iconSet: 'feather', dotColor: '#c2e8e4', rotate: 4 },
  { id: 'gif', label: 'gif', icon: 'gift' as FeatherName, iconSet: 'feather', dotColor: '#e8c2d4', rotate: -3.5 },
  { id: 'coupon', label: 'coupon', icon: 'tag' as FeatherName, iconSet: 'feather', dotColor: '#e8e2c2', rotate: 1.5 },
];

const { width: SCREEN_W } = Dimensions.get('window');
const ITEM_W = Math.floor((SCREEN_W - 52) / 2);

function GridItem({ item, onPress }: { item: Item; onPress: () => void }) {
  const pressScale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${item.rotate}deg` },
      { scale: pressScale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.itemOuter, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { pressScale.value = withSpring(0.94, { damping: 15 }); }}
        onPressOut={() => { pressScale.value = withSpring(1, { damping: 12 }); }}
        style={styles.itemPressable}
      >
        <View style={[styles.iconCircle, { backgroundColor: item.dotColor }]}>
          {item.iconSet === 'feather' ? (
            <Feather name={item.icon as FeatherName} size={28} color="#3d2c1e" />
          ) : (
            <MaterialCommunityIcons name={item.icon as MCIName} size={28} color="#3d2c1e" />
          )}
        </View>
        <Text style={styles.itemLabel}>{item.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

interface Props {
  onSelectItem: (index: number) => void;
  onOpenFinal: () => void;
}

export default function GridScreen({ onSelectItem, onOpenFinal }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
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

      {/* See the final note */}
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
  itemOuter: {
    width: ITEM_W,
    backgroundColor: '#fdf6ee',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#3d2c1e',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 4 },
    elevation: 4,
  },
  itemPressable: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemLabel: {
    fontFamily: FONT_BOLD,
    fontSize: 18,
    color: '#3d2c1e',
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
