// Frontend localStorage clearing script
// Run this in the browser console to clear all frontend data

console.log('🧹 Clearing frontend data...');

// Clear localStorage
const localStorageKeys = Object.keys(localStorage);
console.log(`📱 Clearing ${localStorageKeys.length} localStorage items:`, localStorageKeys);
localStorage.clear();
console.log('✅ localStorage cleared');

// Clear sessionStorage
const sessionStorageKeys = Object.keys(sessionStorage);
console.log(`🗂️  Clearing ${sessionStorageKeys.length} sessionStorage items:`, sessionStorageKeys);
sessionStorage.clear();
console.log('✅ sessionStorage cleared');

// Clear IndexedDB (if any)
if ('indexedDB' in window) {
  console.log('🗄️  Checking IndexedDB...');
  indexedDB.databases().then(databases => {
    if (databases.length > 0) {
      console.log(`🗄️  Found ${databases.length} IndexedDB databases:`, databases.map(db => db.name));
      databases.forEach(db => {
        if (db.name) {
          const deleteReq = indexedDB.deleteDatabase(db.name);
          deleteReq.onsuccess = () => console.log(`✅ Deleted IndexedDB: ${db.name}`);
          deleteReq.onerror = () => console.log(`❌ Failed to delete IndexedDB: ${db.name}`);
        }
      });
    } else {
      console.log('🗄️  No IndexedDB databases found');
    }
  });
}

// Clear cookies (domain-specific)
if (document.cookie) {
  console.log('🍪 Clearing cookies...');
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });
  console.log('✅ Cookies cleared');
} else {
  console.log('🍪 No cookies found');
}

// Clear any caches (if supported)
if ('caches' in window) {
  console.log('💾 Clearing caches...');
  caches.keys().then(cacheNames => {
    if (cacheNames.length > 0) {
      console.log(`💾 Found ${cacheNames.length} caches:`, cacheNames);
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log(`🗑️  Deleting cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    } else {
      console.log('💾 No caches found');
    }
  }).then(() => {
    console.log('✅ All caches cleared');
  });
}

console.log('🎊 Frontend data clearing complete!');
console.log('🔄 Reload the page to start fresh');
console.log('💡 You can also use: location.reload() to refresh');

// Optionally reload the page automatically
// Uncomment the next line if you want auto-reload
// setTimeout(() => location.reload(), 2000);