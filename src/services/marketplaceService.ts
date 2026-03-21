import { db, collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType } from '../../firebase';
import { MarketplaceItem } from '../../types';

const COLLECTION_NAME = 'marketplace_items';

export const subscribeToMarketplaceItems = (
  onUpdate: (items: MarketplaceItem[]) => void,
  onError: (error: any) => void
) => {
  const itemsQuery = query(collection(db, COLLECTION_NAME));
  return onSnapshot(itemsQuery, (snapshot) => {
    const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketplaceItem));
    onUpdate(itemsData);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onError(error);
  });
};

export const addMarketplaceItem = async (item: Omit<MarketplaceItem, 'id'>) => {
  try {
    return await addDoc(collection(db, COLLECTION_NAME), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
};

export const updateMarketplaceItem = async (id: string, item: Partial<MarketplaceItem>) => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
};

export const deleteMarketplaceItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
};
