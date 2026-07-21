import React, { useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RECIPIENT_NAME, SENDER_NAME } from '@/constants/content';

const FONT = 'Caveat_400Regular';
const FONT_BOLD = 'Caveat_700Bold';

// Box color palette
const BOX_BODY = '#b8864e';
const BOX_LID = '#d4a872';
const BOX_LID_FLAP = '#c99960';
const BOX_TAPE = '#ede0c0';
const LABEL_BG = '#f8f2e8';

export default function BoxScreen({ onOpen }: { onOpen: () => void }) {
  const insets = useSafeAreaInsets();
  const breathScale = useSharedValue(1);
  const boxRotate = useSharedValue(0);
  const lidY = useSharedValue(0);
  const lidOpacity = useSharedValue(1);
  const hasOpened = useRef(false);

  useEffect(() => {
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.035, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breathScale.value },
      { rotate: `${boxRotate.value}deg` },
    ],
  }));

  const lidAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lidY.value }],
    opacity: interpolate(lidY.value, [0, -90], [1, 0], Extrapolation.CLAMP),
  }));

  const handlePress = () => {
    if (hasOpened.current) return;
    hasOpened.current = true;

    cancelAnimation(breathScale);
    breathScale.value = 1;

    // Shake, then lid flies open, then fade and navigate
    boxRotate.value = withSequence(
      withTiming(-4, { duration: 75 }),
      withTiming(4, { duration: 75 }),
      withTiming(-3, { duration: 75 }),
      withTiming(3, { duration: 75 }),
      withTiming(-2, { duration: 60 }),
      withTiming(0, { duration: 60 }),
      withTiming(0, { duration: 150 }, () => {
        lidY.value = withTiming(-110, { duration: 550, easing: Easing.out(Easing.ease) }, (done) => {
          if (done) {
            breathScale.value = withTiming(0.88, { duration: 350 }, () => {
              runOnJS(onOpen)();
            });
          }
        });
      }),
    );
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad + 32, paddingBottom: bottomPad + 24 }]}>
      <Text style={styles.heading}>you've got mail</Text>

      <Pressable onPress={handlePress} style={styles.pressable}>
        <Animated.View style={[styles.boxWrapper, boxStyle]}>
          {/* LID */}
          <Animated.View style={[styles.lid, lidAnimStyle]}>
            <View style={styles.lidLeft} />
            <View style={styles.lidTape} />
            <View style={styles.lidRight} />
          </Animated.View>

          {/* BOX BODY */}
          <View style={styles.body}>
            {/* Fold line */}
            <View style={styles.foldLine} />

            {/* Shipping label */}
            <View style={styles.label}>
              {/* Heart sticker */}
              <View style={styles.heartSticker}>
                <MaterialCommunityIcons name="heart" size={15} color="#ffffff" />
              </View>

              <Text style={styles.labelTitle} numberOfLines={1}>
                DIGITAL CARE PACKAGE
              </Text>
              <View style={styles.labelDivider} />

              <Text style={styles.labelField}>TO: {RECIPIENT_NAME}</Text>
              <Text style={styles.labelField}>FROM: {SENDER_NAME}</Text>

              {/* Barcode */}
              <View style={styles.barcode}>
                {BARCODE_WIDTHS.map((w, i) => (
                  <View key={i} style={[styles.barcodeBar, { width: w }]} />
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      </Pressable>

      <Text style={styles.caption}>tap to open</Text>
    </View>
  );
}

// Deterministic barcode bar widths
const BARCODE_WIDTHS = [2,1,3,1,2,1,1,3,2,1,2,1,3,2,1,1,2,1,3,1,2,3,1,1,2];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0e4d3',
  },
  heading: {
    fontFamily: FONT_BOLD,
    fontSize: 38,
    color: '#3d2c1e',
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  pressable: {
    alignItems: 'center',
  },
  boxWrapper: {
    width: 220,
    alignItems: 'center',
  },
  // Lid
  lid: {
    width: 220,
    height: 75,
    flexDirection: 'row',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    zIndex: 10,
  },
  lidLeft: {
    flex: 1,
    backgroundColor: BOX_LID_FLAP,
  },
  lidTape: {
    width: 28,
    backgroundColor: BOX_TAPE,
  },
  lidRight: {
    flex: 1,
    backgroundColor: BOX_LID_FLAP,
  },
  // Box body
  body: {
    width: 220,
    height: 155,
    backgroundColor: BOX_BODY,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
  foldLine: {
    height: 1.5,
    backgroundColor: '#a07040',
    marginBottom: 10,
  },
  label: {
    flex: 1,
    backgroundColor: LABEL_BG,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  heartSticker: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#c4706e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelTitle: {
    fontFamily: FONT_BOLD,
    fontSize: 9.5,
    color: '#3d2c1e',
    letterSpacing: 0.8,
    marginBottom: 5,
    marginRight: 30,
  },
  labelDivider: {
    height: 1,
    backgroundColor: '#d4b8a0',
    marginBottom: 5,
  },
  labelField: {
    fontFamily: FONT,
    fontSize: 13,
    color: '#3d2c1e',
    lineHeight: 16,
  },
  barcode: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
    height: 22,
    gap: 1,
  },
  barcodeBar: {
    height: '100%',
    backgroundColor: '#3d2c1e',
  },
  caption: {
    fontFamily: FONT,
    fontSize: 18,
    color: '#8b6f5e',
    marginTop: 28,
    letterSpacing: 0.3,
  },
});
