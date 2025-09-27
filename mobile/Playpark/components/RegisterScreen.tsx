import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
} from 'react-native';

interface RegisterScreenProps {
  onBack: () => void;
  onSave: (playgroundData: any) => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBack, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

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

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAddPhoto = () => {
    // TODO: Implementar seleção de fotos da galeria ou câmera
    Alert.alert(
      'Funcionalidade',
      'Seleção de fotos será implementada em breve',
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do parque');
      return;
    }

    const playgroundData = {
      name: name.trim(),
      description: description.trim(),
      photos,
      amenities: selectedAmenities,
    };

    onSave(playgroundData);
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registar Parque</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Nome do Parque */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nome do Parque *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Digite o nome do parque"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Morada do Parque */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morada do Parque *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Digite a morada do parque"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Descreva o parque (opcional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Fotos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotos</Text>
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={handleAddPhoto}
          >
            <Text style={styles.addPhotoText}>+ Adicionar Foto</Text>
          </TouchableOpacity>
          {photos.length > 0 && (
            <View style={styles.photosContainer}>
              {photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photoPreview}
                />
              ))}
            </View>
          )}
        </View>
        {/*Localização do Parque */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização do Parque *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Digite a localização do parque"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Comodidades por Categoria */}
        {Object.entries(filterCategories).map(([category, items]) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            <View style={styles.amenitiesGrid}>
              {items.map((item: string) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.amenityChip,
                    selectedAmenities.includes(item) &&
                      styles.amenityChipSelected,
                  ]}
                  onPress={() => toggleAmenity(item)}
                >
                  <Text
                    style={[
                      styles.amenityText,
                      selectedAmenities.includes(item) &&
                        styles.amenityTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    padding: 5,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addPhotoButton: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#f8fff8',
  },
  addPhotoText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  amenityChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
  },
  amenityTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default RegisterScreen;
