import { StyleSheet, Text, View , TextInput} from 'react-native'
import React from 'react'

const CustomTextInput = ({title, isSecureText,handleOnChangeText,handleValue,handlePlaceholder}) => {
  return (
    <View style={styles.inputContainer}>
    <Text style={styles.inputBoxText}>{title}</Text>
    <TextInput
    secureTextEntry={isSecureText}
     placeholder={handlePlaceholder}
     style={styles.textInputStyle}
     onChangeText={handleOnChangeText} 
     value={handleValue} 
     />
   </View>

  )
}

export default CustomTextInput

const styles = StyleSheet.create({
    inputContainer:{
        width: '80%',
    },
    inputBoxText:{
        fontWeight: 'bold',
        alignSelf: 'flex-start',
      },
      textInputStyle:{
        borderBottomWidth: 1, // kenarlık kalınlığı
        width: '100%',
        height: 50,
        marginVertical: 10, // her iki yönede margin verir
        borderRadius: 10, // kenar yuvarlaklığı 
        textAlign: 'center', // metni ortalar
        fontWeight: 'bold', // metin kalınlığı
      },

       


})