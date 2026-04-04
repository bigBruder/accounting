import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  familyId: string | null;
  monobankToken: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  joinFamily: (newFamilyId: string) => Promise<void>;
  updateMonobankToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [monobankToken, setMonobankToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFamilyId(data.familyId);
          setMonobankToken(data.monobankToken || null);
        } else {
          const newFamilyId = currentUser.uid;
          await setDoc(userDocRef, {
            email: currentUser.email,
            familyId: newFamilyId,
            createdAt: Date.now(),
            monobankToken: ''
          });
          setFamilyId(newFamilyId);
          setMonobankToken('');
        }
      } else {
        setFamilyId(null);
        setMonobankToken(null);
      }
      
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass).then(() => {});
  const register = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass).then(() => {});
  const logout = () => signOut(auth);

  const joinFamily = async (newFamilyId: string) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { familyId: newFamilyId });
    setFamilyId(newFamilyId);
  };

  const updateMonobankToken = async (token: string) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { monobankToken: token });
    setMonobankToken(token);
  };

  return (
    <AuthContext.Provider value={{ 
      user, familyId, monobankToken, loading, 
      login, register, logout, joinFamily, updateMonobankToken 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
