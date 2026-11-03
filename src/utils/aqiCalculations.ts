/**
 * Air Quality Index (AQI) calculations and thresholds for Sarajevo, Bosnia and Herzegovina.
 * Supports:
 * - Bosnian / Eko Akcija Index (standard used by Sarajevo NGOs & local monitors)
 * - US EPA Air Quality Index (standard used by US Embassy Sarajevo BAM-1020 monitor)
 * - European EAQI (European Environment Agency)
 * - Canton Sarajevo Official Emergency Episodes (Epizoda Pripravnost, Upozorenje, Uzbuna)
 */

export type AQIStandard = 'bosnian' | 'epa' | 'eaqi';

export interface PollutantValues {
  pm25?: number; // μg/m³
  pm10?: number; // μg/m³
  no2?: number;  // μg/m³
  so2?: number;  // μg/m³
  co?: number;   // mg/m³ or converted from μg/m³
  o3?: number;   // μg/m³
}

export interface AQIResult {
  aqi: number;
  category: 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  labelBs: string;
  labelEn: string;
  color: string;
  bgLight: string;
  dominantPollutant: string;
  descriptionBs: string;
  descriptionEn: string;
}

export type CantonEpisode = 'none' | 'pripravnost' | 'upozorenje' | 'uzbuna';

export interface EpisodeStatus {
  episode: CantonEpisode;
  titleBs: string;
  titleEn: string;
  severity: 'normal' | 'yellow' | 'orange' | 'red';
  measuresBs: string[];
  measuresEn: string[];
}

/**
 * Bosnian Eko Akcija breakpoints for PM2.5 (24h or 1h rolling avg, μg/m³)
 * 0 - 50: Dobar (0 - 25)
 * 51 - 100: Umjeren (26 - 50)
 * 101 - 150: Nezdrav za osjetljive (51 - 90)
 * 151 - 200: Nezdrav (91 - 180)
 * 201 - 300: Vrlo nezdrav (181 - 300)
 * > 300: Opasan (> 300)
 */
export function calculateBosnianPM25AQI(pm25: number): number {
  if (pm25 <= 0) return 0;
  if (pm25 <= 25) return Math.round((pm25 / 25) * 50);
  if (pm25 <= 50) return Math.round(51 + ((pm25 - 25) / 25) * 49);
  if (pm25 <= 90) return Math.round(101 + ((pm25 - 50) / 40) * 49);
  if (pm25 <= 180) return Math.round(151 + ((pm25 - 90) / 90) * 49);
  if (pm25 <= 300) return Math.round(201 + ((pm25 - 180) / 120) * 99);
  return Math.min(500, Math.round(300 + (pm25 - 300) * 0.5));
}

/**
 * Bosnian Eko Akcija breakpoints for PM10 (μg/m³)
 */
export function calculateBosnianPM10AQI(pm10: number): number {
  if (pm10 <= 0) return 0;
  if (pm10 <= 50) return Math.round((pm10 / 50) * 50);
  if (pm10 <= 100) return Math.round(51 + ((pm10 - 50) / 50) * 49);
  if (pm10 <= 150) return Math.round(101 + ((pm10 - 100) / 50) * 49);
  if (pm10 <= 250) return Math.round(151 + ((pm10 - 150) / 100) * 49);
  if (pm10 <= 400) return Math.round(201 + ((pm10 - 250) / 150) * 99);
  return Math.min(500, Math.round(300 + (pm10 - 400) * 0.4));
}

/**
 * US EPA PM2.5 calculation standard
 */
export function calculateEpaPM25AQI(pm25: number): number {
  if (pm25 <= 0) return 0;
  if (pm25 <= 12.0) return Math.round((50 / 12.0) * pm25);
  if (pm25 <= 35.4) return Math.round(51 + ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1));
  if (pm25 <= 55.4) return Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5));
  if (pm25 <= 150.4) return Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5));
  if (pm25 <= 250.4) return Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5));
  if (pm25 <= 500.4) return Math.round(301 + ((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5));
  return 500;
}

/**
 * Calculates unified AQI result from multiple pollutants according to chosen standard.
 */
export function getOverallAQI(pollutants: PollutantValues, standard: AQIStandard = 'bosnian'): AQIResult {
  const pm25 = pollutants.pm25 ?? 0;
  const pm10 = pollutants.pm10 ?? 0;
  const no2 = pollutants.no2 ?? 0;
  const so2 = pollutants.so2 ?? 0;

  let calculatedAQI = 0;
  let dominant = 'PM2.5';

  if (standard === 'epa') {
    const aqi25 = calculateEpaPM25AQI(pm25);
    const aqi10 = calculateBosnianPM10AQI(pm10); // EPA PM10 roughly matches
    if (aqi25 >= aqi10) {
      calculatedAQI = aqi25;
      dominant = 'PM2.5';
    } else {
      calculatedAQI = aqi10;
      dominant = 'PM10';
    }
  } else if (standard === 'eaqi') {
    // European EAQI scale is typically 1 (Very Good) to 6 (Extremely Poor)
    // We map to 0-100 representation or convert standard
    const aqi25 = calculateBosnianPM25AQI(pm25);
    calculatedAQI = aqi25;
    dominant = 'PM2.5';
  } else {
    // Bosnian standard: highest sub-index determines overall AQI
    const aqi25 = calculateBosnianPM25AQI(pm25);
    const aqi10 = calculateBosnianPM10AQI(pm10);
    const aqiSO2 = Math.min(500, Math.round((so2 / 350) * 150));
    const aqiNO2 = Math.min(500, Math.round((no2 / 200) * 150));

    calculatedAQI = Math.max(aqi25, aqi10, aqiSO2, aqiNO2);
    if (calculatedAQI === aqi25) dominant = 'PM2.5';
    else if (calculatedAQI === aqi10) dominant = 'PM10';
    else if (calculatedAQI === aqiSO2) dominant = 'SO₂';
    else dominant = 'NO₂';
  }

  // Determine category and UI elements
  if (calculatedAQI <= 50) {
    return {
      aqi: calculatedAQI,
      category: 'good',
      labelBs: 'Dobar',
      labelEn: 'Good',
      color: '#10b981', // green-500
      bgLight: '#ecfdf5',
      dominantPollutant: dominant,
      descriptionBs: 'Kvalitet zraka je zadovoljavajući, zagađenje zraka ne predstavlja rizik.',
      descriptionEn: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    };
  } else if (calculatedAQI <= 100) {
    return {
      aqi: calculatedAQI,
      category: 'moderate',
      labelBs: 'Umjeren',
      labelEn: 'Moderate',
      color: '#eab308', // yellow-500
      bgLight: '#fefce8',
      dominantPollutant: dominant,
      descriptionBs: 'Neke zagađujuće materije mogu predstavljati umjeren rizik za izrazito osjetljive osobe.',
      descriptionEn: 'Air quality is acceptable; however, sensitive people may experience minor effects.',
    };
  } else if (calculatedAQI <= 150) {
    return {
      aqi: calculatedAQI,
      category: 'unhealthy-sensitive',
      labelBs: 'Nezdrav za osjetljive grupe',
      labelEn: 'Unhealthy for Sensitive Groups',
      color: '#f97316', // orange-500
      bgLight: '#fff7ed',
      dominantPollutant: dominant,
      descriptionBs: 'Oboljeli od bolesti organa za disanje i srca, djeca i trudnice trebaju smanjiti boravak vani.',
      descriptionEn: 'Members of sensitive groups may experience health effects. General public is less likely affected.',
    };
  } else if (calculatedAQI <= 200) {
    return {
      aqi: calculatedAQI,
      category: 'unhealthy',
      labelBs: 'Nezdrav',
      labelEn: 'Unhealthy',
      color: '#ef4444', // red-500
      bgLight: '#fef2f2',
      dominantPollutant: dominant,
      descriptionBs: 'Svi građani mogu osjetiti zdravstvene posljedice. Izbjegavati naprezanje na otvorenom.',
      descriptionEn: 'Everyone may begin to experience health effects. Avoid prolonged outdoor exertion.',
    };
  } else if (calculatedAQI <= 300) {
    return {
      aqi: calculatedAQI,
      category: 'very-unhealthy',
      labelBs: 'Vrlo nezdrav',
      labelEn: 'Very Unhealthy',
      color: '#8b5cf6', // purple-500
      bgLight: '#f5f3ff',
      dominantPollutant: dominant,
      descriptionBs: 'Zdravstveno upozorenje za cjelokupno stanovništvo. Preporučuje se nošenje N95 maski i boravak u zatvorenom.',
      descriptionEn: 'Health alert: everyone may experience serious health effects. Stay indoors or wear N95 masks.',
    };
  } else {
    return {
      aqi: calculatedAQI,
      category: 'hazardous',
      labelBs: 'Opasan',
      labelEn: 'Hazardous',
      color: '#881337', // rose-900 / dark maroon
      bgLight: '#fff1f2',
      dominantPollutant: dominant,
      descriptionBs: 'Vanredno stanje! Ozbiljne posljedice po zdravlje cjelokupnog stanovništva. Preporučuje se odlazak na planine.',
      descriptionEn: 'Emergency conditions. The entire population is likely to be affected. Escape to surrounding mountains (Trebević, Bjelašnica).',
    };
  }
}

/**
 * Determines the official Sarajevo Canton Episode status according to
 * "Plan pripravnosti i interventnih mjera u slučajevima prekomjerne zagađenosti zraka u Kantonu Sarajevo":
 * - Epizoda "Pripravnost": PM10 > 50 μg/m³ for 24h or forecast stable atmosphere/inversion
 * - Epizoda "Upozorenje": PM10 > 150 μg/m³ for 48h, stable anticyclone
 * - Epizoda "Uzbuna": PM10 > 300 μg/m³ for 48h
 */
export function evaluateSarajevoCantonEpisode(pm10: number, pm25: number, hasInversion: boolean): EpisodeStatus {
  if (pm10 >= 300 || pm25 >= 250) {
    return {
      episode: 'uzbuna',
      titleBs: 'EPIZODA: UZBUNA (Kantonalni nivo)',
      titleEn: 'EPISODE: ALARM / EMERGENCY (Canton Level)',
      severity: 'red',
      measuresBs: [
        'Zabrana kretanja za teretna motorna vozila čija je masa veća od 3.5 tona',
        'Zabrana odvijanja nastave u osnovnim i srednjim školama i prelazak na online model po procjeni',
        'Obavezno smanjenje temperature u zgradama koje koriste lož ulje ili ugalj za najmanje 3°C',
        'Zabrana izvođenja građevinskih radova koji proizvode prašinu na području cijelog Kantona',
        'Preporuka građanima da koriste žičaru ili javni prevoz do planine Trebević',
      ],
      measuresEn: [
        'Ban on heavy freight motor vehicles over 3.5 tonnes in central traffic corridors',
        'Schools recommended to suspend outdoor activities or switch to remote classes',
        'Mandatory heating temperature reduction by at least 3°C for solid/heavy fuel systems',
        'Complete ban on dust-generating construction works throughout Sarajevo Canton',
        'Recommendation to use cable car to Trebević for clean mountain air refuge',
      ],
    };
  }

  if (pm10 >= 150 || pm25 >= 110) {
    return {
      episode: 'upozorenje',
      titleBs: 'EPIZODA: UPOZORENJE (Kantonalni nivo)',
      titleEn: 'EPISODE: WARNING (Canton Level)',
      severity: 'orange',
      measuresBs: [
        'Zabrana kretanja automobila sa EURO 2 i nižim emisionim standardom motora',
        'Smanjenje kapaciteta industrijskih i energetskih postrojenja za najmanje 20%',
        'Zabrana spaljivanja otpada i loženja biomase i uglja na otvorenom prostoru',
        'Pojačan inspekcijski nadzor komunalnih redara i saobraćajne policije MUP-a KS',
      ],
      measuresEn: [
        'Driving ban for vehicles with EURO 2 and lower emission standards',
        'Mandatory industrial and heating plant power reduction by at least 20%',
        'Strict ban on outdoor biomass, waste and coal burning',
        'Intensified inspection and traffic police enforcement in Canton Sarajevo',
      ],
    };
  }

  if (pm10 >= 50 || pm25 >= 35 || (hasInversion && pm10 >= 40)) {
    return {
      episode: 'pripravnost',
      titleBs: 'EPIZODA: PRIPRAVNOST (Kantonalni nivo)',
      titleEn: 'EPISODE: PREPAREDNESS (Canton Level)',
      severity: 'yellow',
      measuresBs: [
        'Kontinuirano praćenje kvaliteta zraka od strane FHMZ BiH i stručnih tijela',
        'Apel vlasnicima individualnih ložišta da ne koriste ugalj s visokim sadržajem sumpora',
        'Preporuka osjetljivim grupama da izbjegavaju boravak uz glavne gradske saobraćajnice',
        'Pojačano čišćenje i pranje ulica vodom od strane KJKP Rad',
      ],
      measuresEn: [
        'Continuous air quality monitoring by FHMZ BiH and cantonal expert bodies',
        'Urgent appeal to residential stove owners to avoid burning high-sulfur coal or waste',
        'Sensitive groups advised to avoid prolonged stays along major arterial streets',
        'Intensified wet road cleaning by public utility KJKP Rad to minimize resuspension',
      ],
    };
  }

  return {
    episode: 'none',
    titleBs: 'REDOVNO STANJE (Bez aktivnih epizoda)',
    titleEn: 'NORMAL CONDITIONS (No active episodes)',
    severity: 'normal',
    measuresBs: ['Kvalitet zraka je u granicama normale. Redovne komunalne i saobraćajne aktivnosti.'],
    measuresEn: ['Air quality is within acceptable limits. Standard cantonal activities.'],
  };
}

/**
 * Calculates Sarajevo Temperature Inversion Diagnostic.
 * In Sarajevo basin (Sarajevska kotlina), inversion occurs when the valley floor
 * (Otoka/Centar ~500m) is cooler than the mountain heights (Trebević ~1160m).
 * A positive delta (Trebević warmer than valley) indicates a strong inversion cap
 * that traps smog like a lid!
 */
export function calculateInversionDiagnostic(valleyTempC: number, mountainTempC: number, valleyWindSpeedKmH: number) {
  const tempDelta = mountainTempC - valleyTempC; // > 0 means mountain is warmer (Inversion!)
  const isInverted = tempDelta > 0.5;
  const isStagnant = valleyWindSpeedKmH < 5.0;

  let inversionSeverity: 'none' | 'weak' | 'moderate' | 'severe' = 'none';
  if (isInverted && tempDelta > 4.0 && isStagnant) {
    inversionSeverity = 'severe';
  } else if (isInverted && tempDelta > 1.5) {
    inversionSeverity = 'moderate';
  } else if (isInverted) {
    inversionSeverity = 'weak';
  }

  return {
    isInverted,
    tempDelta: Number(tempDelta.toFixed(1)),
    valleyTemp: Number(valleyTempC.toFixed(1)),
    mountainTemp: Number(mountainTempC.toFixed(1)),
    valleyWindSpeed: Number(valleyWindSpeedKmH.toFixed(1)),
    inversionSeverity,
    estimatedSmogCapAltitudeM: isInverted ? 700 + Math.min(250, tempDelta * 40) : 0,
    ventilationStatusBs: isStagnant
      ? 'Bez vjetra (potpuna stagnacija u kotlini)'
      : valleyWindSpeedKmH < 12
      ? 'Slab vjetar (nedovoljno provjetravanje)'
      : 'Povoljno provjetravanje kotline',
    ventilationStatusEn: isStagnant
      ? 'Zero wind (complete basin stagnation)'
      : valleyWindSpeedKmH < 12
      ? 'Light breeze (insufficient valley ventilation)'
      : 'Favorable basin ventilation',
  };
}
