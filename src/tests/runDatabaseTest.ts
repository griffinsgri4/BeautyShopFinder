import { app } from '../config/firebase';
import { testDatabaseConnection } from './databaseTest';

// Ensure Firebase is initialized before running tests
const runTest = async () => {
  try {
    // Wait for Firebase initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Run the test
    const result = await testDatabaseConnection();
    
    // Exit with appropriate code
    process.exit(result ? 0 : 1);
  } catch (error) {
    console.error('Test runner failed:', error);
    process.exit(1);
  }
};

runTest();