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
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
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

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  profile: UserProfile | null;
  role: string | null;
  isAdmin: boolean;
  loading: boolean;
  emailVerified: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<User>;

  signUp: (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => Promise<User>;

  signInWithGoogle: () => Promise<User | null>;

  logOut: () => Promise<void>;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(
    null
  );
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // ---------------------------------------------------------
  // ---------------------------------------------------------
  // LOAD USER PROFILE
  // ---------------------------------------------------------

  const fetchUserProfile = useCallback(
    async (firebaseUser: User, isAdminUser?: boolean): Promise<UserProfile> => {
      try {
        // Guarantee Firebase ID Token is resolved and synchronized with Firestore
        await firebaseUser.getIdToken();

        const userRef = doc(
          db,
          "users",
          firebaseUser.uid
        );

        let snapshot;
        try {
          snapshot = await getDoc(userRef);
        } catch (firstErr: any) {
          if (firstErr?.code === "permission-denied") {
            console.warn("[AuthContext] Token out of sync on user profile fetch. Force-refreshing ID token and retrying...");
            await firebaseUser.getIdToken(true);
            snapshot = await getDoc(userRef);
          } else {
            throw firstErr;
          }
        }

        if (snapshot && snapshot.exists()) {
          const data = snapshot.data();
          const userRole: UserRole = isAdminUser
            ? "admin"
            : ((data.role as UserRole) || "user");

          const loadedProfile: UserProfile = {
            uid: firebaseUser.uid,
            name:
              data.name ||
              firebaseUser.displayName ||
              "",
            email:
              data.email ||
              firebaseUser.email ||
              "",
            phone: data.phone || "",
            photoURL:
              data.photoURL ||
              firebaseUser.photoURL ||
              undefined,
            savedAddress: data.savedAddress,
            shippingAddress: data.shippingAddress,
            role: userRole,
            provider:
              data.provider ||
              firebaseUser.providerData[0]?.providerId ||
              "password",
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };

          setUserProfile(loadedProfile);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(`negm_user_profile_${firebaseUser.uid}`, JSON.stringify(loadedProfile));
              if (localStorage.getItem("negm_user_profile")) {
                localStorage.removeItem("negm_user_profile");
              }
            } catch (lsErr) {
              console.warn("Failed to cache user profile locally", lsErr);
            }
          }
          return loadedProfile;
        } else {
          // Create a basic profile if one does not exist.
          const userRole: UserRole = isAdminUser ? "admin" : "user";
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            phone: "",
            photoURL: firebaseUser.photoURL || undefined,
            role: userRole,
            provider:
              firebaseUser.providerData[0]?.providerId || "google.com",
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

          setUserProfile(newProfile);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(`negm_user_profile_${firebaseUser.uid}`, JSON.stringify(newProfile));
              if (localStorage.getItem("negm_user_profile")) {
                localStorage.removeItem("negm_user_profile");
              }
            } catch (lsErr) {
              console.warn("Failed to cache user profile locally", lsErr);
            }
          }
          return newProfile;
        }
      } catch (error) {
        console.error(
          `[AuthContext] Error fetching Firestore user profile for UID ${firebaseUser.uid} (email: ${firebaseUser.email}):`,
          error
        );

        let cachedProfile: UserProfile | null = null;
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem(`negm_user_profile_${firebaseUser.uid}`);
            if (raw) cachedProfile = JSON.parse(raw);
          } catch {}
        }

        const fallbackProfile: UserProfile = cachedProfile || {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          phone: "",
          photoURL: firebaseUser.photoURL || undefined,
          role: isAdminUser ? "admin" : "user",
          provider:
            firebaseUser.providerData[0]?.providerId || "password",
        };

        setUserProfile(fallbackProfile);
        return fallbackProfile;
      }
    },
    []
  );

  // ---------------------------------------------------------
  // CHECK ADMIN STATUS IN FIRESTORE admins/{uid}
  // ---------------------------------------------------------

  const checkAdminStatus = useCallback(
    async (firebaseUser: User): Promise<{ isAdmin: boolean; role: "admin" | "user" }> => {
      try {
        // Guarantee Firebase ID Token is resolved and synchronized with Firestore
        await firebaseUser.getIdToken();

        const adminRef = doc(db, "admins", firebaseUser.uid);
        let adminDoc;
        try {
          adminDoc = await getDoc(adminRef);
        } catch (firstErr: any) {
          if (firstErr?.code === "permission-denied") {
            console.warn("[AuthContext] Token out of sync on admin check. Force-refreshing ID token and retrying...");
            await firebaseUser.getIdToken(true);
            adminDoc = await getDoc(adminRef);
          } else {
            throw firstErr;
          }
        }

        if (adminDoc && adminDoc.exists()) {
          const data = adminDoc.data();
          if (data?.role === "admin" && data?.active === true) {
            console.log(`[AuthContext] Verified admin document for UID: ${firebaseUser.uid}`);
            setIsAdmin(true);
            setRole("admin");
            return { isAdmin: true, role: "admin" };
          }
        }
        console.log(`[AuthContext] User is not an admin: UID=${firebaseUser.uid}`);
      } catch (error) {
        console.error(
          `[AuthContext] Error checking admin status in Firestore for UID ${firebaseUser.uid} (email: ${firebaseUser.email}):`,
          error
        );
      }

      setIsAdmin(false);
      setRole("user");
      return { isAdmin: false, role: "user" };
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
        setUserProfile(null);
        setRole(null);
        setIsAdmin(false);
        setEmailVerified(false);
        return;
      }

      try {
        await reload(firebaseUser);
      } catch (reloadErr) {
        console.warn("[AuthContext] Could not reload firebaseUser:", reloadErr);
      }

      // Ensure token is valid and synchronized with Firestore credentials
      try {
        await firebaseUser.getIdToken();
      } catch (tokenErr) {
        console.warn("[AuthContext] Could not get ID token:", tokenErr);
      }

      setUser(firebaseUser);

      const verified =
        firebaseUser.emailVerified ||
        firebaseUser.providerData.some(
          (provider) => provider.providerId === "google.com"
        );

      setEmailVerified(verified);

      console.log(`[AuthContext] State updated: UID=${firebaseUser.uid}, email=${firebaseUser.email}, verified=${verified}`);

      // Check admin status first so role and isAdmin are immediately determined
      const adminStatus = await checkAdminStatus(firebaseUser);

      // Fetch user profile from Firestore users/{uid}
      await fetchUserProfile(firebaseUser, adminStatus.isAdmin);
    },
    [checkAdminStatus, fetchUserProfile]
  );

  // ---------------------------------------------------------
  // AUTH STATE LISTENER
  // ---------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!mounted) return;

        try {
          await updateAuthState(firebaseUser);
        } catch (error) {
          console.error("Auth state error:", error);
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
        const result = await getRedirectResult(auth);

        if (result?.user) {
          await updateAuthState(result.user);
        }
      } catch (error) {
        console.error("Google redirect error:", error);
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
  ): Promise<User> => {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    await updateAuthState(credential.user);

    return credential.user;
  };

  // ---------------------------------------------------------
  // SIGN UP
  // ---------------------------------------------------------

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<User> => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const newUser = credential.user;

    await updateProfile(newUser, {
      displayName: name.trim(),
    });

    const newProfile: UserProfile = {
      uid: newUser.uid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      role: "user",
      provider: "password",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(
        doc(db, "users", newUser.uid),
        {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (firestoreError) {
      console.error("Firestore user profile save error:", firestoreError);
    }

    try {
      await sendEmailVerification(newUser);
    } catch (verificationError) {
      console.error("Verification email error:", verificationError);
    }

    await updateAuthState(newUser);

    return newUser;
  };

  // ---------------------------------------------------------
  // GOOGLE LOGIN
  // ---------------------------------------------------------

  const signInWithGoogle = async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const result = await signInWithPopup(auth, provider);
      await updateAuthState(result.user);
      return result.user;
    } catch (error: unknown) {
      // Popup blocked / unavailable: fallback to redirect
      const err = error as { code?: string };
      if (err?.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
        return null;
      }

      throw error;
    }
  };

  // ---------------------------------------------------------
  // SIGN OUT (PURGES USER-SCOPED STORAGE)
  // ---------------------------------------------------------

  const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }

    setUser(null);
    setUserProfile(null);
    setRole(null);
    setIsAdmin(false);
    setEmailVerified(false);

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("negm_orders_history");
        localStorage.removeItem("negm_latest_order");
        localStorage.removeItem("negm_user_profile");
        localStorage.removeItem("negm_cart");
        localStorage.removeItem("negm_coupon");
        localStorage.removeItem("negm_wishlist");
        localStorage.removeItem("negm_selected_vehicle");
        sessionStorage.clear();
      } catch (storageErr) {
        console.error("Error clearing user storage:", storageErr);
      }
    }
  };

  // ---------------------------------------------------------
  // REFRESH PROFILE
  // ---------------------------------------------------------

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    await fetchUserProfile(auth.currentUser, isAdmin);
  };

  // ---------------------------------------------------------
  // RELOAD USER
  // ---------------------------------------------------------

  const reloadUser = async () => {
    if (!auth.currentUser) return;

    try {
      await reload(auth.currentUser);
    } catch (err) {
      console.error("Error reloading user:", err);
    }

    const currentUser = auth.currentUser;
    setUser(currentUser);

    const verified =
      currentUser.emailVerified ||
      currentUser.providerData.some(
        (provider) => provider.providerId === "google.com"
      );

    setEmailVerified(verified);

    const adminStatus = await checkAdminStatus(currentUser);
    await fetchUserProfile(currentUser, adminStatus.isAdmin);
  };

  // ---------------------------------------------------------
  // SEND VERIFICATION EMAIL
  // ---------------------------------------------------------

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error("No authenticated user.");
    }

    if (auth.currentUser.emailVerified) {
      return;
    }

    await sendEmailVerification(auth.currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        profile: userProfile,
        role,
        isAdmin,
        loading,
        emailVerified,

        signIn,
        signUp,
        signInWithGoogle,
        logOut,
        signOutUser: logOut,

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
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}