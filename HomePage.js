import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import React from 'react';

const HomePage = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>İmmünoglobulin A</Text>
        <Image
          source={require('../../assets/images/igA.jpg')}
          style={styles.image}
        />
        <Text style={styles.text}>
          IgA antikorları adıyla da bilinen immünoglobulin A antikorları, akciğer, sinüs, mide ve bağırsakların mukoza zarlarında bulunan antikorlardır. Ayrıca bu zarların ürettiği tükürük ve gözyaşı gibi sıvılarda ve kanda da ilgili antikorlar bulunur.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>İmmünoglobulin G</Text>
        <Image
          source={require('../../assets/images/IgG.jpg')}
          style={styles.image}
        />
        <Text style={styles.text}>
          IgG antikorları olan immünoglobulin G, kanda ve diğer vücut sıvılarında en yaygın olarak bulunan antikor türüdür. Bu antikorlar, daha önce vücuttaki mikropları hatırlayıp reaksiyon göstererek kişiyi enfeksiyona karşı korur ve bağışıklık sistemini uzun süre güçlü tutma görevi üstlenir.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>İmmünoglobulin M</Text>
        <Image
          source={require('../../assets/images/igM.png')}
          style={styles.image}
        />
        <Text style={styles.text}>
          IgM adıyla ifade edilen immünoglobulin M antikorları, vücuda ilk kez yeni bir bakteri veya mikrop girdiğinde ve kişi enfekte olduğunda üretilir.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.text}>
          Yukarıda yer alan antikor türleri, vücudun enfeksiyonlara karşı koruyucu kalkanı olarak bilinir. Vücudunuz bir bakteri veya mikrobu algıladığında özellikle IgM değeri kısa bir süreliğine yükselir.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Soft light gray background
    paddingTop: 10,
  },
  card: {
    backgroundColor: 'white', // White background for each card
    borderRadius: 15, // Soft corners for cards
    marginBottom: 20, // Space between cards
    padding: 20, // Padding inside the card
    shadowColor: '#000', // Soft shadow for cards
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5, // Android shadow
  },
  title: {
    fontSize: 22, // Larger title for more emphasis
    fontWeight: '700',
    color: '#2e2e2e',
    marginBottom: 12,
    textTransform: 'uppercase', // Make the title bold and capitalized
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#555', // Soft dark text color for readability
    lineHeight: 24,
    textAlign: 'justify',
  },
  image: {
    width: '100%',
    height: 220, // Higher image for better visual impact
    borderRadius: 12, // Soft rounded corners
    marginBottom: 15, // Space between image and text
    borderWidth: 1, // Thin border around image
    borderColor: '#eee', // Light border color
  },
});

export default HomePage;
