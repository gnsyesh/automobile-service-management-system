"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  User,
  onAuthStateChanged,
  reload,
  getIdTokenResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

import type {
  UserProfile,
  UserRole,
} from "@/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  emailVerified: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<User>;

  signInWithGoogle: () => Promise<User | null>;

  signOutUser: () => Promise<void>;

  refreshProfile: () => Promise<void>;

  reloadUser: () => Promise<void>;

  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailVerified, setEmailVerified] =
    useState(false);

  // ---------------------------------------------------------
  // LOAD USER PROFILE
  // ---------------------------------------------------------

  const fetchUserProfile = useCallback(
    async (firebaseUser: User) => {
      try {
        const userRef = doc(
          db,
          "users",
          firebaseUser.uid
        );

        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();

          setProfile({
            uid: firebaseUser.uid,
            name:
              data.name ||
              firebaseUser.displayName ||
              "",
            email:
              data.email ||
              firebaseUser.email ||
              "",
            phone: data.phone,
            photoURL:
              data.photoURL ||
              firebaseUser.photoURL ||
              undefined,
            savedAddress: data.savedAddress,
            shippingAddress:
              data.shippingAddress,
            role: data.role as UserRole | undefined,
            provider: data.provider,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        } else {
          // Create a basic profile if one does not exist.
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            name:
              firebaseUser.displayName || "",
            email:
              firebaseUser.email || "",
            photoURL:
              firebaseUser.photoURL || undefined,
            role: "user",
            provider:
              firebaseUser.providerData[0]
                ?.providerId || "password",
            createdAt: new Date().toISOString(),
          };

          await setDoc(
            userRef,
            {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );

          setProfile(newProfile);
        }
      } catch (error) {
        console.error(
          "Error fetching Firestore user profile:",
          error
        );

        // IMPORTANT:
        // Authentication should still work even if
        // the profile read temporarily fails.
        setProfile({
          uid: firebaseUser.uid,
          name:
            firebaseUser.displayName || "",
          email:
            firebaseUser.email || "",
          photoURL:
            firebaseUser.photoURL || undefined,
          role: "user",
          provider:
            firebaseUser.providerData[0]
              ?.providerId || "password",
        });
      }
    },
    []
  );

  // ---------------------------------------------------------
  // CHECK ADMIN USING CUSTOM CLAIM
  // ---------------------------------------------------------

  const checkAdminStatus = useCallback(
    async (firebaseUser: User) => {
      try {
        const tokenResult =
          await getIdTokenResult(firebaseUser, true);

        const admin =
          tokenResult.claims.admin === true;

        setIsAdmin(admin);

        return admin;
      } catch (error) {
        console.error(
          "Error checking admin status:",
          error
        );

        setIsAdmin(false);

        return false;
      }
    },
    []
  );

  // ---------------------------------------------------------
  // UPDATE AUTH STATE
  // ---------------------------------------------------------

  const updateAuthState = useCallback(
    async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setEmailVerified(false);
        return;
      }

      await reload(firebaseUser);

      setUser(firebaseUser);

      const verified =
        firebaseUser.emailVerified ||
        firebaseUser.providerData.some(
          (provider) =>
            provider.providerId === "google.com"
        );

      setEmailVerified(verified);

      await checkAdminStatus(firebaseUser);

      await fetchUserProfile(firebaseUser);
    },
    [
      checkAdminStatus,
      fetchUserProfile,
    ]
  );

  // ---------------------------------------------------------
  // AUTH STATE LISTENER
  // ---------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          if (!mounted) return;

          try {
            await updateAuthState(
              firebaseUser
            );
          } catch (error) {
            console.error(
              "Auth state error:",
              error
            );
          } finally {
            if (mounted) {
              setLoading(false);
            }
          }
        }
      );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [updateAuthState]);

  // ---------------------------------------------------------
  // GOOGLE REDIRECT RESULT
  // ---------------------------------------------------------

  useEffect(() => {
    const processRedirect = async () => {
      try {
        const result =
          await getRedirectResult(auth);

        if (result?.user) {
          await updateAuthState(
            result.user
          );
        }
      } catch (error) {
        console.error(
          "Google redirect error:",
          error
        );
      }
    };

    processRedirect();
  }, [updateAuthState]);

  // ---------------------------------------------------------
  // EMAIL / PASSWORD LOGIN
  // ---------------------------------------------------------

  const signIn = async (
    email: string,
    password: string
  ) => {
    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    await updateAuthState(
      credential.user
    );

    return credential.user;
  };

  // ---------------------------------------------------------
  // GOOGLE LOGIN
  // ---------------------------------------------------------

  const signInWithGoogle =
    async () => {
      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      try {
        const result =
          await signInWithPopup(
            auth,
            provider
          );

        await updateAuthState(
          result.user
        );

        return result.user;
      } catch (error: any) {
        // Popup blocked / unavailable:
        // fallback to redirect.
        if (
          error?.code ===
            "auth/popup-blocked" ||
          error?.code ===
            "auth/popup-cancelled-by-user"
        ) {
          await signInWithRedirect(
            auth,
            provider
          );

          return null;
        }

        throw error;
      }
    };

  // ---------------------------------------------------------
  // SIGN OUT
  // ---------------------------------------------------------

  const signOutUser = async () => {
    await signOut(auth);

    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setEmailVerified(false);
  };

  // ---------------------------------------------------------
  // REFRESH PROFILE
  // ---------------------------------------------------------

  const refreshProfile = async () => {
    if (!auth.currentUser) return;

    await fetchUserProfile(
      auth.currentUser
    );
  };

  // ---------------------------------------------------------
  // RELOAD USER
  // ---------------------------------------------------------

  const reloadUser = async () => {
    if (!auth.currentUser) return;

    await reload(auth.currentUser);

    const currentUser =
      auth.currentUser;

    setUser(currentUser);

    const verified =
      currentUser.emailVerified ||
      currentUser.providerData.some(
        (provider) =>
          provider.providerId ===
          "google.com"
      );

    setEmailVerified(verified);

    await checkAdminStatus(
      currentUser
    );

    await fetchUserProfile(
      currentUser
    );
  };

  // ---------------------------------------------------------
  // SEND VERIFICATION EMAIL
  // ---------------------------------------------------------

  const sendVerificationEmail =
    async () => {
      if (!auth.currentUser) {
        throw new Error(
          "No authenticated user."
        );
      }

      if (
        auth.currentUser.emailVerified
      ) {
        return;
      }

      await sendEmailVerification(
        auth.currentUser
      );
    };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        emailVerified,

        signIn,
        signInWithGoogle,
        signOutUser,

        refreshProfile,
        reloadUser,
        sendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}