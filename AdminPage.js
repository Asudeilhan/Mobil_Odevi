import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { db } from '../../firebaseConfig'; // Firebase config dosyanızın yolu
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import guidesData from '../../klavuz-verileri.json'; // JSON dosyanızı projenize ekleyin

const AdminPage = () => {
  // State Değişkenleri
  const [klavuzName, setKlavuzName] = useState('');
  const [klavuzCreated, setKlavuzCreated] = useState(false);
  const [ageRanges, setAgeRanges] = useState([]);
  const [currentAgeRange, setCurrentAgeRange] = useState('');

  // İmmünoglobulin Tipleri
  const immunoglobulinTypes = ['IgA', 'IgM', 'IgG', 'IgG1', 'IgG2', 'IgG3', 'IgG4'];

  // Mevcut Kan Değerleri için Min ve Max
  const [currentValues, setCurrentValues] = useState(
    immunoglobulinTypes.reduce((acc, type) => {
      acc[type] = { min: '', max: '' };
      return acc;
    }, {})
  );

  // Klavuz adı ekle
  const handleCreateKlavuz = () => {
    if (!klavuzName.trim()) {
      Alert.alert('Hata', 'Kılavuz adı giriniz');
      return;
    }
    setKlavuzCreated(true); // Klavuz oluşturulmuş oldu
  };

  // Yeni Yaş Aralığı Ekleme
  const addNewAgeRange = () => {
    setAgeRanges([
      ...ageRanges,
      {
        ageRange: '',
        immunoglobulins: immunoglobulinTypes.reduce((acc, type) => {
          acc[type] = { min: '', max: '' };
          return acc;
        }, {}),
      },
    ]);
  };

  // Yaş Aralığını Silme
  const removeAgeRange = (index) => {
    const updatedAgeRanges = [...ageRanges];
    updatedAgeRanges.splice(index, 1);
    setAgeRanges(updatedAgeRanges);
  };

  // Yaş Aralığı ve Kan Değerlerini Güncelleme
  const updateAgeRange = (index, field, value) => {
    const updatedAgeRanges = [...ageRanges];
    if (field.startsWith('immunoglobulin')) {
      const [_, type, key] = field.split('_'); // e.g., immunoglobulin_IgA_min
      updatedAgeRanges[index].immunoglobulins[type][key] = value;
    } else if (field === 'ageRange') {
      updatedAgeRanges[index].ageRange = value;
    }
    setAgeRanges(updatedAgeRanges);
  };

  // Veriyi Firebase Firestore'a kaydet
  const saveKlavuzToFirebase = async () => {
    if (!klavuzName.trim() || ageRanges.length === 0) {
      Alert.alert('Hata', 'Kılavuz adı ve yaş aralıkları eksik!');
      return;
    }

    // Tüm yaş aralıklarının ve kan değerlerinin geçerli olup olmadığını kontrol et
    for (let i = 0; i < ageRanges.length; i++) {
      const ageRange = ageRanges[i];
      if (!ageRange.ageRange.trim()) {
        Alert.alert('Hata', `Yaş aralığı ${i + 1}. sırada boş bırakılamaz.`);
        return;
      }
      for (let type of immunoglobulinTypes) {
        const { min, max } = ageRange.immunoglobulins[type];
        if (min === '' || max === '') {
          Alert.alert(
            'Hata',
            `${type} için min ve max değerleri giriniz (Yaş aralığı: ${ageRange.ageRange}).`
          );
          return;
        }
        if (isNaN(min) || isNaN(max)) {
          Alert.alert(
            'Hata',
            `${type} için geçerli bir sayı giriniz (Yaş aralığı: ${ageRange.ageRange}).`
          );
          return;
        }
      }
    }

    try {
      // Yeni bir kılavuz ekle
      const klavuzRef = await addDoc(collection(db, 'guides'), {
        name: klavuzName.trim(),
      });

      // Her immünoglobulin tipi için test ekle
      for (let type of immunoglobulinTypes) {
        const testRef = await addDoc(collection(db, 'guides', klavuzRef.id, 'tests'), {
          name: type,
        });

        // Her yaş aralığı için ageGroup ekle
        for (let ageRange of ageRanges) {
          await setDoc(
            doc(collection(db, 'guides', klavuzRef.id, 'tests', testRef.id, 'ageGroups')),
            {
              ageRange: ageRange.ageRange.trim(),
              minValue: parseFloat(ageRange.immunoglobulins[type].min),
              maxValue: parseFloat(ageRange.immunoglobulins[type].max),
            }
          );
        }
      }

      Alert.alert('Başarılı', 'Kılavuz ve yaş aralıkları Firestore\'a kaydedildi!');

      // Formu sıfırlama
      setKlavuzName('');
      setKlavuzCreated(false);
      setAgeRanges([]);
    } catch (error) {
      console.error('Firestore kaydetme hatası:', error);
      Alert.alert('Hata', 'Kılavuz veritabanına kaydedilemedi.');
    }
  };

  // JSON'dan Kılavuzları Firestore'a Yükleme
  const uploadGuidesToFirestore = async () => {
    try {
      // Kılavuzların her biri için döngü
      for (const guide of guidesData.guides) {
        // 1. Guide ekle
        const guideRef = await addDoc(collection(db, 'guides'), {
          name: guide.name,
          description: guide.description,
          unit: guide.unit,
        });
        //console.log(`Kılavuz eklendi: ${guide.name}`);

        // Kılavuz içindeki testler için döngü
        for (const test of guide.testTypes) {
          // 2. Test ekle
          const testRef = await addDoc(collection(db, 'guides', guideRef.id, 'tests'), {
            name: test.name,
          });
          //console.log(`Test ekledi: ${test.name}`);

          // Test içindeki yaş grupları için döngü
          for (const ageGroup of test.ageGroups) {
            // Test adını küçük harfe çevirerek JSON'daki alan adlarına erişiyoruz (örn: IgA -> igaMin)
            const testKey = test.name.toLowerCase();

            // JSON'daki ilgili min ve max değerlerini alıyoruz
            const minField = `${testKey}Min`;
            const maxField = `${testKey}Max`;

            await setDoc(
              doc(collection(db, 'guides', guideRef.id, 'tests', testRef.id, 'ageGroups')),
              {
                ageRange: ageGroup.ageRange,
                minValue:
                  typeof ageGroup[minField] === 'number'
                    ? ageGroup[minField]
                    : parseFloat(ageGroup[minField]) || null,
                maxValue:
                  typeof ageGroup[maxField] === 'number'
                    ? ageGroup[maxField]
                    : parseFloat(ageGroup[maxField]) || null,
              }
            );
            //console.log(`Yaş grubu eklendi: ${ageGroup.ageRange}`);
          }
        }
      }
      console.log('JSON verileri başarıyla yüklendi!');
      Alert.alert('Başarılı', 'JSON verileri Firestore\'a yüklendi!');
    } catch (error) {
      console.error('JSON yükleme sırasında hata oluştu:', error);
      Alert.alert('Hata', 'JSON yükleme sırasında bir hata oluştu.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Klavuz adı girme */}
      {!klavuzCreated ? (
        <View>
          <TextInput
            value={klavuzName}
            onChangeText={setKlavuzName}
            placeholder="Kılavuz Adı"
            style={styles.input}
          />
          <Button title="Kılavuz Ekle" onPress={handleCreateKlavuz} />
          <View style={styles.uploadButtonContainer}>
            <Button title="JSON'dan Kılavuzları Yükle" onPress={uploadGuidesToFirestore} />
          </View>
        </View>
      ) : (
        <View>
          {/* Yaş Aralığı Ekleme */}
          <Text style={styles.sectionTitle}>Yaş Aralığı Ekle:</Text>
          {ageRanges.map((ageRange, index) => (
            <View key={index} style={styles.ageRangeContainer}>
              <View style={styles.ageRangeHeader}>
                <TextInput
                  value={ageRange.ageRange}
                  onChangeText={(value) => updateAgeRange(index, 'ageRange', value)}
                  placeholder="Yaş Aralığı (Örn: 0-10)"
                  style={[styles.input, styles.ageRangeInput]}
                />
                <TouchableOpacity onPress={() => removeAgeRange(index)} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>Sil</Text>
                </TouchableOpacity>
              </View>

              {/* İmmünoglobulin Değerleri */}
              {immunoglobulinTypes.map((type) => (
                <View key={type} style={styles.immunoglobulinContainer}>
                  <Text style={styles.immunoglobulinTitle}>{type}:</Text>
                  <TextInput
                    value={ageRange.immunoglobulins[type].min}
                    onChangeText={(value) => updateAgeRange(index, `immunoglobulin_${type}_min`, value)}
                    placeholder={`${type} Min`}
                    keyboardType="numeric"
                    style={styles.minMaxInput}
                  />
                  <TextInput
                    value={ageRange.immunoglobulins[type].max}
                    onChangeText={(value) => updateAgeRange(index, `immunoglobulin_${type}_max`, value)}
                    placeholder={`${type} Max`}
                    keyboardType="numeric"
                    style={styles.minMaxInput}
                  />
                </View>
              ))}
            </View>
          ))}

          {/* Yeni Yaş Aralığı Ekle Butonu */}
          <Button title="Yeni Yaş Aralığı Ekle" onPress={addNewAgeRange} />

          {/* Eklenen Yaş Aralıkları Listesi */}
          {ageRanges.length > 0 && (
            <View style={styles.ageRangeList}>
              <Text style={styles.sectionTitle}>Eklenen Yaş Aralıkları:</Text>
              {ageRanges.map((ageRange, index) => (
                <View key={index} style={styles.ageRangeItem}>
                  <View style={styles.ageRangeHeader}>
                    <Text style={styles.ageRangeText}>{ageRange.ageRange}</Text>
                    <TouchableOpacity onPress={() => removeAgeRange(index)}>
                      <Text style={styles.removeButton}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.ageRangeDetails}>
                    {immunoglobulinTypes
                      .map(
                        (type) =>
                          `${type}: ${ageRange.immunoglobulins[type].min}-${ageRange.immunoglobulins[type].max}`
                      )
                      .join(', ')}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Kaydetme Butonu */}
          <Button title="Kaydet" onPress={saveKlavuzToFirebase} />

          {/* İptal Etme Butonu */}
          <View style={{ marginTop: 10 }}>
            <Button
              title="İptal Et"
              color="red"
              onPress={() => {
                setKlavuzName('');
                setKlavuzCreated(false);
                setAgeRanges([]);
              }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  ageRangeContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  ageRangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ageRangeInput: {
    flex: 1,
  },
  removeButton: {
    marginLeft: 10,
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  immunoglobulinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  immunoglobulinTitle: {
    width: 60,
    fontSize: 16,
  },
  minMaxInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 5,
    flex: 1,
  },
  ageRangeList: {
    marginVertical: 20,
  },
  ageRangeItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: '#f1f1f1',
  },
  ageRangeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ageRangeDetails: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  uploadButtonContainer: {
    marginTop: 20,
  },
});

export default AdminPage;
