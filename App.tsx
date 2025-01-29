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
              <Text style={styles.buttonText}>Show All ☰</Text>
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
              {' • '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('https://github.com/colemanm/muse')}
              >
                github
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
              {' • '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('https://github.com/colemanm/muse')}
              >
                github
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
    padding: Platform.select({ web: 20, default: 16 }),
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.select({ web: 20, default: 16 }),
    paddingTop: Platform.select({ web: 40, default: 20 }),
  },
  card: {
    backgroundColor: '#fff9f0',
    borderRadius: 8,
    padding: Platform.select({ web: 40, default: 16 }),
    width: '100%',
    maxWidth: 600,
    height: Platform.select({ web: 300, default: 280 }),
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
    borderLeftWidth: Platform.select({ web: 30, default: 16 }),
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
    fontSize: Platform.select({ web: 24, default: 22 }),
    textAlign: 'center',
    lineHeight: Platform.select({ web: 32, default: 30 }),
    color: '#2c3e50',
    backgroundColor: 'rgba(255, 249, 240, 0.9)',
    padding: Platform.select({ web: 16, default: 8 }),
    borderRadius: 4,
    maxWidth: Platform.select({ web: 520, default: '95%' }),
    alignSelf: 'center',
    fontFamily: "'PT Serif', serif",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Platform.select({ web: 10, default: 8 }),
    width: '100%',
    maxWidth: Platform.select({ web: 600, default: '100%' }),
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: Platform.select({ web: 20, default: 16 }),
    paddingHorizontal: Platform.select({ web: 0, default: 20 }),
  },
  button: {
    flex: Platform.select({ web: 1, default: 0 }),
    minWidth: Platform.select({ web: 'auto', default: 140 }),
    backgroundColor: '#eb5757',
    padding: Platform.select({ web: 15, default: 12 }),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginRight: Platform.select({ web: 5, default: 8 }),
  },
  buttonRight: {
    marginLeft: Platform.select({ web: 5, default: 8 }),
  },
  buttonText: {
    color: '#fff',
    fontSize: Platform.select({ web: 16, default: 15 }),
    fontWeight: 'bold',
    fontFamily: "'PT Serif', serif",
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.select({ web: 20, default: 16 }),
    paddingTop: Platform.select({ web: 40, default: 20 }),
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: Platform.select({ web: 40, default: 20 }),
    width: '100%',
    maxWidth: 600,
    height: Platform.select({ web: '80vh', default: '75vh' }),
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
    fontSize: Platform.select({ web: 28, default: 24 }),
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: Platform.select({ web: 24, default: 20 }),
    fontFamily: "'PT Serif', serif",
  },
  promptListItem: {
    fontSize: Platform.select({ web: 18, default: 16 }),
    marginBottom: Platform.select({ web: 16, default: 12 }),
    lineHeight: Platform.select({ web: 32, default: 24 }),
    color: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: Platform.select({ web: 16, default: 12 }),
    fontFamily: "'PT Serif', serif",
  },
  footer: {
    position: 'absolute',
    bottom: Platform.select({ web: 20, default: 16 }),
    right: Platform.select({ web: 20, default: 16 }),
  },
  footerText: {
    color: '#666',
    fontSize: Platform.select({ web: 14, default: 12 }),
    fontFamily: "'PT Serif', serif",
  },
  link: {
    color: '#eb5757',
    textDecorationLine: 'underline',
    cursor: 'pointer',
    fontFamily: "'PT Serif', serif",
  },
}); 