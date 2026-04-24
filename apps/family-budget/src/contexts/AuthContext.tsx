import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export interface UserProfile {
  displayName: string;
  avatarEmoji: string;
  currency: string;
  monthlyBudget: number;
  monoClientName: string;
}

interface AuthContextType {
  user: User | null;
  familyId: string | null;
  monobankToken: string | null;
  profile: UserProfile;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  joinFamily: (newFamilyId: string) => Promise<void>;
  updateMonobankToken: (token: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const defaultProfile: UserProfile = {
  displayName: '',
  avatarEmoji: '🐈‍⬛',
  currency: 'UAH',
  monthlyBudget: 0,
  monoClientName: '',
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [monobankToken, setMonobankToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
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
          setProfile({
            displayName: data.displayName || currentUser.displayName || '',
            avatarEmoji: data.avatarEmoji || '🐈‍⬛',
            currency: data.currency || 'UAH',
            monthlyBudget: data.monthlyBudget || 0,
            monoClientName: data.monoClientName || '',
          });
        } else {
          const newFamilyId = currentUser.uid;
          await setDoc(userDocRef, {
            email: currentUser.email,
            familyId: newFamilyId,
            createdAt: Date.now(),
            monobankToken: '',
            displayName: currentUser.displayName || '',
            avatarEmoji: '🐈‍⬛',
            currency: 'UAH',
            monthlyBudget: 0,
            monoClientName: '',
          });
          setFamilyId(newFamilyId);
          setMonobankToken('');
        }
      } else {
        setFamilyId(null);
        setMonobankToken(null);
        setProfile(defaultProfile);
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

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, updates);
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, familyId, monobankToken, profile, loading, 
      login, register, logout, joinFamily, updateMonobankToken, updateProfile 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
