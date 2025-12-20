const axios = require('axios');
const fs = require('fs');
const path = require('path');

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby49VOPDwu_-F7Pk-YQNTtK7PRW_zlq4LWk5VW42UZdNAMl6MN3w-4XqNiUVaAl8oZ4uQ/exec';

async function syncTranslations() {
  try {
    // 1. Read local keys extracted from your code
    const localEnPath = path.join(__dirname, '../src/i18n/locales/en/translation.json');
    const localEnData = JSON.parse(fs.readFileSync(localEnPath, 'utf8'));
    const localKeys = Object.keys(localEnData);

    console.log(`Syncing ${localKeys.length} keys with Google Sheets...`);

    // 2. Send local keys to Google Sheet
    // The Apps Script will handle duplicates internally or you can send all
    const response = await axios.post(WEB_APP_URL, {
      keys: localKeys,
      action: 'sync' 
    });

    const sheetData = response.data; // Expecting { en: {...}, hi: {...} }

    // 3. Save the latest translations back to your project
    fs.writeFileSync(
      path.join(__dirname, '../src/i18n/locales/en/translation.json'),
      JSON.stringify(sheetData.en, null, 2)
    );
    fs.writeFileSync(
      path.join(__dirname, '../src/i18n/locales/hi/translation.json'),
      JSON.stringify(sheetData.hi, null, 2)
    );

    console.log('Sync Complete: Local JSON files updated from Sheet.');
  } catch (error) {
    console.error('Sync Error:', error.message);
  }
}

syncTranslations();