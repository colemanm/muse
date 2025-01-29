import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface PromptList {
  id: string;
  name: string;
  prompts: string[];
  userId: string;
  createdAt: Date;
}

export function usePromptLists(userId: string | null) {
  const [promptLists, setPromptLists] = useState<PromptList[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPromptLists = async () => {
    if (!userId) {
      setPromptLists([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'promptLists'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const lists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PromptList));
    
    setPromptLists(lists);
    setLoading(false);
  };

  useEffect(() => {
    loadPromptLists();
  }, [userId]);

  const savePromptList = async (name: string, prompts: string[]) => {
    if (!userId) return;

    const newList = {
      name,
      prompts,
      userId,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'promptLists'), newList);
    await loadPromptLists(); // Refresh lists after saving
    return docRef.id;
  };

  const deletePromptList = async (listId: string) => {
    await deleteDoc(doc(db, 'promptLists', listId));
    await loadPromptLists(); // Refresh lists after deleting
  };

  const updatePromptList = async (listId: string, updates: Partial<Omit<PromptList, 'id'>>) => {
    await updateDoc(doc(db, 'promptLists', listId), updates);
    await loadPromptLists();
  };

  return { 
    promptLists, 
    loading, 
    savePromptList, 
    deletePromptList,
    updatePromptList,
    refreshLists: loadPromptLists 
  };
} 