import { db, collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType, orderBy } from '../../firebase';
import { Transaction } from '../../types';

const COLLECTION_NAME = 'transactions';

export const subscribeToTransactions = (
  onUpdate: (transactions: Transaction[]) => void,
  onError: (error: any) => void
) => {
  const transactionsQuery = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
  return onSnapshot(transactionsQuery, (snapshot) => {
    const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    onUpdate(transactionsData);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onError(error);
  });
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  try {
    return await addDoc(collection(db, COLLECTION_NAME), transaction);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
};
