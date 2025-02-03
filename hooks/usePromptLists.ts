import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

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
    
    // Convert string array to Prompt objects
    const promptObjects = prompts.map(text => ({ text }));
    
    const docRef = await addDoc(collection(db, 'promptLists'), {
      name,
      prompts: promptObjects,
      userId,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  };

  const deletePromptList = async (listId: string) => {
    await deleteDoc(doc(db, 'promptLists', listId));
    await loadPromptLists(); // Refresh lists after deleting
  };

  const updatePromptList = async (listId: string, updates: { 
    name?: string, 
    prompts?: Prompt[] 
  }) => {
    if (!userId) return;
    
    const docRef = doc(db, 'promptLists', listId);
    await updateDoc(docRef, updates);
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