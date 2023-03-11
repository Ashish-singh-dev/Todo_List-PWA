import { useMemo } from "react";

import loadable from "@loadable/component";
import { Capacitor } from "@capacitor/core";
import { Routes, Route } from "react-router-dom";
import { useTernaryDarkMode } from "usehooks-ts";
import { StatusBar, Style } from "@capacitor/status-bar";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import Loading from "./components/Loading";
import { PrivateRoute, MenuAppBar } from "./components";
import { getDesignTokens } from "./utils/getDesignToken";
import { AccountMenuProvider, DrawerProvider } from "./context";
import NotesCategoryProvider from "./context/NotesCategoryProvider";

const HomePage = loadable(() => import("./pages/Home"));
const SignInPage = loadable(() => import("./pages/SignIn"));
const SignUpPage = loadable(() => import("./pages/SignUp"));

async function changeStatusbarColor(isDarkMode: boolean) {
	if (Capacitor.getPlatform() === "android") {
		if (isDarkMode) {
			await StatusBar.setBackgroundColor({ color: "#121212" });
		} else {
			await StatusBar.setBackgroundColor({ color: "#ff5722" });
		}
		await StatusBar.setStyle({ style: Style.Dark });
	}
}

function App() {
	// get theme value from localstorage
	const { isDarkMode } = useTernaryDarkMode();

	// returns theme object for mui
	const theme = useMemo(() => {
		if (isDarkMode) document.body.style.backgroundColor = "#18181b";
		else document.body.style.backgroundColor = "#fff";
		return createTheme(getDesignTokens(isDarkMode ? "dark" : "light"));
	}, [isDarkMode]);

	changeStatusbarColor(isDarkMode);

	return (
		<ThemeProvider theme={theme}>
			<DrawerProvider>
				<AccountMenuProvider>
					<MenuAppBar />
					<Routes>
						<Route path="/">
							<Route
								index
								element={
									<PrivateRoute>
										<NotesCategoryProvider>
											<HomePage fallback={<Loading />} />
										</NotesCategoryProvider>
									</PrivateRoute>
								}
							/>
							<Route
								path="signup"
								element={<SignUpPage fallback={<Loading />} />}
							/>
							<Route
								path="login"
								element={<SignInPage fallback={<Loading />} />}
							/>
						</Route>
					</Routes>
				</AccountMenuProvider>
			</DrawerProvider>
		</ThemeProvider>
	);
}

export default App;
