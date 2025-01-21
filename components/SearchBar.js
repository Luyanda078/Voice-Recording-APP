import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const SearchBar = ({ searchQuery, onSearch }) => (
  <TextInput
    style={styles.searchInput}
    placeholder="Search recordings"
    value={searchQuery}
    onChangeText={onSearch}
  />
);

const styles = StyleSheet.create({
  searchInput: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
    borderColor: '#ccc',
  },
});

export default SearchBar;
