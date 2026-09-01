"use client";

import { useEffect, useState } from "react";

import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import type { RestaurantProfile } from "@/services/restaurantService";

import { RestaurantMapCard } from "./RestaurantMapCard";

import "leaflet/dist/leaflet.css";

interface RestaurantMapProps {
  restaurants: RestaurantProfile[];
}

const restaurantIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RecenterMap({
  position,
}: {
  position: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.flyTo(position, 15, {
      duration: 1.5,
    });
  }, [map, position]);

  return null;
}

function LocationButton({
  onLocate,
}: {
  onLocate: () => void;
}) {
  const map = useMap();

  return (
    <button
      type="button"
      onClick={onLocate}
      className="absolute right-3 top-3 z-[1000] rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-md transition hover:bg-slate-50"
    >
      Mi ubicación
    </button>
  );
}

export function RestaurantMap({
  restaurants,
}: RestaurantMapProps) {
  const [userLocation, setUserLocation] = useState<
    [number, number] | null
  >(null);

  const [locationError, setLocationError] = useState("");

  const restaurantsWithLocation = restaurants.filter(
    (restaurant) =>
      typeof restaurant.latitud === "number" &&
      typeof restaurant.longitud === "number" &&
      Number.isFinite(restaurant.latitud) &&
      Number.isFinite(restaurant.longitud) &&
      restaurant.latitud >= -90 &&
      restaurant.latitud <= 90 &&
      restaurant.longitud >= -180 &&
      restaurant.longitud <= 180,
  );

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Tu navegador no permite obtener tu ubicación.",
      );
      return;
    }

    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "No se pudo acceder a tu ubicación. Revisa los permisos del navegador.",
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Tu ubicación no está disponible en este momento.",
            );
            break;

          case error.TIMEOUT:
            setLocationError(
              "La solicitud de ubicación tardó demasiado.",
            );
            break;

          default:
            setLocationError(
              "No se pudo obtener tu ubicación.",
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  useEffect(() => {
    requestUserLocation();
  }, []);

  return (
    <div className="relative h-[350px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <MapContainer
        center={[6.2442, -75.5812]}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap position={userLocation} />

        <LocationButton onLocate={requestUserLocation} />

        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={9}
            pathOptions={{
              color: "white",
              fillColor: "#2563eb",
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -8]}
              className="font-semibold"
            >
              Tú
            </Tooltip>
          </CircleMarker>
        )}

        {restaurantsWithLocation.map((restaurant) => (
          <Marker
            key={restaurant.uid}
            position={[
              restaurant.latitud!,
              restaurant.longitud!,
            ]}
            icon={restaurantIcon}
          >
            <Popup>
              <RestaurantMapCard
                restaurant={restaurant}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {locationError && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] rounded-lg bg-white px-3 py-2 text-xs text-slate-600 shadow-md">
          {locationError}
        </div>
      )}
    </div>
  );
}
