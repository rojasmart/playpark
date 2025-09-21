/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Platform,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

type Playground = {
  id: number | string;
  lat: number;
  lon: number;
  tags?: Record<string, any>;
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use 10.0.2.2 to access host machine from Android emulator. On iOS simulator use localhost.
  const host =
    Platform.OS === 'android'
      ? 'http://10.0.2.2:3000'
      : 'http://localhost:3000';

  const fetchLisbon = useCallback(async () => {
    try {
      setLoading(true);
      // Call your Next.js API route that returns playgrounds for Lisbon.
      const res = await fetch(`${host}/api/playgrounds?city=Lisbon`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlaygrounds(data);
      } else if (data.elements) {
        // Overpass response shape fallback
        setPlaygrounds(data.elements as Playground[]);
      } else {
        setPlaygrounds([]);
      }
    } catch (err) {
      console.warn('Fetch error', err);
      setPlaygrounds([]);
    } finally {
      setLoading(false);
    }
  }, [host]);

  useEffect(() => {
    // don't auto-fetch to avoid surprising network calls; user taps button.
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLisbon();
    setRefreshing(false);
  }, [fetchLisbon]);

  function renderItem({ item }: { item: Playground }) {
    const title =
      item.tags?.name || item.tags?.['operator'] || `Playground ${item.id}`;
    const addr = item.tags?.['addr:street'] || item.tags?.['addr:full'] || '';
    const photo = item.tags?.image || item.tags?.photo || null;

    return (
      <View style={styles.card}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>No image</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          {addr ? <Text style={styles.cardAddr}>{addr}</Text> : null}
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => {
                // open in map app
                const url = Platform.select({
                  ios: `maps:0,0?q=${item.lat},${item.lon}`,
                  android: `geo:${item.lat},${item.lon}?q=${item.lat},${item.lon}`,
                });
                if (url) Linking.openURL(url);
              }}
            >
              <Text style={styles.link}>Open in maps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Playpark — Lisbon</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={fetchLisbon}>
          <Text style={styles.buttonText}>Load Lisbon Playgrounds</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondary]}
          onPress={() => {
            setPlaygrounds([]);
          }}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" />
      ) : (
        <FlatList
          data={playgrounds}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No playgrounds loaded. Tap the button above.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#0ea5ff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  secondary: { backgroundColor: '#64748b' },
  buttonText: { color: '#fff', fontWeight: '600' },
  empty: { alignItems: 'center', padding: 24 },
  emptyText: { color: '#444' },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  photo: { width: 100, height: 80, borderRadius: 6, backgroundColor: '#ddd' },
  photoPlaceholder: {
    width: 100,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: { color: '#9ca3af' },
  cardContent: { flex: 1, paddingLeft: 12, justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardAddr: { color: '#6b7280', marginTop: 4 },
  row: { flexDirection: 'row', marginTop: 8 },
  link: { color: '#0ea5ff', fontWeight: '600' },
});

export default App;
