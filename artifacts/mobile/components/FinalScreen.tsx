import React, { useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CLOSING_MESSAGE } from '@/constants/content';

const FONT = 'Caveat_400Regular';
const FONT_BOLD = 'Caveat_700Bold';

const DOODLES: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; top: number; left?: number; right?: number; size: number; opacity: number; rotate: number }[] = [
  { icon: 'heart', top: 10, left: 14, size: 16, opacity: 0.7, rotate: -15 },
  { icon: 'star', top: 8, right: 12, size: 14, opacity: 0.6, rotate: 20 },
  { icon: 'heart-outline', top: 30, right: 6, size: 10, opacity: 0.4, rotate: 0 },
  { icon: 'star-outline', top: 32, left: 6, size: 10, opacity: 0.4, rotate: 10 },
  { icon: 'heart', top: 64, left: 4, size: 8, opacity: 0.3, rotate: -5 },
  { icon: 'star', top: 60, right: 4, size: 8, opacity: 0.3, rotate: -10 },
];

export default function FinalScreen({ onReplay }: { onReplay: () => void }) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const headingScale = useSharedValue(0.7);
  const headingOpacity = useSharedValue(0);
  const cardTranslate = useSharedValue(40);
  const cardOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);

  useEffect(() => {
    headingScale.value = withSpring(1, { damping: 16, stiffness: 180 });
    headingOpacity.value = withTiming(1, { duration: 500 });
    cardTranslate.value = withDelay(300, withSpring(0, { damping: 18, stiffness: 180 }));
    cardOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    btnOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
  }, []);

  const headingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headingScale.value }],
    opacity: headingOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslate.value }],
    opacity: cardOpacity.value,
  }));

  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
  }));

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 40, paddingBottom: bottomPad + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Heading with hearts */}
      <Animated.View style={[styles.headingRow, headingStyle]}>
        <MaterialCommunityIcons name="heart" size={22} color="#c4706e" />
        <Text style={styles.heading}>and little goodies</Text>
        <MaterialCommunityIcons name="heart" size={22} color="#c4706e" />
      </Animated.View>

      {/* Note card */}
      <Animated.View style={[styles.noteCard, cardStyle]}>
        {/* Corner doodles */}
        {DOODLES.map((d, i) => (
          <MaterialCommunityIcons
            key={i}
            name={d.icon}
            size={d.size}
            color="#c4706e"
            style={[
              styles.doodle,
              {
                top: d.top,
                left: d.left,
                right: d.right,
                opacity: d.opacity,
                transform: [{ rotate: `${d.rotate}deg` }],
              },
            ]}
          />
        ))}

        {/* Stitched border */}
        <View style={styles.stitchBorder}>
          {/* Lined paper lines */}
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[styles.paperLine, { top: 58 + i * 34 }]} />
          ))}

          <Text style={styles.noteMessage}>{CLOSING_MESSAGE}</Text>
        </View>
      </Animated.View>

      {/* Decoration */}
      <View style={styles.decorRow}>
        {[0,1,2,3,4].map((i) => (
          <MaterialCommunityIcons key={i} name="star" size={12} color="#d4b8a0" style={{ opacity: 0.6 + i * 0.1 }} />
        ))}
      </View>

      {/* Replay button */}
      <Animated.View style={btnStyle}>
        <Pressable onPress={onReplay} style={styles.replayBtn}>
          <MaterialCommunityIcons name="replay" size={18} color="#8b6f5e" />
          <Text style={styles.replayText}>replay from the beginning</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#f0e4d3',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  heading: {
    fontFamily: FONT_BOLD,
    fontSize: 30,
    color: '#3d2c1e',
    textAlign: 'center',
  },
  noteCard: {
    width: '100%',
    backgroundColor: '#fdf8f0',
    borderRadius: 14,
    shadowColor: '#3d2c1e',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 2, height: 6 },
    elevation: 6,
    overflow: 'hidden',
  },
  doodle: {
    position: 'absolute',
  },
  stitchBorder: {
    margin: 10,
    borderWidth: 1.5,
    borderColor: '#d4b8a0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    paddingTop: 28,
    minHeight: 220,
  },
  paperLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: '#ede0ce',
  },
  noteMessage: {
    fontFamily: FONT,
    fontSize: 21,
    color: '#3d2c1e',
    lineHeight: 34,
    zIndex: 1,
  },
  decorRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ede0d4',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
  replayText: {
    fontFamily: FONT,
    fontSize: 17,
    color: '#8b6f5e',
  },
});
