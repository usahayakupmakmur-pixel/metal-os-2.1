import { db, collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType, orderBy } from '../../firebase';
import { BerdayaOrder } from '../../types';

const COLLECTION_NAME = 'berdaya_orders';

export const subscribeToOrders = (
  onUpdate: (orders: BerdayaOrder[]) => void,
  onError: (error: any) => void
) => {
  const ordersQuery = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
  return onSnapshot(ordersQuery, (snapshot) => {
    const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BerdayaOrder));
    onUpdate(ordersData);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onError(error);
  });
};

export const addOrder = async (order: Omit<BerdayaOrder, 'id'>) => {
  try {
    return await addDoc(collection(db, COLLECTION_NAME), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
};

export const updateOrder = async (id: string, order: Partial<BerdayaOrder>) => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
};
