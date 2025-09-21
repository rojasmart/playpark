import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';

type Playground = {
  id: number | string;
  lat: number;
  lon: number;
  tags?: Record<string, any>;
};

type Props = {
  playgrounds: Playground[];
  onMarkerPress?: (p: Playground) => void;
  initialRegion?: Region;
};

export default function MobileMap({
  playgrounds,
  onMarkerPress,
  initialRegion,
}: Props) {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={
          initialRegion ||
          ({
            latitude: 38.7223,
            longitude: -9.1393,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          } as Region)
        }
      >
        {playgrounds.map(p => (
          <Marker
            key={String(p.id)}
            coordinate={{ latitude: p.lat, longitude: p.lon }}
            title={p.tags?.name}
            description={p.tags?.description}
            onPress={() => onMarkerPress && onMarkerPress(p)}
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
