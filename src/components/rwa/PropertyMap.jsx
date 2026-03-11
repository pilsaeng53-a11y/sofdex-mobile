import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Use CDN icons to avoid Vite asset resolution issues
const PIN_ICON = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
});

export default function PropertyMap({ property }) {
  const { lat, lng } = property.coordinates;

  return (
    <div className="rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.08)]" style={{ height: 240 }}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%', background: '#0d1220' }}
        scrollWheelZoom={false}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Dark CartoDB tiles — matches app theme */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <Marker position={[lat, lng]} icon={PIN_ICON}>
          <Popup>
            <div style={{ fontSize: '12px', lineHeight: 1.5, minWidth: 140 }}>
              <strong style={{ display: 'block', marginBottom: 2 }}>{property.name}</strong>
              <span style={{ color: '#64748b' }}>{property.city}, {property.country}</span>
              <br />
              <span style={{ color: '#64748b', fontSize: 10 }}>
                {lat.toFixed(4)}°, {lng.toFixed(4)}°
              </span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}