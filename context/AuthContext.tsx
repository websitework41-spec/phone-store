'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  updatePassword as updateFirebasePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  validatePakistaniMobile,
  phoneToSyntheticEmail,
} from '@/lib/firebase';

export interface SavedAddress {
  id: string;
  label: string; // 'Home' | 'Office' | 'Other'
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  province?: string;
  isDefault: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email: string;
  addresses: SavedAddress[];
  createdAt?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot';
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
  signup: (
    name: string,
    phone: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  login: (
    phone: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfileName: (
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  addAddress: (
    address: Omit<SavedAddress, 'id'>
  ) => Promise<{ success: boolean; error?: string }>;
  updateAddress: (
    id: string,
    address: Partial<SavedAddress>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (
    currentPass: string,
    newPass: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to prevent hanging Firebase network requests on unstable or throttled connections
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage = 'Operation timed out. Please try again.'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), ms);
    }),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('hamzastore_profile');
        return cached ? JSON.parse(cached) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (currentUser) {
        // Fast-load existing profile from localStorage if present
        try {
          const cached = localStorage.getItem('hamzastore_profile');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && (parsed.uid === currentUser.uid || !profile)) {
              setProfile(parsed);
              setLoading(false);
            }
          }
        } catch {}

        const userDocRef = doc(db, 'users', currentUser.uid);

        // Listen for realtime changes to the user document with resilient fallback
        unsubscribeFirestore = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              setProfile(data);
              try {
                localStorage.setItem('hamzastore_profile', JSON.stringify(data));
              } catch {}
              setLoading(false);
            } else {
              const phoneFromEmail = currentUser.email
                ? currentUser.email.replace(/@(hamzaphonestore\.pk|voltphone\.pk)/, '')
                : '';
              const newProfile: UserProfile = {
                uid: currentUser.uid,
                name: currentUser.displayName || 'Navira Traders Customer',
                phone: phoneFromEmail,
                email: currentUser.email || `${phoneFromEmail}@hamzaphonestore.pk`,
                addresses: [],
                createdAt: new Date().toISOString(),
              };
              setProfile(newProfile);
              try {
                localStorage.setItem('hamzastore_profile', JSON.stringify(newProfile));
              } catch {}
              setLoading(false);

              // Non-blocking background sync to Firestore
              withTimeout(
                setDoc(userDocRef, { ...newProfile, createdAt: serverTimestamp() }),
                5000
              ).catch(() => {});
            }
          },
          (err) => {
            console.warn('Firestore snapshot listener warning:', err);
            // Fallback profile if Firestore is restricted
            setProfile((prev) => {
              if (prev) return prev;
              const phoneFromEmail = currentUser.email
                ? currentUser.email.replace(/@(hamzaphonestore\.pk|voltphone\.pk)/, '')
                : '';
              const fallback: UserProfile = {
                uid: currentUser.uid,
                name: currentUser.displayName || 'Navira Traders Customer',
                phone: phoneFromEmail,
                email: currentUser.email || '',
                addresses: [],
              };
              try {
                localStorage.setItem('hamzastore_profile', JSON.stringify(fallback));
              } catch {}
              return fallback;
            });
            setLoading(false);
          }
        );
      } else {
        setProfile(null);
        try {
          localStorage.removeItem('hamzastore_profile');
        } catch {}
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // 1. Signup Flow - Fast, Non-blocking, and Network-Resilient
  const signup = async (name: string, phone: string, password: string) => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }

    const phoneCheck = validatePakistaniMobile(phone);
    if (!phoneCheck.isValid) {
      return { success: false, error: phoneCheck.error || 'Invalid Pakistani mobile number.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const syntheticEmail = phoneToSyntheticEmail(phoneCheck.cleanPhone);

    try {
      let activeUser: User | null = null;

      try {
        // Create user with 8s network timeout
        const userCredential = await withTimeout(
          createUserWithEmailAndPassword(auth, syntheticEmail, password),
          8000,
          'Account creation connection timed out. Please check your network and try again.'
        );
        activeUser = userCredential.user;
      } catch (createErr: any) {
        // If mobile/email is already registered (e.g. from an earlier interrupted signup), auto sign in seamlessly!
        if (createErr.code === 'auth/email-already-in-use') {
          try {
            const loginRes = await withTimeout(
              signInWithEmailAndPassword(auth, syntheticEmail, password),
              6000
            );
            activeUser = loginRes.user;
          } catch {
            return {
              success: false,
              error: `Mobile number ${phoneCheck.cleanPhone} is already registered. Please log in with your password.`,
            };
          }
        } else {
          throw createErr;
        }
      }

      if (!activeUser) {
        return { success: false, error: 'Failed to initialize account session.' };
      }

      // Update Firebase Auth profile display name (non-blocking)
      withTimeout(
        updateFirebaseProfile(activeUser, { displayName: trimmedName }),
        4000
      ).catch(() => {});

      // Build profile data
      const userDocData: UserProfile = {
        uid: activeUser.uid,
        name: trimmedName,
        phone: phoneCheck.cleanPhone,
        email: syntheticEmail,
        addresses: [],
        createdAt: new Date().toISOString(),
      };

      // Immediately cache locally and update state so UI responds instantly!
      setProfile(userDocData);
      try {
        localStorage.setItem('hamzastore_profile', JSON.stringify(userDocData));
      } catch {}

      // Write to Firestore in background without blocking modal close or UI progress
      const userDocRef = doc(db, 'users', activeUser.uid);
      withTimeout(
        setDoc(userDocRef, { ...userDocData, createdAt: serverTimestamp() }),
        6000
      ).catch((err) => {
        console.warn('Background Firestore profile sync warning:', err);
      });

      return { success: true };
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        return {
          success: false,
          error: `Mobile number ${phoneCheck.cleanPhone} is already registered. Please log in instead.`,
        };
      }
      if (err.code === 'auth/weak-password') {
        return {
          success: false,
          error: 'Password is too weak. Please use at least 6 characters.',
        };
      }
      if (err.code === 'auth/network-request-failed') {
        return {
          success: false,
          error: 'Network connection issue. Please check your internet and try again.',
        };
      }
      return {
        success: false,
        error: err.message || 'Failed to create account. Please try again.',
      };
    }
  };

  // 2. Login Flow
  const login = async (phone: string, password: string) => {
    const phoneCheck = validatePakistaniMobile(phone);
    if (!phoneCheck.isValid) {
      return { success: false, error: phoneCheck.error || 'Invalid Pakistani mobile number.' };
    }

    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const syntheticEmail = phoneToSyntheticEmail(phoneCheck.cleanPhone);

    try {
      const userCred = await withTimeout(
        signInWithEmailAndPassword(auth, syntheticEmail, password),
        8000,
        'Login connection timed out. Please check your connection and try again.'
      );

      // Check for cached profile
      try {
        const cached = localStorage.getItem('hamzastore_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.uid === userCred.user.uid || parsed.phone === phoneCheck.cleanPhone)) {
            setProfile(parsed);
          }
        }
      } catch {}

      return { success: true };
    } catch (err: any) {
      // Legacy fallback: check if account was originally created with @voltphone.pk
      if (
        (err.code === 'auth/invalid-credential' ||
          err.code === 'auth/user-not-found' ||
          err.code === 'auth/wrong-password') &&
        syntheticEmail.endsWith('@hamzaphonestore.pk')
      ) {
        try {
          const legacyEmail = `${phoneCheck.cleanPhone}@voltphone.pk`;
          await withTimeout(
            signInWithEmailAndPassword(auth, legacyEmail, password),
            5000
          );
          return { success: true };
        } catch {
          // Continue to standard error reporting
        }
      }

      console.error('Login error:', err);
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        return {
          success: false,
          error: 'Incorrect mobile number or password. Please verify and try again.',
        };
      }
      if (err.code === 'auth/too-many-requests') {
        return {
          success: false,
          error: 'Too many failed login attempts. Please wait a few minutes before trying again.',
        };
      }
      if (err.code === 'auth/network-request-failed') {
        return {
          success: false,
          error: 'Network connection issue. Please check your internet and try again.',
        };
      }
      return {
        success: false,
        error: err.message || 'Login failed. Please verify your credentials.',
      };
    }
  };

  // 3. Logout Flow
  const logout = async () => {
    try {
      await signOut(auth);
      setProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 4. Update Profile Name
  const updateProfileName = async (name: string) => {
    if (!user) return { success: false, error: 'User is not logged in.' };
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      return { success: false, error: 'Please enter a valid full name.' };
    }

    try {
      await updateFirebaseProfile(user, { displayName: trimmed });
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { name: trimmed });
      setProfile((prev) => (prev ? { ...prev, name: trimmed } : null));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update name.' };
    }
  };

  // 5. Add Address
  const addAddress = async (addressData: Omit<SavedAddress, 'id'>) => {
    if (!user || !profile) return { success: false, error: 'User not logged in.' };

    const newId = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const currentAddresses = profile.addresses || [];

    // If marked default or first address, make it default and unset others
    const shouldBeDefault = addressData.isDefault || currentAddresses.length === 0;
    const updatedList = currentAddresses.map((a) =>
      shouldBeDefault ? { ...a, isDefault: false } : a
    );

    const newAddress: SavedAddress = {
      ...addressData,
      id: newId,
      isDefault: shouldBeDefault,
    };

    const nextAddresses = [...updatedList, newAddress];

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { addresses: nextAddresses });
      setProfile((prev) => (prev ? { ...prev, addresses: nextAddresses } : null));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to add address.' };
    }
  };

  // 6. Update Address
  const updateAddress = async (id: string, addressData: Partial<SavedAddress>) => {
    if (!user || !profile) return { success: false, error: 'User not logged in.' };

    const currentAddresses = profile.addresses || [];
    const isNowDefault = addressData.isDefault;

    const nextAddresses = currentAddresses.map((a) => {
      if (a.id === id) {
        return { ...a, ...addressData };
      }
      if (isNowDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { addresses: nextAddresses });
      setProfile((prev) => (prev ? { ...prev, addresses: nextAddresses } : null));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update address.' };
    }
  };

  // 7. Delete Address
  const deleteAddress = async (id: string) => {
    if (!user || !profile) return { success: false, error: 'User not logged in.' };

    const currentAddresses = profile.addresses || [];
    const target = currentAddresses.find((a) => a.id === id);
    const filtered = currentAddresses.filter((a) => a.id !== id);

    // If we deleted the default address and there are remaining addresses, set first as default
    if (target?.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { addresses: filtered });
      setProfile((prev) => (prev ? { ...prev, addresses: filtered } : null));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete address.' };
    }
  };

  // 8. Set Default Address
  const setDefaultAddress = async (id: string) => {
    if (!user || !profile) return { success: false, error: 'User not logged in.' };

    const currentAddresses = profile.addresses || [];
    const nextAddresses = currentAddresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { addresses: nextAddresses });
      setProfile((prev) => (prev ? { ...prev, addresses: nextAddresses } : null));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to set default address.' };
    }
  };

  // 9. Change Password
  const changePassword = async (currentPass: string, newPass: string) => {
    if (!user || !user.email) return { success: false, error: 'User not logged in.' };

    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    try {
      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      // Update password
      await updateFirebasePassword(user, newPass);
      return { success: true };
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        return { success: false, error: 'Current password is incorrect.' };
      }
      return { success: false, error: err.message || 'Failed to change password.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signup,
        login,
        logout,
        updateProfileName,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
