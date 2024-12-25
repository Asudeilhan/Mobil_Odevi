import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    getAuth,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { db } from "../../firebaseConfig"; 

// Kullanıcı giriş işlemleri
export const login = createAsyncThunk('user/Login', async ({ email, password }) => {
    try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = user.stsTokenManager.accessToken;

        // Firestore'dan kullanıcı bilgilerini al
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        const userDate = {
            token,
            user: user,
            name: userData.name || null,
            role: userData.role || "user", // Kullanıcının rolünü Firestore'dan al
            tc: userData.tc || null, // TC Kimlik bilgisini ekle
            dob: userData.dob || null // Doğum tarihi bilgisini ekle
        };

        await AsyncStorage.setItem("userToken", token);
        
        return userDate;
    } catch (error) {
        console.log("Login Error:", error.message); 
        throw error;
    }
});

// Kullanıcı otomatik giriş işlemleri
export const autoLogin = createAsyncThunk("user/autoLogin", async () => {
    try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
            return token;
        } else {
            throw new Error("User not found");
        }
    } catch (error) {
        throw error;
    }
});

// Kullanıcı çıkış işlemleri
export const logout = createAsyncThunk("user/logout", async () => {
    try {
        const auth = getAuth();
        await signOut(auth);
        await AsyncStorage.removeItem("userToken");
        return null;
    } catch (error) {
        throw error;
    }
});

// Kullanıcı kayıt işlemleri
export const register = createAsyncThunk("user/register", async ({ name, email, password, tc, dob }) => {
    if (!tc || tc.length !== 11) { // TC Kimlik numarası kontrolü
        throw new Error("TC Kimlik must be 11 digits");
    }
    if (!name) {
        throw new Error("Name is required");
    }
    try {
        const auth = getAuth();
        
        // Eğer e-posta admin e-posta adresine eşitse, rolü 'admin' olarak ayarla
        const role = email === "admin@123456.com" ? "admin" : "user";

        // Kullanıcıyı Firebase Authentication'a kaydet
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = user.stsTokenManager.accessToken;

        // Kullanıcı bilgilerini Firestore'a kaydet
        await setDoc(doc(db, "users", user.uid), {
            name,
            email,
            uid: user.uid,
            role: role, // Rolü 'admin' veya 'user' olarak kaydet
            tc, // TC Kimlik numarasını Firestore'a kaydet
            dob // Doğum tarihini Firestore'a kaydet
        });

        // Kullanıcı kaydından sonra email doğrulaması gönder
        await sendEmailVerification(user);

        // Kullanıcı bilgilerini AsyncStorage ve Redux'a kaydedin
        await AsyncStorage.setItem("userToken", token);

        return { token, user, name, role, tc, dob };  // TC ve dob'yi de geri dön
    } catch (error) {
        console.log("Registration Error:", error.message); 
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("This email is already registered.");
        } else {
            throw new Error(error.message || "An unexpected error occurred.");
        }
    }
});

// Başlangıç durumu
const initialState = {
    isLoading: false,
    isAuth: false,
    token: null,
    user: null,
    error: null,
    userName: null, 
    role: null, // Kullanıcının rolünü burada saklayacağız
    tc: null, // TC Kimlik numarasını burada saklayacağız
    dob: null, // Doğum tarihini burada saklayacağız
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setEmail: (state, action) => {
            const lowerCaseEmail = action.payload.toLowerCase();
            state.email = lowerCaseEmail;
        },
        setPassword: (state, action) => {
            state.password = action.payload;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.isAuth = false;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuth = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.userName = action.payload.name;
                state.role = action.payload.role; // Rolü Redux state'inde sakla
                state.tc = action.payload.tc; // TC'yi Redux state'inde sakla
                state.dob = action.payload.dob; // Doğum tarihini Redux state'inde sakla
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuth = false;
                state.error = "Invalid email or password. Please try again.";
            })
            .addCase(autoLogin.pending, (state) => {
                state.isLoading = true;
                state.isAuth = false; 
            })
            .addCase(autoLogin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuth = true;
                state.token = action.payload;
            })
            .addCase(autoLogin.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuth = false;
                state.token = null;
            })
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isLoading = false;
                state.isAuth = false;
                state.token = null;
                state.error = null;
                state.userName = null;
                state.role = null; // Rolü sıfırla
                state.tc = null; // TC'yi sıfırla
                state.dob = null; // Doğum tarihini sıfırla
            })
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.isAuth = false;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuth = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.userName = action.payload.name;
                state.role = action.payload.role; // Rolü Redux state'ine kaydet
                state.tc = action.payload.tc; // TC'yi Redux state'ine kaydet
                state.dob = action.payload.dob; // Doğum tarihini Redux state'ine kaydet
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuth = false;
                state.error = action.error.message;
            });
    },
});

export const { setEmail, setPassword, setIsLoading } = userSlice.actions;
export default userSlice.reducer;
