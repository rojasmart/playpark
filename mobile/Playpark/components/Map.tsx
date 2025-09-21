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
  playgrounds: Playground[];
  onMarkerPress?: (p: Playground) => void;
  initialRegion?: Region;
};

export default function MobileMap({
  playgrounds,
  onMarkerPress,
  initialRegion,
}: Props) {
  const region: Region =
    initialRegion ||
    ({
      latitude: 38.7223,
      longitude: -9.1393,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2,
    } as Region);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region}>
        <UrlTile
          urlTemplate={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          maximumZ={19}
          flipY={false}
        />

        {playgrounds?.map(p => (
          <Marker
            key={String(p.id)}
            coordinate={{ latitude: Number(p.lat), longitude: Number(p.lon) }}
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
