import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // FontAwesome icons

const RecordingItem = ({ item, onPlay, onPause, onRename, onDelete }) => {
  // Convert the duration from seconds to a readable format (mm:ss)
  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.recordingItem}>
      <Text style={styles.name}>{item.name || 'Untitled'}</Text> {/* Name */}
      <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text> {/* Date */}
      <Text style={styles.duration}>
        Duration: {formatDuration(item.duration)}
      </Text> {/* Duration */}
      <View style={styles.actions}>
        {/* Play Button */}
        <TouchableOpacity onPress={() => onPlay(item.uri)}>
          <Icon name="play" size={30} color="black" />
        </TouchableOpacity>
        {/* Pause Button */}
        <TouchableOpacity onPress={onPause}>
          <Icon name="pause" size={30} color="black" />
        </TouchableOpacity>
        {/* Rename Button */}
        <TouchableOpacity onPress={() => onRename(item.uri)}>
          <Icon name="edit" size={30} color="black" />
        </TouchableOpacity>
        {/* Delete Button */}
        <TouchableOpacity onPress={() => onDelete(item.uri)}>
          <Icon name="trash" size={30} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  recordingItem: {
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  duration: {
    fontSize: 14,
    color: '#444',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default RecordingItem;
