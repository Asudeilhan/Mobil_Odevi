import { StyleSheet, Text, View, SafeAreaView, Image, Pressable, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import React, { useState } from 'react';
import { CustomButton, CustomTextInput, Loading } from '../components';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/userSlice';

const SignupPage = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tc, setTc] = useState(''); // TC Kimlik numarası için durum
  const [dob, setDob] = useState(''); // Doğum tarihi için durum
  const [error, setError] = useState(''); // Hata mesajlarını tutmak için durum

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.user);
  
  const handledRegister = async () => {
    if (!tc || tc.length !== 11) { // TC Kimlik kontrolü
      setError("TC ID must be 11 digits");
      return;
    }
    if (!name) {
      setError("Name is required");
      return;
    }
    if (!dob || !isValidDate(dob)) { // Doğum tarihi kontrolü
      setError("Please enter a valid date of birth (YYYY-MM-DD)");
      return;
    }
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
 

    try {
      setError('');
      await dispatch(register({ name, email, password, tc, dob })).unwrap();
    } catch (error) {
      setError(error.message);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.innerContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.title}>
          <Image style={styles.image} source={require('../../assets/images/lab.png')} />
          <Text style={styles.singUp}>Sign Up</Text>
        </View>

        <View style={styles.textInputContainer}>
          <CustomTextInput title="TC ID" isSecureText={false} handleOnChangeText={setTc} value={tc} handlePlaceholder="Enter your TC Kimlik" />
          <CustomTextInput title="Name-Surname" isSecureText={false} handleOnChangeText={setName} value={name} handlePlaceholder="Enter your name and surname" />
          <CustomTextInput title="Date of Birth" isSecureText={false} handleOnChangeText={setDob} value={dob} handlePlaceholder="Enter your Date of Birth (YYYY-MM-DD)" />
          <CustomTextInput title="Email" isSecureText={false} handleOnChangeText={setEmail} value={email} handlePlaceholder="Enter your email" />
          <CustomTextInput title="Password" isSecureText={true} handleOnChangeText={setPassword} value={password} handlePlaceholder="Enter your password" />
        </View>
        
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.signUpOption}>
          <CustomButton buttonText="Sign Up" setWidth="80%" gradientColors={['#d01a1a', '#697FE4']} pressedButtonColor="blue" handleOnPress={handledRegister} />
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={{ fontWeight: 'bold', marginTop: 20 }}>Already have an account? Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Doğum tarihi kontrolü (YYYY-MM-DD formatında)
const isValidDate = (date) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD formatı
  return regex.test(date);
};

export default SignupPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singUp: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#d01a1a',
  },
  title: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputContainer: {
    paddingVertical: 1,
    width: '100%',
    alignItems: 'center',
  },
  signUpOption: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});


