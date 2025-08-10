import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { togglePOI } from '../redux/slices/navigationSlice';

export default function POIList() {
  const dispatch = useDispatch();
  const landmarks = useSelector((state) => state.navigation.landmarks);
  const selectedPOIs = useSelector((state) => state.navigation.selectedPOIs);

  if (selectedPOIs.length === 0) return null;

  return (
    <View style={styles.poiList}>
      <Text style={styles.poiTitle}>POI sélectionné :</Text>
      {landmarks
        .filter((lm) => selectedPOIs.includes(lm.id))
        .map((lm) => (
          <TouchableOpacity key={lm.id} onPress={() => dispatch(togglePOI(lm.id))}>
            <Text style={styles.poiItem}>
              • {lm.label || lm.name}{' '}
              <Text style={styles.poiRemove}>[X]</Text>
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  poiList: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#ffffffee',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  poiTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
    color: '#2D2D2D',
  },
  poiItem: {
    fontSize: 13,
    color: '#2D2D2D',
    marginBottom: 4,
  },
  poiRemove: {
    color: '#d80404ff',
    fontWeight: 'bold',
  },
});
