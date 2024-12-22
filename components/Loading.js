import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Loading = ({ changeIsLoading }) => {
    return (
        <View style={styles.container}>
          <Pressable 
            onPress={()=>changeIsLoading()}
            style={styles.closeButtonContainer}
          >
            <Text style={styles.closeButton}>X</Text>
          </Pressable>
            
          <ActivityIndicator size="large" color="#697FE4" />
          <Text style={styles.loginText}>Loading...</Text>
        </View>
      )
}

export default Loading

const styles = StyleSheet.create({
    container: {
     position: 'absolute',
     width: '100%',
     height: '100%',
     backgroundColor: '#fff',
     justifyContent: 'center',
     alignItems: 'center',
    },
    loginText: {
      fontWeight: 'bold',
      fontSize: 16,  // düzeltildi
      color: '#697FE4',
      marginTop: 20,
    },
    closeButtonContainer: {
        backgroundColor: '#697FE4',
        width: 50,
        height: 50,
        borderRadius: 25,  // tam yuvarlak yapmak için
        alignItems: 'center',  // X yazısını ortalar
        justifyContent: 'center', // X yazısını dikeyde ortalar
        position: 'absolute',
        top: 50,
        right: 10,
    },
    closeButton: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
