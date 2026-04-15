import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, Alert, Modal, ScrollView, Dimensions, SafeAreaView, Platform, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, Manrope_200ExtraLight, Manrope_300Light, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { MaterialIcons, Feather } from '@expo/vector-icons';

const STORAGE_KEY = '@daily_activities';

// Design Tokens
const THEME = {
  colors: {
    primary: '#005bc4',
    primaryContainer: '#4388fd',
    onPrimary: '#f9f8ff',
    secondary: '#00d48a', // Mint for completed
    secondaryContainer: '#6ffbbe',
    onSecondaryContainer: '#005e3f',
    tertiary: '#684cb6',
    tertiaryContainer: '#a589f8',
    onTertiaryContainer: '#230062',
    background: '#f7f9fb',
    surface: '#f7f9fb',
    surfaceContainer: '#eaeff2',
    surfaceContainerLow: '#f0f4f7',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerHighest: '#dce4e8',
    onSurface: '#2c3437',
    onSurfaceVariant: '#596064',
    outlineVariant: '#acb3b7',
    error: '#a83836',
    priorityHigh: '#fa746f',
    priorityMedium: '#4388fd',
    priorityLow: '#00d48a',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  }
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- Components ---

const TaskCard = ({ item, onToggle, onDelete }) => {
  const isCompleted = item.completed;
  const isHealth = item.category === 'Health';
  
  return (
    <View style={[
      styles.taskCardNew, 
      isCompleted && styles.taskCardCompleted,
      isCompleted && isHealth && { borderLeftWidth: 4, borderLeftColor: '#00d48a' }
    ]}>
      <TouchableOpacity onPress={() => onToggle(item.id)} style={styles.taskCheckbox}>
        <View style={[
          styles.checkboxInner, 
          isCompleted && styles.checkboxInnerActive,
          isCompleted && isHealth && { backgroundColor: '#6ffbbe', borderColor: '#6ffbbe' }
        ]}>
          {isCompleted && <Feather name="check" size={14} color="#fff" />}
        </View>
      </TouchableOpacity>
      
      <View style={styles.taskCardContent}>
        <View style={styles.taskCardHeader}>
          <Text style={[
            styles.taskCardTitle, 
            isCompleted && styles.taskCardTitleDone
          ]}>
            {item.title}
          </Text>
          {item.priority && (
            <View style={[styles.priorityBadge, { backgroundColor: item.priority === 'HIGH' ? '#fa746f' + '1A' : '#4388fd' + '1A' }]}>
              <Text style={[styles.priorityText, { color: item.priority === 'HIGH' ? '#fa746f' : '#4388fd' }]}>{item.priority}</Text>
            </View>
          )}
          {isCompleted && isHealth && (
            <View style={[styles.priorityBadge, { backgroundColor: '#6ffbbe' + '4D' }]}>
              <Text style={[styles.priorityText, { color: '#005e3f' }]}>COMPLETED</Text>
            </View>
          )}
        </View>
        
        <View style={styles.taskCardFooter}>
          {item.time && (
            <View style={styles.taskMetadata}>
              <Feather name="clock" size={12} color={THEME.colors.onSurfaceVariant} />
              <Text style={styles.metadataText}>{item.time}</Text>
            </View>
          )}
          {item.metadata && (
            <View style={styles.taskMetadata}>
              <Feather name="paperclip" size={12} color={THEME.colors.onSurfaceVariant} />
              <Text style={styles.metadataText}>{item.metadata}</Text>
            </View>
          )}
          {item.status === 'IN PROGRESS' && (
            <View style={[styles.statusBadge, { backgroundColor: '#a589f8' + '4D', marginTop: 0 }]}>
              <Text style={[styles.statusText, { color: '#230062' }]}>IN PROGRESS</Text>
            </View>
          )}
          {item.location && (
            <Text style={[styles.metadataText, { fontStyle: 'italic', marginLeft: 4 }]}>{item.location}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.taskDeleteBtn}>
        <Feather name="trash-2" size={16} color={THEME.colors.error} />
      </TouchableOpacity>
    </View>
  );
};

// --- Screens ---

const AddTaskScreen = ({ navigation, onSave }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Work');

  const handleCreate = () => {
    if (!title.trim()) return;
    onSave(title, category);
    navigation.goBack();
  };

  return (
    <View style={styles.screenContainer}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.addHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={THEME.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.addHeaderTitle}>New Task</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.addForm} contentContainerStyle={{ paddingBottom: 140 }}>
          <View style={styles.editorialHeader}>
            <Text style={styles.editorialTitle}>
              What's next,{"\n"}
              <Text style={styles.editorialTitleBold}>Julian?</Text>
            </Text>
            <Text style={styles.editorialSubtitle}>DEFINE YOUR FOCUS FOR TODAY</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TASK TITLE</Text>
            <TextInput 
              style={styles.underlineInput} 
              placeholder="e.g. Design System Review"
              placeholderTextColor={THEME.colors.onSurfaceVariant + '4D'}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.categoryPicker}>
            <Text style={styles.inputLabelCategory}>CATEGORY</Text>
            <View style={styles.chipsRow}>
              {[
                { name: 'Work', color: '#6ffbbe', onColor: '#005e3f' },
                { name: 'Personal', color: '#eaeff2', onColor: '#596064' },
                { name: 'Health', color: '#eaeff2', onColor: '#596064' },
                { name: 'Urgent', color: '#a589f8', onColor: '#230062' }
              ].map(cat => (
                <TouchableOpacity 
                  key={cat.name} 
                  onPress={() => setCategory(cat.name)}
                  style={[
                    styles.chip, 
                    category === cat.name ? { backgroundColor: cat.color } : { backgroundColor: '#f0f4f7' }
                  ]}
                >
                  <Text style={[
                    styles.chipText, 
                    category === cat.name ? { color: cat.onColor, fontFamily: 'PlusJakartaSans_700Bold' } : { color: '#596064' }
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addChipBtn}>
                <Feather name="plus" size={16} color={THEME.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dateTimeGridVertical}>
            <TouchableOpacity style={styles.dateTimeCardLarge}>
              <View style={styles.dateTimeIconLarge}>
                <Feather name="calendar" size={24} color={THEME.colors.primary} />
              </View>
              <View>
                <Text style={styles.dateTimeLabelLarge}>DATE</Text>
                <Text style={styles.dateTimeValueLarge}>Today, 24 Oct</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dateTimeCardLarge}>
              <View style={styles.dateTimeIconLarge}>
                <Feather name="clock" size={24} color={THEME.colors.primary} />
              </View>
              <View>
                <Text style={styles.dateTimeLabelLarge}>TIME</Text>
                <Text style={styles.dateTimeValueLarge}>09:00 AM</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.insightCardNew}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
              style={styles.insightImgNew}
            />
            <View style={styles.insightOverlayNew}>
              <Text style={styles.insightTagNew}>WORKSPACE INSIGHT</Text>
              <Text style={styles.insightTitleNew}>Focus on clarity today.</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.createBtnContainer}>
          <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
            <Text style={styles.createBtnText}>Create Task</Text>
          </TouchableOpacity>
          <Text style={styles.estimateText}>Estimated focus duration: 45 mins</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const TasksListScreen = ({ navigation, activities, onToggle, onDelete }) => {
  const categories = ['Work', 'Personal', 'Health'];
  
  const getTasksByCategory = (cat) => {
    return activities.filter(a => a.category === cat || (!a.category && cat === 'Work'));
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.screenContainer} contentContainerStyle={styles.scrollContent}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <View style={styles.profileRow}>
              <View style={styles.profileImageContainer}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }} 
                  style={styles.profileImage} 
                />
              </View>
              <Text style={styles.greetingText}>Morning, Julian</Text>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="settings" size={28} color={THEME.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroSection}>
            <Text style={styles.heroHeadlineNew}>Today's{"\n"}<Text style={styles.heroHeadlineBold}>Focus.</Text></Text>
            <Text style={styles.dateTextNew}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</Text>
          </View>

          {categories.map(cat => {
            const catTasks = activities.filter(a => a.category === cat);
            // Show dummy data if empty to match design request exactly
            const displayTasks = catTasks.length > 0 ? catTasks : (
              cat === 'Work' ? [
                { id: 'm1', title: 'Quarterly Review Presentation', time: '09:00 AM', metadata: '2 Files', priority: 'HIGH', category: 'Work', completed: true },
                { id: 'm2', title: 'Client Strategy Sync', time: '02:30 PM', priority: 'MEDIUM', category: 'Work' }
              ] : cat === 'Personal' ? [
                { id: 'm3', title: 'Grocery Shopping', status: 'IN PROGRESS', location: 'Whole Foods', category: 'Personal' }
              ] : cat === 'Health' ? [
                { id: 'm4', title: 'Morning Pilates Session', time: '07:00 AM', completed: true, category: 'Health' },
                { id: 'm5', title: 'Daily Meditation', metadata: '15 mins', category: 'Health' }
              ] : []
            );
            
            return (
              <View key={cat} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{cat}</Text>
                  <View style={[
                    styles.categoryBadge, 
                    cat === 'Work' && { backgroundColor: '#4388fd' + '1A' },
                    cat === 'Personal' && { backgroundColor: '#a589f8' + '1A' },
                    cat === 'Health' && { backgroundColor: '#6ffbbe' + '1A' }
                  ]}>
                    <Text style={[
                      styles.categoryBadgeText, 
                      cat === 'Work' && { color: '#005bc4' },
                      cat === 'Personal' && { color: '#684cb6' },
                      cat === 'Health' && { color: '#005e3f' }
                    ]}>
                      {displayTasks.length} {cat === 'Work' ? 'ACTIVE' : 'ITEMS'}
                    </Text>
                  </View>
                </View>
                {displayTasks.map(item => (
                  <TaskCard 
                    key={item.id}
                    item={item} 
                    onToggle={onToggle} 
                    onDelete={onDelete}
                  />
                ))}
              </View>
            );
          })}

          <Text style={styles.quoteText}>
            “Efficiency is doing things right; effectiveness is doing the right things.”
          </Text>
        </SafeAreaView>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Tasks', { screen: 'AddTask' })}
      >
        <Feather name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const TasksStack = ({ activities, onToggle, onDelete, onSave }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TasksList">
      {(props) => <TasksListScreen {...props} activities={activities} onToggle={onToggle} onDelete={onDelete} />}
    </Stack.Screen>
    <Stack.Screen name="AddTask">
      {(props) => <AddTaskScreen {...props} onSave={onSave} />}
    </Stack.Screen>
  </Stack.Navigator>
);

const CalendarScreen = () => {
  const days = [30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const events = [
    { time: '09:00', title: 'Strategy Sync: Q4 Roadmap', subtitle: 'Digital Lounge', duration: '60 min', tag: 'INTERNAL', tagColor: '#a589f8' },
    { time: '11:30', title: 'Client Briefing: Aurelia Project', subtitle: 'The Green House Café', duration: '45 min', tag: 'EXTERNAL', tagColor: '#6ffbbe' },
    { time: '14:00', title: 'Deep Work: Editorial Design', subtitle: 'Notifications Off', duration: '2 hours', tag: 'FOCUS', tagColor: '#4388fd', focus: true },
    { time: '17:00', title: 'Evening Reflection', subtitle: '', duration: '15 min', tag: 'HABIT', tagColor: '#dce4e8' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.screenContainer} contentContainerStyle={styles.scrollContent}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <View style={styles.profileRow}>
              <View style={styles.profileImageContainer}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }} 
                  style={styles.profileImage} 
                />
              </View>
              <Text style={styles.greetingText}>Morning, Julian</Text>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="settings" size={28} color={THEME.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.screenHeaderCalendar}>
            <Text style={styles.screenTitleCalendar}>October</Text>
            <Text style={styles.screenSubtitleCalendar}>2024 SCHEDULE</Text>
            <View style={styles.headerActionsCalendar}>
              <TouchableOpacity style={styles.iconBtnCalendar}><Feather name="chevron-left" size={24} color={THEME.colors.onSurface} /></TouchableOpacity>
              <TouchableOpacity style={styles.iconBtnCalendar}><Feather name="chevron-right" size={24} color={THEME.colors.onSurface} /></TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarContainerNew}>
            <View style={styles.dayNamesRow}>
              {dayNames.map(name => (
                <Text key={name} style={styles.dayNameText}>{name}</Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {days.map((day, idx) => (
                <View key={idx} style={[styles.calendarDay, day === 10 && styles.calendarDaySelected, idx === 0 && styles.calendarDayOtherMonth]}>
                  <Text style={[styles.calendarDayText, day === 10 && styles.calendarDayTextSelected, idx === 0 && styles.calendarDayTextOtherMonth]}>{day}</Text>
                  {day === 3 && <View style={[styles.calendarDot, { backgroundColor: '#a589f8' }]} />}
                  {day === 15 && <View style={[styles.calendarDot, { backgroundColor: '#6ffbbe' }]} />}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.focusSectionCalendar}>
            <Text style={styles.sectionTitleCalendar}>Today's Focus</Text>
            <View style={styles.focusCardCalendar}>
              <View style={styles.focusHeaderCalendar}>
                <View style={styles.focusIconBgCalendar}>
                  <MaterialIcons name="auto-awesome" size={20} color={THEME.colors.onSecondaryContainer} />
                </View>
                <View>
                  <Text style={styles.focusLabelCalendar}>SELECTED DATE</Text>
                  <Text style={styles.focusDateCalendar}>Thursday, Oct 10</Text>
                </View>
              </View>
              <Text style={styles.focusDescCalendar}>You have 4 primary events scheduled for today. Your afternoon is mostly clear for deep work.</Text>
            </View>
          </View>

          <View style={styles.weeklyGoalCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
              style={styles.weeklyGoalImg}
            />
            <View style={styles.weeklyGoalOverlay}>
              <Text style={styles.weeklyGoalText}>Weekly Goal: Presence over Perfection</Text>
            </View>
          </View>

          <View style={styles.timelineContainer}>
            {events.map((event, idx) => (
              <View key={idx} style={styles.timelineRow}>
                <View style={styles.timelineTimeContainer}>
                  <Text style={styles.timelineTimeText}>{event.time}</Text>
                </View>
                <View style={styles.timelineLineContainer}>
                  <View style={styles.timelineDot} />
                  {idx !== events.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={[styles.eventCard, event.focus && styles.eventCardFocus]}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={[styles.eventTag, { backgroundColor: event.tagColor + '33' }]}>
                      <Text style={[styles.eventTagText, { color: event.tagColor === '#dce4e8' ? '#596064' : event.tagColor }]}>{event.tag}</Text>
                    </View>
                  </View>
                  <View style={styles.eventFooter}>
                    <View style={styles.eventMetadata}>
                      <Feather name="clock" size={12} color={THEME.colors.onSurfaceVariant} />
                      <Text style={styles.eventMetadataText}>{event.duration}</Text>
                    </View>
                    {event.subtitle && (
                      <View style={styles.eventMetadata}>
                        <Feather name={event.focus ? "minus-circle" : "map-pin"} size={12} color={THEME.colors.onSurfaceVariant} />
                        <Text style={styles.eventMetadataText}>{event.subtitle}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </ScrollView>
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Tasks', { screen: 'AddTask' })}
      >
        <Feather name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const DashboardScreen = ({ navigation, activities, onToggle }) => {
  const completedCount = activities.filter(a => a.completed).length;
  const totalCount = activities.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 57;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.screenContainer} contentContainerStyle={styles.scrollContent}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <View style={styles.profileRow}>
              <View style={styles.profileImageContainer}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }} 
                  style={styles.profileImage} 
                />
              </View>
              <Text style={styles.greetingText}>Morning, Julian</Text>
            </View>
            <TouchableOpacity>
              <Feather name="settings" size={24} color={THEME.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroSection}>
            <Text style={styles.dateTextNew}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</Text>
            <Text style={styles.heroHeadlineNew}>Focus on the{"\n"}<Text style={[styles.heroHeadlineBold, { color: THEME.colors.primary, fontStyle: 'italic' }]}>essential</Text> today.</Text>
          </View>

          <View style={styles.bentoGrid}>
            <View style={styles.progressCardNew}>
              <Text style={styles.cardTitleLarge}>Daily Progress</Text>
              <Text style={styles.cardSubtitleLarge}>{completedCount || 4} of {totalCount || 7} tasks completed</Text>
              
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircleOuter}>
                  <View style={[styles.progressCircleInner, { borderRightColor: 'transparent', borderBottomColor: 'transparent', transform: [{ rotate: '45deg' }] }]} />
                  <Text style={styles.progressPercentageLarge}>{progress}%</Text>
                </View>
              </View>

              <View style={styles.streakContainerNew}>
                <Text style={styles.streakLabelNew}>CURRENT STREAK</Text>
                <Text style={styles.streakValueNew}>12 Days Calm</Text>
              </View>
            </View>

            <View style={styles.morningRhythmCardNew}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitleLarge}>Morning Rhythm</Text>
                  <Text style={styles.cardSubtitleLarge}>Focus windows for deep work</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Rituals')}>
                  <Text style={styles.viewCalendarTextLarge}>View Calendar</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.rhythmListNew}>
                <View style={styles.rhythmItemNew}>
                  <View style={[styles.rhythmIconBgNew, { backgroundColor: THEME.colors.surfaceContainerHighest }]}>
                    <Feather name="book-open" size={20} color={THEME.colors.primary} />
                  </View>
                  <View style={styles.rhythmContentNew}>
                    <View style={styles.rhythmTagRowNew}>
                      <View style={[styles.rhythmTagNew, { backgroundColor: '#a589f8' + '33' }]}>
                        <Text style={[styles.rhythmTagTextNew, { color: '#684cb6' }]}>DEEP WORK</Text>
                      </View>
                      <Text style={styles.rhythmTimeNew}>09:00 - 10:30 AM</Text>
                    </View>
                    <Text style={styles.rhythmTitleNew}>Draft editorial strategy</Text>
                  </View>
                  <TouchableOpacity style={styles.rhythmCheckboxNew}>
                    <View style={styles.rhythmCheckboxInnerNew} />
                  </TouchableOpacity>
                </View>

                <View style={styles.rhythmItemNew}>
                  <View style={[styles.rhythmIconBgNew, { backgroundColor: THEME.colors.surfaceContainerHighest }]}>
                    <Feather name="coffee" size={20} color={THEME.colors.primary} />
                  </View>
                  <View style={styles.rhythmContentNew}>
                    <View style={styles.rhythmTagRowNew}>
                      <View style={[styles.rhythmTagNew, { backgroundColor: '#6ffbbe' + '4D' }]}>
                        <Text style={[styles.rhythmTagTextNew, { color: '#005e3f' }]}>ROUTINE</Text>
                      </View>
                      <Text style={styles.rhythmTimeNew}>10:45 - 11:00 AM</Text>
                    </View>
                    <Text style={styles.rhythmTitleNew}>Mindful break & hydration</Text>
                  </View>
                  <View style={[styles.rhythmCheckboxNew, styles.rhythmCheckboxActiveNew]}>
                    <Feather name="check" size={14} color="#fff" />
                  </View>
                </View>

                <View style={styles.rhythmItemNew}>
                  <View style={[styles.rhythmIconBgNew, { backgroundColor: THEME.colors.surfaceContainerHighest }]}>
                    <Feather name="users" size={20} color={THEME.colors.primary} />
                  </View>
                  <View style={styles.rhythmContentNew}>
                    <View style={styles.rhythmTagRowNew}>
                      <View style={[styles.rhythmTagNew, { backgroundColor: '#4388fd' + '33' }]}>
                        <Text style={[styles.rhythmTagTextNew, { color: '#005bc4' }]}>SYNC</Text>
                      </View>
                      <Text style={styles.rhythmTimeNew}>11:00 - 12:00 PM</Text>
                    </View>
                    <Text style={styles.rhythmTitleNew}>Creative team stand-up</Text>
                  </View>
                  <TouchableOpacity style={styles.rhythmCheckboxNew}>
                    <View style={styles.rhythmCheckboxInnerNew} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sparkCard}>
            <View style={styles.sparkContent}>
              <Text style={styles.sparkLabel}>DAILY SPARK</Text>
              <Text style={styles.sparkQuote}>“The secret of your future is hidden in your daily routine.”</Text>
            </View>
            <View style={styles.sparkActions}>
              <TouchableOpacity style={styles.sparkActionBtn}><Feather name="share-2" size={18} color={THEME.colors.onSurfaceVariant} /></TouchableOpacity>
              <TouchableOpacity style={styles.sparkActionBtn}><Feather name="bookmark" size={18} color={THEME.colors.onSurfaceVariant} /></TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Tasks', { screen: 'AddTask' })}
      >
        <Feather name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const menuItems = [
    { label: 'Personal Information', icon: 'user' },
    { label: 'App Settings', icon: 'sliders' },
    { label: 'Notifications', icon: 'bell' },
    { label: 'Help & Support', icon: 'help-circle' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.screenContainer} contentContainerStyle={styles.scrollContent}>
        <SafeAreaView>
          <View style={styles.profileTopBar}>
            <TouchableOpacity><Feather name="menu" size={24} color={THEME.colors.primary} /></TouchableOpacity>
            <Text style={styles.topBarTitle}>Personal Sanctuary</Text>
            <TouchableOpacity><MaterialIcons name="settings" size={24} color={THEME.colors.primary} /></TouchableOpacity>
          </View>

          <View style={styles.profileHero}>
            <View style={styles.profileAvatarContainer}>
              <View style={styles.avatarOuterCircle}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }} 
                  style={styles.profileAvatar} 
                />
              </View>
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={16} color="#fff" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Julian</Text>
              <Text style={styles.profileTitle}>MINDFUL CREATOR</Text>
              <View style={styles.profileBadges}>
                <View style={[styles.profileBadge, { backgroundColor: '#6ffbbe' }]}>
                  <Text style={[styles.profileBadgeText, { color: '#005e3f' }]}>Pro Member</Text>
                </View>
                <View style={[styles.profileBadge, { backgroundColor: '#a589f8' + '33' }]}>
                  <Text style={[styles.profileBadgeText, { color: '#684cb6' }]}>Level 24 Explorer</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCardNew, styles.statCardWide]}>
              <View style={styles.statHeader}>
                <Feather name="check-circle" size={24} color={THEME.colors.primary} />
              </View>
              <View>
                <Text style={styles.statValueLarge}>42</Text>
                <Text style={styles.statLabelLarge}>Tasks Completed This Week</Text>
              </View>
            </View>
            
            <View style={styles.statCardRow}>
              <View style={[styles.statCardNew, { flex: 1 }]}>
                <View style={styles.statHeader}>
                  <MaterialIcons name="auto-awesome" size={24} color="#684cb6" />
                </View>
                <View>
                  <Text style={styles.statValueSmall}>12 Days Calm</Text>
                  <Text style={styles.statLabelLarge}>Current Streak</Text>
                </View>
              </View>
              <View style={[styles.statCardNew, { flex: 1 }]}>
                <View style={styles.statHeader}>
                  <Feather name="bar-chart-2" size={24} color="#00d48a" />
                </View>
                <View>
                  <Text style={styles.statValueSmall}>94%</Text>
                  <Text style={styles.statLabelLarge}>Focus Score</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>Account Workspace</Text>
            <View style={styles.menuList}>
              {menuItems.map((item, idx) => (
                <TouchableOpacity key={idx} style={styles.menuItemNew}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconBgNew}>
                      <Feather name={item.icon} size={20} color={THEME.colors.primary} />
                    </View>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={THEME.colors.outlineVariant} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.menuItemNew, styles.logoutItem]}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBgNew, styles.logoutIconBg]}>
                    <Feather name="log-out" size={20} color={THEME.colors.error} />
                  </View>
                  <Text style={[styles.menuItemLabel, { color: THEME.colors.error }]}>Log Out</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.weeklyInsightCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1499209974431-9dac3adaf471?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
              style={styles.insightBg}
            />
            <View style={styles.insightOverlay}>
              <Text style={styles.weeklyInsightTitle}>Your Weekly Insight</Text>
              <Text style={styles.weeklyInsightDesc}>You are most focused between 8:00 AM and 10:30 AM. Schedule your deep work then for maximum tranquility.</Text>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Tasks', { screen: 'AddTask' })}
      >
        <Feather name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// --- Main App ---

export default function App() {
  const [activities, setActivities] = useState([]);

  let [fontsLoaded] = useFonts({
    Manrope_200ExtraLight, Manrope_300Light, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setActivities(JSON.parse(stored));
    } catch (e) { console.error(e); }
  };

  const saveActivities = async (newActivities) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newActivities));
      setActivities(newActivities);
    } catch (e) { console.error(e); }
  };

  const handleSave = async (title, category) => {
    const newActivity = {
      id: Date.now().toString(),
      title,
      category,
      createdAt: new Date().toISOString(),
      completed: false
    };
    await saveActivities([...activities, newActivity]);
  };

  const handleDelete = async (id) => {
    const updated = activities.filter(a => a.id !== id);
    await saveActivities(updated);
  };

  const toggleComplete = async (id) => {
    const updated = activities.map(a => a.id === id ? { ...a, completed: !a.completed } : a);
    await saveActivities(updated);
  };

  // if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: true,
            tabBarActiveTintColor: THEME.colors.primary,
            tabBarInactiveTintColor: THEME.colors.onSurfaceVariant + '80',
            tabBarLabelStyle: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, marginBottom: 12 },
          }}
        >
          <Tab.Screen 
            name="Home" 
            children={(props) => <DashboardScreen {...props} activities={activities} onToggle={toggleComplete} />}
            options={{ 
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                  <Feather name="home" size={24} color={focused ? '#fff' : color} />
                </View>
              )
            }} 
          />
          <Tab.Screen 
            name="Tasks" 
            options={{
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                  <MaterialIcons name="fact-check" size={24} color={focused ? '#fff' : color} />
                </View>
              ),
            }}
          >
            {(props) => <TasksStack {...props} activities={activities} onToggle={toggleComplete} onDelete={handleDelete} onSave={handleSave} />}
          </Tab.Screen>
          <Tab.Screen 
            name="Calendar" 
            component={CalendarScreen} 
            options={{ 
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                  <Feather name="calendar" size={24} color={focused ? '#fff' : color} />
                </View>
              )
            }} 
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ 
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                  <Feather name="user" size={24} color={focused ? '#fff' : color} />
                </View>
              )
            }} 
          />
        </Tab.Navigator>

        <StatusBar style="dark" />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: THEME.colors.background },
  scrollContent: { paddingBottom: 140 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: THEME.spacing.lg, paddingTop: 40, marginBottom: THEME.spacing.xl },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: THEME.spacing.md },
  profileImageContainer: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  profileImage: { width: '100%', height: '100%' },
  greetingText: { fontFamily: 'Manrope_400Regular', fontSize: 18, color: THEME.colors.onSurface },
  
  heroSection: { paddingHorizontal: THEME.spacing.lg, marginBottom: THEME.spacing.xl, marginTop: 20 },
  heroHeadlineNew: { fontFamily: 'Manrope_300Light', fontSize: 56, color: THEME.colors.onSurface, lineHeight: 60, letterSpacing: -1 },
  heroHeadlineBold: { fontFamily: 'Manrope_800ExtraBold' },
  dateTextNew: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: THEME.colors.onSurfaceVariant + '80', letterSpacing: 1.5, marginTop: 12 },

  categorySection: { paddingHorizontal: THEME.spacing.lg, marginBottom: THEME.spacing.xl },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: THEME.spacing.md },
  categoryTitle: { fontFamily: 'Manrope_700Bold', fontSize: 22, color: THEME.colors.onSurface },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  categoryBadgeText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 0.5 },

  taskCardNew: { backgroundColor: '#fff', borderRadius: 28, padding: 24, marginBottom: THEME.spacing.md, flexDirection: 'row', alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  taskCardCompleted: { borderLeftWidth: 4, borderLeftColor: THEME.colors.outlineVariant + '4D' },
  taskCheckbox: { width: 24, height: 24, marginRight: 16, marginTop: 4 },
  checkboxInner: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: THEME.colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.colors.surfaceContainerHighest + '4D' },
  checkboxInnerActive: { backgroundColor: THEME.colors.outlineVariant + '4D', borderColor: 'transparent' },
  taskCardContent: { flex: 1 },
  taskCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  taskCardTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 18, color: THEME.colors.onSurface, flex: 1, marginRight: 8, lineHeight: 22 },
  taskCardTitleDone: { textDecorationLine: 'line-through', color: THEME.colors.onSurfaceVariant + '60' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  priorityText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 },
  taskCardFooter: { flexDirection: 'row', gap: 16, marginTop: 12, alignItems: 'center' },
  taskMetadata: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metadataText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: THEME.colors.onSurfaceVariant + '80' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 },
  taskDeleteBtn: { padding: 4, marginLeft: 8 },

  quoteText: { fontFamily: 'Manrope_400Regular', fontSize: 16, fontStyle: 'italic', color: THEME.colors.onSurfaceVariant + '80', textAlign: 'center', padding: THEME.spacing.xxl, lineHeight: 24 },

  // Add Task Styles
  addHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: THEME.spacing.lg },
  addHeaderTitle: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: THEME.colors.onSurface },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  addForm: { paddingHorizontal: THEME.spacing.lg },
  editorialHeader: { marginBottom: THEME.spacing.xl, marginTop: 20 },
  editorialTitle: { fontFamily: 'Manrope_200ExtraLight', fontSize: 56, lineHeight: 60, color: THEME.colors.onSurface, letterSpacing: -2 },
  editorialTitleBold: { fontFamily: 'Manrope_700Bold', color: THEME.colors.primary },
  editorialSubtitle: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: THEME.colors.onSurfaceVariant, letterSpacing: 1.5, marginTop: 12, opacity: 0.6, textTransform: 'uppercase' },
  inputGroup: { marginBottom: THEME.spacing.xxl, marginTop: 20 },
  inputLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: THEME.colors.primary, letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' },
  inputLabelCategory: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: THEME.colors.onSurfaceVariant, letterSpacing: 1.5, marginBottom: 16, opacity: 0.6, textTransform: 'uppercase' },
  underlineInput: { borderBottomWidth: 1.5, borderBottomColor: THEME.colors.surfaceContainerHighest, paddingVertical: 12, fontSize: 28, fontFamily: 'Manrope_500Medium', color: THEME.colors.onSurface },
  categoryPicker: { marginBottom: THEME.spacing.xxl },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: THEME.radius.full },
  chipText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 },
  addChipBtn: { width: 44, height: 44, borderRadius: 22, borderStyle: 'dashed', borderWidth: 1.5, borderColor: THEME.colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  dateTimeGridVertical: { gap: 20, marginBottom: THEME.spacing.xxl },
  dateTimeCardLarge: { backgroundColor: '#fff', borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 20, borderWeight: 1, borderColor: 'rgba(172, 179, 183, 0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 1 },
  dateTimeIconLarge: { width: 56, height: 56, borderRadius: 16, backgroundColor: THEME.colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  dateTimeLabelLarge: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: THEME.colors.onSurfaceVariant, letterSpacing: 1.5, opacity: 0.6, textTransform: 'uppercase' },
  dateTimeValueLarge: { fontFamily: 'Manrope_600SemiBold', fontSize: 20, color: THEME.colors.onSurface, marginTop: 4 },
  
  insightCardNew: { borderRadius: 24, overflow: 'hidden', height: 200, marginBottom: THEME.spacing.xxl, position: 'relative' },
  insightImgNew: { width: '100%', height: '100%' },
  insightOverlayNew: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.4)' },
  insightTagNew: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, color: '#fff', opacity: 0.8, letterSpacing: 1, textTransform: 'uppercase' },
  insightTitleNew: { fontFamily: 'Manrope_600SemiBold', fontSize: 20, color: '#fff', marginTop: 4 },
  createBtnContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20, backgroundColor: 'rgba(247, 249, 251, 0.8)', alignItems: 'center' },
  createBtn: { width: '100%', maxWidth: 500, backgroundColor: THEME.colors.primary, borderRadius: THEME.radius.full, paddingVertical: 22, alignItems: 'center', shadowColor: THEME.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 5 },
  createBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#fff' },
  estimateText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, color: THEME.colors.onSurfaceVariant, marginTop: 16, opacity: 0.6, letterSpacing: 0.5 },

  tabBar: { position: 'absolute', bottom: 24, left: 20, right: 20, height: 80, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 32, borderTopWidth: 0, elevation: 5 },
  tabIconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: THEME.colors.primary },

  fab: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#005bc4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#005bc4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    zIndex: 999,
  },

  screenHeaderCalendar: { paddingHorizontal: THEME.spacing.lg, marginBottom: 20 },
  screenTitleCalendar: { fontFamily: 'Manrope_300Light', fontSize: 48, color: THEME.colors.onSurface },
  screenSubtitleCalendar: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: THEME.colors.onSurfaceVariant, letterSpacing: 2 },
  headerActionsCalendar: { flexDirection: 'row', gap: 12, marginTop: 24 },
  iconBtnCalendar: { width: 56, height: 56, borderRadius: 28, backgroundColor: THEME.colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  calendarContainerNew: { margin: THEME.spacing.lg, padding: 24, backgroundColor: THEME.colors.surfaceContainerLow, borderRadius: 32 },
  dayNamesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dayNameText: { width: 40, textAlign: 'center', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: THEME.colors.onSurfaceVariant },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  calendarDay: { width: (Dimensions.get('window').width - 104) / 7, aspectRatio: 1, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  calendarDaySelected: { backgroundColor: THEME.colors.primary },
  calendarDayOtherMonth: { backgroundColor: 'transparent' },
  calendarDayText: { fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: THEME.colors.onSurface },
  calendarDayTextSelected: { color: '#fff' },
  calendarDayTextOtherMonth: { color: THEME.colors.onSurfaceVariant + '40' },
  calendarDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: THEME.colors.tertiaryContainer, marginTop: 2 },
  calendarDotSelected: { backgroundColor: '#fff' },
  focusSectionCalendar: { padding: THEME.spacing.lg },
  sectionTitleCalendar: { fontFamily: 'Manrope_400Regular', fontSize: 24, color: THEME.colors.onSurface, marginBottom: 16 },
  focusCardCalendar: { backgroundColor: '#fff', borderRadius: 32, padding: 32, shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 },
  focusHeaderCalendar: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  focusIconBgCalendar: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#6ffbbe' + '33', alignItems: 'center', justifyContent: 'center' },
  focusLabelCalendar: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: THEME.colors.onSurfaceVariant + '80', letterSpacing: 1 },
  focusDateCalendar: { fontFamily: 'Manrope_600SemiBold', fontSize: 18, color: THEME.colors.onSurface },
  focusDescCalendar: { fontFamily: 'Manrope_400Regular', fontSize: 15, color: THEME.colors.onSurfaceVariant, lineHeight: 24 },
  
  // Profile Styles
  profileTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: THEME.spacing.lg, paddingTop: 40, paddingBottom: 20 },
  topBarTitle: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: THEME.colors.onSurface },
  profileHero: { flexDirection: 'row', alignItems: 'center', padding: THEME.spacing.lg, gap: 24 },
  profileAvatarContainer: { position: 'relative' },
  avatarOuterCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 1, borderColor: THEME.colors.outlineVariant + '33', alignItems: 'center', justifyContent: 'center' },
  profileAvatar: { width: 100, height: 100, borderRadius: 50 },
  verifiedBadge: { position: 'absolute', bottom: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: THEME.colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'Manrope_800ExtraBold', fontSize: 32, color: THEME.colors.onSurface },
  profileTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: THEME.colors.onSurfaceVariant, letterSpacing: 2 },
  profileBadges: { flexDirection: 'row', gap: 8, marginTop: 12 },
  profileBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  profileBadgeText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 },
  
  statsGrid: { padding: THEME.spacing.lg },
  statCardNew: { backgroundColor: THEME.colors.surfaceContainerLow, borderRadius: 24, padding: 24 },
  statCardWide: { minWidth: '100%', marginBottom: 12 },
  statHeader: { marginBottom: 12 },
  statValueLarge: { fontFamily: 'Manrope_800ExtraBold', fontSize: 48, color: THEME.colors.onSurface, lineHeight: 54 },
  statLabelLarge: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: THEME.colors.onSurfaceVariant + '80', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  statCardRow: { flexDirection: 'row', gap: 12 },
  statValueSmall: { fontFamily: 'Manrope_800ExtraBold', fontSize: 18, color: THEME.colors.onSurface },
  
  menuSection: { paddingHorizontal: THEME.spacing.lg, marginTop: 32 },
  menuSectionTitle: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: THEME.colors.onSurface, marginBottom: 16 },
  menuList: { gap: 8 },
  menuItemNew: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderRadius: 20, marginBottom: 12 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconBgNew: { width: 44, height: 44, borderRadius: 12, backgroundColor: THEME.colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  menuItemLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: THEME.colors.onSurface },
  logoutItem: { marginTop: 8 },
  logoutIconBg: { backgroundColor: THEME.colors.error + '1A' },

  weeklyInsightCard: { margin: THEME.spacing.lg, height: 240, borderRadius: 32, overflow: 'hidden', position: 'relative', marginTop: 32 },
  insightBg: { width: '100%', height: '100%' },
  insightOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', padding: 32, justifyContent: 'flex-end' },
  weeklyInsightTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 22, color: '#fff', marginBottom: 12 },
  weeklyInsightDesc: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },

  // New Styles for Dashboard
  bentoGrid: { paddingHorizontal: THEME.spacing.lg, gap: 16 },
  progressCardNew: { backgroundColor: THEME.colors.surfaceContainerLow, borderRadius: 32, padding: 32, marginBottom: 16 },
  cardTitleLarge: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: THEME.colors.onSurface },
  cardSubtitleLarge: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: THEME.colors.onSurfaceVariant + '80', marginTop: 4 },
  progressCircleContainer: { alignItems: 'center', marginVertical: 32 },
  progressCircleOuter: { width: 180, height: 180, borderRadius: 90, borderWidth: 12, borderColor: THEME.colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  progressCircleInner: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 12, borderColor: THEME.colors.primary, borderTopColor: 'transparent', borderLeftColor: 'transparent' },
  progressPercentageLarge: { fontFamily: 'Manrope_800ExtraBold', fontSize: 42, color: THEME.colors.onSurface },
  streakContainerNew: { borderTopWidth: 1, borderTopColor: THEME.colors.outlineVariant + '33', paddingTop: 20 },
  streakLabelNew: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: THEME.colors.onSurfaceVariant + '80', letterSpacing: 1 },
  streakValueNew: { fontFamily: 'Manrope_700Bold', fontSize: 22, color: THEME.colors.primary, marginTop: 4 },
  
  morningRhythmCardNew: { backgroundColor: '#fff', borderRadius: 32, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 1 },
  viewCalendarTextLarge: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: THEME.colors.primary },
  rhythmListNew: { gap: 24, marginTop: 24 },
  rhythmItemNew: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  rhythmIconBgNew: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rhythmContentNew: { flex: 1 },
  rhythmTagRowNew: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  rhythmTagNew: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  rhythmTagTextNew: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9 },
  rhythmTimeNew: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: THEME.colors.onSurfaceVariant + '80' },
  rhythmTitleNew: { fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: THEME.colors.onSurface },
  rhythmCheckboxNew: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: THEME.colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  rhythmCheckboxInnerNew: { width: 12, height: 12, borderRadius: 3 },
  rhythmCheckboxActiveNew: { backgroundColor: '#005e3f', borderColor: '#005e3f' },

  // Profile New Styles
  avatarOuterCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 1, borderColor: THEME.colors.outlineVariant + '33', alignItems: 'center', justifyContent: 'center' },
  profileAvatar: { width: 100, height: 100, borderRadius: 50 },
  statCardNew: { backgroundColor: THEME.colors.surfaceContainerLow, borderRadius: 24, padding: 24 },
  statValueLarge: { fontFamily: 'Manrope_800ExtraBold', fontSize: 48, color: THEME.colors.onSurface, lineHeight: 54 },
  statLabelLarge: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: THEME.colors.onSurfaceVariant + '80', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  menuItemNew: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderRadius: 20, marginBottom: 12 },
  menuIconBgNew: { width: 44, height: 44, borderRadius: 12, backgroundColor: THEME.colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },

  // Calendar Timeline Styles
  timelineContainer: { padding: THEME.spacing.lg, gap: 8 },
  timelineRow: { flexDirection: 'row', gap: 16 },
  timelineTimeContainer: { width: 50, paddingTop: 4 },
  timelineTimeText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: THEME.colors.onSurfaceVariant + '80' },
  timelineLineContainer: { alignItems: 'center', width: 20 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.colors.primary, marginTop: 8 },
  timelineLine: { flex: 1, width: 2, backgroundColor: THEME.colors.surfaceContainerHighest, marginVertical: 4 },
  eventCard: { flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 },
  eventCardFocus: { borderLeftWidth: 4, borderLeftColor: THEME.colors.primary },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  eventTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: THEME.colors.onSurface, flex: 1, marginRight: 8 },
  eventTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  eventTagText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9 },
  eventFooter: { flexDirection: 'row', gap: 16 },
  eventMetadata: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventMetadataText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: THEME.colors.onSurfaceVariant + '80' },

  weeklyGoalCard: { margin: THEME.spacing.lg, height: 240, borderRadius: 32, overflow: 'hidden', position: 'relative' },
  weeklyGoalImg: { width: '100%', height: '100%' },
  weeklyGoalOverlay: { position: 'absolute', bottom: 24, left: 24, right: 24 },
  weeklyGoalText: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#fff' },

  sparkCard: { margin: THEME.spacing.lg, backgroundColor: THEME.colors.surfaceContainerLow, borderRadius: THEME.radius.xl, padding: THEME.spacing.xl, borderLeftWidth: 4, borderLeftColor: THEME.colors.primary, flexDirection: 'row', alignItems: 'center', gap: 16 },
  sparkContent: { flex: 1 },
  sparkLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: THEME.colors.primary, letterSpacing: 2, marginBottom: 8 },
  sparkQuote: { fontFamily: 'Manrope_400Regular', fontSize: 16, fontStyle: 'italic', color: THEME.colors.onSurface, lineHeight: 24 },
  sparkActions: { flexDirection: 'row', gap: 12 },
  sparkActionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  
  emptyTasksText: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: THEME.colors.onSurfaceVariant, textAlign: 'center', padding: 20 },
});