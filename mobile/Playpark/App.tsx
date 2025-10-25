/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
// minimal ambient declarations for geolocation fallbacks
declare const global: any;
declare const navigator: any;
// use community geolocation for reliable native behavior
import Geolocation from '@react-native-community/geolocation';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  ScrollView,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
//import MapView, { Marker } from 'react-native-maps';
import Map from './components/Map';
import FilterScreen from './components/FilterScreen';
import RegisterScreen from './components/RegisterScreen';
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
  const [showRegisterScreen, setShowRegisterScreen] = useState(false);
  const [showDrawerMenu, setShowDrawerMenu] = useState(false);
  const [selectedPlayground, setSelectedPlayground] =
    useState<Playground | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const mapRef = useRef<any>(null);
  const [registerInitialCoords, setRegisterInitialCoords] = useState<{
    lat?: number;
    lon?: number;
  } | null>(null);
  const hasRecenteredRef = useRef(false);

  // Use 10.0.2.2 to access host machine from Android emulator. On iOS simulator use localhost.
  const host =
    Platform.OS === 'android'
      ? 'http://10.0.2.2:5000'
      : 'http://localhost:5000';

  const fetchPlaygrounds = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching playgrounds...');

      // Use user location if available, otherwise default to Lisbon center
      const centerLat = userLocation?.lat || 38.7223;
      const centerLon = userLocation?.lon || -9.1393;

      console.log('Fetching playgrounds near:', {
        lat: centerLat,
        lon: centerLon,
      });

      const params = new URLSearchParams({
        lat: String(centerLat),
        lon: String(centerLon),
        radius: '10000',
        ...filters,
      });

      if (searchQuery) params.append('search', searchQuery);

      // Construct Overpass QL query using actual location
      let overpassQuery = `[out:json][timeout:25];
        node(around:10000,${centerLat},${centerLon})["leisure"="playground"];
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
  }, [host, filters, searchQuery, userLocation]);

  useEffect(() => {
    // Auto-fetch playgrounds when app starts
    // try to obtain device location for centering and recenter button
    const tryLocation = async () => {
      try {
        Geolocation.getCurrentPosition(
          (pos: any) => {
            const newLocation = {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
            };
            console.log('Got user location:', newLocation);
            setUserLocation(newLocation);
          },
          (error: any) => {
            console.warn('Geolocation error:', error);
            // Fetch playgrounds with default location if geolocation fails
            fetchPlaygrounds();
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
        );
      } catch (e) {
        console.warn('Geolocation exception:', e);
        // Fetch playgrounds with default location if exception
        fetchPlaygrounds();
      }
    };

    tryLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Recenter map when user location is first obtained
  useEffect(() => {
    if (userLocation && !hasRecenteredRef.current) {
      hasRecenteredRef.current = true;
      console.log('Recentering map to user location:', userLocation);
      if (mapRef.current?.recenter) {
        mapRef.current.recenter(userLocation.lat, userLocation.lon, 15);
      }
      // Fetch playgrounds for the new location
      fetchPlaygrounds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]); // Don't include fetchPlaygrounds to avoid loop

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlaygrounds();
    setRefreshing(false);
  }, [fetchPlaygrounds]);

  const handleSavePlayground = useCallback(
    async (playgroundData: any) => {
      try {
        console.log('Saving playground:', playgroundData);

        // Construir FormData para enviar imagens via multipart/form-data
        const form = new FormData();

        // Campos textuais
        form.append('name', playgroundData.name || '');
        form.append('description', playgroundData.description || '');
        // Enviar lat/lng também (compatibilidade com backend)
        if (typeof playgroundData.latitude !== 'undefined') {
          form.append('lat', String(playgroundData.latitude));
        }
        if (typeof playgroundData.longitude !== 'undefined') {
          form.append('lng', String(playgroundData.longitude));
        }

        // Adicionar comodidades/tags
        const surface = playgroundData.amenities
          .find((a: string) =>
            ['Relva', 'Areia', 'Borracha', 'Alcatrão', 'Terra'].includes(a),
          )
          ?.toLowerCase();
        if (surface) form.append('surface', surface);
        form.append(
          'wheelchair',
          playgroundData.amenities.includes('Acessível Cadeira Rodas')
            ? 'yes'
            : 'no',
        );
        form.append(
          'covered',
          playgroundData.amenities.includes('Coberto') ? 'yes' : 'no',
        );
        form.append(
          'bench',
          playgroundData.amenities.includes('Bancos') ? 'yes' : 'no',
        );
        form.append(
          'drinking_water',
          playgroundData.amenities.includes('Bebedouro') ? 'yes' : 'no',
        );
        form.append(
          'playground_slide',
          playgroundData.amenities.includes('Escorrega') ||
            playgroundData.amenities.includes('Escorrega 2 pisos')
            ? 'yes'
            : 'no',
        );
        form.append(
          'playground_swing',
          playgroundData.amenities.includes('Baloiços') ? 'yes' : 'no',
        );
        form.append(
          'playground_climbingframe',
          playgroundData.amenities.includes('Rede') ||
            playgroundData.amenities.includes('Rede Arborismo')
            ? 'yes'
            : 'no',
        );

        const theme = playgroundData.amenities
          .find((a: string) =>
            [
              'Aventura',
              'Natureza',
              'Desporto',
              'Inclusivo',
              'Tradicional',
            ].includes(a),
          )
          ?.toLowerCase();
        if (theme) form.append('theme', theme);

        // idade mínima/máxima
        if (playgroundData.amenities.includes('0-2 anos')) {
          form.append('min_age', '0');
          form.append('max_age', '2');
        } else if (playgroundData.amenities.includes('2-5 anos')) {
          form.append('min_age', '2');
          form.append('max_age', '5');
        } else if (playgroundData.amenities.includes('5-12 anos')) {
          form.append('min_age', '5');
          form.append('max_age', '12');
        } else if (playgroundData.amenities.includes('12+ anos')) {
          form.append('min_age', '12');
          form.append('max_age', '99');
        }

        form.append('userId', 'mobile-app-user');

        // Anexar imagens (campo 'images' esperado pelo backend multer)
        const photos = playgroundData.photos || [];
        photos.forEach((uri: string, idx: number) => {
          // garantir prefixo file:// para Android local files
          let fileUri = uri;
          if (
            !fileUri.startsWith('file://') &&
            !fileUri.startsWith('content://') &&
            !fileUri.startsWith('http')
          ) {
            fileUri = `file://${fileUri}`;
          }
          const filename = fileUri.split('/').pop() || `photo_${idx}.jpg`;
          const match = /\.([0-9a-z]+)(?:[?#]|$)/i.exec(filename);
          const ext = match ? match[1].toLowerCase() : 'jpg';
          const type = ext === 'png' ? 'image/png' : 'image/jpeg';

          // @ts-ignore - RN FormData file object
          form.append('images', { uri: fileUri, name: filename, type });
        });

        // Não setar manualmente 'Content-Type' — fetch definirá boundary
        const response = await fetch(`${host}/api/points`, {
          method: 'POST',
          body: form,
        });

        if (response.ok) {
          const savedPlayground = await response.json();
          console.log('Playground saved successfully:', savedPlayground);
          Alert.alert('Sucesso', 'Parque registado com sucesso!');
          // Refresh playgrounds after saving
          await fetchPlaygrounds();
        } else {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          Alert.alert('Erro', errorData.error || 'Falha ao registar o parque');
        }
      } catch (error) {
        console.error('Error saving playground:', error);
        Alert.alert('Erro', 'Falha ao conectar com o servidor');
      }
    },
    [host, fetchPlaygrounds],
  );

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

      {/* Register Screen */}
      {showRegisterScreen && (
        <RegisterScreen
          onBack={() => setShowRegisterScreen(false)}
          onSave={handleSavePlayground}
        />
      )}

      {/* Map with playgrounds and floating search */}
      {!showFilterScreen && !showRegisterScreen && (
        <View style={styles.mapContainer}>
          <Map
            ref={mapRef}
            playgrounds={playgrounds}
            initialCenter={userLocation || { lat: 38.7223, lon: -9.1393 }}
            initialZoom={15}
            onBoundsChange={bbox => {
              // forwarded to earlier handler if needed
              console.log('Bounds changed', bbox);
            }}
            onMapTap={coords => {
              console.log('Map tapped at', coords);
              // open register and prefill coords
              setRegisterInitialCoords(coords);
              setShowRegisterScreen(true);
            }}
            onMarkerPress={(p: Playground) => {
              console.log('Marker pressed:', p);
              setSelectedPlayground(p);
              setShowDrawer(true);
            }}
          />

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => setShowRegisterScreen(true)}
          >
            <Text style={styles.registerButtonText}>Registar Parque</Text>
          </TouchableOpacity>

          {/* Recenter floating icon button (bottom-left) */}
          {userLocation && (
            <TouchableOpacity
              style={styles.recenterButton}
              onPress={() => {
                if (mapRef.current?.recenter) {
                  mapRef.current.recenter(
                    userLocation.lat,
                    userLocation.lon,
                    15,
                  );
                }
              }}
            >
              <Filter name="my-location" size={22} color="#fff" />
            </TouchableOpacity>
          )}

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
                    `Parques ${selectedPlayground.id}`}
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
                    <Text style={styles.photoPlaceholderText}>
                      📍 Sem foto disponível
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.drawerDescription}>
                {selectedPlayground.description ||
                  selectedPlayground.tags?.description ||
                  'Sem descrição disponível'}
              </Text>
              <View style={styles.amenitiesGrid}>
                <Text style={styles.amenitiesTitle}>
                  Equipamentos e Comodidades
                </Text>
                <View style={styles.amenityChipsContainer}>
                  {/* Amenities with 'yes' values */}
                  {selectedPlayground.tags &&
                    Object.keys(selectedPlayground.tags)
                      .filter(key => {
                        const val = selectedPlayground.tags?.[key];
                        // Only show amenities that are available (value = 'yes')
                        return (
                          val === 'yes' &&
                          (key.startsWith('playground:') ||
                            [
                              'bench',
                              'covered',
                              'drinking_water',
                              'wheelchair',
                              'natural_shade',
                              'lit',
                            ].includes(key))
                        );
                      })
                      .map(key => {
                        // Map keys to friendly Portuguese labels
                        const labelMap: Record<string, string> = {
                          bench: 'Bancos',
                          covered: 'Coberto',
                          drinking_water: 'Bebedouro',
                          wheelchair: 'Acessível',
                          natural_shade: 'Sombra Natural',
                          lit: 'Iluminado',
                          'playground:slide': 'Escorrega',
                          'playground:swing': 'Baloiços',
                          'playground:climbingframe': 'Rede',
                          'playground:climbing_net': 'Rede Arborismo',
                          'playground:seesaw': 'Balancé',
                          'playground:slider': 'Slider',
                          'playground:music': 'Música',
                          'playground:slide:double_deck': 'Escorrega 2 Pisos',
                        };

                        const label =
                          labelMap[key] ||
                          key
                            .replace('playground:', '')
                            .replace(/_/g, ' ')
                            .split(' ')
                            .map(
                              word =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(' ');

                        return (
                          <View key={key} style={styles.amenityChip}>
                            <Text style={styles.amenityChipText}>{label}</Text>
                          </View>
                        );
                      })}

                  {/* Add surface type if present */}
                  {selectedPlayground.tags?.surface && (
                    <View
                      style={[
                        styles.amenityChip,
                        { backgroundColor: '#06b6d4' },
                      ]}
                    >
                      <Text style={styles.amenityChipText}>
                        Surface: {selectedPlayground.tags.surface}
                      </Text>
                    </View>
                  )}

                  {/* Add theme if present */}
                  {selectedPlayground.tags?.['playground:theme'] && (
                    <View
                      style={[
                        styles.amenityChip,
                        { backgroundColor: '#8b5cf6' },
                      ]}
                    >
                      <Text style={styles.amenityChipText}>
                        Theme: {selectedPlayground.tags['playground:theme']}
                      </Text>
                    </View>
                  )}

                  {/* Add age range if present */}
                  {(selectedPlayground.tags?.min_age ||
                    selectedPlayground.tags?.max_age) && (
                    <View
                      style={[
                        styles.amenityChip,
                        { backgroundColor: '#f59e0b' },
                      ]}
                    >
                      <Text style={styles.amenityChipText}>
                        {selectedPlayground.tags.min_age || '?'}-
                        {selectedPlayground.tags.max_age || '?'} anos
                      </Text>
                    </View>
                  )}
                </View>
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
  registerButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  registerButtonText: {
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
    minHeight: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 16,
    lineHeight: 26,
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
  amenityChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 4,
    marginBottom: 4,
  },
  amenityChipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
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
  recenterButton: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0ea5ff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    zIndex: 1010,
  },
});

export default App;
