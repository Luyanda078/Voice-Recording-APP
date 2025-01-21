import React from 'react';
import { Button, StyleSheet, View } from 'react-native';

const RecordingControls = ({ recording, onStartRecording, onStopRecording }) => (
  <View style={styles.controls}>
    <Button
      title={recording ? 'Stop Recording' : 'Start Recording'}
      onPress={recording ? onStopRecording : onStartRecording}
    />
  </View>
);

const styles = StyleSheet.create({
  controls: {
    marginBottom: 20,
    alignItems: 'center',
  },
});

export default RecordingControls;
