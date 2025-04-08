import * as fs from 'fs';
import * as path from 'path';

const verifyDatabaseData = () => {
  try {
    console.log('Starting data verification...');

    // Read the firebase-data.json file
    const dataPath = path.join(__dirname, '..', 'data', 'firebase-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    // Verify salons data structure
    console.log('\nVerifying salons data...');
    if (data.salons) {
      console.log(`Found ${Object.keys(data.salons).length} salons`);
      const sampleSalon = Object.values(data.salons)[0];
      console.log('Sample salon structure:', JSON.stringify(sampleSalon, null, 2));
    } else {
      console.log('No salons data found');
    }

    // Verify barbershops data structure
    console.log('\nVerifying barbershops data...');
    if (data.barbershops) {
      console.log(`Found ${Object.keys(data.barbershops).length} barbershops`);
      const sampleBarbershop = Object.values(data.barbershops)[0];
      console.log('Sample barbershop structure:', JSON.stringify(sampleBarbershop, null, 2));
    } else {
      console.log('No barbershops data found');
    }

    // Verify data structure completeness
    console.log('\nVerifying data structure...');
    const requiredSections = ['salons', 'barbershops', 'appointments', 'users', 'reviews'];
    const missingSections = requiredSections.filter(section => !data[section]);
    
    if (missingSections.length === 0) {
      console.log('✓ All required data sections are present');
    } else {
      console.log('✗ Missing sections:', missingSections.join(', '));
    }

    console.log('\nData verification completed successfully!');
    return true;
  } catch (error) {
    console.error('Data verification failed:', error);
    return false;
  }
};

// Run the verification
const result = verifyDatabaseData();
process.exit(result ? 0 : 1);