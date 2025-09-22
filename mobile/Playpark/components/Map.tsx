import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, UrlTile, Region } from 'react-native-maps';

type Playground = {
  id: number | string;
  lat: number;
  lon: number;
  tags?: Record<string, any>;
};

type Props = {
  playgrounds?: Playground[];
  onMarkerPress?: (p: Playground) => void;
};

export default function MobileMap({ playgrounds = [], onMarkerPress }: Props) {
  const initialRegion: Region = {
    latitude: 38.7223,
    longitude: -9.1393,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        // provider default: on Android this uses Google Maps SDK
        showsUserLocation={false}
      >
        {/* Use tile.openstreetmap.org (no {s}) to avoid subdomain issues */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        {/* test marker(s) */}
        <Marker
          key="test"
          coordinate={{ latitude: 38.7223, longitude: -9.1393 }}
          title="Lisboa (teste)"
          description="Marker de teste"
          onPress={() => {
            if (playgrounds && playgrounds.length > 0) {
              onMarkerPress?.(playgrounds[0]);
            }
          }}
        />

        {playgrounds.map(p => (
          <Marker
            key={String(p.id)}
            coordinate={{ latitude: Number(p.lat), longitude: Number(p.lon) }}
            title={p.tags?.name || `Parque ${p.id}`}
            description={p.tags?.description || undefined}
            onPress={() => onMarkerPress?.(p)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
