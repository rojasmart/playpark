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
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';

interface RegisterScreenProps {
  onBack: () => void;
  onSave: (playgroundData: any) => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBack, onSave }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
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

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permissão da Câmera',
            message: 'Esta app precisa de acesso à câmera para tirar fotos',
            buttonNeutral: 'Perguntar Mais Tarde',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleAddPhoto = () => {
    Alert.alert('Selecionar Foto', 'Escolha uma opção', [
      { text: 'Câmera', onPress: () => openCamera() },
      { text: 'Galeria', onPress: () => openGallery() },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Erro', 'Permissão da câmera necessária');
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as const,
      maxWidth: 1200,
      maxHeight: 1200,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          setPhotos([...photos, imageUri]);
        }
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as const,
      maxWidth: 1200,
      maxHeight: 1200,
      selectionLimit: 5, // Máximo 5 fotos
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets) {
        const newPhotos = response.assets
          .map(asset => asset.uri)
          .filter(uri => uri !== undefined) as string[];
        setPhotos([...photos, ...newPhotos]);
      }
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do parque');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Erro', 'Por favor, insira a morada do parque');
      return;
    }

    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert(
        'Erro',
        'Por favor, insira as coordenadas (latitude e longitude)',
      );
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert(
        'Erro',
        'Coordenadas inválidas. Use números com ponto decimal (ex: 38.7223)',
      );
      return;
    }

    const playgroundData = {
      name: name.trim(),
      address: address.trim(),
      latitude: lat,
      longitude: lng,
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
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* Coordenadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coordenadas *</Text>
          <View style={styles.coordinatesContainer}>
            <TextInput
              style={[styles.textInput, styles.coordinateInput]}
              placeholder="Latitude (ex: 38.7223)"
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.textInput, styles.coordinateInput]}
              placeholder="Longitude (ex: -9.1393)"
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numeric"
            />
          </View>
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
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photoPreview} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Text style={styles.removePhotoText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
  coordinatesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  coordinateInput: {
    flex: 1,
  },
  photoContainer: {
    position: 'relative',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 14,
  },
});

export default RegisterScreen;
