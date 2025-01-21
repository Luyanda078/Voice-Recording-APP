import React, { useState, useEffect } from 'react';
import { Alert, Platform, FlatList, StyleSheet, View, Text, Button } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecordingItem from './components/RecordingItem';
import RecordingControls from './components/RecordingControls';
import RenameRecording from './components/RenameRecording';
import SearchBar from './components/SearchBar';

const STORAGE_KEY = 'voice_notes'; // Key for AsyncStorage

const VoiceNotesApp = () => {
  const [recordings, setRecordings] = useState([]);
  const [recording, setRecording] = useState(null);
  const [editingRecording, setEditingRecording] = useState(null);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingRecording, setPlayingRecording] = useState(null); // Track currently playing recording

  useEffect(() => {
    if (Platform.OS !== 'web') {
      loadRecordings();
    }
  }, []);

  const saveRecordingsToStorage = async (recordings) => {
    try {
      const jsonValue = JSON.stringify(recordings);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Failed to save recordings to AsyncStorage', error);
    }
  };

  const loadRecordings = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const storedRecordings = jsonValue != null ? JSON.parse(jsonValue) : [];
      setRecordings(storedRecordings);
    } catch (error) {
      console.error('Failed to load recordings from AsyncStorage', error);
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable microphone permissions.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        // Get the duration of the recording
        const status = await recording.getStatusAsync();
        const duration = status.durationMillis / 1000; // Duration in seconds

        const fileName = `${FileSystem.documentDirectory}${new Date().toISOString()}.m4a`;

        if (Platform.OS !== 'web') {
          await FileSystem.moveAsync({ from: uri, to: fileName });

          const newRecording = {
            uri: fileName,
            date: new Date().toISOString(),
            name: 'Untitled',
            duration, // Store the duration
          };
          const updatedRecordings = [...recordings, newRecording];
          setRecordings(updatedRecordings);

          saveRecordingsToStorage(updatedRecordings);
        } else {
          Alert.alert('Not Supported', 'Saving recordings is not supported on the web.');
        }

        setRecording(null);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const deleteRecording = async (uri) => {
    try {
      if (Platform.OS !== 'web') {
        await FileSystem.deleteAsync(uri);
        const updatedRecordings = recordings.filter(
          (recording) => recording.uri !== uri
        );
        setRecordings(updatedRecordings);

        saveRecordingsToStorage(updatedRecordings);
      } else {
        Alert.alert('Not Supported', 'Deleting recordings is not supported on the web.');
      }
    } catch (error) {
      console.error('Failed to delete recording', error);
    }
  };

  const renameRecording = async (uri) => {
    const recordingToRename = recordings.find((rec) => rec.uri === uri);
    setEditingRecording(recordingToRename);
    setNewName(recordingToRename.name);
  };

  const saveRenamedRecording = () => {
    if (editingRecording && newName) {
      const updatedRecordings = recordings.map((rec) =>
        rec.uri === editingRecording.uri
          ? { ...rec, name: newName }
          : rec
      );
      setRecordings(updatedRecordings);
      saveRecordingsToStorage(updatedRecordings);
      setEditingRecording(null);
      setNewName('');
    } else {
      Alert.alert('Invalid Name', 'Please enter a valid name.');
    }
  };

  const playRecording = async (uri) => {
    if (playingRecording) {
      await playingRecording.stopAsync();
      setPlayingRecording(null);
    }

    const sound = new Audio.Sound();
    try {
      await sound.loadAsync({ uri });
      await sound.playAsync();
      setPlayingRecording(sound);
    } catch (error) {
      console.error('Failed to play recording', error);
    }
  };

  const pauseRecording = async () => {
    if (playingRecording) {
      await playingRecording.pauseAsync();
    }
  };

  const filteredRecordings = recordings.filter((recording) =>
    recording.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Notes</Text>

      <SearchBar searchQuery={searchQuery} onSearch={setSearchQuery} />

      <RecordingControls
        recording={recording}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
      />

      {editingRecording && (
        <RenameRecording
          newName={newName}
          onChangeName={setNewName}
          onSave={saveRenamedRecording}
        />
      )}

      {Platform.OS === 'web' ? (
        <Text style={styles.webMessage}>
          Recording functionality is not supported on the web platform.
        </Text>
      ) : (
        <FlatList
          data={filteredRecordings}
          keyExtractor={(item) => item.uri}
          renderItem={({ item }) => (
            <RecordingItem
              item={item}
              onPlay={playRecording}
              onPause={pauseRecording}
              onRename={renameRecording}
              onDelete={deleteRecording}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  webMessage: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
  },
});

export default VoiceNotesApp;
