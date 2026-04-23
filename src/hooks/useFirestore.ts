import { useState, useEffect } from 'react';
import { 
  db, 
  onSnapshot, 
  collection, 
  query, 
  doc, 
  OperationType, 
  handleFirestoreError 
} from '../firebase';
import { QueryConstraint, DocumentData } from 'firebase/firestore';

/**
 * Hook moderno para escutar coleções do Firestore com tratamento de erro robusto.
 */
export function useFirestoreCollection<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, collectionPath), ...constraints);
    
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as T));
        setData(items);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
        try {
          handleFirestoreError(err, OperationType.LIST, collectionPath);
        } catch (e) {
          // Error is already logged by handleFirestoreError
        }
      }
    );

    return () => unsubscribe();
  }, [collectionPath, JSON.stringify(constraints)]);

  return { data, loading, error };
}

/**
 * Hook moderno para escutar um documento específico do Firestore.
 */
export function useFirestoreDoc<T = DocumentData>(
  collectionPath: string,
  docId: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docId) return;
    
    setLoading(true);
    const docRef = doc(db, collectionPath, docId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
        try {
          handleFirestoreError(err, OperationType.GET, `${collectionPath}/${docId}`);
        } catch (e) {
          // Error is already logged
        }
      }
    );

    return () => unsubscribe();
  }, [collectionPath, docId]);

  return { data, loading, error };
}
