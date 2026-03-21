import { db, collection, getDocs, query, limit } from '../../firebase';

export const checkServiceConnectivity = async (collectionName: string): Promise<boolean> => {
  try {
    const q = query(collection(db, collectionName), limit(1));
    await getDocs(q);
    return true;
  } catch (error) {
    console.error(`Error checking connectivity for ${collectionName}:`, error);
    return false;
  }
};

export const getAllServicesStatus = async () => {
  const services = [
    'marketplace_items',
    'service_providers',
    'orders',
    'visitor_logs',
    'security_alerts',
    'budget',
    'transactions',
    'iot_devices',
    'library_content',
    'events',
    'courses'
  ];
  
  const status: Record<string, boolean> = {};
  for (const service of services) {
    status[service] = await checkServiceConnectivity(service);
  }
  return status;
};
