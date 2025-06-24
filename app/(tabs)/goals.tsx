import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getGoalsStyles } from '../../styles/goals.styles';
import { useRouter, useLocalSearchParams } from 'expo-router';

const initialGoals = [
  {
    name: 'Vacation in Hawaii',
    icon: 'airplane-outline',
    current: 2000,
    target: 5000,
    deadline: '2024-12-31',
    image: 'https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Down Payment',
    icon: 'home-outline',
    current: 10000,
    target: 20000,
    deadline: '2025-06-30',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'New Car',
    icon: 'car-sport-outline',
    current: 5000,
    target: 15000,
    deadline: '2024-11-30',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

export default function GoalsScreen() {
  const { colors } = useTheme();
  const styles = getGoalsStyles(colors);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [goals, setGoals] = useState(initialGoals);

  useEffect(() => {
    if (params.newGoal) {
      const newGoal = JSON.parse(params.newGoal as string);
      setGoals(currentGoals => [...currentGoals, newGoal]);
    }
  }, [params.newGoal]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goals</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>My Goals</Text>
        {goals.map((goal, index) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <View key={index} style={styles.goalCard}>
              <Image source={{ uri: goal.image }} style={styles.goalImage} />
              <View style={styles.goalInfo}>
                <View style={styles.goalHeader}>
                    <Ionicons name={goal.icon as any} size={24} color={colors.primary} />
                    <Text style={styles.goalName}>{goal.name}</Text>
                </View>
                <Text style={styles.goalProgressText}>
                  ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                </Text>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.goalDeadline}>Deadline: {new Date(goal.deadline).toLocaleDateString()}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <TouchableOpacity style={styles.newGoalButton} onPress={() => router.push('/addGoal')}>
        <Feather name="plus" size={20} color="#fff" />
        <Text style={styles.newGoalButtonText}>New Goal</Text>
      </TouchableOpacity>
    </View>
  );
} 