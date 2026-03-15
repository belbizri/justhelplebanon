/**
 * Fetches MoPH ArcGIS data and saves as static JSON files.
 * Run: node scripts/fetch-moph.js
 */
import { writeFileSync, mkdirSync } from 'fs';

const ATTACKS_URL =
  'https://services3.arcgis.com/lKUTBE0q4VS3JGH0/arcgis/rest/services/Hospitals_Attacks2024/FeatureServer/0/query?' +
  'where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=1000';

const FACILITIES_URL =
  'https://services3.arcgis.com/lKUTBE0q4VS3JGH0/arcgis/rest/services/Health_Facility_Locator/FeatureServer/0/query?' +
  'where=1%3D1&outFields=Name,Name_ar,Type,Governorate,District,Address&outSR=4326&f=json&resultRecordCount=200';

async function main() {
  mkdirSync('public/data', { recursive: true });

  console.log('Fetching hospital attacks data...');
  const attacksRes = await fetch(ATTACKS_URL);
  const attacksData = await attacksRes.json();
  writeFileSync('public/data/moph-attacks.json', JSON.stringify(attacksData));
  console.log(`  → ${attacksData.features?.length || 0} attack incidents saved`);

  console.log('Fetching health facilities data...');
  const facilitiesRes = await fetch(FACILITIES_URL);
  const facilitiesData = await facilitiesRes.json();
  writeFileSync('public/data/moph-facilities.json', JSON.stringify(facilitiesData));
  console.log(`  → ${facilitiesData.features?.length || 0} health facilities saved`);

  console.log('Done.');
}

main().catch(console.error);
