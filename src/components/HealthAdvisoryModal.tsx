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
                  ? `Trenutni indeks u Sarajevu: AQI ${currentAQIResult.aqi} (${currentAQIResult.labelBs})`
                  : `Current Sarajevo Index: AQI ${currentAQIResult.aqi} (${currentAQIResult.labelEn})`}
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
                        ? 'Smanjite kretanje na otvorenom u jutarnjim (07:00-10:00) i večernjim satima (18:00-23:00) kada je koncentracija PM2.5 najviša.'
                        : 'Minimize outdoor presence during morning (07:00-10:00) and evening hours (18:00-23:00) when PM2.5 concentrations peak.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>
                      {isBs
                        ? 'Ako morate boraviti vani, nosite zaštitnu respiratornu masku sa oznakom FFP2 ili N95 (obične hirurške i platnene maske ne zaustavljaju PM2.5).'
                        : 'If you must go outside, wear an FFP2 or N95 respirator mask (surgical and cloth masks do not filter PM2.5 particulate matter).'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>
                      {isBs
                        ? 'Izbjegavajte kretanje u neposrednoj blizini glavnih saobraćajnica (Zmaja od Bosne, Bulevar Meše Selimovića) gdje su koncentracije NO2 i čađi ekstremne.'
                        : 'Avoid walking right alongside major thoroughfares (Zmaja od Bosne, Bulevar Meše Selimovića) where traffic NO2 and black carbon concentrate.'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Mountain Escape Card */}
              <div className="bg-purple-950/40 p-4 rounded-xl border border-purple-800/50 flex items-start gap-3">
                <Mountain className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-purple-200 text-sm">
                    {isBs ? 'Planinski bijeg (Trebević, Igman, Bjelašnica)' : 'Mountain Refuge (Trebević, Igman, Bjelašnica)'}
                  </h4>
                  <p className="text-slate-300 mt-1">
                    {isBs
                      ? 'Zahvaljujući temperaturnoj inverziji, planine iznad 800-1000m imaju čist vazduh i sunčano vrijeme. Sarajevska žičara od Bistrika do Trebevića vozi samo 7 minuta direktno iznad smoga!'
                      : 'Due to temperature inversion, mountains above 800-1,000m enjoy pure air and sunshine. The Sarajevo Cable Car reaches Trebević in just 7 minutes right above the smog!'}
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
                    ? 'Čestice PM2.5 prodiru direktno u plućne alveole i krvotok, izazivajući upalne reakcije i suženje disajnih puteva.'
                    : 'PM2.5 particles penetrate deep into alveoli and the bloodstream, triggering inflammation and airway constriction.'}
                </p>
                <ul className="space-y-1.5 text-slate-300 pl-2">
                  <li>• {isBs ? 'Obavezno nosite propisanu inhalacionu terapiju (pumpice) sa sobom.' : 'Keep prescribed bronchodilator inhalers readily accessible at all times.'}</li>
                  <li>• {isBs ? 'Ne izlazite vani bez FFP2 maske kada je AQI iznad 100.' : 'Do not venture outdoors without an FFP2 mask when AQI exceeds 100.'}</li>
                  <li>• {isBs ? 'U slučaju otežanog disanja ili stezanja u prsima, odmah kontaktirajte ljekara (Hitna pomoć: 124).' : 'Seek immediate medical assistance if chest tightness or acute dyspnea occurs (Emergency: 124).'}</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm text-cyan-300">
                  {isBs ? 'Trudnice, novorođenčad i mala djeca:' : 'Pregnant Women, Infants & Young Children:'}
                </h4>
                <p className="text-slate-300">
                  {isBs
                    ? 'Dječija pluća su u razvoju i udišu više zraka po kilogramu tjelesne mase. Za vrijeme epizoda uzbune preporučuje se boravak u prostorijama sa pročišćivačem zraka ili privremeni boravak na planini.'
                    : 'Developing lungs breathe significantly more air per kilogram of body weight. During high smog episodes, keep children indoors with air purifiers or visit mountain areas.'}
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
                    ? 'Tokom intenzivnog trčanja ili vožnje bicikla disanje prelazi na usta, čime se zaobilaze nosni filteri, a volumen udahnutog zraka se povećava za 500-1000%!'
                    : 'During vigorous cardiovascular exercise, mouth breathing bypasses nasal filtration, increasing particulate inhalation by up to 10x!'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40">
                    <span className="font-bold text-rose-300 block mb-1">
                      {isBs ? '❌ Izbjegavati u gradu (AQI > 100):' : '❌ Avoid in Valley (AQI > 100):'}
                    </span>
                    <span className="text-slate-300 text-[11px]">
                      {isBs
                        ? 'Trčanje na Vilsonovom šetalištu, Bentbaši, Darivi ili Alipašinom polju rano ujutro ili navečer.'
                        : 'Running along Vilsonovo promenade, Bentbasa, Dariva, or city parks during morning/evening smog.'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                    <span className="font-bold text-emerald-300 block mb-1">
                      {isBs ? '✅ Preporučene alternative:' : '✅ Recommended Alternatives:'}
                    </span>
                    <span className="text-slate-300 text-[11px]">
                      {isBs
                        ? 'Trčanje na Trebeviću (staza Bob staza, Brus), Igmanu (Veliko polje) ili indoor treninzi sa HEPA filterom.'
                        : 'Running trails on Trebević (Brus, Bobsleigh track), Igman, or indoor treadmill with HEPA air filtration.'}
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
                  {isBs ? 'Pravilo provjetravanja u Sarajevskoj kotlini:' : 'Valley Airing Window Rules:'}
                </h4>
                <p className="text-slate-300">
                  {isBs
                    ? 'Tokom zimskih inverzija, NIKADA ne otvarajte prozore na kipu duže vrijeme, a posebno ne rano ujutro (06:00-09:00) niti navečer (18:00-22:00) kada komšijska ložišta najjače dime.'
                    : 'During winter inversions, NEVER leave windows tilted for hours. Avoid opening windows between 06:00-09:00 and 18:00-22:00 when home stoves emit maximum smoke.'}
                </p>
                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-cyan-200">
                  <span className="font-bold">{isBs ? 'Zlatni prozor za provjetravanje:' : 'Golden Airing Window:'}</span>{' '}
                  {isBs
                    ? 'Prozračite stan unakrsnim propuhom 3-5 minuta između 13:00 i 15:00 sati kada sunce privremeno oslabi temperaturnu inverziju.'
                    : 'Airtight quick purge for 3-5 minutes between 13:00 and 15:00 when solar radiation temporarily thins the inversion lid.'}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">
                  {isBs ? 'Maske i pročišćivači zraka:' : 'Respirator Masks & Air Purifiers:'}
                </h4>
                <ul className="space-y-1.5 text-slate-300 pl-2">
                  <li>• <strong>FFP2 / N95 / KN95:</strong> {isBs ? 'Jedine maske koje efikasno filtriraju čestice manje od 2.5 mikrometra.' : 'The only respirators that filter ultrafine 2.5 micron particles.'}</li>
                  <li>• <strong>HEPA H13 Filteri:</strong> {isBs ? 'Uklanjaju 99.97% čestica iz zatvorenog prostora. Koristite ih u spavaćim sobama.' : 'Removes 99.97% of indoor particulates. Recommended for bedrooms.'}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
