import { shopService } from '../services/shopService';
import { serviceAvailabilityService } from '../services/serviceAvailabilityService';

export const testDatabaseConnection = async () => {
  try {
    console.log('Starting database connection test...');

    // Test 1: Fetch all shops
    console.log('\nTest 1: Fetching all shops...');
    const shops = await shopService.getAllShops();
    console.log(`Found ${shops.length} shops`);
    if (shops.length > 0) {
      console.log('Sample shop data:', JSON.stringify(shops[0], null, 2));
    }

    // Test 2: Fetch specific shop by ID
    console.log('\nTest 2: Fetching specific shop...');
    const specificShop = await shopService.getShopById('luxe_hair_studio');
    console.log('Specific shop found:', specificShop ? 'Yes' : 'No');
    if (specificShop) {
      console.log('Shop details:', JSON.stringify(specificShop, null, 2));
    }

    // Test 3: Test service availability
    console.log('\nTest 3: Testing service availability...');
    const availability = await serviceAvailabilityService.getServiceAvailability('luxe_hair_studio');
    console.log('Service availability data:', JSON.stringify(availability, null, 2));

    // Test 4: Subscribe to shop updates
    console.log('\nTest 4: Testing shop subscription...');
    const unsubscribe = shopService.subscribeToShops((updatedShops) => {
      console.log(`Received real-time update with ${updatedShops.length} shops`);
    });

    // Clean up subscription after 5 seconds
    setTimeout(() => {
      unsubscribe();
      console.log('\nTest completed successfully!');
    }, 5000);

    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
};