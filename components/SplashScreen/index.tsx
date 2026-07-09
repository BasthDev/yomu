import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { useThemeStore } from "../../store/themeStore";

interface SplashScreenProps {
  fontsLoaded: boolean;
  onAnimationEnd: () => void;
}

export function SplashScreen({
  fontsLoaded,
  onAnimationEnd,
}: SplashScreenProps) {
  const { currentTheme } = useThemeStore();

  const letters = useMemo(() => ["Y", "O", "M", "U"], []);

  const [canAnimate, setCanAnimate] = useState(false);

  const containerOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.96);

  const letterValues = letters.map(() => ({
    opacity: useSharedValue(0),
    translateY: useSharedValue(18),
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanAnimate(true);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!fontsLoaded || !canAnimate) return;

    logoOpacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });

    logoScale.value = withTiming(1, {
      duration: 350,
      easing: Easing.out(Easing.quad),
    });

    letters.forEach((_, index) => {
      letterValues[index].opacity.value = withDelay(
        index * 80,
        withTiming(1, {
          duration: 250,
          easing: Easing.out(Easing.quad),
        }),
      );

      letterValues[index].translateY.value = withDelay(
        index * 80,
        withTiming(0, {
          duration: 280,
          easing: Easing.out(Easing.cubic),
        }),
      );
    });

    setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        {
          duration: 400,
          easing: Easing.inOut(Easing.quad),
        },
        () => {
          runOnJS(onAnimationEnd)();
        },
      );

      logoScale.value = withTiming(1.04, {
        duration: 400,
      });
    }, 1600);
  }, [fontsLoaded, canAnimate]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      {
        scale: logoScale.value,
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          backgroundColor: currentTheme.background,
        },
      ]}
    >
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.wordContainer}>
          {letters.map((letter, index) => (
            <Letter
              key={letter}
              value={letterValues[index]}
              letter={letter}
              color={currentTheme.primary}
            />
          ))}
        </View>

        {!fontsLoaded && (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color={currentTheme.primary} />

            <Text
              style={[
                styles.loadingText,
                {
                  color: currentTheme.text,
                },
              ]}
            >
              Loading...
            </Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

function Letter({
  letter,
  value,
  color,
}: {
  letter: string;
  value: {
    opacity: SharedValue<number>;
    translateY: SharedValue<number>;
  };
  color: string;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: value.opacity.value,
    transform: [
      {
        translateY: value.translateY.value,
      },
    ],
  }));

  return (
    <Animated.Text
      style={[
        styles.letter,
        style,
        {
          color,
        },
      ]}
    >
      {letter}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  logoContainer: {
    alignItems: "center",
  },

  wordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  letter: {
    fontFamily: "Audiowide-Regular",
    fontSize: 64,
    letterSpacing: 5,
    marginHorizontal: 2,
  },

  loading: {
    marginTop: 24,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.7,
  },
});
