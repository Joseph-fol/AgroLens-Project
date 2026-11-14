import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { CoordinatePoint } from '../types/agrolens';

interface LeafletFarmMapProps {
  latitude: number;
  longitude: number;
  farmName: string;
  boundary?: CoordinatePoint[];
  heightClass?: string;
  editable?: boolean;
  showNasaGrid?: boolean;
  riskLayer?: 'none' | 'heat' | 'moisture' | 'erosion';
  onCoordinateSelect?: (lat: number, lng: number) => void;
}

export function LeafletFarmMap({
  latitude,
  longitude,
  farmName,
  boundary,
  heightClass = 'h-72',
  editable = false,
  showNasaGrid = false,
  riskLayer = 'none',
  onCoordinateSelect,
}: LeafletFarmMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: showNasaGrid ? 10 : 15,
      zoomControl: true,
    });

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Imagery &copy; Esri',
        maxZoom: 19,
      }
    );

    satelliteLayer.addTo(map);
    L.control.layers({ 'Satellite Imagery': satelliteLayer, 'Street Map': osmLayer }, undefined, { position: 'topright' }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    overlayGroupRef.current = group;

    return () => {
      map.remove();
      mapRef.current = null;
      overlayGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handler = (e: L.LeafletMouseEvent) => {
      if (editable && onCoordinateSelect) {
        onCoordinateSelect(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
      }
    };
    map.on('click', handler);
    return () => {
      map.off('click', handler);
    };
  }, [editable, onCoordinateSelect]);

  useEffect(() => {
    const map = mapRef.current;
    const group = overlayGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Marker icon built cleanly with divIcon so default Leaflet PNG asset path issues never occur
    const pinIcon = L.divIcon({
      className: 'agrolens-pin',
      html: `<div style="width:26px;height:26px;border-radius:9999px;background:#0B4D1E;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;border-radius:9999px;background:#4ADE80;"></div></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    L.marker([latitude, longitude], { icon: pinIcon })
      .bindPopup(`<strong>${farmName}</strong><br/>${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`)
      .addTo(group);

    // Farm boundary polygon
    const polyPoints: [number, number][] =
      boundary && boundary.length >= 3
        ? boundary.map((p) => [p.lat, p.lng])
        : [
            [latitude + 0.0014, longitude - 0.0016],
            [latitude + 0.0015, longitude + 0.0018],
            [latitude - 0.0014, longitude + 0.0019],
            [latitude - 0.0015, longitude - 0.0014],
          ];

    L.polygon(polyPoints, {
      color: '#FFFFFF',
      weight: 2.5,
      dashArray: '6 5',
      fillColor: '#22C55E',
      fillOpacity: 0.25,
    })
      .bindTooltip(`${farmName} Boundary`, { sticky: true })
      .addTo(group);

    // Optional NASA POWER 0.5° × 0.625° regional grid footprint
    if (showNasaGrid) {
      const gridLatStart = Math.floor(latitude / 0.5) * 0.5;
      const gridLngStart = Math.floor(longitude / 0.625) * 0.625;
      L.rectangle(
        [
          [gridLatStart, gridLngStart],
          [gridLatStart + 0.5, gridLngStart + 0.625],
        ],
        {
          color: '#1D4ED8',
          weight: 2,
          dashArray: '8 6',
          fillColor: '#3B82F6',
          fillOpacity: 0.09,
        }
      )
        .bindPopup('<strong>NASA POWER Grid Cell (0.5° × 0.625°)</strong><br/>Regional ~55 km meteorological average')
        .addTo(group);

      // GPM 0.1° x 0.1° (~11 km) sub-grid
      const gpmLat = Math.floor(latitude / 0.1) * 0.1;
      const gpmLng = Math.floor(longitude / 0.1) * 0.1;
      L.rectangle(
        [
          [gpmLat, gpmLng],
          [gpmLat + 0.1, gpmLng + 0.1],
        ],
        {
          color: '#0D9488',
          weight: 1.8,
          fillColor: '#14B8A6',
          fillOpacity: 0.12,
        }
      )
        .bindPopup('<strong>GPM IMERG Cell (0.1° × 0.1°)</strong><br/>~11 km precipitation grid')
        .addTo(group);
    }

    // Risk overlays (illustrative regional context)
    if (riskLayer !== 'none') {
      const riskColors = {
        heat: { color: '#D97706', label: 'Regional Thermal Stress Context (Tmax ≥ 33°C)' },
        moisture: { color: '#0284C7', label: 'SMAP / MERRA-2 Soil Wetness Zone' },
        erosion: { color: '#DC2626', label: 'Runoff & Bare-Soil Erosion Risk Zone' },
      };
      const cfg = riskColors[riskLayer];
      L.circle([latitude, longitude], {
        radius: 1800,
        color: cfg.color,
        weight: 2,
        fillColor: cfg.color,
        fillOpacity: 0.16,
      })
        .bindPopup(cfg.label)
        .addTo(group);
    }

    map.setView([latitude, longitude], showNasaGrid ? 10 : 15, { animate: true });
  }, [latitude, longitude, farmName, boundary, showNasaGrid, riskLayer]);

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-[#CFE2D0] bg-[#E8F1E8]`}>
      <div ref={containerRef} className="w-full h-full" />
      {editable && (
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm border border-[#CFE2D0] rounded-lg px-3 py-1.5 text-xs font-medium text-[#0F1F14] shadow-sm pointer-events-none">
          Click anywhere on map to update farm coordinates
        </div>
      )}
    </div>
  );
}
