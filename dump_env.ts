
console.log('Environment Variables:');
for (const key in process.env) {
  if (key.startsWith('VITE_') || key.includes('FIREBASE') || key.includes('GOOGLE') || key.includes('APP')) {
    console.log(`${key}: ${process.env[key] ? 'DEFINED' : 'UNDEFINED'}`);
    if (key === 'FIREBASE_CONFIG') {
       console.log('FIREBASE_CONFIG value:', process.env[key]);
    }
  }
}
