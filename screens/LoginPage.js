import { 
    StyleSheet,
    Text,
    View,
    Image,
    Pressable,
  } from 'react-native'; 
  
  import React, {useEffect, useState} from 'react';
  import { Loading, CustomTextInput, CustomButton } from '../components';
  import { login, autoLogin } from '../redux/userSlice';
  
  import { useSelector, useDispatch } from 'react-redux';
  import { setIsLoading } from '../redux/userSlice';
  
  const LoginPage = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    const { isLoading, error } = useSelector(state => state.user);
  
    const dispatch = useDispatch();
  
    useEffect(() => {
      dispatch(autoLogin());
    }, []);
  
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>LABCONNECT</Text>
        <Image
          source={require('../../assets/images/lab.png')}
          style={styles.image}
        />
        <CustomTextInput 
          title='Email'
          isSecureText={false}
          handleOnChangeText={(text) => setEmail(text)}
          handleValue={email}
          handlePlaceholder='Enter your Email'
        />
        <CustomTextInput 
          title='Password'
          isSecureText={true}
          handleOnChangeText={(password) => setPassword(password)}
          handleValue={password}
          handlePlaceholder='Enter your Password'
        />
        <CustomButton
          buttonText="Login"
          setWidth="80%"
          handleOnPress={() => dispatch(login({ email, password }))}
          gradientColors={['#d01a1a', '#697FE4']}
          pressedButtonColor="blue"
        />
       
        <Pressable onPress={() => navigation.navigate('Signup')}>
          <Text style={{ fontWeight: 'bold', marginTop: 20 }}>Don't have an account? Sign Up</Text>
        </Pressable>
  
        {/* Hata Mesajı */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
  
        {isLoading && (
          <Loading changeIsLoading={() => dispatch(setIsLoading(false))} />
        )}
      </View>
    );
  }
  
  export default LoginPage;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: 100,
      height: 100,
      marginBottom: 20,
    },
    welcome: {
      fontSize: 30,
      fontWeight: 'bold',
      marginVertical: 10,
      marginBottom: 30,
      color: '#d01a1a',
    },
    errorText: {
      color: 'red',
      marginTop: 10,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
  
  
  
  