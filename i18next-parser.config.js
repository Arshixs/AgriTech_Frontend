module.exports = {
  locales: ['en', 'hi'],
  output: 'src/i18n/locales/$LOCALE/translation.json', // Matches your current path
  input: ['app/**/*.{js,jsx}', 'src/**/*.{js,jsx}'],
  keySeparator: false, // Allows natural English sentences as keys
  namespaceSeparator: false,
  defaultValue: (lng, ns, key) => (lng === 'en' ? key : ''), // EN keys default to the text itself
};