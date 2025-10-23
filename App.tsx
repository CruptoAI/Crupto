import 'react-native-gesture-handler';
import React from 'react';
import type { ComponentProps } from 'react';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { MD3LightTheme, Provider as PaperProvider, SegmentedButtons, Text, Button, useTheme } from 'react-native-paper';
import { StyleSheet, View, Animated } from 'react-native';

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1',
    secondary: '#EC4899',
    surface: '#FFFFFF',
    background: '#F5F5FB',
    surfaceVariant: '#E4E7FB',
  },
};

const navigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: paperTheme.colors.background,
    card: paperTheme.colors.surface,
    primary: paperTheme.colors.primary,
    text: paperTheme.colors.onSurface,
    border: paperTheme.colors.surfaceVariant,
  },
};

type FeatherIconName = ComponentProps<typeof Feather>['name'];

type TabIconProps = {
  focused: boolean;
  color: string;
  icon: FeatherIconName;
};

const TabBarIcon: React.FC<TabIconProps> = ({ focused, color, icon }) => {
  const scale = React.useRef(new Animated.Value(focused ? 1.08 : 1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.08 : 1,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  return (
    <View style={styles.iconWrapper}>
      <Animated.View style={[styles.iconGlyphWrapper, { transform: [{ scale }] }]}>
        <Feather name={icon} size={24} color={color} />
      </Animated.View>
    </View>
  );
};

const HomeScreen = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Welcome back</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Choose your next step.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => console.log('Dive In pressed')}
          style={styles.primaryAction}
          contentStyle={styles.actionContent}
        >
          Dive In
        </Button>
        <Button
          mode="outlined"
          onPress={() => console.log('Ask AI pressed')}
          style={styles.secondaryAction}
          contentStyle={styles.actionContent}
        >
          Ask AI
        </Button>
      </View>
    </SafeAreaView>
  );
};

const MarketsScreen = () => {
  const theme = useTheme();
  const [segment, setSegment] = React.useState<'crypto' | 'tradfi'>('crypto');

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineSmall" style={styles.sectionTitle}>
        Markets
      </Text>
      <SegmentedButtons
        value={segment}
        onValueChange={(value) => setSegment(value as 'crypto' | 'tradfi')}
        buttons={[
          { value: 'crypto', label: 'Crypto' },
          { value: 'tradfi', label: 'TradFi' },
        ]}
        style={styles.segment}
      />
      <View style={styles.placeholderCard}>
        <Text variant="titleMedium" style={styles.placeholderTitle}>
          {segment === 'crypto' ? 'Crypto market overview' : 'Traditional markets snapshot'}
        </Text>
        <Text variant="bodyMedium" style={styles.placeholderBody}>
          This section will surface live data soon.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const NewsScreen = () => {
  const theme = useTheme();
  const [segment, setSegment] = React.useState<'crypto' | 'tradfi'>('crypto');

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineSmall" style={styles.sectionTitle}>
        News
      </Text>
      <SegmentedButtons
        value={segment}
        onValueChange={(value) => setSegment(value as 'crypto' | 'tradfi')}
        buttons={[
          { value: 'crypto', label: 'Crypto' },
          { value: 'tradfi', label: 'TradFi' },
        ]}
        style={styles.segment}
      />
      <View style={styles.placeholderCard}>
        <Text variant="titleMedium" style={styles.placeholderTitle}>
          {segment === 'crypto' ? 'Crypto headlines' : 'TradFi briefings'}
        </Text>
        <Text variant="bodyMedium" style={styles.placeholderBody}>
          Relevant stories will show up here next iteration.
        </Text>
      </View>
    </SafeAreaView>
  );
};

type PlaceholderProps = {
  label: string;
};

const ComingSoonScreen: React.FC<PlaceholderProps> = ({ label }) => {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.placeholderCard}>
        <Text variant="headlineSmall" style={styles.placeholderTitle}>
          {label}
        </Text>
        <Text variant="bodyMedium" style={styles.placeholderBody}>
          Coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const Tab = createBottomTabNavigator();

const ChatScreen = () => <ComingSoonScreen label="Chat" />;

const AccountScreen = () => <ComingSoonScreen label="Account" />;

const Tabs = () => {
  const theme = useTheme();
  const iconMap: Record<string, FeatherIconName> = {
    Home: 'home',
    Chat: 'message-circle',
    Markets: 'bar-chart-2',
    News: 'file-text',
    Account: 'user',
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceVariant,
          height: 70,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 8,
        },
        tabBarIcon: ({ focused, color }) => {
          const iconName = iconMap[route.name] ?? 'circle';
          return <TabBarIcon focused={focused} color={color} icon={iconName} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Markets" component={MarketsScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="dark" />
        <NavigationContainer theme={navigationTheme}>
          <Tabs />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    marginTop: 16,
    gap: 8,
  },
  subtitle: {
    color: '#6B7280',
  },
  actions: {
    marginTop: 32,
    gap: 16,
  },
  actionContent: {
    height: 56,
  },
  primaryAction: {
    borderRadius: 16,
  },
  secondaryAction: {
    borderRadius: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  segment: {
    marginBottom: 24,
  },
  placeholderCard: {
    borderRadius: 16,
    padding: 24,
    gap: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  placeholderTitle: {
    textAlign: 'center',
  },
  placeholderBody: {
    textAlign: 'center',
    color: '#6B7280',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -4,
  },
  iconGlyphWrapper: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
