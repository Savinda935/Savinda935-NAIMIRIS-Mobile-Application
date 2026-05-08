import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions, ScrollView } from "react-native";
import PrimaryButton from "../components/ui/PrimaryButton";
import { theme } from "../config/theme";

const { width } = Dimensions.get("window");

const slides = [
  {
    title: "Plan before you plant",
    subtitle: "Land fit, budget checks, and ROI predictions for Sri Lankan wet-zone farms.",
    image: require("../images/onboard1.jpg")
  },
  {
    title: "Monitor every week",
    subtitle: "IoT sensors and AI growth guidance to keep yields on track.",
    image: require("../images/onboard2.jpg")
  },
  {
    title: "Control pests with precision",
    subtitle: "Detect, score severity, and apply localized treatment advice.",
    image: require("../images/onboard3.jpg")
  }
];

export default function OnboardingScreen({ navigation }) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (event) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(nextIndex);
  };

  const onNext = () => {
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
    } else {
      navigation.replace("Tabs");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <View key={slide.title} style={styles.slide}>
            <Image source={slide.image} style={styles.image} />
            <View style={styles.content}>
              <Text style={styles.eyebrow}>Step {index + 1}</Text>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View key={`dot-${index}`} style={[styles.dot, index === activeIndex && styles.dotActive]} />
          ))}
        </View>
        <PrimaryButton
          label={activeIndex === slides.length - 1 ? "Enter App" : "Next"}
          onPress={onNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  slide: {
    width,
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl
  },
  image: {
    width: width - theme.spacing.xl * 2,
    height: width * 0.9,
    borderRadius: theme.radius.xl,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg
  },
  content: {
    alignItems: "flex-start"
  },
  eyebrow: {
    color: theme.colors.accent,
    textTransform: "uppercase",
    letterSpacing: 2.4,
    fontSize: 12,
    fontFamily: theme.typography.medium
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    marginTop: theme.spacing.sm,
    fontFamily: theme.typography.title
  },
  subtitle: {
    color: theme.colors.muted,
    marginTop: theme.spacing.sm,
    fontSize: 14,
    fontFamily: theme.typography.body
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderStrong
  },
  dots: {
    flexDirection: "row",
    marginBottom: theme.spacing.md
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.borderStrong,
    marginRight: theme.spacing.sm
  },
  dotActive: {
    width: 28,
    backgroundColor: theme.colors.primary
  }
});
