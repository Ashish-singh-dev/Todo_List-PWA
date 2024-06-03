import React, { useCallback } from "react";

import { router, useRootNavigationState, useSegments } from "expo-router";
import { useShallow } from "zustand/react/shallow";

import { USER_SESSION_KEY } from "@/constant/auth";
import { API } from "@/lib/api";
import { APIError } from "@/lib/api-error";
import {
  deleteSecureValue,
  getSecureValue,
  setSecureValue
} from "@/lib/secure-store";
import { useUserStore } from "@/lib/store/user";
import { toast } from "@/lib/toast";
import { User, userSchema } from "@/lib/validations/user";

type Context = {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
  createUser: (
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
};

const AuthContext = React.createContext({} as Context);

// This hook can be used to access the user info.
export function useAuth() {
  return React.useContext(AuthContext);
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(user: User | null) {
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  React.useEffect(() => {
    if (!navigationState?.key) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !user &&
      !inAuthGroup
    ) {
      // Redirect to the sign-in page.
      router.replace("/sign-in");
    } else if (user && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace("/");
    }
  }, [user, segments, navigationState]);
}

export function AuthProvider(props: { children: React.ReactNode }) {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = React.useState(true);
  const [user, setUser] = useUserStore(
    useShallow((state) => [state.user, state.setUser])
  );

  const getUser = useCallback(async () => {
    const userString = await getSecureValue(USER_SESSION_KEY);

    if (!userString) return;

    const user = userSchema.parse(JSON.parse(userString));
    setUser(user);
  }, [setUser]);

  React.useEffect(() => {
    getUser().finally(() => setInitializing(false));
  }, [getUser]);

  useProtectedRoute(user);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const res: User = await API.post("/v1/auth/login", {
          data: { email, password }
        });
        await setSecureValue(USER_SESSION_KEY, JSON.stringify(res));
        setUser(res);
      } catch (error) {
        if (error instanceof APIError) toast(error.message);
        else toast("Something went wrong");
      }
    },
    [setUser]
  );

  const createUser = useCallback(
    async (email: string, password: string, confirmPassword: string) => {
      try {
        const res: User = await API.post("/v1/auth/register", {
          data: { email, password, confirmPassword }
        });
        await setSecureValue(USER_SESSION_KEY, JSON.stringify(res));
        setUser(res);
      } catch (error) {
        if (error instanceof APIError) toast(error.message);
        else toast("Something went wrong");
      }
    },
    [setUser]
  );

  const signOut = useCallback(async () => {
    try {
      await API.post("/v1/auth/logout");
      const deleted = await deleteSecureValue(USER_SESSION_KEY);
      if (!deleted) {
        throw new Error("Unable to logout");
      }
      setUser(null);
    } catch (error) {
      toast("Failed to logout");
    }
  }, [setUser]);

  const sendPasswordResetEmail = useCallback(async (_email: string) => {}, []);

  if (initializing) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        createUser,
        sendPasswordResetEmail
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
