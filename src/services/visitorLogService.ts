import { db, collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType } from '../../firebase';
import { VisitorLog } from '../../types';

const COLLECTION_NAME = 'visitor_logs';

export const subscribeToVisitorLogs = (
  onUpdate: (logs: VisitorLog[]) => void,
  onError: (error: any) => void
) => {
  const logsQuery = query(collection(db, COLLECTION_NAME));
  return onSnapshot(logsQuery, (snapshot) => {
    const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VisitorLog));
    onUpdate(logsData);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onError(error);
  });
};

export const addVisitorLog = async (log: Omit<VisitorLog, 'id'>) => {
  try {
    return await addDoc(collection(db, COLLECTION_NAME), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
};
