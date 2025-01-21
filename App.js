import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'voice_notes'; // Key for AsyncStorage

const VoiceNotesApp = () => {
  const [recordings, setRecordings] = useState([]);
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    // Load recordings from AsyncStorage and file system
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
        const fileName = `${FileSystem.documentDirectory}${new Date().toISOString()}.m4a`;

        if (Platform.OS !== 'web') {
          await FileSystem.moveAsync({ from: uri, to: fileName });

          const newRecording = { uri: fileName, date: new Date().toISOString() };
          const updatedRecordings = [...recordings, newRecording];
          setRecordings(updatedRecordings);

          // Save to AsyncStorage
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

        // Update AsyncStorage
        saveRecordingsToStorage(updatedRecordings);
      } else {
        Alert.alert('Not Supported', 'Deleting recordings is not supported on the web.');
      }
    } catch (error) {
      console.error('Failed to delete recording', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.recordingItem}>
      <Text>{new Date(item.date).toLocaleString()}</Text>
      <View style={styles.actions}>
        <Button
          title="Play"
          onPress={async () => {
            const sound = new Audio.Sound();
            try {
              await sound.loadAsync({ uri: item.uri });
              await sound.playAsync();
            } catch (error) {
              console.error('Failed to play recording', error);
            }
          }}
        />
        <Button
          title="Delete"
          color="red"
          onPress={() => deleteRecording(item.uri)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Notes</Text>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
      {Platform.OS === 'web' ? (
        <Text style={styles.webMessage}>
          Recording functionality is not supported on the web platform.
        </Text>
      ) : (
        <FlatList
          data={recordings}
          keyExtractor={(item) => item.uri}
          renderItem={renderItem}
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
  recordingItem: {
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  webMessage: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
  },
});

export default VoiceNotesApp;
