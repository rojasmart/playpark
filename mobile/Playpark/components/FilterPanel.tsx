import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface FilterPanelProps {
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
}

const EQUIPMENT_FILTERS = [
  { key: 'playground:slide', label: 'Escorrega' },
  { key: 'playground:slide_2floor', label: 'Escorrega 2 pisos' },
  { key: 'playground:swing', label: 'Baloiços' },
  { key: 'playground:seesaw', label: 'Balancé' },
  { key: 'playground:climbingframe', label: 'Rede' },
  { key: 'playground:climbing_tree', label: 'Rede Arborismo' },
  { key: 'playground:zipline', label: 'Slider' },
  { key: 'playground:music', label: 'Música' },
];

const AMENITIES_FILTERS = [
  { key: 'covered', label: 'Coberto' },
  { key: 'wheelchair', label: 'Acessível Cadeira Rodas' },
  { key: 'natural_shade', label: 'Sombra c/árvores' },
  { key: 'drinking_water', label: 'Bebedouro' },
  { key: 'bench', label: 'Bancos' },
];

const AGE_RANGES = [
  { key: 'age_0_3', label: '0-3 anos' },
  { key: 'age_3_6', label: '3-6 anos' },
  { key: 'age_6_12', label: '6-12 anos' },
  { key: 'age_12_plus', label: '12+ anos' },
];

const SURFACE_TYPES = [
  { key: 'surface_rubber', label: 'Borracha' },
  { key: 'surface_sand', label: 'Areia' },
  { key: 'surface_grass', label: 'Relva' },
  { key: 'surface_concrete', label: 'Betão' },
  { key: 'surface_wood', label: 'Madeira' },
];

const THEMES = [
  { key: 'theme_nature', label: 'Natureza' },
  { key: 'theme_adventure', label: 'Aventura' },
  { key: 'theme_pirates', label: 'Piratas' },
  { key: 'theme_castle', label: 'Castelo' },
  { key: 'theme_space', label: 'Espaço' },
];

export default function FilterPanel({ filters, setFilters }: FilterPanelProps) {
  const toggleFilter = (key: string) => {
    setFilters({
      ...filters,
      [key]: filters[key] === 'yes' ? undefined : 'yes',
    });
  };

  const setRadius = (value: string) => {
    setFilters({
      ...filters,
      radius: value,
    });
  };

  const toggleRating = (rating: number) => {
    const key = `min_rating_${rating}`;
    setFilters({
      ...filters,
      [key]: filters[key] ? undefined : 'yes',
    });
  };

  const renderFilterSection = (
    title: string,
    filterList: Array<{ key: string; label: string }>,
  ) => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipGrid}>
        {filterList.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              filters[filter.key] === 'yes' && styles.filterChipActive,
            ]}
            onPress={() => toggleFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filters[filter.key] === 'yes' && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Location & Radius */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Localização e Raio</Text>
        <View style={styles.locationRow}>
          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.locationButtonText}>Minha Localização</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.radiusRow}>
          {['500', '1000', '2000', '5000', '10000', '20000'].map(radius => (
            <TouchableOpacity
              key={radius}
              style={[
                styles.radiusChip,
                filters.radius === radius && styles.radiusChipActive,
              ]}
              onPress={() => setRadius(radius)}
            >
              <Text
                style={[
                  styles.radiusChipText,
                  filters.radius === radius && styles.radiusChipTextActive,
                ]}
              >
                {parseInt(radius) < 1000
                  ? `${radius}m`
                  : `${parseInt(radius) / 1000}km`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Equipment */}
      {renderFilterSection('Equipamentos', EQUIPMENT_FILTERS)}

      {/* Rating */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>⭐ Avaliação</Text>
        <View style={styles.chipGrid}>
          {[1, 2, 3, 4, 5].map(rating => (
            <TouchableOpacity
              key={`rating_${rating}`}
              style={[
                styles.filterChip,
                filters[`min_rating_${rating}`] && styles.filterChipActive,
              ]}
              onPress={() => toggleRating(rating)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filters[`min_rating_${rating}`] &&
                    styles.filterChipTextActive,
                ]}
              >
                {rating}⭐+
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Amenities */}
      {renderFilterSection('Comodidades', AMENITIES_FILTERS)}

      {/* Age Range */}
      {renderFilterSection('Faixa Etária', AGE_RANGES)}

      {/* Surface */}
      {renderFilterSection('Tipo de Superfície', SURFACE_TYPES)}

      {/* Theme */}
      {renderFilterSection('Tema', THEMES)}

      {/* Clear Filters */}
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => setFilters({})}
      >
        <Text style={styles.clearButtonText}>Limpar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
    paddingVertical: 8,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  filterChipActive: {
    backgroundColor: '#0ea5ff',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  locationRow: {
    marginBottom: 12,
  },
  locationButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  radiusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  radiusChipActive: {
    backgroundColor: '#0ea5ff',
    borderColor: '#0ea5ff',
  },
  radiusChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  radiusChipTextActive: {
    color: '#fff',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
