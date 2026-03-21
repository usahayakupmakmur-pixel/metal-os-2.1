import { db, collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType } from '../../firebase';
import { BudgetLineItem } from '../../types';

const COLLECTION_NAME = 'budget_data';

export const subscribeToBudget = (
  onUpdate: (budget: BudgetLineItem[]) => void,
  onError: (error: any) => void
) => {
  const budgetQuery = query(collection(db, COLLECTION_NAME));
  return onSnapshot(budgetQuery, (snapshot) => {
    const budgetData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BudgetLineItem));
    onUpdate(budgetData);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onError(error);
  });
};
