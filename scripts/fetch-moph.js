/**
 * Fetches MoPH ArcGIS data and saves as static JSON files.
 * Run: node scripts/fetch-moph.js
 */
import { writeFileSync, mkdirSync } from 'fs';

const ATTACKS_URL =
  'https://maps.moph.gov.lb/server/rest/services/Hosted/Attacks_on_hospitals/FeatureServer/0/query?' +
  'where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=1000';

const ATTACKS_2024_URL =
  'https://maps.moph.gov.lb/server/rest/services/Hosted/Hospitals_Attacks2024/FeatureServer/0/query?' +
  'where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=1000';

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

  console.log('Done.');
}

main().catch(console.error);
