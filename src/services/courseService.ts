import { db, collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType } from '../../firebase';
import { Course } from '../../types';

const COLLECTION_NAME = 'courses';

export const subscribeToCourses = (
  onUpdate: (courses: Course[]) => void,
  onError: (error: any) => void
) => {
  const coursesQuery = query(collection(db, COLLECTION_NAME));
  return onSnapshot(coursesQuery, (snapshot) => {
    const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
    onUpdate(coursesData);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onError(error);
  });
};
