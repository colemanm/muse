import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, where, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface Prompt {
  id: string;
  text: string;
  category?: string;
}

interface PromptList {
  id: string;
  name: string;
  prompts: Prompt[];
  userId: string;
  createdAt: Date;
}

interface PromptUsage {
  promptId: string;
  usedCount: number;
  lastUsed?: Date;
}

export function usePromptLists(userId: string | null) {
  const [promptLists, setPromptLists] = useState<PromptList[]>([]);
  const [loading, setLoading] = useState(true);
  const [promptUsage, setPromptUsage] = useState<PromptUsage[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

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
    
    // Extract all prompts from the lists
    const allPrompts = lists.flatMap(list => 
      list.prompts.map(prompt => ({
        ...prompt,
        id: typeof prompt === 'string' ? prompt : prompt.id || prompt.text
      }))
    );
    
    setPrompts(allPrompts);
    setPromptLists(lists);
    setLoading(false);
  };

  useEffect(() => {
    loadPromptLists();
  }, [userId]);

  const savePromptList = async (name: string, promptTexts: string[]) => {
    if (!userId) return;
    
    // Convert string array to Prompt objects
    const promptObjects = promptTexts.map(text => ({
      id: crypto.randomUUID(), // Generate unique IDs for new prompts
      text,
    }));
    
    const docRef = await addDoc(collection(db, 'promptLists'), {
      name,
      prompts: promptObjects,
      userId,
      createdAt: serverTimestamp(),
    });
    
    await loadPromptLists(); // Refresh to update prompts state
    return docRef.id;
  };

  const deletePromptList = async (listId: string): Promise<boolean> => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this list? This action cannot be undone.');
    
    if (!confirmed) {
      return false;
    }
    
    try {
      await deleteDoc(doc(db, 'promptLists', listId));
      await loadPromptLists(); // Refresh lists after deleting
      return true;
    } catch (error) {
      console.error('Error deleting prompt list:', error);
      return false;
    }
  };

  const updatePromptList = async (listId: string, updates: { 
    name?: string, 
    prompts?: Prompt[] 
  }) => {
    if (!userId) return;
    
    const docRef = doc(db, 'promptLists', listId);
    await updateDoc(docRef, updates);
  };

  const getRandomPrompt = useCallback((category?: string) => {
    if (!prompts.length) return null;
    
    let availablePrompts = category 
      ? prompts.filter(p => p.category === category)
      : prompts;

    // First, try to find prompts that have never been used
    const unusedPrompts = availablePrompts.filter(prompt => 
      !promptUsage.some(usage => usage.promptId === prompt.id)
    );

    if (unusedPrompts.length > 0) {
      // If there are unused prompts, randomly select from those
      const randomIndex = Math.floor(Math.random() * unusedPrompts.length);
      const selectedPrompt = unusedPrompts[randomIndex];
      
      // Track the usage
      setPromptUsage(prev => [...prev, {
        promptId: selectedPrompt.id,
        usedCount: 1,
        lastUsed: new Date()
      }]);
      
      return selectedPrompt;
    }

    // If all prompts have been used, fall back to random selection
    // but favor less frequently used prompts
    const weightedPrompts = availablePrompts.map(prompt => {
      const usage = promptUsage.find(u => u.promptId === prompt.id);
      const weight = usage ? 1 / (usage.usedCount + 1) : 1;
      return { prompt, weight };
    });

    const totalWeight = weightedPrompts.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const { prompt, weight } of weightedPrompts) {
      random -= weight;
      if (random <= 0) {
        // Update usage for the selected prompt
        setPromptUsage(prev => {
          const existing = prev.find(u => u.promptId === prompt.id);
          if (existing) {
            return prev.map(u => u.promptId === prompt.id 
              ? { ...u, usedCount: u.usedCount + 1, lastUsed: new Date() }
              : u
            );
          }
          return [...prev, { promptId: prompt.id, usedCount: 1, lastUsed: new Date() }];
        });
        
        return prompt;
      }
    }

    return availablePrompts[0]; // Fallback, should never reach here
  }, [prompts, promptUsage]);

  return { 
    promptLists, 
    loading, 
    savePromptList, 
    deletePromptList,
    updatePromptList,
    refreshLists: loadPromptLists,
    getRandomPrompt
  };
} 