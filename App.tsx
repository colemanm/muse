import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Linking, ScrollView } from 'react-native';
import prompts from './prompts.md';
import { Feather } from '@expo/vector-icons';
import defaultPrompts from './prompts.md';
import { useAuth } from './hooks/useAuth';
import { usePromptLists } from './hooks/usePromptLists';

export default function App() {
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [allPrompts, setAllPrompts] = useState<string[]>([]);
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customFile, setCustomFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, loading: authLoading, error: authError, signIn, logOut } = useAuth();
  const { 
    promptLists, 
    loading: listsLoading, 
    savePromptList, 
    deletePromptList,
    refreshLists,
    updatePromptList
  } = usePromptLists(user?.uid);
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    loadPrompts(defaultPrompts);
  }, []);

  useEffect(() => {
    // Check localStorage on mount
    const savedSidebarState = localStorage.getItem('sidebarVisible');
    if (savedSidebarState !== null) {
      setShowSidebar(savedSidebarState === 'true');
    }
  }, []);

  const loadPrompts = (content: string) => {
    try {
      let promptList: string[] = [];

      // First try bullet format
      promptList = content
        .split('\n')
        .filter(line => line.trim().startsWith('- '))
        .map(line => line.substring(2).trim());

      // If no bullets found, try line-by-line, skipping empty lines
      if (promptList.length === 0) {
        promptList = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && !line.startsWith('#')); // Skip empty lines and headers
      }
      
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      loadPrompts(text);
      setCustomFile(file.name);

      // If user is logged in, automatically save the list
      if (user) {
        try {
          // Use the same parsing logic as loadPrompts
          let prompts = text.split('\n')
            .filter(line => line.trim().startsWith('- '))
            .map(line => line.substring(2).trim());

          if (prompts.length === 0) {
            prompts = text.split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0 && !line.startsWith('#'));
          }

          await savePromptList(file.name, prompts);
          await refreshLists();
        } catch (error) {
          console.error('Error auto-saving list:', error);
        }
      }
    } catch (error) {
      console.error('Error reading file:', error);
      setCurrentPrompt('Error reading file: ' + error.message);
    }
  };

  const selectRandomPrompt = (prompts: string[]) => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setCurrentPrompt(prompts[randomIndex]);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSidebar = () => {
    const newState = !showSidebar;
    setShowSidebar(newState);
    localStorage.setItem('sidebarVisible', String(newState));
  };

  return (
    <View style={styles.container}>
      {/* Add toggle button in top right */}
      {user && promptLists.length > 0 && (
        <TouchableOpacity 
          style={styles.sidebarToggle}
          onPress={toggleSidebar}
        >
          <Feather 
            name={showSidebar ? "chevrons-right" : "list"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
      )}

      {/* Add sign in button for logged out users */}
      {!user && (
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={signIn}
          disabled={authLoading}
        >
          <Feather name="log-in" size={16} color="#666" style={{ marginRight: 8 }} />
          <Text style={styles.signInButtonText}>
            {authLoading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Add sidebar */}
      {user && promptLists.length > 0 && (
        <View style={[
          styles.sidebar,
          showSidebar ? styles.sidebarVisible : styles.sidebarHidden
        ]}>
          <Text style={styles.sidebarTitle}>Your Saved Lists</Text>
          <ScrollView style={styles.sidebarScroll}>
            {promptLists.map(list => (
              <View key={list.id} style={styles.sidebarItem}>
                {editingListId === list.id ? (
                  <View style={styles.sidebarItemEdit}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      style={styles.sidebarItemInput}
                      autoFocus
                      onBlur={async () => {
                        if (editingName.trim()) {
                          try {
                            await updatePromptList(list.id, { name: editingName.trim() });
                            if (customFile === list.name) {
                              setCustomFile(editingName.trim());
                            }
                          } catch (error) {
                            console.error('Error updating list name:', error);
                          }
                        }
                        setEditingListId(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.sidebarItemContent,
                      list.name === customFile && styles.sidebarItemActive
                    ]}
                    onPress={() => {
                      loadPrompts(list.prompts.join('\n'));
                      setCustomFile(list.name);
                    }}
                  >
                    <View style={styles.sidebarItemRow}>
                      {list.name === customFile && (
                        <Feather 
                          name="chevron-right" 
                          size={14} 
                          color="#eb5757" 
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text style={styles.sidebarItemText}>{list.name}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.sidebarItemEdit}
                      onPress={() => {
                        setEditingListId(list.id);
                        setEditingName(list.name);
                      }}
                    >
                      <Feather name="edit-2" size={14} color="#666" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.sidebarItemDelete}
                  onPress={async () => {
                    try {
                      await deletePromptList(list.id);
                      if (customFile === list.name) {
                        loadPrompts(defaultPrompts);
                        setCustomFile(null);
                      }
                    } catch (error) {
                      console.error('Error deleting list:', error);
                    }
                  }}
                >
                  <Feather name="trash-2" size={16} color="#eb5757" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={styles.sidebarButtons}>
            <TouchableOpacity
              style={styles.sidebarButton}
              onPress={() => fileInputRef.current?.click()}
            >
              <Feather name="upload" size={16} color="#666" style={{ marginRight: 8 }} />
              <Text style={styles.sidebarButtonText}>Upload Prompts</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sidebarButton, { marginTop: 8 }]}
              onPress={logOut}
              disabled={authLoading}
            >
              <Feather name="log-out" size={16} color="#666" style={{ marginRight: 8 }} />
              <Text style={styles.sidebarButtonText}>
                {authLoading ? 'Signing out...' : 'Sign Out'}
              </Text>
            </TouchableOpacity>
            <input
              type="file"
              accept=".md,.txt"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          </View>
        </View>
      )}

      {!showAllPrompts ? (
        <>
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.redLine} />
              <Text style={styles.prompt}>{currentPrompt}</Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={copyPrompt}
              >
                <Feather 
                  name={copied ? "check" : "copy"} 
                  size={20} 
                  color="#2c3e50" 
                  style={{ opacity: 0.6 }}
                />
                {copied && <Text style={styles.copyFeedback}>Copied!</Text>}
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.customFileText}>
            Current prompt list: {customFile || 'Default'}{' '}
            {customFile && (
              <Text 
                style={styles.resetLink}
                onPress={() => {
                  loadPrompts(defaultPrompts);
                  setCustomFile(null);
                }}
              >
                (reset)
              </Text>
            )}
          </Text>
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
    left: Platform.select({ web: 20, default: 16 }),
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
  copyButton: {
    position: 'absolute',
    bottom: Platform.select({ web: 16, default: 12 }),
    right: Platform.select({ web: 16, default: 12 }),
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 249, 240, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyIcon: {
    fontSize: Platform.select({ web: 22, default: 20 }),
    opacity: 0.6,
    cursor: 'pointer',
    color: '#2c3e50',
  },
  copyFeedback: {
    fontSize: Platform.select({ web: 14, default: 12 }),
    color: '#2c3e50',
    opacity: 0.6,
    fontFamily: "'PT Serif', serif",
  },
  uploadContainer: {
    position: 'absolute',
    bottom: Platform.select({ web: 20, default: 16 }),
    left: Platform.select({ web: 20, default: 16 }),
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  uploadText: {
    color: '#666',
    fontSize: Platform.select({ web: 14, default: 12 }),
    fontFamily: "'PT Serif', serif",
  },
  customFileText: {
    color: '#666',
    fontSize: Platform.select({ web: 14, default: 12 }),
    fontFamily: "'PT Serif', serif",
    textAlign: 'center',
    marginBottom: 16,
    marginTop: -8,
    opacity: 0.8,
    maxWidth: 600,
    alignSelf: 'center',
  },
  resetLink: {
    color: '#eb5757',
    textDecorationLine: 'underline',
    cursor: 'pointer',
  },
  savedListsContainer: {
    position: 'absolute',
    top: Platform.select({ web: 20, default: 16 }),
    left: Platform.select({ web: 20, default: 16 }),
  },
  savedListsLabel: {
    color: '#666',
    fontSize: Platform.select({ web: 14, default: 12 }),
    fontFamily: "'PT Serif', serif",
  },
  savedListItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  savedListName: {
    color: '#2c3e50',
    fontSize: Platform.select({ web: 16, default: 14 }),
    fontFamily: "'PT Serif', serif",
  },
  errorText: {
    color: '#eb5757',
    fontSize: Platform.select({ web: 12, default: 10 }),
    marginTop: 4,
    fontFamily: "'PT Serif', serif",
  },
  sidebarToggle: {
    position: 'absolute',
    top: Platform.select({ web: 20, default: 16 }),
    right: Platform.select({ web: 20, default: 16 }),
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 100,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: Platform.select({ web: 300, default: 250 }),
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
    padding: Platform.select({ web: 20, default: 16 }),
    paddingTop: Platform.select({ web: 60, default: 56 }),
    transition: 'transform 0.3s ease',
    zIndex: 50,
  },
  sidebarVisible: {
    right: 0,
    transform: [{ translateX: 0 }],
  },
  sidebarHidden: {
    right: 0,
    transform: [{ translateX: '100%' }],
  },
  sidebarTitle: {
    fontSize: Platform.select({ web: 18, default: 16 }),
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    fontFamily: "'PT Serif', serif",
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sidebarItemContent: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 4,
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(235, 87, 87, 0.05)',
  },
  sidebarItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sidebarItemEdit: {
    marginLeft: 8,
    opacity: 0.6,
  },
  sidebarItemInput: {
    flex: 1,
    padding: 8,
    fontSize: Platform.select({ web: 16, default: 14 }),
    fontFamily: "'PT Serif', serif",
    color: '#2c3e50',
    border: '1px solid #ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
    margin: 4,
  },
  sidebarItemDelete: {
    padding: 12,
    opacity: 0.7,
  },
  sidebarItemText: {
    fontSize: Platform.select({ web: 16, default: 14 }),
    color: '#2c3e50',
    fontFamily: "'PT Serif', serif",
  },
  sidebarButtons: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginTop: 8,
  },
  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sidebarButtonText: {
    color: '#666',
    fontSize: Platform.select({ web: 14, default: 12 }),
    fontFamily: "'PT Serif', serif",
  },
  signInButton: {
    position: 'absolute',
    bottom: Platform.select({ web: 20, default: 16 }),
    right: Platform.select({ web: 20, default: 16 }),
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 100,
  },
  signInButtonText: {
    color: '#666',
    fontSize: Platform.select({ web: 14, default: 12 }),
    fontFamily: "'PT Serif', serif",
  },
}); 