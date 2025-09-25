const ai = require('ai');

console.log('Available functions:', Object.keys(ai).filter(key => key.includes('Image') || key.includes('google') || key.includes('generate')));

// Check if experimental_generateImage exists
if (ai.experimental_generateImage) {
    console.log('experimental_generateImage is available');
} else {
    console.log('experimental_generateImage is NOT available');
}

// Check if there are any Google-related imports
const googleRelated = Object.keys(ai).filter(key => key.toLowerCase().includes('google'));
console.log('Google-related exports:', googleRelated);