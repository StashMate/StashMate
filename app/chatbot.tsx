import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../context/ThemeContext';
import { sendMessageToGemini } from '../services/geminiService';
import { getChatbotStyles } from '../styles/chatbot.styles';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function ChatbotScreen() {
  const { colors } = useTheme();
  const styles = getChatbotStyles(colors);
  const router = useRouter();
  const listRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! How can I help you today?', isUser: false },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim().length > 0) {
      const newMessage: Message = { id: Date.now().toString(), text: input, isUser: true };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInput('');
      setLoading(true);
      try {
        const geminiResponse = await sendMessageToGemini(input);
        setMessages(prevMessages => [...prevMessages, { id: Date.now().toString() + 'bot', text: geminiResponse, isUser: false }]);
      } catch (error) {
        console.error('Error getting response from Gemini:', error);
        setMessages(prevMessages => [...prevMessages, { id: Date.now().toString() + 'bot', text: 'Sorry, I could not get a response from the AI.', isUser: false }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage]}>
      {item.isUser ? (
        <Text style={[styles.messageText, { color: item.isUser ? '#FFFFFF' : colors.text }]}>
          {item.text}
        </Text>
      ) : (
        <Markdown style={{ body: { color: colors.text } }}>
          {item.text}
        </Markdown>
      )}
      <View style={[styles.messageTail, item.isUser ? styles.userTail : styles.botTail]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>StashMate AI</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: true })}
        />
        {loading && (
          <View style={{ paddingVertical: 10, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.text} />
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor={colors.secondaryText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 