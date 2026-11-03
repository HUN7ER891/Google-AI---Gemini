import React, { useState, useMemo } from 'react';
import { StationData } from '../types/airQuality.ts';
import { getOverallAQI, AQIStandard } from '../utils/aqiCalculations.ts';
import { Search, SlidersHorizontal, Mountain, Shield, Cpu, ArrowUpDown } from 'lucide-react';

interface StationGridProps {
  stations: StationData[];
  selectedStationId: string | null;
  onSelectStation: (station: StationData) => void;
  aqiStandard: AQIStandard;
  language: 'bs' | 'en';
}

export const StationGrid: React.FC<StationGridProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  aqiStandard,
  language,
}) => {
  const isBs = language === 'bs';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'worst' | 'cleanest' | 'elevation' | 'name'>('worst');

  const municipalities = useMemo(() => {
    const list = Array.from(new Set(stations.map((s) => s.municipality)));
    return ['all', ...list];
  }, [stations]);

  const filteredAndSortedStations = useMemo(() => {
    return stations
      .filter((station) => {
        const matchesSearch =
          station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          station.nameBs.toLowerCase().includes(searchQuery.toLowerCase()) ||
          station.municipality.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMunicipality =
          selectedMunicipality === 'all' || station.municipality === selectedMunicipality;

        const matchesSource =
          selectedSource === 'all' ||
          (selectedSource === 'official' && (station.source === 'fhmz' || station.source === 'us_embassy')) ||
          (selectedSource === 'citizen' && (station.source === 'sensor_community' || station.source === 'purple_air')) ||
          (selectedSource === 'custom' && station.isCustom);

        return matchesSearch && matchesMunicipality && matchesSource;
      })
      .sort((a, b) => {
        const aqiA = getOverallAQI(a.pollutants, aqiStandard).aqi;
        const aqiB = getOverallAQI(b.pollutants, aqiStandard).aqi;

        if (sortBy === 'worst') return aqiB - aqiA;
        if (sortBy === 'cleanest') return aqiA - aqiB;
        if (sortBy === 'elevation') return b.elevationM - a.elevationM;
        return a.name.localeCompare(b.name);
      });
  }, [stations, searchQuery, selectedMunicipality, selectedSource, sortBy, aqiStandard]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{isBs ? 'Mreža stanica u Kantonu Sarajevo' : 'Sarajevo Canton Monitoring Network'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {filteredAndSortedStations.length} {isBs ? 'stanica' : 'stations'}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            {isBs
              ? 'Uporedite zagađenje po općinama, visinskim zonama i tipu senzora'
              : 'Compare pollution across municipalities, elevation bands, and sensor sources'}
          </p>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBs ? 'Pretraži stanicu ili naselje...' : 'Search station or neighborhood...'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="worst">{isBs ? 'Najzagađenije prvo' : 'Worst air first'}</option>
              <option value="cleanest">{isBs ? 'Najčistije prvo' : 'Cleanest first'}</option>
              <option value="elevation">{isBs ? 'Nadmorska visina' : 'Elevation'}</option>
              <option value="name">{isBs ? 'Naziv (A-Z)' : 'Name (A-Z)'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Badges: Municipalities & Sources */}
      <div className="py-3 flex flex-wrap items-center gap-1.5 text-xs border-b border-slate-800/80">
        <span className="text-slate-500 font-semibold mr-1">{isBs ? 'Općina:' : 'Municipality:'}</span>
        {municipalities.map((mun) => (
          <button
            key={mun}
            onClick={() => setSelectedMunicipality(mun)}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              selectedMunicipality === mun
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {mun === 'all' ? (isBs ? 'Sve općine' : 'All') : mun}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        <span className="text-slate-500 font-semibold mr-1 ml-1">{isBs ? 'Izvor:' : 'Source:'}</span>
        <button
          onClick={() => setSelectedSource('all')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            selectedSource === 'all'
              ? 'bg-slate-700 text-white font-bold'
              : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          {isBs ? 'Svi' : 'All'}
        </button>
        <button
          onClick={() => setSelectedSource('official')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            selectedSource === 'official'
              ? 'bg-slate-700 text-white font-bold'
              : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          {isBs ? 'Službene (FHMZ/SAD)' : 'Official'}
        </button>
        <button
          onClick={() => setSelectedSource('citizen')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            selectedSource === 'citizen'
              ? 'bg-slate-700 text-white font-bold'
              : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          {isBs ? 'Građanski senzori' : 'Citizen Nodes'}
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {filteredAndSortedStations.map((station) => {
          const aqiRes = getOverallAQI(station.pollutants, aqiStandard);
          const isSelected = station.id === selectedStationId;
          const stationName = isBs ? station.nameBs : station.name;
          const isMountain = station.id === 'trebevic' || station.elevationM >= 1000;

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              {/* Top Row: Municipality & Elevation */}
              <div>
                <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {station.municipality}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {station.elevationM}m
                    </span>
                  </div>
                  {isMountain && (
                    <span className="flex items-center gap-1 text-[10px] text-purple-300 font-bold px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/50">
                      <Mountain className="w-3 h-3" />
                      <span>{isBs ? 'Planina' : 'Mountain'}</span>
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-white text-sm line-clamp-1">
                  {stationName}
                </h4>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                  {station.sourceName}
                </div>
              </div>

              {/* Middle Row: Big AQI and Status */}
              <div className="my-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">
                      {aqiRes.aqi}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded text-white shadow-sm"
                      style={{ backgroundColor: aqiRes.color }}
                    >
                      {isBs ? aqiRes.labelBs : aqiRes.labelEn}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isBs ? 'Dominira:' : 'Dominant:'} <span className="text-slate-200 font-semibold">{aqiRes.dominantPollutant}</span>
                  </div>
                </div>

                {/* Mini Pollutant summary */}
                <div className="text-right text-[11px] font-mono">
                  <div className="text-slate-300">
                    PM2.5: <strong className="text-white">{station.pollutants.pm25}</strong>
                  </div>
                  <div className="text-slate-400">
                    PM10: {station.pollutants.pm10}
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    {station.weather.temperatureC.toFixed(1)}°C • {station.weather.humidityPct}%
                  </div>
                </div>
              </div>

              {/* Bottom Action Hint */}
              <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                <span>{station.lastUpdated}</span>
                <span className="text-emerald-400 font-semibold hover:underline">
                  {isSelected ? (isBs ? 'Aktivna stanica ✓' : 'Active station ✓') : (isBs ? 'Prikaži detalje →' : 'View telemetry →')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
