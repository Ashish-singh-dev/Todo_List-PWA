import { Capacitor } from "@capacitor/core";
import loadable, { LoadableComponent } from "@loadable/component";
import { ThemeProvider } from "@mui/material/styles";
import { Route, Routes } from "react-router-dom";

import { RouteComponents } from "@/Routes";
import AppBar from "@/components/AppBar";
import ThemedToaster from "@/components/ThemedToaster";
import Connectivity from "@/components/general/Connectivity";
import DrawerProvider from "@/context/DrawerContext";
import useHandleBackButtonPress from "@/hooks/useHandleBackButtonPress";
import { useTheme } from "@/hooks/useTheme";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import React from "react";
import toast from "react-hot-toast";

let CheckForUpdates: LoadableComponent<unknown>;

if (Capacitor.isNativePlatform()) {
  CheckForUpdates = loadable(
    () => import("@/components/general/CheckForUpdates"),
  );
}

// Create a client
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (import.meta.env.DEV) console.log(error);
      if (error instanceof AxiosError) toast.error(`${error.response?.data}`);
      else toast.error(`Something went wrong: ${error.message}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (import.meta.env.DEV) console.log(error);
      if (error instanceof AxiosError) toast.error(`${error.response?.data}`);
      else toast.error(`Something went wrong: ${error.message}`);
    },
  }),
});

const ReactQueryDevtools = React.lazy(() =>
  import("@tanstack/react-query-devtools").then((d) => ({
    default: d.ReactQueryDevtools,
  })),
);

function App() {
  const { theme } = useTheme();
  useHandleBackButtonPress();

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <DrawerProvider>
          <AppBar />
          <div className="overflow-auto h-full pt-4 pb-10 md:pb-16">
            <Routes>
              {RouteComponents.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Routes>
          </div>
          <Connectivity />
          {CheckForUpdates ? <CheckForUpdates /> : null}
          <ThemedToaster />
        </DrawerProvider>
        <React.Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </React.Suspense>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
