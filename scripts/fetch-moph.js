/**
 * Fetches MoPH ArcGIS data + Insecurity Insight HDX data and saves as static JSON.
 * Run: node scripts/fetch-moph.js
 */
import { writeFileSync, mkdirSync } from 'fs';
import XLSX from 'xlsx';

const ATTACKS_URL =
  'https://maps.moph.gov.lb/server/rest/services/Hosted/Attacks_on_hospitals/FeatureServer/0/query?' +
  'where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=1000';

const ATTACKS_2024_URL =
  'https://maps.moph.gov.lb/server/rest/services/Hosted/Hospitals_Attacks2024/FeatureServer/0/query?' +
  'where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=1000';

const HDX_HEALTH_ATTACKS_URL =
  'https://data.humdata.org/dataset/52503c9f-f575-43c0-87d2-83b9d3197d0a/resource/8cd0ce1f-2b87-4bc3-aadc-9637c557b6b5/download/2016-2026-lbn-attacks-on-health-care-incident-data.xlsx';

async function main() {
  mkdirSync('public/data', { recursive: true });

  console.log('Fetching hospital attacks data (legacy)...');
  const attacksRes = await fetch(ATTACKS_URL);
  const attacksData = await attacksRes.json();
  writeFileSync('public/data/moph-attacks.json', JSON.stringify(attacksData));
  console.log(`  → ${attacksData.features?.length || 0} attack incidents saved`);

  console.log('Fetching hospital attacks 2024 data...');
  const attacks2024Res = await fetch(ATTACKS_2024_URL);
  const attacks2024Data = await attacks2024Res.json();
  writeFileSync('public/data/moph-attacks-2024.json', JSON.stringify(attacks2024Data));
  console.log(`  → ${attacks2024Data.features?.length || 0} attack incidents (2024) saved`);

  console.log('Fetching Insecurity Insight healthcare attacks (2016-2026)...');
  const hdxRes = await fetch(HDX_HEALTH_ATTACKS_URL);
  const buf = await hdxRes.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'buffer', cellDates: true });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  const records = rows.map(r => ({
    date: r.Date instanceof Date ? r.Date.toISOString().slice(0, 10) : '',
    admin1: r['Admin 1'] || '',
    perpetrator: r['Reported Perpetrator Name'] || r['Reported Perpetrator'] || '',
    weapon: r['Weapon Carried/Used'] || '',
    location: r['Location of Incident'] || '',
    facilitiesDestroyed: r['Number of Attacks on Health Facilities Reporting Destruction'] || 0,
    facilitiesDamaged: r['Number of Attacks on Health Facilities Reporting Damaged'] || 0,
    healthWorkersKilled: r['Health Workers Killed'] || 0,
    healthWorkersInjured: r['Health Workers Injured'] || 0,
    healthWorkersKidnapped: r['Health Workers Kidnapped'] || 0,
    healthWorkersArrested: r['Health Workers Arrested'] || 0,
    transportDestroyed: r['Health Transportation Destroyed'] || 0,
    transportDamaged: r['Health Transportation Damaged'] || 0,
    ems: r['Attacks on Emergency Medical Services'] === 'AttacksOnEmergencyMedicalServices',
    eventId: r['SiND Event ID'] || '',
  }));
  writeFileSync('public/data/hdx-health-attacks.json', JSON.stringify(records));
  console.log(`  → ${records.length} Insecurity Insight records saved (${rows.filter(r => r.Date instanceof Date && r.Date.getFullYear() >= 2025).length} from 2025+)`);

  console.log('Done.');
}

main().catch(console.error);
