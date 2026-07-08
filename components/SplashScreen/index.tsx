import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, useWindowDimensions, View, Text } from "react-native";
import { useThemeStore } from "../../store/themeStore";

interface SplashScreenProps {
  fontsLoaded: boolean;
  onAnimationEnd: () => void;
}

export function SplashScreen({ fontsLoaded, onAnimationEnd }: SplashScreenProps) {
  const { width } = useWindowDimensions();
  const { currentTheme } = useThemeStore();
  const fullWord = useMemo(() => ["Y", "O", "M", "U"], []);
  const [touchEnabled, setTouchEnabled] = useState(true);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 1000);
    return () => clearTimeout(timer);
  }, []);

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
  const loadingBarWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple looping loading bar while waiting for fonts or min time
    if (!fontsLoaded || !minTimePassed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingBarWidth, {
            toValue: width * 0.6,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(loadingBarWidth, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          })
        ])
      ).start();
    } else {
      loadingBarWidth.stopAnimation();
    }
  }, [fontsLoaded, minTimePassed, loadingBarWidth, width]);

  useEffect(() => {
    if (!fontsLoaded || !minTimePassed) return;
    setAnimationStarted(true);
  }, [fontsLoaded, minTimePassed]);

  useEffect(() => {
    if (!animationStarted) return;
    
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
  }, [animationStarted, fullWord, slideAnims, fadeAnims, containerOpacity, onAnimationEnd]);

  return (
    <Animated.View
      pointerEvents={touchEnabled ? "auto" : "none"}
      style={[styles.container, { opacity: containerOpacity }]}
    >
      {!animationStarted ? (
        <View style={styles.loadingContainer}>
          <Text style={{ color: currentTheme.text, marginBottom: 20 }}>Loading Assets...</Text>
          <View style={[styles.loadingBarBackground, { backgroundColor: currentTheme.surface, width: width * 0.6 }]}>
            <Animated.View 
              style={[
                styles.loadingBarFill, 
                { 
                  backgroundColor: currentTheme.primary,
                  width: loadingBarWidth
                }
              ]} 
            />
          </View>
        </View>
      ) : (
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
      )}
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
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBarBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
  }
});
