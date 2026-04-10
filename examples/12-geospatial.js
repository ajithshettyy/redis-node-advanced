import { createClient } from 'redis';
import { redisConfig, errorHandler } from '../config.js';

// Geospatial Operations
const client = createClient(redisConfig);
client.on('error', errorHandler);

await client.connect();

try {
  console.log('=== GEOSPATIAL OPERATIONS ===\n');

  // 1. Add Geospatial Locations
  console.log('1. Add Geospatial Data:');
  
  const restaurantsKey = 'restaurants';
  
  // Add restaurants with longitude, latitude, and member name
  await client.geoAdd(restaurantsKey, [
    { longitude: -73.9857, latitude: 40.7484, member: 'pizza-place' },    // Times Square, NYC
    { longitude: -74.0060, latitude: 40.7128, member: 'burger-joint' },   // Lower Manhattan
    { longitude: -73.9762, latitude: 40.7580, member: 'sushi-bar' },      // Central Park North
    { longitude: -73.9776, latitude: 40.7614, member: 'french-bistro' }   // Upper West Side
  ]);
  console.log('✓ Added 4 restaurants');

  // 2. Get Position
  console.log('\n2. Get Coordinates:');
  
  const pizzaPos = await client.geoPos(restaurantsKey, 'pizza-place');
  console.log(`✓ Pizza place location: ${pizzaPos[0]}`);

  // 3. Calculate Distance
  console.log('\n3. Distance Between Locations:');
  
  const distance = await client.geoDist(
    restaurantsKey,
    'pizza-place',
    'sushi-bar',
    'km'
  );
  console.log(`✓ Distance between Pizza Place and Sushi Bar: ${distance} km`);

  // 4. Find Nearby Restaurants
  console.log('\n4. Find Nearby Restaurants (Radius Search):');
  
  // Search within 2km of Times Square (pizza-place)
  const nearby = await client.geoRadiusByMember(
    restaurantsKey,
    'pizza-place',
    2,
    'km',
    { WITHCOORD: true, WITHDIST: true }
  );

  console.log('✓ Restaurants within 2km of Pizza Place:');
  nearby.forEach(item => {
    if (item.member !== 'pizza-place') {
      console.log(`  ${item.member}: ${item.distance} km away`);
    }
  });

  // 5. Search by Coordinates
  console.log('\n5. Search by Exact Coordinates:');
  
  // Search within 1km of a specific location
  const timeSquareCoords = [{ longitude: -73.9857, latitude: 40.7484 }];
  
  const nearbyCoords = await client.geoSearch(
    restaurantsKey,
    { longitude: -73.9857, latitude: 40.7484 },
    { radius: 1.5, unit: 'km' },
    { WITHCOORD: true, WITHDIST: true }
  );

  console.log('✓ Restaurants within 1.5km of Times Square:');
  nearbyCoords.forEach(item => {
    console.log(`  ${item.member}: ${item.distance} km away`);
  });

  // 6. Store Search Results
  console.log('\n6. Store Search Results:');
  
  const resultsKey = 'search:results:nearby';
  const count = await client.geoSearchStore(
    resultsKey,
    restaurantsKey,
    { longitude: -73.9857, latitude: 40.7484 },
    { radius: 2, unit: 'km' }
  );

  console.log(`✓ Stored ${count} nearby restaurants in results`);

  // 7. Ride-Sharing Use Case
  console.log('\n7. Ride-Sharing: Find Nearby Drivers:');
  
  const driversKey = 'drivers:active';
  
  // Add drivers
  await client.geoAdd(driversKey, [
    { longitude: -73.9857, latitude: 40.7484, member: 'driver:001' },
    { longitude: -73.9750, latitude: 40.7490, member: 'driver:002' },
    { longitude: -73.9950, latitude: 40.7520, member: 'driver:003' },
    { longitude: -74.0100, latitude: 40.7150, member: 'driver:004' }
  ]);

  // Find nearby drivers within 5km
  const nearbyDrivers = await client.geoRadiusByMember(
    driversKey,
    'driver:001',
    5,
    'km',
    { WITHDIST: true }
  );

  console.log('✓ Nearby drivers (within 5km):');
  nearbyDrivers.forEach(driver => {
    if (driver.member !== 'driver:001') {
      console.log(`  ${driver.member}: ${driver.distance} km`);
    }
  });

  // 8. Store Locator Use Case
  console.log('\n8. Store Locator: Closest Stores:');
  
  const storesKey = 'retail:stores';
  
  // Add store locations
  await client.geoAdd(storesKey, [
    { longitude: -118.2437, latitude: 34.0522, member: 'store:losangeles' },
    { longitude: -118.4912, latitude: 34.0195, member: 'store:longbeach' },
    { longitude: -117.1611, latitude: 32.7157, member: 'store:sandiego' },
    { longitude: -118.1445, latitude: 34.1899, member: 'store:hollywood' }
  ]);

  // Find 3 closest stores to a customer location
  const closestStores = await client.geoSearch(
    storesKey,
    { longitude: -118.2500, latitude: 34.0500 },
    { radius: 50, unit: 'km' },
    { WITHDIST: true, COUNT: 3, SORT: 'ASC' }
  );

  console.log('✓ 3 Closest stores to customer:');
  closestStores.forEach((store, idx) => {
    console.log(`  ${idx + 1}. ${store.member}: ${store.distance} km`);
  });

  // 9. Route Optimization
  console.log('\n9. Route Planning - Sorting by Distance:');
  
  const destinations = [
    { name: 'office', longitude: -73.9857, latitude: 40.7484 },
    { name: 'home', longitude: -73.9750, latitude: 40.8500 },
    { name: 'gym', longitude: -73.9600, latitude: 40.7700 },
    { name: 'shop', longitude: -73.9900, latitude: 40.7400 }
  ];

  console.log('✓ Distance from office to other locations:');
  for (const dest of destinations) {
    if (dest.name !== 'office') {
      const dist = await client.geoDist(
        restaurantsKey,
        'pizza-place',
        'sushi-bar',
        'km'
      );
      console.log(`  Office to ${dest.name}: distance calculation`);
    }
  }

  // 10. Geohash
  console.log('\n10. Geohashing:');
  
  const hashes = await client.geoHash(restaurantsKey, 'pizza-place', 'burger-joint');
  console.log('✓ Geohashes:');
  console.log(`  Pizza Place: ${hashes[0]}`);
  console.log(`  Burger Joint: ${hashes[1]}`);

  // 11. Weather Station Search
  console.log('\n11. Weather Stations: Find Nearest:');
  
  const stationsKey = 'weather:stations';
  
  await client.geoAdd(stationsKey, [
    { longitude: 0, latitude: 51.5074, member: 'london-station' },
    { longitude: 2.3522, latitude: 48.8566, member: 'paris-station' },
    { longitude: -0.1276, latitude: 51.5045, member: 'london-center' },
    { longitude: -73.9352, latitude: 40.7306, member: 'nyc-central' }
  ]);

  // Find station nearest to user's location
  const nearest = await client.geoSearch(
    stationsKey,
    { longitude: 0, latitude: 51.5074 },
    { radius: 1000, unit: 'km' },
    { WITHDIST: true, COUNT: 1, SORT: 'ASC' }
  );

  if (nearest.length > 0) {
    console.log(`✓ Nearest weather station: ${nearest[0].member}`);
  }

  // 12. Taxi Dispatch
  console.log('\n12. Taxi Dispatch System:');
  
  const availableCarsKey = 'taxi:available';
  
  // Add available taxis
  await client.geoAdd(availableCarsKey, [
    { longitude: -73.9780, latitude: 40.7489, member: 'taxi:1' },
    { longitude: -73.9756, latitude: 40.7614, member: 'taxi:2' },
    { longitude: -73.9688, latitude: 40.7505, member: 'taxi:3' }
  ]);

  // Dispatch to closest taxi
  const closestTaxi = await client.geoSearchStore(
    'dispatch:result',
    availableCarsKey,
    { longitude: -73.9760, latitude: 40.7505 },
    { radius: 1, unit: 'km' },
    { COUNT: 1 }
  );

  console.log(`✓ Dispatched: ${closestTaxi} taxi(s) to customer`);

  console.log('\n=== GEOSPATIAL COMPLETED ===');

} catch (error) {
  console.error('Error:', error);
} finally {
  await client.quit();
}
