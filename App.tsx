// eslint-disable-next-line import/no-duplicates
import 'react-native-gesture-handler';
import React from 'react';
import type { ComponentProps } from 'react';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  MD3LightTheme,
  Provider as PaperProvider,
  SegmentedButtons,
  Text,
  Button,
  useTheme,
  TextInput,
  IconButton,
} from 'react-native-paper';
import { StyleSheet, View, Animated, Keyboard, Platform } from 'react-native';
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import type {
  BottomSheetBackdropProps,
  BottomSheetFooterProps,
  BottomSheetFlatListMethods,
} from '@gorhom/bottom-sheet';
// eslint-disable-next-line import/no-duplicates
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

type ChatMessage = {
  id: string;
  author: 'user' | 'ai';
  text: string;
  timestamp: number;
};

const HomeScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);
  const listRef = React.useRef<BottomSheetFlatListMethods | null>(null);
  const snapPoints = React.useMemo(() => ['55%', '88%'], []);
  const [chatVisible, setChatVisible] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    {
      id: 'ai-welcome',
      author: 'ai',
      text: 'Привет! Я Crupto AI. Спроси меня про рынки или новости — скоро отвечу данными в реальном времени.',
      timestamp: Date.now(),
    },
  ]);

  const openChat = React.useCallback(() => {
    setChatVisible(true);
    bottomSheetRef.current?.present();
  }, []);

  const closeChat = React.useCallback(() => {
    setChatVisible(false);
    bottomSheetRef.current?.dismiss();
  }, []);

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  const footerBackground = theme.colors.elevation?.level2 ?? theme.colors.surface;
  const footerShadowColor = theme.colors.shadow ?? '#000';

  const renderFooter = React.useCallback(
    (footerProps: BottomSheetFooterProps) => (
      <BottomSheetFooter {...footerProps} bottomInset={insets.bottom}>
        <View
          style={[
            styles.chatFooterCard,
            { backgroundColor: footerBackground, shadowColor: footerShadowColor },
          ]}
        >
          <TextInput
            mode="outlined"
            placeholder="Спросите про рынки, токены, новости…"
            value={draft}
            onChangeText={setDraft}
            style={styles.chatInput}
            outlineStyle={styles.chatInputOutline}
            multiline
            right={<TextInput.Affix text={`${draft.length}/280`} />}
            maxLength={280}
          />
          <IconButton
            icon="send"
            size={24}
            onPress={sendMessage}
            disabled={!draft.trim()}
            accessibilityLabel="Send message"
            style={styles.chatSendButton}
          />
        </View>
      </BottomSheetFooter>
    ),
    [draft, footerBackground, footerShadowColor, insets.bottom, sendMessage]
  );

  React.useEffect(() => {
    const handleKeyboardShow = () => {
      listRef.current?.scrollToEnd({ animated: true });
    };

    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      handleKeyboardShow
    );

    return () => {
      showListener.remove();
    };
  }, []);

  const sendMessage = React.useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      author: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        author: 'ai',
        text: 'Я скоро научусь отвечать из реального источника. Пока что только собираю твои вопросы 🤖',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }, 600);
  }, [draft]);

  const renderMessage = React.useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.author === 'user';
    return (
      <View style={[styles.chatMessageRow, isUser ? styles.chatMessageRowUser : styles.chatMessageRowAi]}>
        <View style={[styles.chatBubble, isUser ? styles.chatBubbleUser : styles.chatBubbleAi]}>
          <Text variant="bodyMedium" style={isUser ? styles.chatBubbleTextUser : undefined}>
            {item.text}
          </Text>
        </View>
        <Text variant="labelSmall" style={styles.chatTimestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  }, []);

  React.useEffect(() => {
    if (chatVisible) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [chatVisible]);

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
        <Button mode="outlined" onPress={openChat} style={styles.secondaryAction} contentStyle={styles.actionContent}>
          Ask AI
        </Button>
      </View>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={0}
        onChange={(index) => {
          if (index === -1) {
            setChatVisible(false);
          }
        }}
        onDismiss={() => setChatVisible(false)}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        handleIndicatorStyle={styles.chatHandleIndicator}
        bottomInset={insets.bottom}
        footerComponent={renderFooter}
      >
        <BottomSheetView
          style={[
            styles.chatSheet,
            {
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <View style={styles.chatHeader}>
            <Text variant="titleMedium">Ask Crupto AI</Text>
            <IconButton icon="close" onPress={closeChat} size={20} style={styles.chatCloseButton} accessibilityLabel="Close chat" />
          </View>
          <BottomSheetFlatList<ChatMessage>
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={styles.chatListContainer}
            contentContainerStyle={[styles.chatList, { paddingBottom: insets.bottom + 16 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        </BottomSheetView>
      </BottomSheetModal>
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
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <BottomSheetModalProvider>
            <StatusBar style="dark" />
            <NavigationContainer theme={navigationTheme}>
              <Tabs />
            </NavigationContainer>
          </BottomSheetModalProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
  chatSheet: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  chatHandleIndicator: {
    backgroundColor: '#D1D5DB',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatCloseButton: {
    margin: 0,
  },
  chatListContainer: {
    flex: 1,
  },
  chatList: {
    flexGrow: 1,
    paddingTop: 4,
    paddingBottom: 8,
    justifyContent: 'flex-end',
  },
  chatFooterCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 6,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  chatMessageRow: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  chatMessageRowUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  chatMessageRowAi: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  chatBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  chatBubbleUser: {
    backgroundColor: '#6366F1',
  },
  chatBubbleAi: {
    backgroundColor: '#EEF2FF',
  },
  chatBubbleTextUser: {
    color: '#FFFFFF',
  },
  chatTimestamp: {
    marginTop: 4,
    color: '#9CA3AF',
  },
  chatInput: {
    flex: 1,
  },
  chatInputOutline: {
    borderRadius: 16,
  },
  chatSendButton: {
    margin: 0,
  },
});
