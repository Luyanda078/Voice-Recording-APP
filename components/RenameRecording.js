import React from 'react';
import { Button, TextInput, View, StyleSheet } from 'react-native';

const RenameRecording = ({ newName, onChangeName, onSave }) => {
  return (
    <View style={styles.renameContainer}>
      <TextInput
        style={styles.renameInput}
        value={newName}
        onChangeText={onChangeName}
        placeholder="Enter new name"
      />
      <Button title="Save" onPress={onSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  renameContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  renameInput: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
    borderColor: '#ccc',
    borderRadius: 5, // Added for a better UI touch
  },
});

export default RenameRecording;
