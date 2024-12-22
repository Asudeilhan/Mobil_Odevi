import { StyleSheet, Text, Pressable} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient'; // LinearGradient import edildi
import React from 'react';

const CustomButton = ({ buttonText, setWidth, handleOnPress,gradientColors}) => {
  return (
    <Pressable onPress={() => handleOnPress()}
     style={styles.buttonContainer}>
      <LinearGradient
        colors={gradientColors} // Gradient renkleri burada belirtiyoruz
        style={[styles.button, { width: setWidth }]}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export default CustomButton;

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 20,
    borderRadius: 50, // Köşelerin yuvarlatılması
  },
  button: {
    height: 50, // Buton yüksekliği
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50, // Köşelerin yuvarlatılması
    paddingHorizontal: 100, 
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
