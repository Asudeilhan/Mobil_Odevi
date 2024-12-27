import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { LineChart } from 'react-native-chart-kit';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientsData, setPatientsData] = useState([]);
  const [testDates, setTestDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedTestForComparison, setSelectedTestForComparison] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) {
      setMessage('Lütfen hasta TC numarası giriniz.');
      return;
    }

    setLoading(true);
    setMessage('');
    setTestDates([]);
    setSelectedDate('');
    setSelectedPatient(null);

    try {
      const patientsRef = collection(db, 'patients');
      const patientQuery = query(patientsRef, where('patientID', '==', searchTerm));
      const patientSnapshot = await getDocs(patientQuery);

      if (!patientSnapshot.empty) {
        const patients = [];
        const dates = [];

        patientSnapshot.forEach((doc) => {
          const data = doc.data();
          let formattedDate = data.date?.toDate?.().toLocaleDateString('tr-TR') || 'Geçersiz Tarih';
          patients.push({ ...data, id: doc.id, formattedDate });
          dates.push(formattedDate);
        });

        setPatientsData(patients);
        setTestDates(dates);
      } else {
        setMessage('Bu TC numarasına ait hasta bulunamadı.');
      }
    } catch (error) {
      console.error('Veri çekme hatası:', error);
      setMessage('Veri getirilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelection = (date) => {
    setSelectedDate(date);

    const filteredPatients = patientsData.filter((p) => p.formattedDate === date);

    if (filteredPatients.length > 0) {
      const combinedPatient = filteredPatients.reduce((acc, patient) => {
        const keys = Object.keys(patient);
        keys.forEach((key) => {
          if (
            patient[key] !== undefined &&
            patient[key] !== null &&
            !isNaN(patient[key]) &&
            acc[key] === undefined
          ) {
            acc[key] = patient[key];
          }
        });
        return acc;
      }, {});
      setSelectedPatient(combinedPatient);
    } else {
      setSelectedPatient(null);
    }
  };

  const openModal = (testName) => {
    setSelectedTestForComparison(testName);
    setModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Hasta Arama</Text>
      <TextInput
        style={styles.input}
        placeholder="Hasta TC Numarası Girin"
        value={searchTerm}
        onChangeText={setSearchTerm}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Ara</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#d01a1a" />}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {testDates.length > 0 && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultHeader}>Test Tarihi Seçin</Text>
          <Picker
            selectedValue={selectedDate}
            onValueChange={(itemValue) => handleDateSelection(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Tarih Seçin" value="" />
            {testDates.map((date, index) => (
              <Picker.Item key={index} label={date} value={date} />
            ))}
          </Picker>

          {selectedPatient && (
            <View>
              <Text style={styles.resultHeader}>Test Sonuçları</Text>
              {['iga', 'igm', 'igg', 'igg1', 'igg2', 'igg3', 'igg4']
                .filter((test) => selectedPatient[test] !== undefined && !isNaN(selectedPatient[test]))
                .map((test) => (
                  <TouchableOpacity
                    key={test}
                    style={styles.card}
                    onPress={() => openModal(test)}
                  >
                    <Text style={styles.cardText}>{test.toUpperCase()}</Text>
                    <Text style={styles.cardValue}>{selectedPatient[test]}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#d01a1a',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
    fontSize: 16,
    width: '100%',
  },
  searchButton: {
    backgroundColor: '#d01a1a',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 20,
  },
  resultHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardValue: {
    fontSize: 16,
    color: '#555',
  },
});

export default SearchPage;
