import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { User } from "../validations/user";

interface UserState {
  user: User | null;
  /**
   * ****************************************************
   * ⚠️ **NOTE**: Do not call this method to clear user state.
   * Use `signOut` method from `useAuth` hook instead.
   * ****************************************************
   * @param user The new user object or null to clear the user.
   */
  setUser: (
    user: User | null | ((user: User | null) => User),
    isSignUp?: boolean
  ) => void;
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
}

export const useUserStore = create<UserState>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    isSignUp: false,
    setUser: (user, isSignUp) => {
      if (typeof user === "function") {
        const data = user(get().user);
        if (typeof isSignUp !== "undefined") {
          set({ user: data, isSignUp });
        } else {
          set({ user: data });
        }
      } else {
        if (typeof isSignUp !== "undefined") {
          set({ user, isSignUp });
        } else {
          set({ user });
        }
      }
    },
    setIsSignUp: (isSignUp) => {
      set({ isSignUp });
    }
  }))
);
