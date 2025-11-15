import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FilterScreenProps {
  onBack: () => void;
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
}

const FilterScreen: React.FC<FilterScreenProps> = ({
  onBack,
  filters,
  onFiltersChange,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const filterCategories = {
    Equipamentos: [
      'Escorrega',
      'Escorrega 2 pisos',
      'Baloiços',
      'Balancé',
      'Rede',
      'Rede Arborismo',
      'Slider',
      'Música',
    ],
    Avaliação: ['⭐ 1+', '⭐ 2+', '⭐ 3+', '⭐ 4+', '⭐ 5'],
    Comodidades: [
      'Coberto',
      'Acessível Cadeira Rodas',
      'Sombra c/árvores',
      'Bebedouro',
      'Bancos',
    ],
    'Faixa Etária': ['0-2 anos', '2-5 anos', '5-12 anos', '12+ anos'],
    Superfície: ['Relva', 'Areia', 'Borracha', 'Alcatrão', 'Terra'],
    Tema: ['Aventura', 'Natureza', 'Desporto', 'Inclusivo', 'Tradicional'],
  };

  const toggleFilter = (category: string, item: string) => {
    const categoryKey = category.toLowerCase();
    const currentCategoryFilters = localFilters[categoryKey] || [];

    let newFilters;
    if (currentCategoryFilters.includes(item)) {
      newFilters = currentCategoryFilters.filter((f: string) => f !== item);
    } else {
      newFilters = [...currentCategoryFilters, item];
    }

    setLocalFilters({
      ...localFilters,
      [categoryKey]: newFilters,
    });
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onBack();
  };

  const clearAllFilters = () => {
    setLocalFilters({});
  };

  const isFilterActive = (category: string, item: string) => {
    const categoryKey = category.toLowerCase();
    return (localFilters[categoryKey] || []).includes(item);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtros</Text>
        <TouchableOpacity onPress={clearAllFilters} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Content */}
      <ScrollView style={styles.content}>
        {Object.entries(filterCategories).map(([category, items]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.filtersGrid}>
              {items.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterChip,
                    isFilterActive(category, item) && styles.filterChipActive,
                  ]}
                  onPress={() => toggleFilter(category, item)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isFilterActive(category, item) &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Radius Slider Section */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>Raio de Pesquisa</Text>
          <View style={styles.radiusContainer}>
            <Text style={styles.radiusText}>1 km</Text>
            <View style={styles.slider}>
              <View style={styles.sliderTrack} />
              <View style={styles.sliderThumb} />
            </View>
            <Text style={styles.radiusText}>10 km</Text>
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    backgroundColor: '#d7d7d7ff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#000',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  clearButtonText: {
    fontSize: 16,
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryContainer: {
    marginVertical: 15,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterChipActive: {
    backgroundColor: '#c10007',
    borderColor: '#c10007',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  radiusText: {
    fontSize: 14,
    color: '#666',
  },
  slider: {
    flex: 1,
    height: 20,
    marginHorizontal: 15,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    left: '30%',
    width: 20,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    marginTop: -8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    backgroundColor: '#c10007',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FilterScreen;
