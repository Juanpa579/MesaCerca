"use client";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RestaurantLocationPickerProps {
  latitude: number | null;
  longitude: number | null;

  onLocationChange: (
    latitude: number,
    longitude: number,
  ) => void;

  disabled?: boolean;
}

const DEFAULT_LOCATION: [
  number,
  number,
] = [6.2442, -75.5812];

function LocationMarker({
  latitude,
  longitude,
  onLocationChange,
  disabled,
}: RestaurantLocationPickerProps) {
  useMapEvents({
    click(event) {
      if (disabled) return;

      onLocationChange(
        event.latlng.lat,
        event.latlng.lng,
      );
    },
  });

  if (
    latitude === null ||
    longitude === null
  ) {
    return null;
  }

  return (
    <Marker
      position={[latitude, longitude]}
      icon={L.divIcon({
        className: "",
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #f97316;
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: white;
              border-radius: 50%;
              position: absolute;
              top: 8px;
              left: 8px;
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })}
    />
  );
}

export function RestaurantLocationPicker({
  latitude,
  longitude,
  onLocationChange,
  disabled = false,
}: RestaurantLocationPickerProps) {
  const center: [
    number,
    number,
  ] =
    latitude !== null &&
    longitude !== null
      ? [latitude, longitude]
      : DEFAULT_LOCATION;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300">
      <MapContainer
        center={center}
        zoom={
          latitude !== null &&
          longitude !== null
            ? 17
            : 13
        }
        scrollWheelZoom={!disabled}
        dragging={!disabled}
        doubleClickZoom={!disabled}
        touchZoom={!disabled}
        zoomControl={!disabled}
        className="h-[400px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker
          latitude={latitude}
          longitude={longitude}
          onLocationChange={
            onLocationChange
          }
          disabled={disabled}
        />
      </MapContainer>

      <div className="border-t border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-500">
          {latitude !== null &&
          longitude !== null
            ? "Haz clic nuevamente en el mapa para cambiar la ubicación."
            : "Haz clic en el mapa para seleccionar la ubicación del restaurante."}
        </p>
      </div>
    </div>
  );
}