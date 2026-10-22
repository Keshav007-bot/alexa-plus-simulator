import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);
  
  // We now store a list of messages to create chat bubbles
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! I am your LogicRippers Alexa+ assistant. How can I help you today?', sender: 'ai' }
  ]);

  // Replace this string with your actual Gemini API key
  const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY'; 

  const handleSend = async () => {
    if (!prompt.trim()) return;
    
    const userMessage = { id: Date.now().toString(), text: prompt, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage.text }] }]
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setMessages((prev) => [...prev, { id: Date.now().toString(), text: `Error: ${data.error?.message}`, sender: 'ai' }]);
      } else {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setMessages((prev) => [...prev, { id: Date.now().toString(), text: aiResponse, sender: 'ai' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: `Network Error: ${error.message}`, sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Premium Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>LogicRippers</Text>
        <Text style={styles.subHeaderText}>AI Assistant</Text>
      </View>
      
      {/* Chat Area */}
      <ScrollView 
        style={styles.chatBox}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.bubbleWrapper, msg.sender === 'user' ? styles.userBubbleWrapper : styles.aiBubbleWrapper]}>
            <View style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.bubbleWrapper, styles.aiBubbleWrapper]}>
            <View style={[styles.bubble, styles.aiBubble, styles.loadingBubble]}>
              <ActivityIndicator color="#00E5FF" size="small" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          placeholderTextColor="#888"
          value={prompt}
          onChangeText={setPrompt}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.button} onPress={handleSend} disabled={isLoading || !prompt.trim()}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0D0D12', // Deep dark gray background
  },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#15151E',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A35',
    alignItems: 'center',
    shadowColor: '#00E5FF', // Subtle neon glow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerText: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#FFF', 
    letterSpacing: 1.5,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#00E5FF', // Neon cyan accent
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  chatBox: { 
    flex: 1, 
    padding: 15,
  },
  bubbleWrapper: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 15,
  },
  userBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  aiBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#7B2CBF', // Deep neon purple
    borderBottomRightRadius: 4,
    shadowColor: '#7B2CBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#1E1E28', // Darker gray for AI
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  loadingBubble: {
    paddingHorizontal: 24,
  },
  messageText: { 
    fontSize: 16, 
    color: '#F0F0F0', 
    lineHeight: 24,
  },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 15, 
    paddingBottom: 30,
    backgroundColor: '#15151E', 
    borderTopWidth: 1,
    borderTopColor: '#2A2A35',
    alignItems: 'center',
  },
  input: { 
    flex: 1, 
    backgroundColor: '#0D0D12',
    borderWidth: 1, 
    borderColor: '#2A2A35', 
    color: '#FFF',
    padding: 15, 
    borderRadius: 25, 
    marginRight: 12, 
    fontSize: 16,
  },
  button: { 
    backgroundColor: '#00E5FF', // Neon cyan send button
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: 25, 
    justifyContent: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonText: { 
    color: '#000', 
    fontSize: 16, 
    fontWeight: '800',
    textTransform: 'uppercase'
  }
});