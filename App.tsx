import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import prompts from './prompts.md';

export default function App() {
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [allPrompts, setAllPrompts] = useState<string[]>([]);
  const [showAllPrompts, setShowAllPrompts] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = () => {
    try {
      const promptList = prompts
        .split('\n')
        .filter(line => line.trim().startsWith('- '))
        .map(line => line.substring(2).trim())
        .filter(line => line.length > 0);
      
      console.log('Prompts loaded:', promptList);
      
      if (promptList.length === 0) {
        throw new Error('No prompts found in file');
      }
      
      setAllPrompts(promptList);
      selectRandomPrompt(promptList);
    } catch (error) {
      console.error('Error loading prompts:', error);
      setCurrentPrompt('Error loading prompts: ' + error.message);
    }
  };

  const selectRandomPrompt = (prompts: string[]) => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setCurrentPrompt(prompts[randomIndex]);
  };

  return (
    <View style={styles.container}>
      {!showAllPrompts ? (
        <>
          <Text style={styles.prompt}>{currentPrompt}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => selectRandomPrompt(allPrompts)}
          >
            <Text style={styles.buttonText}>Roll the Dice 🎲</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowAllPrompts(true)}
          >
            <Text style={styles.buttonText}>Show All Prompts</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.promptList}>
            {allPrompts.map((prompt, index) => (
              <Text key={index} style={styles.promptListItem}>
                • {prompt}
              </Text>
            ))}
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowAllPrompts(false)}
          >
            <Text style={styles.buttonText}>Back to Random Prompt</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  prompt: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  promptList: {
    flex: 1,
    width: '100%',
    paddingVertical: 20,
  },
  promptListItem: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 24,
  },
}); 