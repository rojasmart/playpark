import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

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
  playgrounds?: Playground[];
  onMarkerPress?: (p: Playground) => void;
  initialCenter?: { lat: number; lon: number };
  initialZoom?: number;
  onBoundsChange?: (
    bounds: { north: number; south: number; east: number; west: number },
    zoom: number,
    center: { lat: number; lon: number },
  ) => void;
  onMapTap?: (coords: { lat: number; lon: number }) => void;
};

function MobileMap(
  {
    playgrounds = [],
    onMarkerPress,
    initialCenter,
    initialZoom = 13,
    onBoundsChange,
    onMapTap,
  }: Props,
  ref: any,
) {
  const webviewRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  // Generate HTML only once - don't recreate on playgrounds change
  const html = useMemo(() => {
    const center = JSON.stringify(
      initialCenter || { lat: 38.7223, lon: -9.1393 },
    );
    const zoom = initialZoom || 13;

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
       }
        let allPlaygrounds = []; // Will be updated dynamically
        const initCenter = ${center};
        const initZoom = ${zoom};
        const map = L.map('map').setView([initCenter.lat, initCenter.lon], initZoom);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
        function send(msg) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(msg));
          }
        }

        // Maintain markers array
        const markers = [];
        function clearMarkers() {
          for (let i = 0; i < markers.length; i++) {
            try { map.removeLayer(markers[i]); } catch(e){}
          }
          markers.length = 0;
        }

        function addMarkerFor(p) {
          const m = L.marker([p.lat, p.lon]).addTo(map);
          const title = p.name || (p.tags && (p.tags.name || p.tags.operator)) || ('Parque ' + p.id);
          m.bindPopup(title);
          m.on('click', function() { send({ type: 'markerPress', payload: p }); });
          markers.push(m);
        }

        function updateMarkers() {
          try {
            const b = map.getBounds();
            clearMarkers();
            for (let i = 0; i < allPlaygrounds.length; i++) {
              const p = allPlaygrounds[i];
              if (b.contains([p.lat, p.lon])) {
                addMarkerFor(p);
              }
            }
          } catch(e) { /* ignore */ }
        }
        
        // Function to update playgrounds from React Native
        window.__rn_updatePlaygrounds = function(newPlaygrounds) {
          try {
            allPlaygrounds = newPlaygrounds.map((p) => {
              const lat = parseFloat(p.lat);
              const lon = parseFloat(p.lon);
              return Object.assign({}, p, { lat, lon });
            }).filter(p => !isNaN(p.lat) && !isNaN(p.lon));
            updateMarkers();
          } catch(e) {
            console.error('Error updating playgrounds:', e);
          }
        };

        // Map click -> send coords
        map.on('click', function(e) { try { send({ type: 'mapTap', payload: { lat: e.latlng.lat, lon: e.latlng.lng } }); } catch(e){} });

        function postBounds() {
          try {
            const b = map.getBounds();
            const c = map.getCenter();
            const z = map.getZoom();
            send({ 
              type: 'bounds', 
              payload: { 
                north: b.getNorth(), 
                south: b.getSouth(), 
                east: b.getEast(), 
                west: b.getWest(),
                zoom: z,
                center: { lat: c.lat, lon: c.lng }
              } 
            });
          } catch(e) { }
        }

  // initial marker render and bounds post
  // DON'T call updateMarkers or postBounds here initially
  let boundsTimeout;
  let hasInitialized = false;
  
  map.on('moveend', function() { 
    if (boundsTimeout) clearTimeout(boundsTimeout); 
    boundsTimeout = setTimeout(function(){ 
      postBounds(); 
      updateMarkers(); 
      hasInitialized = true;
    }, hasInitialized ? 300 : 1000); // Even longer delay for initial load to avoid rate limiting
  });
  
  map.on('zoomend', function() { 
    if (boundsTimeout) clearTimeout(boundsTimeout); 
    boundsTimeout = setTimeout(function(){ 
      postBounds(); 
      updateMarkers(); 
    }, 300); 
  });

        // expose recenter helper for RN
        window.__rn_recenter = function(lat, lon, z) { try { map.setView([lat, lon], z || initZoom); } catch(e){} };
      </script>
    </body>
    </html>`;
  }, [initialCenter, initialZoom]); // Remove playgrounds from dependencies

  // Update playgrounds dynamically via JavaScript injection
  React.useEffect(() => {
    if (isInitializedRef.current && webviewRef.current) {
      const js = `
        if (typeof window.__rn_updatePlaygrounds === 'function') {
          window.__rn_updatePlaygrounds(${JSON.stringify(playgrounds)});
        }
        true;
      `;
      webviewRef.current.injectJavaScript(js);
    }
  }, [playgrounds]);

  useImperativeHandle(ref, () => ({
    recenter: (lat: number, lon: number, zoom?: number) => {
      try {
        const js = `window.__rn_recenter(${lat}, ${lon}, ${
          zoom || initialZoom
        }); true;`;
        webviewRef.current?.injectJavaScript(js);
      } catch (e) {}
    },
  }));

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
            if (!data) return;
            if (data.type === 'markerPress') {
              onMarkerPress?.(data.payload);
            } else if (data.type === 'bounds') {
              const { north, south, east, west, zoom, center } = data.payload;

              // Mark as initialized on first bounds event
              if (!isInitializedRef.current) {
                isInitializedRef.current = true;
              }

              onBoundsChange?.({ north, south, east, west }, zoom, center);
            } else if (data.type === 'mapTap') {
              onMapTap?.(data.payload);
            }
          } catch (e) {
            // ignore
          }
        }}
      />
    </View>
  );
}

export default forwardRef(MobileMap);

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  web: { flex: 1, backgroundColor: 'transparent' },
});
