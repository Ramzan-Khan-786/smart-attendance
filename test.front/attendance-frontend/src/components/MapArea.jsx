// frontend/src/components/MapArea.jsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw'; // side-effect import

// fix leaflet's icon for many bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapArea({ center=[19.386,72.858], zoom=13, activeGeofence, drawMode=false, onCreateGeofence }) {
  const mapRef = useRef();

  useEffect(() => {
    const map = mapRef.current && mapRef.current._map;
    if (!map) return;

    // setup Draw control if drawMode
    if (drawMode) {
      // remove existing draw control if any
      if (map._drawControl) map.removeControl(map._drawControl);

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      const drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems, edit: false, remove: false },
        draw: {
          polygon: true,
          circle: true,
          marker: false,
          polyline: false,
          rectangle: false
        }
      });
      map.addControl(drawControl);
      map._drawControl = drawControl;

      const onDrawCreated = (e) => {
        const layer = e.layer;
        if (layer instanceof L.Circle) {
          const center = layer.getLatLng();
          const radius = layer.getRadius();
          const coords = { type: 'circle', center: { lat: center.lat, lng: center.lng }, radius };
          if (onCreateGeofence) onCreateGeofence(coords);
        } else if (layer instanceof L.Polygon) {
          const latlngs = layer.getLatLngs()[0].map(p => ({ lat: p.lat, lng: p.lng }));
          const coords = { type: 'polygon', polygon: latlngs };
          if (onCreateGeofence) onCreateGeofence(coords);
        }
        // clear the drawn layer to avoid duplicates
        drawnItems.clearLayers();
      };

      map.on(L.Draw.Event.CREATED, onDrawCreated);

      return () => {
        map.off(L.Draw.Event.CREATED, onDrawCreated);
        if (map._drawControl) {
          map.removeControl(map._drawControl);
          map._drawControl = null;
        }
      };
    }
  }, [drawMode, onCreateGeofence]);

  return (
    <div style={{ width: '100%', height: '520px', borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%' }} whenCreated={mapInst => (mapRef.current = mapInst)}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {activeGeofence && activeGeofence.geofence && (() => {
          const g = activeGeofence.geofence;
          if (g.coords.type === 'circle' && g.coords.center) {
            return (
              <>
                <Circle center={[g.coords.center.lat, g.coords.center.lng]} radius={g.coords.radius || 50} />
                <Marker position={[g.coords.center.lat, g.coords.center.lng]}>
                  <Popup>
                    <div>
                      <div><strong>{activeGeofence.sessionName}</strong></div>
                      <div>Admin: {activeGeofence.activatedByName}</div>
                      <div>Coords: {g.coords.center.lat.toFixed(6)}, {g.coords.center.lng.toFixed(6)}</div>
                    </div>
                  </Popup>
                </Marker>
              </>
            );
          }

          if (g.coords.type === 'polygon' && g.coords.polygon && g.coords.polygon.length) {
            const latlngs = g.coords.polygon.map(p => [p.lat, p.lng]);
            return (
              <>
                <Polygon positions={latlngs} />
                <Marker position={latlngs[0]}>
                  <Popup>
                    <div>
                      <div><strong>{activeGeofence.sessionName}</strong></div>
                      <div>Admin: {activeGeofence.activatedByName}</div>
                    </div>
                  </Popup>
                </Marker>
              </>
            );
          }
          return null;
        })()}
      </MapContainer>
    </div>
  );
}
