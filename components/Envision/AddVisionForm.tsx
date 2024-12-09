import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import EmojiSelector from 'react-native-emoji-selector'; // You might need to install this package
import { insertNewVision } from '@/lib/supabase_envision';
import { useGlobalContext } from '@/context/Context'
import { getUserHabits } from '@/lib/supabase_habits';
import { Habit } from '@/types/types';
import { color } from '@rneui/themed/dist/config';
import { KeyboardAvoidingView, Platform } from 'react-native';


export interface Vision {
  name: string;
  emoji: string;
  habit_names: string[];
  tags: string[];
}

interface SelectedHabit {
  id: string;
  name: string;
}

const dummyHabits = [
  'Morning Meditation', 'Daily Exercise', 'Read 30 Minutes', 
  'Drink Water', 'Healthy Eating', 'Journal Writing'
];

const AddVisionForm: React.FC<{ closeModal?: () => void }> = ({ closeModal }) => {
  const { user, isLoading } = useGlobalContext();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<SelectedHabit[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isEmojiSelectorVisible, setIsEmojiSelectorVisible] = useState(false);
  const [habits, setHabits] = useState<Habit[]>()
  const [description, setDescription] = useState('')

  const fetchHabits = async ()=>{
    const data = await getUserHabits(user.userId)
    setHabits(data)
  }
  useEffect(()=>{
    fetchHabits()

  }, [])

  const handleAddTag = () => {
    if (newTag.trim() !== '') {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  

  const handleSubmit = () => {
    insertNewVision(name, emoji, selectedHabits,user.userId, tags)
    setName('')
    setEmoji('')
    setSelectedHabits([])
    setTags([])
    
    if (closeModal) {
      closeModal();
    }
  };

  const handleEmojiSelect = (selectedEmoji: string) => {
    setEmoji(selectedEmoji);
    setIsEmojiSelectorVisible(false);
  };

  if(!habits){
    return(
      <View></View>
    )
  }
  else{
  return (
    <KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  style={{ flex: 1 }}
>
    <ScrollView style={styles.container}>
      <View style={{marginBottom:5}}>
      <Text style={styles.visionTitle}>
        Vision Name
      </Text>
      </View>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Keep it Short & Powerful"
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity 
          style={styles.emojiButton} 
          onPress={() => setIsEmojiSelectorVisible(true)}
        >
          <Text style={{
            color:'white'

          }}>{emoji || 'Select Emoji'}</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={isEmojiSelectorVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsEmojiSelectorVisible(false)}
            >
              <Text style={{color:'white'}}>Close</Text>
            </TouchableOpacity>
            <EmojiSelector
              onEmojiSelected={handleEmojiSelect}
              columns={8}
            />
          </View>
        </View>
      </Modal>

      <View style={{marginBottom: 10}}>
      <Text style={styles.label}>Associate Habits:</Text>
      {habits.map((habit) => (
        <TouchableOpacity
          key={habit.id}
          style={styles.habitItem}
          onPress={() => {
            setSelectedHabits(
              selectedHabits.some(h => h.id === habit.id)
                ? selectedHabits.filter((h) => h.id !== habit.id)
                : [...selectedHabits, { id: habit.id, name: habit.name }]
            );
          }}
        >
          <Text>{habit.name}</Text>
          {selectedHabits.some(h => h.id === habit.id) && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      ))}
    </View>

    {/** 

      <Text style={styles.label}>Tags:</Text>
      <View style={styles.tagContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text>{tag}</Text>
          </View>
        ))}
      </View>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="New Tag"
          value={newTag}
          onChangeText={setNewTag}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
          <Text>+</Text>
        </TouchableOpacity>
      </View>
      */}

<View style={{ marginBottom: 5, marginTop: 5 }}>
  <Text style={styles.visionTitle}>
    Add a Description for your Vision
  </Text>
</View>
<View style={styles.row}>
<TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Provide a detailed description of your Vision"
          placeholderTextColor={"#898989"}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
</View>



      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create Vision</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>

  );
}};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  visionTitle:{
    fontSize:16,
    fontWeight:'bold'

  },
  textArea: {
    height: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
  },
  
  description: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 20,
    marginRight: 10,
    height: 120, // Specify height for the TextInput
    textAlignVertical: 'top', // Align text to the top of the box
  },
  emojiButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius:10,
    backgroundColor:'#8BBDFA'
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  checkmark: {
    color: 'green',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    padding: 5,
    margin: 2,
    borderRadius: 5,
  },
  addButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#3e4e88',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
    
  },
  closeButton: {
    alignSelf: 'center',
    padding: 10,
    backgroundColor: 'black',
    borderRadius: 5,
  },
});

export default AddVisionForm;