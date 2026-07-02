import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, useWindowDimensions, View } from "react-native";
import { useThemeStore } from "../../store/themeStore";

interface SplashScreenProps {
  onAnimationEnd: () => void;
}

export function SplashScreen({ onAnimationEnd }: SplashScreenProps) {
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeStore();
  const fullWord = useMemo(() => ["Y", "O", "M", "U"], []);
  const [touchEnabled, setTouchEnabled] = useState(true);

  // Animated values - memoized to prevent recreation
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const slideAnims = useMemo(
    () => fullWord.map(() => new Animated.Value(width)),
    [fullWord, width],
  );
  const fadeAnims = useMemo(
    () => fullWord.map(() => new Animated.Value(0)),
    [fullWord],
  );

  useEffect(() => {
    // Animate letters one by one
    const animations = fullWord.map((_, index) => {
      return Animated.parallel([
        Animated.timing(slideAnims[index], {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnims[index], {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);
    });

    // After all letters slide in, fade out container
    Animated.sequence([
      Animated.stagger(300, animations),
      Animated.delay(1000),
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTouchEnabled(false);
      onAnimationEnd();
    });
  }, [fullWord, slideAnims, fadeAnims, containerOpacity, onAnimationEnd]);

  return (
    <Animated.View
      pointerEvents={touchEnabled ? "auto" : "none"}
      style={[styles.container, { opacity: containerOpacity }]}
    >
      <View style={styles.wordContainer}>
        {fullWord.map((letter, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.letter,
              {
                opacity: fadeAnims[index],
                transform: [{ translateX: slideAnims[index] }],
                color: currentTheme.primary,
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  wordContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  letter: {
    fontFamily: "Audiowide_400Regular",
    fontSize: 60,
    color: "#E50914",
    marginHorizontal: 2,
    // textShadowColor: "rgba(229, 9, 20, 0.5)",
    // textShadowOffset: { width: 0, height: 4 },
    // textShadowRadius: 15,
  },
});
