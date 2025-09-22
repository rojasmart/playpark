import React, { useRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

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
  const webviewRef = useRef<any>(null);

  console.log('MobileMap rendering with playgrounds:', playgrounds.length);
  console.log('Sample playground:', playgrounds[0]);

  const html = useMemo(() => {
    const pg = JSON.stringify(playgrounds || []);

    console.log('HTML playgrounds data:', pg);

    return `<!doctype html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <style>html,body,#map{height:100%;margin:0;padding:0} .leaflet-control-attribution{display:none!important}</style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
      if (typeof L === 'undefined') {
       console.error('WebView: Leaflet not loaded - check internet connection');
         document.body.innerHTML = '<div style="padding:20px;text-align:center;color:red;">Erro: Leaflet não carregou. Verifique conexão à internet.</div>';
       } else {
         console.log('WebView: Leaflet loaded successfully');
       }
        const playgrounds = ${pg};
        const map = L.map('map').setView([38.7223, -9.1393], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
        function send(msg) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(msg));
          }
        }
        playgrounds.forEach((p, idx) => {
          try {
            const lat = parseFloat(p.lat);
            const lon = parseFloat(p.lon);
            if (!isNaN(lat) && !isNaN(lon)) {
              const m = L.marker([lat, lon]).addTo(map);
              const title = (p.tags && (p.tags.name || p.tags.operator)) || ('Parque ' + p.id);
              m.bindPopup(title);
              m.on('click', function() { send({ type: 'markerPress', index: idx, payload: p }); });
            }
          } catch(e) { /* ignore malformed items */ }
        });
      </script>
    </body>
    </html>`;
  }, [playgrounds]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        onMessage={(event: any) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data && data.type === 'markerPress') {
              const p = data.payload;
              onMarkerPress?.(p);
            }
          } catch (e) {
            // ignore
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  web: { flex: 1, backgroundColor: 'transparent' },
});
