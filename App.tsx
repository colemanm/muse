import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Linking, ScrollView } from 'react-native';
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
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.redLine} />
              <Text style={styles.prompt}>{currentPrompt}</Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonLeft]}
              onPress={() => selectRandomPrompt(allPrompts)}
            >
              <Text style={styles.buttonText}>Next Prompt →</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonRight]}
              onPress={() => setShowAllPrompts(true)}
            >
              <Text style={styles.buttonText}>Show All Prompts</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              built by{' '}
              <Text 
                style={styles.link}
                onPress={() => Linking.openURL('https://www.colemanm.org')}
              >
                @colemanm
              </Text>
            </Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.listContainer}>
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>All Prompts</Text>
              <ScrollView style={styles.scrollView}>
                {allPrompts.map((prompt, index) => (
                  <Text key={index} style={styles.promptListItem}>
                    {prompt}
                  </Text>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowAllPrompts(false)}
            >
              <Text style={styles.buttonText}>Back to Random Prompt</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              built by{' '}
              <Text 
                style={styles.link}
                onPress={() => Linking.openURL('https://www.colemanm.org')}
              >
                @colemanm
              </Text>
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40,
  },
  card: {
    backgroundColor: '#fff9f0',
    borderRadius: 8,
    padding: 40,
    width: '100%',
    maxWidth: 600,
    height: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    justifyContent: 'center',
    position: 'relative',
    borderLeftWidth: 30,
    borderLeftColor: '#ff9e9e',
  },
  redLine: {
    position: 'absolute',
    left: -20,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#eb5757',
  },
  prompt: {
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 32,
    color: '#2c3e50',
    backgroundColor: 'rgba(255, 249, 240, 0.9)',
    padding: 16,
    borderRadius: 4,
    maxWidth: 520,
    alignSelf: 'center',
    fontFamily: "'PT Serif', serif",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 600,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#eb5757',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  buttonLeft: {
    marginRight: 5,
  },
  buttonRight: {
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: "'PT Serif', serif",
  },
  listContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 40,
    width: '100%',
    maxWidth: 600,
    height: '80vh',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  listTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: "'PT Serif', serif",
  },
  promptListItem: {
    fontSize: 18,
    marginBottom: 16,
    lineHeight: 32,
    color: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
    fontFamily: "'PT Serif', serif",
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    fontFamily: "'PT Serif', serif",
  },
  link: {
    color: '#eb5757',
    textDecorationLine: 'underline',
    cursor: 'pointer',
    fontFamily: "'PT Serif', serif",
  },
}); 