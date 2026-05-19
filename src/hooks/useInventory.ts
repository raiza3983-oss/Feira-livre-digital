import { useState, useEffect, useCallback } from 'react';
import { db, collection, onSnapshot, query, orderBy, doc, updateDoc, writeBatch } from '../firebase';
import { Product } from '../types';

export function useInventory(shopId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `shops/${shopId}/products`),
      orderBy('name')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shopId]);

  const updateStock = useCallback(async (productId: string, newStock: number) => {
    if (!shopId) return;
    try {
      await updateDoc(doc(db, `shops/${shopId}/products`, productId), {
        stock: newStock,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  }, [shopId]);

  return { products, loading, updateStock };
}
