import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import BoxScreen from '@/components/BoxScreen';
import GridScreen from '@/components/GridScreen';
import CardOverlay from '@/components/CardOverlay';
import FinalScreen from '@/components/FinalScreen';

type Screen = 'mail' | 'grid' | 'card' | 'final';

export default function MainScreen() {
  const colors = useColors();
  const [screen, setScreen] = useState<Screen>('mail');
  const [cardIndex, setCardIndex] = useState(0);

  const handleSelectItem = (index: number) => {
    setCardIndex(index);
    setScreen('card');
  };

  const handleCloseCard = () => setScreen('grid');

  const handleNavigate = (newIndex: number) => {
    setCardIndex(newIndex);
  };

  const handleReachEnd = () => {
    setScreen('final');
  };

  const handleReplay = () => {
    setScreen('mail');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {screen === 'mail' && (
        <BoxScreen onOpen={() => setScreen('grid')} />
      )}

      {(screen === 'grid' || screen === 'card') && (
        <GridScreen
          onSelectItem={handleSelectItem}
          onOpenFinal={() => setScreen('final')}
        />
      )}

      {screen === 'card' && (
        <CardOverlay
          itemIndex={cardIndex}
          onClose={handleCloseCard}
          onNavigate={handleNavigate}
          onReachEnd={handleReachEnd}
        />
      )}

      {screen === 'final' && (
        <FinalScreen onReplay={handleReplay} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
