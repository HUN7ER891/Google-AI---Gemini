import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { StationData } from '../types/airQuality.ts';
import { getOverallAQI, AQIStandard } from '../utils/aqiCalculations.ts';
import { MapPin, Mountain, Eye, Layers } from 'lucide-react';

interface SarajevoMapProps {
  stations: StationData[];
  selectedStationId: string | null;
  onSelectStation: (station: StationData) => void;
  aqiStandard: AQIStandard;
  language: 'bs' | 'en';
}

export const SarajevoMap: React.FC<SarajevoMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  aqiStandard,
  language,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const overlaysLayerRef = useRef<L.LayerGroup | null>(null);
  const isBs = language === 'bs';

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Leaflet map centered on Sarajevo basin
    const map = L.map(mapContainerRef.current, {
      center: [43.8563, 18.3800],
      zoom: 12,
      minZoom: 10,
      maxZoom: 17,
      zoomControl: true,
      attributionControl: false,
    });

    // ArcGIS World Dark Gray Base layer (no API key required, beautiful dark slate aesthetic)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Esri, HERE, Garmin, OpenStreetMap contributors',
    }).addTo(map);

    // ArcGIS Reference overlay for street names and neighborhoods
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      opacity: 0.85,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    const overlaysLayer = L.layerGroup().addTo(map);

    markersLayerRef.current = markersLayer;
    overlaysLayerRef.current = overlaysLayer;
    mapInstanceRef.current = map;

    // Add Miljacka River valley flow corridor line (approximate basin floor)
    const valleyPath = [
      [43.8610, 18.4450], // Bentbaša / Mošćanica
      [43.8590, 18.4334], // Vijećnica
      [43.8560, 18.4140], // Skenderija
      [43.8530, 18.3980], // Marijin Dvor
      [43.8500, 18.3840], // Grbavica / Vilsonovo
      [43.8475, 18.3683], // Otoka
      [43.8400, 18.3450], // Alipašino Polje
      [43.8317, 18.3039], // Ilidža
    ] as L.LatLngExpression[];

    L.polyline(valleyPath, {
      color: '#38bdf8',
      weight: 3,
      opacity: 0.35,
      dashArray: '4, 8',
    }).bindTooltip(
      isBs ? 'Rijeka Miljacka • Glavni koridor kotline' : 'Miljacka River • Main basin corridor',
      { permanent: false, direction: 'top', className: 'text-xs' }
    ).addTo(overlaysLayer);

    // Add Sarajevska žičara (Cable Car) line connecting Bistrik to Trebević Vidikovac
    const cableCarPath = [
      [43.8550, 18.4320], // Bistrik Departure Station (583 m)
      [43.8344, 18.4489], // Vidikovac Trebević Station (1,160 m)
    ] as L.LatLngExpression[];

    L.polyline(cableCarPath, {
      color: '#a855f7',
      weight: 2.5,
      opacity: 0.8,
      dashArray: '6, 6',
    }).bindTooltip(
      isBs ? 'Sarajevska žičara (Bistrik 583m → Trebević 1.160m • Spas od smoga)' : 'Sarajevo Cable Car (583m → 1,160m • Smog Escape Line)',
      { permanent: false, direction: 'right' }
    ).addTo(overlaysLayer);

    // Mountain peak landmarks around Sarajevo
    const mountainPeaks = [
      { name: 'Trebević', elev: '1.160 m', coords: [43.8344, 18.4489] as [number, number] },
      { name: 'Hum (TV Toranj)', elev: '816 m', coords: [43.8744, 18.3847] as [number, number] },
      { name: 'Igman (Malo Polje)', elev: '1.246 m', coords: [43.7667, 18.2833] as [number, number] },
      { name: 'Bjelašnica (Opservatorij)', elev: '2.067 m', coords: [43.7042, 18.2611] as [number, number] },
    ];

    mountainPeaks.forEach((peak) => {
      const peakIcon = L.divIcon({
        className: 'mountain-marker',
        html: `
          <div class="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/90 border border-purple-500/40 text-[10px] font-semibold text-purple-300 shadow">
            <span>▲ ${peak.name}</span>
            <span class="text-slate-400">(${peak.elev})</span>
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [60, 12],
      });
      L.marker(peak.coords, { icon: peakIcon, interactive: false }).addTo(overlaysLayer);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update station markers whenever stations, aqiStandard, or selectedStationId change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    stations.forEach((station) => {
      const aqiRes = getOverallAQI(station.pollutants, aqiStandard);
      const isSelected = station.id === selectedStationId;
      const isMountain = station.id === 'trebevic' || station.elevationM >= 1000;
      const pulseAnimation = aqiRes.aqi > 100 ? 'animate-smog-pulse' : '';

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110" style="width: 44px; height: 44px;">
          ${
            aqiRes.aqi > 100
              ? `<div class="absolute inset-0 rounded-full ${pulseAnimation}" style="background-color: ${aqiRes.color}; opacity: 0.35;"></div>`
              : ''
          }
          <div
            class="relative flex flex-col items-center justify-center rounded-full text-white font-extrabold shadow-lg transition-all ${
              isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-950 scale-110' : ''
            }"
            style="
              width: ${isSelected ? '38px' : '32px'};
              height: ${isSelected ? '38px' : '32px'};
              background-color: ${aqiRes.color};
              border: 2px solid ${isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.85)'};
            "
          >
            <span class="text-[12px] leading-none drop-shadow-md">${aqiRes.aqi}</span>
            ${isMountain ? '<span class="text-[7px] leading-none text-purple-100 uppercase tracking-tighter">Planina</span>' : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'station-div-icon',
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([station.latitude, station.longitude], { icon: customIcon });

      const stationName = isBs ? station.nameBs : station.name;
      const categoryLabel = isBs ? aqiRes.labelBs : aqiRes.labelEn;

      marker.bindTooltip(
        `
        <div class="p-1">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-bold text-white text-xs">${stationName}</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style="background-color: ${aqiRes.color}">
              AQI ${aqiRes.aqi}
            </span>
          </div>
          <div class="text-[11px] text-slate-300">
            <div>${categoryLabel} (${aqiRes.dominantPollutant})</div>
            <div class="text-slate-400 mt-0.5">PM2.5: ${station.pollutants.pm25} μg/m³ • ${station.elevationM}m n/v</div>
          </div>
        </div>
        `,
        { direction: 'top', offset: [0, -18], className: 'custom-leaflet-tooltip' }
      );

      marker.on('click', () => {
        onSelectStation(station);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [stations, selectedStationId, aqiStandard, language, onSelectStation]);

  // Center on selected station if clicked from outside
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStationId) return;
    const selected = stations.find((s) => s.id === selectedStationId);
    if (selected) {
      mapInstanceRef.current.panTo([selected.latitude, selected.longitude], {
        animate: true,
        duration: 0.6,
      });
    }
  }, [selectedStationId, stations]);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Top Map Header Controls Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs">
        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-bold text-white">
          {isBs ? 'Mapa Kantona Sarajevo' : 'Sarajevo Canton Map'}
        </span>
        <span className="text-slate-400">•</span>
        <span className="text-slate-300">{stations.length} {isBs ? 'senzora' : 'sensors'}</span>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[1000] bg-slate-900/90 backdrop-blur-md p-2.5 sm:p-3 rounded-xl border border-slate-700/80 shadow-xl text-xs max-w-sm">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
          <span>{isBs ? 'Indeks zagađenja' : 'Pollution Index (AQI)'}</span>
          <span className="text-[10px] text-slate-400 font-normal">
            {isBs ? 'Izvor: FHMZ / Copernicus / EkoAkcija' : 'Sources: FHMZ / Copernicus'}
          </span>
        </div>
        <div className="grid grid-cols-6 gap-1 text-[10px] text-center font-bold text-slate-200">
          <div className="rounded py-1 px-0.5 bg-emerald-500 text-slate-950">0-50</div>
          <div className="rounded py-1 px-0.5 bg-yellow-500 text-slate-950">51-100</div>
          <div className="rounded py-1 px-0.5 bg-orange-500 text-slate-950">101-150</div>
          <div className="rounded py-1 px-0.5 bg-red-500 text-white">151-200</div>
          <div className="rounded py-1 px-0.5 bg-purple-600 text-white">201-300</div>
          <div className="rounded py-1 px-0.5 bg-rose-950 text-rose-200 border border-rose-800">&gt;300</div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            {isBs ? 'Planinski referentni vrhovi' : 'Mountain Peaks'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-purple-400 border-dashed"></span>
            {isBs ? 'Sarajevska žičara' : 'Cable Car'}
          </span>
        </div>
      </div>

      {/* The Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
