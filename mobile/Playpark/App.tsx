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
import Map from './components/Map';
import FilterScreen from './components/FilterScreen';
import Filter from 'react-native-vector-icons/MaterialIcons';

type Playground = {
  id: number | string;
  lat: number;
  lon: number;
  tags?: Record<string, any>;
  images?: string[];
  description?: string;
  name?: string;
  rating?: number;
  ratingCount?: number;
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
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilterScreen, setShowFilterScreen] = useState(false);
  const [showDrawerMenu, setShowDrawerMenu] = useState(false);
  const [selectedPlayground, setSelectedPlayground] =
    useState<Playground | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Use 10.0.2.2 to access host machine from Android emulator. On iOS simulator use localhost.
  const host =
    Platform.OS === 'android'
      ? 'http://10.0.2.2:5000'
      : 'http://localhost:5000';

  const fetchPlaygrounds = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching playgrounds...');

      const params = new URLSearchParams({
        lat: '38.7223',
        lon: '-9.1393',
        radius: '10000',
        ...filters,
      });

      if (searchQuery) params.append('search', searchQuery);

      // Construct Overpass QL query (same logic as frontend route)
      let overpassQuery = `[out:json][timeout:25];
        node(around:10000,38.7223,-9.1393)["leisure"="playground"];
        out body;`;

      // Fetch OSM data directly from Overpass API
      const overpassRes = await fetch(
        'https://overpass-api.de/api/interpreter',
        {
          method: 'POST',
          body: overpassQuery,
        },
      );

      // Fetch your backend points
      const backendUrl = `${host}/api/points?${params}`;
      console.log('Fetching Backend URL:', backendUrl);

      const [overpassData, backendData] = await Promise.all([
        overpassRes.json(),
        fetch(backendUrl)
          .then(res => (res.ok ? res.json() : []))
          .catch(() => []),
      ]);

      console.log('Overpass Response status:', overpassRes.status);
      console.log('Overpass data:', overpassData);
      console.log('Backend data:', backendData);

      // Normalize OSM data (elements array from Overpass)
      const osmPlaygrounds = (overpassData.elements || []).map(
        (element: any) => ({
          id: `osm_${element.id}`,
          lat: element.lat,
          lon: element.lon,
          tags: element.tags || {},
          source: 'osm',
          images: element.tags?.image ? [element.tags.image] : [],
          description: element.tags?.description || element.tags?.name || '',
        }),
      );

      // Normalize backend data
      const backendPlaygrounds = (
        Array.isArray(backendData) ? backendData : []
      ).map((item: any) => ({
        id: `backend_${item._id}`,
        lat: item.location?.coordinates?.[1] || 0, // GeoJSON format: [lon, lat]
        lon: item.location?.coordinates?.[0] || 0,
        tags: item.tags || {},
        source: 'backend',
        images: item.appData?.images?.map((img: any) => img.url) || [],
        description: item.description || '',
        name: item.name,
        rating: item.appData?.rating?.average || 0,
        ratingCount: item.appData?.rating?.count || 0,
      }));

      // Debug backend items specifically
      console.log('Backend playgrounds processed:', backendPlaygrounds);
      backendPlaygrounds.forEach((bg, idx) => {
        console.log(`Backend item ${idx}:`, {
          id: bg.id,
          name: bg.name,
          images: bg.images,
          lat: bg.lat,
          lon: bg.lon,
        });
      });

      // Debug OSM items too
      console.log('OSM playgrounds processed:', osmPlaygrounds);
      osmPlaygrounds.forEach((osm: any, idx: number) => {
        console.log(`OSM item ${idx}:`, {
          id: osm.id,
          name: osm.tags?.name,
          images: osm.images,
        });
      });

      // Merge OSM + backend data
      const allPlaygrounds = [...osmPlaygrounds, ...backendPlaygrounds];

      console.log('Final merged playgrounds:', allPlaygrounds);
      setPlaygrounds(allPlaygrounds);
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
      item.name ||
      item.tags?.name ||
      item.tags?.['operator'] ||
      `Playground ${item.id}`;
    const addr = item.tags?.['addr:street'] || item.tags?.['addr:full'] || '';
    const photo =
      (item.images && item.images[0]) ||
      item.tags?.image ||
      item.tags?.photo ||
      null;

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
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setShowDrawerMenu(!showDrawerMenu)}
        >
          <Text style={styles.hamburgerText}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>Playpark</Text>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterScreen(true)}
        >
          <Filter name="filter-list" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Filter Screen */}
      {showFilterScreen && (
        <FilterScreen
          onBack={() => setShowFilterScreen(false)}
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {/* Map with playgrounds and floating search */}
      {!showFilterScreen && (
        <View style={styles.mapContainer}>
          <Map
            playgrounds={playgrounds}
            onMarkerPress={(p: Playground) => {
              console.log('Marker pressed:', p);
              console.log('Marker name field:', p.name);
              console.log('Marker id field:', p.id);
              setSelectedPlayground(p);
              setShowDrawer(true);
            }}
          />

          <TouchableOpacity
            style={styles.loadButton}
            onPress={fetchPlaygrounds}
          >
            <Text style={styles.loadButtonText}>Carregar Parques</Text>
          </TouchableOpacity>

          {/* Bottom Search Bar */}
          <View style={styles.bottomSearch}>
            <Text style={styles.searchPlaceholder}>Pesquisar parques...</Text>
          </View>
        </View>
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
              <View style={{ flex: 1 }}>
                <Text style={styles.drawerTitle}>
                  {selectedPlayground.name ||
                    selectedPlayground.tags?.name ||
                    `Parque ${selectedPlayground.id}`}
                </Text>
                {selectedPlayground.rating && selectedPlayground.rating > 0 && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>
                      {'⭐'.repeat(Math.round(selectedPlayground.rating))}
                      {selectedPlayground.rating.toFixed(1)}
                      {selectedPlayground.ratingCount &&
                        ` (${selectedPlayground.ratingCount})`}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowDrawer(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.drawerContent}>
              <View style={styles.drawerPhoto}>
                {selectedPlayground.images &&
                selectedPlayground.images.length > 0 ? (
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageSlider}
                  >
                    {selectedPlayground.images.map(
                      (uri: string, idx: number) => (
                        <Image
                          key={idx}
                          source={{ uri }}
                          style={styles.drawerPhotoImage}
                          resizeMode="cover"
                        />
                      ),
                    )}
                  </ScrollView>
                ) : selectedPlayground.tags?.image ? (
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
                {selectedPlayground.description ||
                  selectedPlayground.tags?.description ||
                  'Sem descrição disponível'}
              </Text>
              <View style={styles.amenitiesGrid}>
                <Text style={styles.amenitiesTitle}>Comodidades:</Text>
                {selectedPlayground.tags &&
                  Object.keys(selectedPlayground.tags).map(key => {
                    const val = selectedPlayground.tags?.[key];
                    if (!val) return null;
                    // filter common playground tags
                    if (
                      key.startsWith('playground:') ||
                      [
                        'bench',
                        'covered',
                        'drinking_water',
                        'wheelchair',
                        'natural_shade',
                        'lit',
                      ].includes(key)
                    ) {
                      const label = key
                        .replace('playground:', '')
                        .replace(/_/g, ' ');
                      return (
                        <Text key={key} style={styles.amenityItem}>
                          • {label} {val === 'yes' ? '' : `(${val})`}
                        </Text>
                      );
                    }
                    return null;
                  })}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0ea5ff',
    textAlign: 'center',
    flex: 1,
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
    flex: 1,
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
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 24,
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 16,
    lineHeight: 24,
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
    width: Dimensions.get('window').width - 32, // full width minus margins
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
  ratingContainer: {
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  imageSlider: {
    flex: 1,
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburgerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 16,
  },
  bottomSearch: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
});

export default App;
