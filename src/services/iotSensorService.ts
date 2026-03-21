import { db, collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType } from '../../firebase';
import { IotSensor } from '../../types';

const COLLECTION_NAME = 'iot_sensors';

export const subscribeToIotSensors = (
  onUpdate: (sensors: IotSensor[]) => void,
  onError: (error: any) => void
) => {
  const sensorsQuery = query(collection(db, COLLECTION_NAME));
  return onSnapshot(sensorsQuery, (snapshot) => {
    const sensorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IotSensor));
    onUpdate(sensorsData);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onError(error);
  });
};

export const updateIotSensor = async (id: string, sensor: Partial<IotSensor>) => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), sensor);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
};
