import { queueService, ShopQueue } from './queueService';
import { serviceAvailabilityService, ShopServiceAvailability } from './serviceAvailabilityService';

export interface ShopScore {
  shopId: string;
  name: string;
  distance: number;
  queueScore: number;
  availabilityScore: number;
  trafficScore: number;
  totalScore: number;
  isRecommended: boolean;
  estimatedTravelTime: number; // in minutes
  alternativeServices: string[];
}

export interface ShopDetails {
  id: string;
  name: string;
  distance: number; // in kilometers
  services: string[];
}

export const shopRecommendationService = {
  // Calculate shop scores based on multiple factors
  calculateShopScores: async (shops: ShopDetails[]): Promise<ShopScore[]> => {
    const shopScores = await Promise.all(
      shops.map(async (shop) => {
        const queueData = await queueService.getQueueStatus(shop.id);
        const availabilityData = await serviceAvailabilityService.getServiceAvailability(shop.id);
        
        return calculateShopScore(shop, queueData, availabilityData);
      })
    );

    // Sort shops by total score (higher is better)
    return shopScores.sort((a, b) => b.totalScore - a.totalScore);
  },

  // Get alternative recommendations based on multiple factors
  getAlternativeRecommendations: async (
    currentShopId: string,
    nearbyShops: ShopDetails[],
    maxWaitTime: number = 30 // default 30 minutes threshold
  ): Promise<ShopScore[]> => {
    const currentQueue = await queueService.getQueueStatus(currentShopId);
    const currentShop = nearbyShops.find(shop => shop.id === currentShopId);
    
    if (!currentShop) return [];

    // Get current shop's services and availability
    const currentAvailability = await serviceAvailabilityService.getServiceAvailability(currentShopId);
    
    // Filter out the current shop and get nearby alternatives
    const otherShops = nearbyShops.filter(shop => shop.id !== currentShopId);
    
    // Calculate scores for alternative shops
    const scores = await shopRecommendationService.calculateShopScores(otherShops);
    
    // Enhanced filtering considering multiple factors
    return scores
      .filter(shop => {
        // Calculate total travel + wait time
        const totalTime = shop.estimatedTravelTime + (shop.queueScore * maxWaitTime);
        
        // Check if shop offers similar or alternative services
        const hasRelevantServices = shop.alternativeServices.some(service =>
          currentShop.services.includes(service)
        );

        // Consider both time savings and service relevance
        const isBetterOption = 
          totalTime < (currentQueue?.averageWaitTime || maxWaitTime) &&
          hasRelevantServices &&
          shop.totalScore > 0.7;

        return isBetterOption;
      })
      .map(shop => ({
        ...shop,
        isRecommended: true
      }));
  }
};

// Helper function to calculate individual shop scores
function calculateShopScore(
  shop: ShopDetails,
  queueData: ShopQueue | null,
  availabilityData: ShopServiceAvailability | null
): ShopScore {
  // Queue score (0-1, higher is better)
  const queueScore = calculateQueueScore(queueData);
  
  // Availability score (0-1, higher is better)
  const availabilityScore = calculateAvailabilityScore(availabilityData);
  
  // Distance and traffic score (0-1, higher is better)
  const { distanceScore, trafficScore, estimatedTravelTime } = calculateLocationScore(shop.distance);
  
  // Find alternative services when preferred ones are busy
  const alternativeServices = findAlternativeServices(availabilityData, shop.services);

  // Calculate total score with dynamic weights based on time of day
  const weights = calculateDynamicWeights();
  const totalScore = (
    queueScore * weights.queue +
    availabilityScore * weights.availability +
    distanceScore * weights.distance +
    trafficScore * weights.traffic
  );

  return {
    shopId: shop.id,
    name: shop.name,
    distance: shop.distance,
    queueScore,
    availabilityScore,
    trafficScore,
    totalScore,
    isRecommended: false,
    estimatedTravelTime,
    alternativeServices
  };
}

// Calculate dynamic weights based on time of day and user preferences
function calculateDynamicWeights() {
  const currentHour = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());
  const isPeakHour = (currentHour >= 10 && currentHour <= 12) || (currentHour >= 16 && currentHour <= 18);

  // Adjust weights based on time factors
  return {
    queue: isPeakHour ? 0.45 : 0.35,
    availability: isPeakHour ? 0.25 : 0.35,
    distance: isWeekend ? 0.2 : 0.15,
    traffic: isWeekend ? 0.1 : 0.15
  };
}

// Calculate location score considering real-time traffic
function calculateLocationScore(distance: number) {
  // In a real app, this would use a traffic API
  const baseSpeed = 30; // km/h
  const trafficMultiplier = getTrafficMultiplier();
  const estimatedTravelTime = (distance / baseSpeed) * 60 * trafficMultiplier; // in minutes

  return {
    distanceScore: Math.max(0, 1 - distance / 10), // Normalize to 0-1
    trafficScore: Math.max(0, 1 - trafficMultiplier / 2),
    estimatedTravelTime
  };
}

// Get traffic multiplier based on time and historical data
function getTrafficMultiplier() {
  const hour = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());

  // Traffic multipliers (1.0 = normal traffic)
  if (isWeekend) return 1.1;
  if (hour >= 8 && hour <= 10) return 1.5; // Morning rush
  if (hour >= 16 && hour <= 18) return 1.4; // Evening rush
  return 1.0;
}

// Find alternative services when preferred ones are unavailable
function findAlternativeServices(
  availabilityData: ShopServiceAvailability | null,
  preferredServices: string[]
): string[] {
  if (!availabilityData) return [];

  const alternatives: string[] = [];
  const serviceGroups = {
    hair: ['haircut', 'styling', 'coloring', 'treatment'],
    nails: ['manicure', 'pedicure', 'nail-art'],
    face: ['facial', 'makeup', 'skincare'],
    body: ['massage', 'spa', 'treatment']
  };

  preferredServices.forEach(service => {
    // Find service group
    const group = Object.entries(serviceGroups)
      .find(([_, services]) => services.includes(service))?.[1] || [];

    // Add available alternatives from the same group
    group.forEach(alt => {
      if (alt !== service && 
          availabilityData.services[alt]?.isAvailable && 
          !alternatives.includes(alt)) {
        alternatives.push(alt);
      }
    });
  });

  return alternatives;
}

function calculateQueueScore(queueData: ShopQueue | null): number {
  if (!queueData) return 1; // No queue data means no wait
  
  // Convert wait time to a score (0-1)
  const waitTimeScore = Math.max(0, 1 - (queueData.averageWaitTime / 120)); // 2 hours max
  
  // Convert queue size to a score (0-1)
  const queueSizeScore = Math.max(0, 1 - (queueData.currentQueueSize / 20)); // 20 people max
  
  // Combine scores with weights
  return (waitTimeScore * 0.6) + (queueSizeScore * 0.4);
}

function calculateAvailabilityScore(availabilityData: ShopServiceAvailability | null): number {
  if (!availabilityData?.services) return 0;
  
  const services = Object.values(availabilityData.services);
  if (services.length === 0) return 0;
  
  // Calculate percentage of available services
  const availableServices = services.filter(service => service.isAvailable);
  const availabilityRatio = availableServices.length / services.length;
  
  // Calculate average capacity utilization
  const capacityScores = services.map(service => {
    if (!service.isAvailable) return 0;
    return 1 - (service.currentCapacity / service.maxCapacity);
  });
  
  const averageCapacityScore = capacityScores.reduce((sum, score) => sum + score, 0) / services.length;
  
  // Combine scores with weights
  return (availabilityRatio * 0.6) + (averageCapacityScore * 0.4);
}

function calculateDistanceScore(distance: number): number {
  // Convert distance to a score (0-1)
  // Assumes 5km is the maximum reasonable distance
  return Math.max(0, 1 - (distance / 5));
}