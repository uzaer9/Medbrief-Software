// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, firestore } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut, // Import signOut function from Firebase
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setCurrentUser(user);
            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            if (userDoc.exists()) {
              setRole(userDoc.data().role);
            }
          } else {
            setCurrentUser(null);
            setRole(null);
          }
          setLoading(false);
        });
        return unsubscribe;
      })
      .catch((error) => {
        setErrorMsg(error.message);
        setLoading(false);
      });
  }, []);

  // Define the logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setRole(null);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const signUp = async (email, password, name, role, specialization, experience) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(firestore, 'users', user.uid), {
        name,
        email,
        role,
        specialization,
        experience,
        profileCompleted: false,
      });

      await signOut(auth);
      setErrorMsg('Signup successful. Please log in.');
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, role, signUp, login, logout, errorMsg, setErrorMsg, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
