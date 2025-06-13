// Simple test script to demonstrate the logging system
// This creates some test logs to show in the LogViewer

console.log('🔧 Testing Gamesta Logging System...');

// Simulate visiting the application in the browser
fetch('http://localhost:5173')
  .then(response => {
    console.log('✅ Application is running at http://localhost:5173');
    console.log('📊 Visit the admin dashboard at: http://localhost:5173/admin');
    console.log('🔐 Admin password: gamesta_admin_2024');
    console.log('');
    console.log('📋 To test the logging system:');
    console.log('   1. Navigate to http://localhost:5173/admin');
    console.log('   2. Enter the admin password');
    console.log('   3. Click on the "System Logs" tab');
    console.log('   4. Try triggering some actions to see logs appear');
    console.log('');
    console.log('🎯 Available logging features:');
    console.log('   • Real-time log monitoring');
    console.log('   • Filter by log level (DEBUG, INFO, WARN, ERROR, CRITICAL)');
    console.log('   • Filter by category (APP, DATABASE, AUTH, UI, API, ADMIN)');
    console.log('   • Search through log messages');
    console.log('   • Export logs as JSON');
    console.log('   • Auto-refresh every 2 seconds');
    console.log('   • Session-based tracking');
    console.log('   • Local storage persistence');
  })
  .catch(error => {
    console.error('❌ Application not running. Please start the dev server first:');
    console.error('   npm run dev');
  });
