import { db, collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType } from '../../firebase';
import { ServiceProvider } from '../../types';

const COLLECTION_NAME = 'service_providers';

export const subscribeToServiceProviders = (
  onUpdate: (providers: ServiceProvider[]) => void,
  onError: (error: any) => void
) => {
  const providersQuery = query(collection(db, COLLECTION_NAME));
  return onSnapshot(providersQuery, (snapshot) => {
    const providersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceProvider));
    onUpdate(providersData);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onError(error);
  });
};

export const addServiceProvider = async (provider: Omit<ServiceProvider, 'id'>) => {
  try {
    return await addDoc(collection(db, COLLECTION_NAME), provider);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
};

export const updateServiceProvider = async (id: string, provider: Partial<ServiceProvider>) => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), provider);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
};

export const deleteServiceProvider = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
};
