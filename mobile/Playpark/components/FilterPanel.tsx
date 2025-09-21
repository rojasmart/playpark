import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

type Props = {
  filters: Record<string, string>;
  setFilters: (
    f:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
};

export default function FilterPanel({ filters, setFilters }: Props) {
  return (
    <ScrollView horizontal style={styles.container}>
      <TouchableOpacity
        style={[styles.chip, filters.slide && styles.chipActive]}
        onPress={() =>
          setFilters((prev: Record<string, string>) => ({
            ...prev,
            slide: prev.slide ? '' : 'yes',
          }))
        }
      >
        <Text style={styles.chipText}>Escorrega</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.chip, filters.swing && styles.chipActive]}
        onPress={() =>
          setFilters((prev: Record<string, string>) => ({
            ...prev,
            swing: prev.swing ? '' : 'yes',
          }))
        }
      >
        <Text style={styles.chipText}>Baloiço</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.chip, filters.climb && styles.chipActive]}
        onPress={() =>
          setFilters((prev: Record<string, string>) => ({
            ...prev,
            climb: prev.climb ? '' : 'yes',
          }))
        }
      >
        <Text style={styles.chipText}>Escalada</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.chip, filters.covered && styles.chipActive]}
        onPress={() =>
          setFilters((prev: Record<string, string>) => ({
            ...prev,
            covered: prev.covered ? '' : 'yes',
          }))
        }
      >
        <Text style={styles.chipText}>Coberto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  chip: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#0ea5ff' },
  chipText: { color: '#374151', fontWeight: '600' },
});
