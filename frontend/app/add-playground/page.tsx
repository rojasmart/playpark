"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Plus, Star, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

interface PlaygroundData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  equipment: {
    slide: boolean;
    slide_double_deck: boolean;
    swing: boolean;
    seesaw: boolean;
    climb: boolean;
    climbing_net: boolean;
    slider: boolean;
    music: boolean;
  };
  facilities: {
    covered: boolean;
    natural_shade: boolean;
    drinking_water: boolean;
    wheelchair: boolean;
    bench: boolean;
    lighting: boolean;
  };
  surface: string;
  min_age: number;
  max_age: number;
  theme: string;
  rating: number;
  opening_hours: string;
  phone: string;
  website: string;
  fee: boolean;
}

export default function AddPlaygroundPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
  }, [router]);

  const [formData, setFormData] = useState<PlaygroundData>({
    name: "",
    description: "",
    latitude: 0,
    longitude: 0,
    address: "",
    equipment: {
      slide: false,
      slide_double_deck: false,
      swing: false,
      seesaw: false,
      climb: false,
      climbing_net: false,
      slider: false,
      music: false,
    },
    facilities: {
      covered: false,
      natural_shade: false,
      drinking_water: false,
      wheelchair: false,
      bench: false,
      lighting: false,
    },
    surface: "",
    min_age: 1,
    max_age: 12,
    theme: "",
    rating: 0,
    opening_hours: "",
    phone: "",
    website: "",
    fee: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;

    if (name.includes(".")) {
      const [category, field] = name.split(".");
      if (category === "equipment") {
        setFormData((prev) => ({
          ...prev,
          equipment: {
            ...prev.equipment,
            [field]: type === "checkbox" ? checked : value,
          },
        }));
      } else if (category === "facilities") {
        setFormData((prev) => ({
          ...prev,
          facilities: {
            ...prev.facilities,
            [field]: type === "checkbox" ? checked : value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
      }));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          alert("Não foi possível obter a sua localização. Por favor, insira as coordenadas manualmente.");
        }
      );
    } else {
      alert("Geolocalização não é suportada por este navegador.");
    }
  };

  // Função para validar arquivos de imagem
  const validateImageFile = (file: File): string | null => {
    // Verificar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return "Apenas arquivos JPG, JPEG e PNG são permitidos.";
    }

    // Verificar tamanho do arquivo (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      return "O arquivo deve ter no máximo 5MB.";
    }

    return null;
  };

  // Função para selecionar imagens
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Verificar limite máximo de 5 imagens
    const totalImages = selectedImages.length + files.length;
    if (totalImages > 5) {
      alert("Máximo de 5 imagens permitidas.");
      return;
    }

    // Validar cada arquivo
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      const error = validateImageFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert("Erros encontrados:\n" + errors.join("\n"));
      return;
    }

    // Adicionar arquivos válidos
    const newImages = [...selectedImages, ...validFiles];
    setSelectedImages(newImages);

    // Criar previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Limpar input
    event.target.value = "";
  };

  // Função para remover imagem
  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validação básica
      if (!formData.name || !formData.latitude || !formData.longitude) {
        alert("Por favor, preencha os campos obrigatórios: nome, latitude e longitude.");
        return;
      }

      // Criar FormData para enviar arquivos
      const submitData = new FormData();

      // Adicionar dados básicos
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("lat", formData.latitude.toString());
      submitData.append("lng", formData.longitude.toString());

      // Adicionar equipamentos (format: playground_slide: "yes"/"no")
      submitData.append("playground_slide", formData.equipment.slide ? "yes" : "no");
      submitData.append("playground_swing", formData.equipment.swing ? "yes" : "no");
      submitData.append("playground_climbingframe", formData.equipment.climb ? "yes" : "no");

      // Adicionar facilidades
      submitData.append("wheelchair", formData.facilities.wheelchair ? "yes" : "no");
      submitData.append("covered", formData.facilities.covered ? "yes" : "no");
      submitData.append("bench", formData.facilities.bench ? "yes" : "no");
      submitData.append("drinking_water", formData.facilities.drinking_water ? "yes" : "no");

      // Adicionar outros dados
      if (formData.surface) submitData.append("surface", formData.surface);
      if (formData.theme) submitData.append("theme", formData.theme);
      submitData.append("min_age", formData.min_age.toString());
      submitData.append("max_age", formData.max_age.toString());
      if (formData.rating > 0) submitData.append("rating", formData.rating.toString());

      // Adicionar imagens
      selectedImages.forEach((image, index) => {
        submitData.append("images", image);
      });

      // Adicionar userId (pode ser obtido do contexto de autenticação)
      submitData.append("userId", "user_temp_id");

      // Fazer chamada para API
      console.log("Enviando dados:", Array.from(submitData.entries()));

      const response = await fetch("/api/points", {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar parque");
      }

      const result = await response.json();
      console.log("Parque criado:", result);

      alert("Parque adicionado com sucesso! Obrigado pela sua contribuição.");

      // Reset form
      setFormData({
        name: "",
        description: "",
        latitude: 0,
        longitude: 0,
        address: "",
        equipment: {
          slide: false,
          slide_double_deck: false,
          swing: false,
          seesaw: false,
          climb: false,
          climbing_net: false,
          slider: false,
          music: false,
        },
        facilities: {
          covered: false,
          natural_shade: false,
          drinking_water: false,
          wheelchair: false,
          bench: false,
          lighting: false,
        },
        surface: "",
        min_age: 1,
        max_age: 12,
        theme: "",
        rating: 0,
        opening_hours: "",
        phone: "",
        website: "",
        fee: false,
      });

      // Reset imagens
      setSelectedImages([]);
      setImagePreviews([]);
      setCurrentLocation(null);
    } catch (error) {
      console.error("Erro ao adicionar parque:", error);
      alert(`Erro ao adicionar parque: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`w-8 h-8 ${star <= rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 transition-colors`}
          >
            <Star className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 p-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-red-700 hover:text-red-800">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Adicionar Novo Parque</h1>
              <p className="text-gray-600">Contribua para a comunidade adicionando informações sobre um parque infantil</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Parque *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Parque Infantil da Alameda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Alameda dos Oceanos, Lisboa"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva o parque, suas características especiais, estado de conservação, etc."
              />
            </div>
          </div>

          {/* Upload de Imagens */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Imagens do Parque</h2>
            <p className="text-sm text-gray-600 mb-4">Adicione até 5 imagens do parque (JPG, JPEG, PNG - máximo 5MB cada)</p>

            {/* Botão de Upload */}
            <div className="mb-4">
              <input type="file" id="image-upload" multiple accept="image/jpeg,image/jpg,image/png" onChange={handleImageSelect} className="hidden" />
              <label
                htmlFor="image-upload"
                className={`
                  flex flex-col items-center justify-center w-full h-32 border-2 border-dashed 
                  border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 
                  transition-colors ${selectedImages.length >= 5 ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (máx. 5MB) - {selectedImages.length}/5 imagens</p>
                </div>
              </label>
            </div>

            {/* Preview das Imagens */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                    </div>

                    {/* Botão de Remover */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full 
                               flex items-center justify-center text-xs hover:bg-red-600 
                               transform transition-transform hover:scale-110"
                      title="Remover imagem"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* Nome do arquivo (truncado) */}
                    <p className="mt-1 text-xs text-gray-600 truncate" title={selectedImages[index]?.name}>
                      {selectedImages[index]?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Informações sobre as imagens */}
            {selectedImages.length === 0 && (
              <div className="flex items-center justify-center h-20 text-gray-400">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Nenhuma imagem selecionada</p>
                </div>
              </div>
            )}
          </div>

          {/* Localização */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Localização</h2>

            <div className="mb-4">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Usar Localização Atual
              </button>
              {currentLocation && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Localização obtida: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude *</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude ?? ""}
                  onChange={handleInputChange}
                  required
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 38.736946"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude *</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude ?? ""}
                  onChange={handleInputChange}
                  required
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: -9.142685"
                />
              </div>
            </div>
          </div>

          {/* Equipamentos */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipamentos</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries({
                slide: "Escorrega",
                slide_double_deck: "Escorrega 2 Pisos",
                swing: "Baloiços",
                seesaw: "Balancé",
                climb: "Rede",
                climbing_net: "Rede Arborismo",
                slider: "Slider",
                music: "Música",
              }).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name={`equipment.${key}`}
                    checked={formData.equipment[key as keyof typeof formData.equipment]}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Comodidades */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comodidades</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries({
                covered: "Coberto",
                natural_shade: "Sombra c/ Árvores",
                drinking_water: "Bebedouro",
                wheelchair: "Acessível Cadeira Rodas",
                bench: "Bancos",
                lighting: "Iluminação Nocturna",
                public_wc: "WC Público",
                picnic_area: "Zona Piquenique",
                barbecue: "Churrasqueira",
                dog_park: "Parque Canino",
                parking: "Estacionamento",
                kiosk: "Quiosque",
              }).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name={`facilities.${key}`}
                    checked={formData.facilities[key as keyof typeof formData.facilities]}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Detalhes Adicionais */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes Adicionais</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Superfície</label>
                <select
                  name="surface"
                  value={formData.surface}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione a superfície</option>
                  <option value="sand">Areia</option>
                  <option value="grass">Relva</option>
                  <option value="rubber">Borracha</option>
                  <option value="concrete">Betão</option>
                  <option value="wood_chips">Aparas de madeira</option>
                  <option value="artificial_turf">Relva artificial</option>
                  <option value="dirt">Terra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione o tema</option>
                  <option value="car">Carros</option>
                  <option value="airplane">Aviões</option>
                  <option value="boat">Barcos</option>
                  <option value="pirate">Piratas</option>
                  <option value="castle">Castelo</option>
                  <option value="nature">Natureza</option>
                  <option value="space">Espaço</option>
                  <option value="animals">Animais</option>
                  <option value="adventure">Aventura</option>
                  <option value="fantasy">Fantasia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Idade Mínima</label>
                <select
                  name="min_age"
                  value={formData.min_age}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                    <option key={age} value={age}>
                      {age} ano{age > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Idade Máxima</label>
                <select
                  name="max_age"
                  value={formData.max_age}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((age) => (
                    <option key={age} value={age}>
                      {age} ano{age > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avaliação</label>
                {renderStarRating(formData.rating, (rating) => setFormData((prev) => ({ ...prev, rating })))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pago</label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="fee"
                    checked={formData.fee}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Este parque é pago</span>
                </label>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Funcionamento</label>
                <input
                  type="text"
                  name="opening_hours"
                  value={formData.opening_hours}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 08:00-20:00 ou 24/7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: +351 123 456 789"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: https://www.exemplo.com"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>Adicionar Parque</>
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> As informações fornecidas serão enviadas para o OpenStreetMap para contribuir com a base de dados colaborativa.
            Certifique-se de que todas as informações estão corretas antes de submeter.
          </p>
        </div>
      </div>
    </div>
  );
}
