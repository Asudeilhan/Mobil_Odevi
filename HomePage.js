import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView,} from 'react-native';

const HomePage = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
       source={require('../../assets/images/kantupleri.webp')}
        style={styles.banner}
      />
      <Text style={styles.title}>LabConnect</Text>
      <Text style={styles.subtitle}>
      Kan testlerinizi analiz edin ve sonuçlarınızı yönergelere uygun olarak değerlendirin.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hizmetlerimiz</Text>
         <View style={styles.cardsContainer}>
         <View style={styles.card}>
          <Image 
            source={require('../../assets/images/analiz.webp')} // Kan testi ile ilgili görsel URL'si
            style={styles.cardImage}
          />
           <Text style={styles.cardTitle}>Test Sonuçları</Text>
           <Text style={styles.cardDescription}>
           Kan değerlerinizi görüntüleyin ve analiz edin.
           </Text>
           </View>

          <View style={styles.card}>
           <Image
             source={require('../../assets/images/klavuz.webp')} // Klavuzlarla ilgili görsel URL'si
             style={styles.cardImage}
            />
             <Text style={styles.cardTitle}>Klavuzlar</Text>
             <Text style={styles.cardDescription}>
             Sonuçlar yönergelere uygun olarak değerlendirildi.</Text>
          </View>

        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkımızda</Text>
        <Text style={styles.sectionDescription}>
        LabConnect, laboratuvar sonuçlarını daha kolay takip edebilmeniz için geliştirildi. Kullanıcı dostu bir deneyim sunar ve sağlık analizinizi kolaylaştırır.
        </Text>
      </View>

    </ScrollView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  banner: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d01a1a',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d01a1a',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});