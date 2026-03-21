import { db, collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType } from '../../firebase';
import { SecurityAlert } from '../../types';

const COLLECTION_NAME = 'security_alerts';

export const subscribeToSecurityAlerts = (
  onUpdate: (alerts: SecurityAlert[]) => void,
  onError: (error: any) => void
) => {
  const alertsQuery = query(collection(db, COLLECTION_NAME));
  return onSnapshot(alertsQuery, (snapshot) => {
    const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SecurityAlert));
    onUpdate(alertsData);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onError(error);
  });
};

export const addSecurityAlert = async (alert: Omit<SecurityAlert, 'id'>) => {
  try {
    return await addDoc(collection(db, COLLECTION_NAME), alert);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
};
