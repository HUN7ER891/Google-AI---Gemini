import React, { useState } from 'react';
import { X, ShieldAlert, HeartPulse, Baby, Activity, Home, Wind, Mountain, CheckCircle2 } from 'lucide-react';
import { AQIResult } from '../utils/aqiCalculations.ts';

interface HealthAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAQIResult: AQIResult;
  language: 'bs' | 'en';
}

export const HealthAdvisoryModal: React.FC<HealthAdvisoryModalProps> = ({
  isOpen,
  onClose,
  currentAQIResult,
  language,
}) => {
  const isBs = language === 'bs';
  const [activeTab, setActiveTab] = useState<'general' | 'sensitive' | 'sports' | 'home'>('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isBs ? 'Zdravstvene preporuke i zaštita od smoga' : 'Health Advisories & Smog Protection'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBs
                  ? `Prikaz prototipa: AQI ${currentAQIResult.aqi} (${currentAQIResult.labelBs}) — nije službeno mjerenje`
                  : `Prototype display: AQI ${currentAQIResult.aqi} (${currentAQIResult.labelEn}) — not an official observation`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Zatvori modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isBs ? 'Opća populacija' : 'General Public'}</span>
          </button>

          <button
            onClick={() => setActiveTab('sensitive')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sensitive'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>{isBs ? 'Djeca i bolesnici' : 'Sensitive & Asthma'}</span>
          </button>

          <button
            onClick={() => setActiveTab('sports')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sports'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{isBs ? 'Sport i trčanje' : 'Sports & Running'}</span>
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'home'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>{isBs ? 'Dom, maske i provjetravanje' : 'Home, Masks & Airing'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          <p className="text-slate-300 border border-slate-700 rounded-lg p-3">
            {isBs ? 'Opće informacije za smanjenje izloženosti. Modelirani i probni podaci ove aplikacije nisu osnova za lične medicinske odluke. Pratite lokalne službene podatke i savjet zdravstvenog stručnjaka.' : 'General exposure information. This app’s modelled and sample data are not a basis for personal medical decisions. Follow local official observations and advice from a health professional.'}
            {' '}<a className="underline text-sky-300" href="https://www.who.int/news-room/questions-and-answers/item/air-pollution-personal-interventions-and-risk-communication" target="_blank" rel="noreferrer">WHO</a>
            {' · '}<a className="underline text-sky-300" href="https://www.who.int/europe/publications/m/item/personal-level-actions-to-reduce-air-pollution-exposure" target="_blank" rel="noreferrer">{isBs ? 'WHO vodiči' : 'WHO guidance'}</a>
          </p>
          {activeTab === 'general' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isBs ? 'Savjeti za sve građane Sarajeva:' : 'Advisories for all Sarajevo residents:'}</span>
                </h4>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>
                      {isBs
                        ? 'Vrijeme i mjesto aktivnosti prilagodite aktuelnim lokalnim mjerenjima i upozorenjima; periodi povišenog zagađenja nisu isti svakog dana.'
                        : 'Adjust the timing and location of activities using current local observations and advisories; pollution peaks vary by day.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>
                      {isBs
                        ? 'Respirator može smanjiti izloženost česticama kada je pravilno odabran i prilagođen licu; nije zaštita od svakog zagađivača.'
                        : 'A correctly selected and fitted respirator can reduce particle exposure; it does not protect against every pollutant.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>
                      {isBs
                        ? 'Kada je moguće, birajte putanje udaljenije od gustog saobraćaja i drugih izvora emisija.'
                        : 'Where practical, choose routes away from heavy traffic and other emission sources.'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Mountain Escape Card */}
              <div className="bg-purple-950/40 p-4 rounded-xl border border-purple-800/50 flex items-start gap-3">
                <Mountain className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-purple-200 text-sm">
                    {isBs ? 'Provjera uslova prije odlaska' : 'Check conditions before travelling'}
                  </h4>
                  <p className="text-slate-300 mt-1">
                    {isBs
                      ? 'Veća nadmorska visina ne garantuje čist zrak. Ovaj prototip ne potvrđuje sigurnost lokacije ili putovanja; provjerite lokalna mjerenja i vrijeme.'
                      : 'Higher elevation does not guarantee clean air. This prototype does not establish that a location or journey is safe; check local observations and weather.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sensitive' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-white text-sm text-amber-300">
                  {isBs ? 'Hronični bolesnici (Astma, HOBP, kardiovaskularne bolesti):' : 'Chronic Patients (Asthma, COPD, Cardiovascular):'}
                </h4>
                <p className="text-slate-300">
                  {isBs
                    ? 'Lične mjere zaštite prilagodite svom zdravstvenom stanju uz savjet zdravstvenog stručnjaka.'
                    : 'Discuss exposure precautions appropriate to your health with a health professional.'}
                </p>
                <ul className="space-y-1.5 text-slate-300 pl-2">
                  <li>• {isBs ? 'Slijedite svoj postojeći plan liječenja; aplikacija ga ne mijenja.' : 'Follow your existing care plan; this app does not change it.'}</li>
                  <li>• {isBs ? 'Za odluke koristite službena upozorenja, ne procijenjeni indeks ovog prototipa.' : 'Use official advisories for decisions, not this prototype’s estimated index.'}</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm text-cyan-300">
                  {isBs ? 'Trudnice, novorođenčad i mala djeca:' : 'Pregnant Women, Infants & Young Children:'}
                </h4>
                <p className="text-slate-300">
                  {isBs
                    ? 'Pratite lokalne zdravstvene preporuke za osjetljive grupe i zatražite individualni savjet ako je potreban.'
                    : 'Follow local health guidance for sensitive groups and seek individual advice when needed.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sports' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>{isBs ? 'Vodič za trkače i rekreativce u Sarajevu:' : 'Guide for Runners & Athletes in Sarajevo:'}</span>
                </h4>
                <p className="text-slate-300">
                  {isBs
                    ? 'Vrijeme, mjesto i intenzitet fizičke aktivnosti prilagodite stvarnim lokalnim uslovima i vlastitom zdravlju.'
                    : 'Adjust the timing, location and intensity of exercise to actual local conditions and your health.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40">
                    <span className="font-bold text-rose-300 block mb-1">
                      {isBs ? 'Provjerite prije aktivnosti:' : 'Check before activity:'}
                    </span>
                    <span className="text-slate-300 text-[11px]">
                      {isBs
                        ? 'Službena mjerenja, upozorenja i uslove na planiranoj ruti.'
                        : 'Official observations, advisories and conditions along your planned route.'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                    <span className="font-bold text-emerald-300 block mb-1">
                      {isBs ? 'Razmotrite alternative:' : 'Consider alternatives:'}
                    </span>
                    <span className="text-slate-300 text-[11px]">
                      {isBs
                        ? 'Drugu lokaciju, termin ili intenzitet u skladu sa provjerenim uslovima.'
                        : 'A different location, time or intensity based on verified conditions.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'home' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">
                  {isBs ? 'Unutrašnji i vanjski zrak:' : 'Indoor and outdoor air:'}
                </h4>
                <p className="text-slate-300">
                  {isBs
                    ? 'Uslovi unutra i vani se razlikuju. Ova aplikacija ne mjeri kvalitet zraka u vašem domu i ne određuje siguran termin provjetravanja.'
                    : 'Indoor and outdoor conditions differ. This app does not measure your home’s air quality or determine a safe ventilation time.'}
                </p>
                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-cyan-200">
                  <span className="font-bold">{isBs ? 'Pratite lokalne smjernice:' : 'Follow local guidance:'}</span>{' '}
                  {isBs
                    ? 'Odluku prilagodite aktuelnim vanjskim uslovima i izvorima zagađenja u prostoru.'
                    : 'Adapt decisions to current outdoor conditions and pollution sources indoors.'}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">
                  {isBs ? 'Maske i pročišćivači zraka:' : 'Respirator Masks & Air Purifiers:'}
                </h4>
                <ul className="space-y-1.5 text-slate-300 pl-2">
                  <li>• <strong>{isBs ? 'Respiratori:' : 'Respirators:'}</strong> {isBs ? 'Efekat zavisi od odabira, prianjanja i pravilne upotrebe.' : 'Performance depends on selection, fit and correct use.'}</li>
                  <li>• <strong>{isBs ? 'Pročišćivači zraka:' : 'Air cleaners:'}</strong> {isBs ? 'Mogu smanjiti čestice; rezultat zavisi od uređaja, prostora i održavanja.' : 'May reduce particles; results depend on the device, room and maintenance.'}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
