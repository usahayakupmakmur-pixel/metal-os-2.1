import { db, collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType } from '../../firebase';
import { LibraryContent } from '../../types';

const COLLECTION_NAME = 'library_content';

export const subscribeToLibraryContent = (
  onUpdate: (content: LibraryContent[]) => void,
  onError: (error: any) => void
) => {
  const contentQuery = query(collection(db, COLLECTION_NAME));
  return onSnapshot(contentQuery, (snapshot) => {
    const contentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LibraryContent));
    onUpdate(contentData);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onError(error);
  });
};
