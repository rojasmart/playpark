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
  TextInput,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
//import MapView, { Marker } from 'react-native-maps';
import MobileMap from './components/Map';
import FilterPanel from './components/FilterPanel';

type Playground = {
  id: number | string;
  lat: number;
  lon: number;
  tags?: Record<string, any>;
};

type Props = {
  playgrounds: Playground[];
  onMarkerPress?: (p: Playground) => void;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlayground, setSelectedPlayground] =
    useState<Playground | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Use 10.0.2.2 to access host machine from Android emulator. On iOS simulator use localhost.
  const host =
    Platform.OS === 'android'
      ? 'http://10.0.2.2:3000'
      : 'http://localhost:3000';

  const fetchPlaygrounds = useCallback(async () => {
    try {
      setLoading(true);
      // Connect to your Node.js backend points API
      const params = new URLSearchParams({
        lat: '38.7223', // Lisbon coordinates
        lon: '-9.1393',
        radius: '10000', // 10km radius
        ...filters,
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const res = await fetch(`${host}/api/points?${params}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setPlaygrounds(data);
      } else if (data.elements) {
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
  }, [host, filters, searchQuery]);

  useEffect(() => {
    // don't auto-fetch to avoid surprising network calls; user taps button.
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlaygrounds();
    setRefreshing(false);
  }, [fetchPlaygrounds]);

  function renderItem({ item }: { item: Playground }) {
    const title =
      item.tags?.name || item.tags?.['operator'] || `Playground ${item.id}`;
    const addr = item.tags?.['addr:street'] || item.tags?.['addr:full'] || '';
    const photo = item.tags?.image || item.tags?.photo || null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedPlayground(item);
          setShowDrawer(true);
        }}
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>📍</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          {addr ? <Text style={styles.cardAddr}>{addr}</Text> : null}
          <View style={styles.row}>
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
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
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Playpark</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar parques..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={fetchPlaygrounds}
          />
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Area */}
      <View style={styles.filterArea}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>
            Filtros {showFilters ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showFilters && (
          <FilterPanel filters={filters} setFilters={setFilters as any} />
        )}
      </View>

      {/* Map with OpenStreetMap playgrounds */}
      <View style={styles.mapContainer}>
        <MobileMap
          playgrounds={playgrounds}
          onMarkerPress={p => {
            setSelectedPlayground(p);
            setShowDrawer(true);
          }}
        />
        <TouchableOpacity style={styles.loadButton} onPress={fetchPlaygrounds}>
          <Text style={styles.loadButtonText}>Carregar Parques</Text>
        </TouchableOpacity>
      </View>

      {/* Playground List */}
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
                Nenhum parque carregado. Use os filtros ou pesquisa.
              </Text>
            </View>
          )}
        />
      )}

      {/* Playground Details Drawer */}
      <Modal
        visible={showDrawer}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDrawer(false)}
      >
        {selectedPlayground && (
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>
                {selectedPlayground.tags?.name ||
                  `Parque ${selectedPlayground.id}`}
              </Text>
              <TouchableOpacity onPress={() => setShowDrawer(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.drawerContent}>
              <View style={styles.drawerPhoto}>
                {selectedPlayground.tags?.image ? (
                  <Image
                    source={{ uri: selectedPlayground.tags.image }}
                    style={styles.drawerPhotoImage}
                  />
                ) : (
                  <View style={styles.drawerPhotoPlaceholder}>
                    <Text>📍 Sem foto disponível</Text>
                  </View>
                )}
              </View>
              <Text style={styles.drawerDescription}>
                {selectedPlayground.tags?.description ||
                  'Sem descrição disponível'}
              </Text>
              <View style={styles.amenitiesGrid}>
                <Text style={styles.amenitiesTitle}>Comodidades:</Text>
                {selectedPlayground.tags?.['playground:slide'] && (
                  <Text style={styles.amenityItem}>• Escorrega</Text>
                )}
                {selectedPlayground.tags?.['playground:swing'] && (
                  <Text style={styles.amenityItem}>• Baloiço</Text>
                )}
                {selectedPlayground.tags?.['playground:climb'] && (
                  <Text style={styles.amenityItem}>• Escalada</Text>
                )}
                {selectedPlayground.tags?.bench && (
                  <Text style={styles.amenityItem}>• Banco</Text>
                )}
                {selectedPlayground.tags?.covered && (
                  <Text style={styles.amenityItem}>• Coberto</Text>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0ea5ff',
    flex: 0,
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#0ea5ff',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  filterArea: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterToggle: {
    paddingVertical: 8,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterScroll: {
    paddingVertical: 8,
  },
  filterChip: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0ea5ff',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#e5e7eb',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  loadButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#0ea5ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  loadButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  photoPlaceholderText: { color: '#9ca3af', fontSize: 20 },
  cardContent: { flex: 1, paddingLeft: 12, justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardAddr: { color: '#6b7280', marginTop: 4 },
  row: { flexDirection: 'row', marginTop: 8 },
  link: { color: '#0ea5ff', fontWeight: '600' },
  drawer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  drawerContent: {
    flex: 1,
  },
  drawerPhoto: {
    height: 200,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  drawerPhotoImage: {
    width: '100%',
    height: '100%',
  },
  drawerPhotoPlaceholder: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  amenitiesGrid: {
    margin: 16,
  },
  amenitiesTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#374151',
  },
  amenityItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
});

export default App;
