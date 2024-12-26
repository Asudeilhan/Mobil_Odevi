import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TextInput } from 'react-native';
import { db } from '../../firebaseConfig'; 
import { getDocs, collection, addDoc } from 'firebase/firestore';

const LabPage = () => {
  const [patientID, setPatientID] = useState('');
  const [age, setAge] = useState('');
  const [iga, setIga] = useState('');
  const [igm, setIgm] = useState('');
  const [igg, setIgg] = useState('');
  const [igg1, setIgg1] = useState('');
  const [igg2, setIgg2] = useState('');
  const [igg3, setIgg3] = useState('');
  const [igg4, setIgg4] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');

  const fetchGuides = async (numericIga, numericIgm, numericIgg, numericIgg1, numericIgg2, numericIgg3, numericIgg4) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'guides'));
      if (querySnapshot.empty) {
        console.log('Firestore: guides collection is empty');
        return [];
      }

      const guides = [];
      for (const docSnapshot of querySnapshot.docs) {
        const guideData = docSnapshot.data();
        const tests = [];

        const testSnapshot = await getDocs(collection(docSnapshot.ref, 'tests'));
        for (const testDoc of testSnapshot.docs) {
          const testData = testDoc.data();
          const ageGroups = [];

          const ageGroupSnapshot = await getDocs(collection(testDoc.ref, 'ageGroups'));
          for (const ageGroupDoc of ageGroupSnapshot.docs) {
            const ageGroupData = ageGroupDoc.data();

            const [minAge, maxAge] = ageGroupData.ageRange.split('-').map(Number);

            const igaMin = ageGroupData.minValue || null;
            const igaMax = ageGroupData.maxValue || null;
            const igmMin = ageGroupData.minValue || null;
            const igmMax = ageGroupData.maxValue || null;
            const iggMin = ageGroupData.minValue || null;
            const iggMax = ageGroupData.maxValue || null;
            const igg1Min = ageGroupData.minValue || null;
            const igg1Max = ageGroupData.maxValue || null;
            const igg2Min = ageGroupData.minValue || null;
            const igg2Max = ageGroupData.maxValue || null;
            const igg3Min = ageGroupData.minValue || null;
            const igg3Max = ageGroupData.maxValue || null;
            const igg4Min = ageGroupData.minValue || null;
            const igg4Max = ageGroupData.maxValue || null;

            const igaStatus = compareValues(numericIga, igaMin, igaMax);
            const igmStatus = compareValues(numericIgm, igmMin, igmMax);
            const iggStatus = compareValues(numericIgg, iggMin, iggMax);
            const igg1Status = compareValues(numericIgg1, igg1Min, igg1Max);
            const igg2Status = compareValues(numericIgg2, igg2Min, igg2Max);
            const igg3Status = compareValues(numericIgg3, igg3Min, igg3Max);
            const igg4Status = compareValues(numericIgg4, igg4Min, igg4Max);

            ageGroups.push({
              ageRange: ageGroupData.ageRange,
              minValue: minAge,
              maxValue: maxAge,
              igaStatus,
              igmStatus,
              iggStatus,
              igg1Status,
              igg2Status,
              igg3Status,
              igg4Status,
            });
          }

          tests.push({ id: testDoc.id, name: testData.name, ageGroups });
        }

        guides.push({ id: docSnapshot.id, name: guideData.name, tests });
      }

      return guides;
    } catch (error) {
      console.error('Error fetching guides: ', error);
      return [];
    }
  };

  // Değerleri karşılaştıran fonksiyon
  const compareValues = (value, min, max) => {
    if (value === null || value === undefined || min === undefined || max === undefined) {
      return { status: 'Veri Mevcut Değil', color: 'gray', symbol: '↔' };
    }

    if (isNaN(value) || isNaN(min) || isNaN(max)) {
      return { status: 'Geçersiz Değer', color: 'gray', symbol: '↔' };
    }

    if (value < min) {
      return { status: 'Düşük', color: 'green', symbol: '↓' };
    } else if (value > max) {
      return { status: 'Yüksek', color: 'red', symbol: '↑' };
    } else {
      return { status: 'Normal', color: 'blue', symbol: '↔' };
    }
  };

  const handleSubmit = async () => {
    if (!patientID || !iga || !igm || !igg) {
      setMessage('Please fill in all fields.');
      return;
    }
  
    const numericIga = parseFloat(iga);
    const numericIgm = parseFloat(igm);
    const numericIgg = parseFloat(igg);
    const numericIgg1 = parseFloat(igg1);
    const numericIgg2 = parseFloat(igg2);
    const numericIgg3 = parseFloat(igg3);
    const numericIgg4 = parseFloat(igg4);
  
    if (isNaN(numericIga) || isNaN(numericIgm) || isNaN(numericIgg)) {
      setMessage('Please enter valid numbers.');
      return;
    }
  
    try {
      const userSnapshot = await getDocs(collection(db, 'users'));
      const user = userSnapshot.docs.find((doc) => doc.data().tc === patientID);
  
      if (!user) {
        setMessage('User not found.');
        return;
      }
  
      const dob = user.data().dob;
      const birthDate = new Date(dob);
      const currentDate = new Date();
      const numericAge =
        (currentDate.getFullYear() - birthDate.getFullYear()) * 12 +
        (currentDate.getMonth() - birthDate.getMonth());
  
      const guides = await fetchGuides(
        numericIga,
        numericIgm,
        numericIgg,
        numericIgg1,
        numericIgg2,
        numericIgg3,
        numericIgg4
      );
      const evaluationResults = [];
  
      guides.forEach((guide) => {
        const guideResult = {
          guide: guide.name,
          tests: [],
        };
  
        guide.tests.forEach((test) => {
          const ageGroup = test.ageGroups.find(
            (group) => numericAge >= group.minValue && numericAge <= group.maxValue
          );
  
          if (ageGroup) {
            guideResult.tests.push({
              test: test.name,
              ageRange: ageGroup.ageRange,
              igaStatus: ageGroup.igaStatus,
              igmStatus: ageGroup.igmStatus,
              iggStatus: ageGroup.iggStatus,
              igg1Status: ageGroup.igg1Status,
              igg2Status: ageGroup.igg2Status,
              igg3Status: ageGroup.igg3Status,
              igg4Status: ageGroup.igg4Status,
            });
          }
        });
  
        if (guideResult.tests.length > 0) {
          evaluationResults.push(guideResult);
        }
      });
  
      setResults(evaluationResults);
      setMessage('The data was successfully evaluated!');
  
      // Test sonuçlarını saklamak için zaman damgası ekle
      const timestamp = new Date();
  
      const patientRef = await addDoc(collection(db, 'patients'), {
        patientID,
        age: numericAge,
        iga: numericIga,
        igm: numericIgm,
        igg: numericIgg,
        igg1: numericIgg1,
        igg2: numericIgg2,
        igg3: numericIgg3,
        igg4: numericIgg4,
        date: timestamp,
      });
  
      // Test sonuçlarını alt koleksiyon olarak kaydet
      for (const guideResult of evaluationResults) {
        const guideRef = await addDoc(collection(patientRef, 'tests'), {
          guideName: guideResult.guide,
          timestamp,
        });
  
        for (const test of guideResult.tests) {
          await addDoc(collection(guideRef, 'guideResults'), {
            testName: test.test,
            ageRange: test.ageRange,
            igaStatus: test.igaStatus,
            igmStatus: test.igmStatus,
            iggStatus: test.iggStatus,
            igg1Status: test.igg1Status,
            igg2Status: test.igg2Status,
            igg3Status: test.igg3Status,
            igg4Status: test.igg4Status,
          });
        }
      }
  
      setMessage('Data successfully saved to Firestore!');
    } catch (error) {
      setMessage('An error has occurred!');
      console.error(error);
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.header}>Lab Test Login</Text>
      <TextInput
        style={styles.input} placeholder="Hasta ID"
        value={patientID}
        onChangeText={setPatientID}
      />
      <TextInput
        style={styles.input}
        placeholder="IgA Değeri"
        value={iga}
        onChangeText={setIga}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="IgM Değeri"
        value={igm}
        onChangeText={setIgm}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="IgG Değeri"
        value={igg}
        onChangeText={setIgg}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="IgG1 Değeri"
        value={igg1}
        onChangeText={setIgg1}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="IgG2 Değeri"
        value={igg2}
        onChangeText={setIgg2}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="IgG3 Değeri"
        value={igg3}
        onChangeText={setIgg3}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="IgG4 Değeri"
        value={igg4}
        onChangeText={setIgg4}
        keyboardType="numeric"
      />
      <Button title="Save and Evaluate" onPress={handleSubmit} />
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          {results.map((guideResult, index) => (
            <View key={index} style={styles.resultCard}>
              <Text style={styles.resultHeader}>{guideResult.guide}</Text>
              {guideResult.tests.map((test, testIndex) => (
                <View key={testIndex} style={styles.testStatus}>
                  <Text style={styles.resultHeader}>{test.test} - {test.ageRange}</Text>
                  {/* IgA, IgM, IgG, vb. testler için sembol ve renk gösterimi */}
                  {test.test === "IgA" && (
                <>
                  {test.iga && <Text>IgA: {test.iga}</Text>}
                  <Text style={{ color: test.igaStatus.color }}>
                    {test.igaStatus.symbol} {test.igaStatus.status}
                  </Text>
                </>
              )}

              {test.test === "IgM" && (
                <>
                  {test.igm && <Text>IgM: {test.igm}</Text>}
                  <Text style={{ color: test.igmStatus.color }}>
                    {test.igmStatus.symbol} {test.igmStatus.status}
                  </Text>
                </>
              )}

               {test.test === "IgG" && (
                <>
                  {test.igg && <Text>IgG: {test.igg}</Text>}
                  <Text style={{ color: test.igaStatus.color }}>
                    {test.iggStatus.symbol} {test.iggStatus.status}
                  </Text>
                </>
              )}

                {test.test === "IgG1" && (
                <>
                  {test.igg1 && <Text>IgG1: {test.igg1}</Text>}
                  <Text style={{ color: test.igg1Status.color }}>
                    {test.igg1Status.symbol} {test.igg1Status.status}
                  </Text>
                </>
              )}

                {test.test === "IgG2" && (
                <>
                  {test.igg2 && <Text>IgG2: {test.igg2}</Text>}
                  <Text style={{ color: test.igg2Status.color }}>
                    {test.igg2Status.symbol} {test.igg2Status.status}
                  </Text>
                </>
              )}

              {test.test === "IgG3" && (
                <>
                  {test.igg3 && <Text>IgG3: {test.igg3}</Text>}
                  <Text style={{ color: test.igg3Status.color }}>
                    {test.igg3Status.symbol} {test.igg3Status.status}
                  </Text>
                </>
              )}

                {test.test === "IgG4" && (
                <>
                  {test.igg4 && <Text>IgG4: {test.igg4}</Text>}
                  <Text style={{ color: test.igg4Status.color }}>
                    {test.igg4Status.symbol} {test.igg4Status.status}
                  </Text>
                </>
              )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    width: '100%',
  },
  message: {
    marginTop: 20,
    textAlign: 'center',
    color: 'green',
  },
  resultsContainer: {
    marginTop: 20,
    width: '100%',
  },
  resultCard: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  resultHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  testStatus: {
    marginTop: 10,
  },
});

export default LabPage;