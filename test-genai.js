// Test file to check what's available in @google/genai
console.log('Testing @google/genai imports...');

try {
  const genaiModule = require('@google/genai');
  console.log('Available exports:', Object.keys(genaiModule));
} catch (error) {
  console.error('Error importing @google/genai:', error.message);
}

try {
  const genaiModule = import('@google/genai');
  genaiModule.then(module => {
    console.log('ES module exports:', Object.keys(module));
  }).catch(error => {
    console.error('Error importing @google/genai as ES module:', error.message);
  });
} catch (error) {
  console.error('Error with ES import:', error.message);
}