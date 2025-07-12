import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getChatbotStyles } from '../styles/chatbot.styles';
import { useRouter } from 'expo-router';

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

  const handleSend = () => {
    if (input.trim().length > 0) {
      const newMessage: Message = { id: Date.now().toString(), text: input, isUser: true };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInput('');
      // TODO: Add Firebase logic here to send the message and get a response
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage]}>
      <Text style={[styles.messageText, { color: item.isUser ? '#FFFFFF' : colors.text }]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chatbot</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={{ paddingBottom: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor={colors.secondaryText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 