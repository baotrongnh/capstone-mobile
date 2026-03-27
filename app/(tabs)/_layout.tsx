import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabVisual = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const TAB_VISUALS: Record<string, TabVisual> = {
  home: { label: "Căn hộ", icon: "home-outline" },
  apartment: { label: "Căn hộ", icon: "office-building-outline" },
  analytic: { label: "Căn hộ", icon: "meter-electric-outline" },
  profile: { label: "Profile", icon: "account-outline" },
};

const ACTIVE_BADGE_WIDTH = 66;
const ACTIVE_UNDERLINE_WIDTH = 34;

function getLabel(routeName: string) {
  return TAB_VISUALS[routeName]?.label ?? routeName;
}

function getIcon(routeName: string) {
  return TAB_VISUALS[routeName]?.icon ?? "circle-outline";
}

function FloatingAnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [tabLayouts, setTabLayouts] = useState<Record<number, { x: number; width: number }>>({});
  const sliderX = useRef(new Animated.Value(0)).current;
  const indicatorX = useRef(new Animated.Value(0)).current;
  const isPositionInitialized = useRef(false);

  useEffect(() => {
    const activeLayout = tabLayouts[state.index];
    if (!activeLayout) return;

    const targetX = activeLayout.x + (activeLayout.width - ACTIVE_BADGE_WIDTH) / 2.2;
    const targetLineX = activeLayout.x + (activeLayout.width - ACTIVE_UNDERLINE_WIDTH) / 2.2;

    if (!isPositionInitialized.current) {
      sliderX.setValue(targetX);
      indicatorX.setValue(targetLineX);
      isPositionInitialized.current = true;
      return;
    }

    Animated.parallel([
      Animated.spring(sliderX, {
        toValue: targetX,
        damping: 18,
        stiffness: 210,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(indicatorX, {
        toValue: targetLineX,
        damping: 18,
        stiffness: 210,
        mass: 0.9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [state.index, tabLayouts, sliderX, indicatorX]);

  return (
    <View style={[styles.tabBarShell, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.tabBar}>
        {!!tabLayouts[state.index] && (
          <>
            <Animated.View
              pointerEvents="none"
              style={[styles.activeBadge, { transform: [{ translateX: sliderX }] }]}
            />
            <Animated.View
              pointerEvents="none"
              style={[styles.activeLine, { transform: [{ translateX: indicatorX }] }]}
            />
          </>
        )}

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const options = descriptors[route.key]?.options;
          const color = focused ? "#3b82f6" : "#2f2f34";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const labelFromOptions =
            typeof options?.tabBarLabel === "string"
              ? options.tabBarLabel
              : typeof options?.title === "string"
                ? options.title
                : getLabel(route.name);

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel}
              testID={options?.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                setTabLayouts((prev) => {
                  const current = prev[index];
                  if (current && current.x === x && current.width === width) {
                    return prev;
                  }

                  return {
                    ...prev,
                    [index]: { x, width },
                  };
                });
              }}
            >
              <MaterialCommunityIcons
                name={getIcon(route.name)}
                size={23}
                color={color}
                style={[styles.icon, focused && styles.iconFocused]}
              />
              <Text style={[styles.label, focused && styles.labelFocused]}>{labelFromOptions}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <FloatingAnimatedTabBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Căn hộ",
        }}
      />
      <Tabs.Screen
        name="apartment"
        options={{
          title: "Thuê",
        }}
      />
      <Tabs.Screen
        name="analytic"
        options={{
          title: "Chỉ số",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarShell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
  },
  tabBar: {
    height: 82,
    borderRadius: 26,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    zIndex: 2,
  },
  icon: {
    marginBottom: 1,
  },
  iconFocused: {
    transform: [{ translateY: -0.5 }],
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: "#3f3f46",
  },
  labelFocused: {
    color: "#3b82f6",
    fontWeight: "700",
  },
  activeBadge: {
    position: "absolute",
    top: 9,
    width: ACTIVE_BADGE_WIDTH,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#e3e8ff",
    zIndex: 1,
  },
  activeLine: {
    position: "absolute",
    bottom: 7,
    width: ACTIVE_UNDERLINE_WIDTH,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#3b82f6",
    zIndex: 1,
  },
});
