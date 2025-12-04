import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from 'react-native-vector-icons/MaterialIcons';

// Minimal ambient for geolocation available on RN environments
declare const navigator: any;
// prefer community geolocation for native permission behavior
import Geolocation from '@react-native-community/geolocation';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';

interface RegisterScreenProps {
  onBack: () => void;
  onSave: (playgroundData: any) => void;
  initialCoords?: { lat?: number; lon?: number } | null;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onBack,
  onSave,
  initialCoords,
}) => {
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
      'Estrutura',
      'Música',
    ],
    Comodidades: [
      'Coberto',
      'Acessível Cadeira Rodas',
      'Sombra c/árvores',
      'Bebedouro',
      'Bancos',
      'Iluminação',
      'WC Público',
      'Zona Piquenique',
      'Churrasqueira',
      'Parque Canino',
      'Estacionamento',
      'Quiosque',
    ],
    'Faixa Etária': ['0-2 anos', '2-5 anos', '5-12 anos', '12+ anos'],
    Superfície: ['Relva', 'Areia', 'Borracha', 'Alcatrão', 'Terra'],
    Tema: [
      'Aventura',
      'Natureza',
      'Desporto',
      'Inclusivo',
      'Música',
      'Avião',
      'Comboio',
      'Barco',
      'Castelo',
      'Espaço',
      'Tradicional',
    ],
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

  // Prefill coordinates when initialCoords is provided
  React.useEffect(() => {
    if (initialCoords) {
      if (typeof initialCoords.lat === 'number')
        setLatitude(String(initialCoords.lat));
      if (typeof initialCoords.lon === 'number')
        setLongitude(String(initialCoords.lon));
    }
  }, [initialCoords]);

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

  const handleUseMyLocation = async () => {
    try {
      // Solicitar permissão explicitamente
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permissão de Localização',
            message:
              'A app precisa da sua localização para preencher as coordenadas',
            buttonNeutral: 'Perguntar Mais Tarde',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permissão Negada',
            'Não foi possível obter a sua localização. Por favor, ative a permissão nas definições.',
          );
          return;
        }
      }

      // Mostrar loading
      console.log('🔍 A obter localização...');

      Geolocation.getCurrentPosition(
        (pos: any) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          setLatitude(String(lat.toFixed(6)));
          setLongitude(String(lon.toFixed(6)));
          console.log('✅ Localização obtida:', { lat, lon });
          Alert.alert(
            'Sucesso! ✅',
            `Localização obtida:\nLat: ${lat.toFixed(6)}\nLon: ${lon.toFixed(
              6,
            )}`,
          );
        },
        (err: any) => {
          console.warn('❌ Erro de geolocalização:', err);
          Alert.alert(
            'Erro',
            `Não foi possível obter a localização.\nCódigo: ${
              err.code
            }\nMensagem: ${
              err.message || 'Desconhecido'
            }\n\nPor favor, verifique se o GPS está ativo.`,
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        },
      );
    } catch (e: any) {
      console.warn('❌ Exceção ao obter localização:', e);
      Alert.alert('Erro', `Falha: ${e.message || 'Erro desconhecido'}`);
    }
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
        <TouchableOpacity onPress={onBack}>
          <Icon name="arrow-back" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adicionar Parque</Text>
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
          <View style={styles.useLocationRow}>
            <TouchableOpacity
              style={styles.useLocationButton}
              onPress={handleUseMyLocation}
            >
              <Text style={styles.useLocationText}>Usar minha localização</Text>
            </TouchableOpacity>
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

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
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
  useLocationRow: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  useLocationButton: {
    backgroundColor: '#0ea5ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  useLocationText: {
    color: '#fff',
    fontWeight: '600',
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
