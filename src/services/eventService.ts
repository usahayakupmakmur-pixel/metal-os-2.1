import { db, collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType } from '../../firebase';
import { SchoolEvent } from '../../types';

const COLLECTION_NAME = 'events';

export const subscribeToEvents = (
  onUpdate: (events: SchoolEvent[]) => void,
  onError: (error: any) => void
) => {
  const eventsQuery = query(collection(db, COLLECTION_NAME));
  return onSnapshot(eventsQuery, (snapshot) => {
    const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolEvent));
    onUpdate(eventsData);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onError(error);
  });
};
