import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./views/Login";
import { AccountManagement } from "./views/AccountManagement";
import { AudioManagement } from "./views/AudioManagement";
import ProtectedRoute from "./components/protectedRoute";
import NavBar from "./components/navigationBar";
import { routerPath } from "./common/config";
import { MainContentContainer } from "./components/styledComponents";
import AuthLoginProvider from "./contexts/authLogin";

function App() {
    return (
        <BrowserRouter>
            <AuthLoginProvider>
                <NavBar />
                <MainContentContainer>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <AudioManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route path={routerPath.login} element={<LoginPage />} />{" "}
                        <Route
                            path={routerPath.account}
                            element={
                                <ProtectedRoute>
                                    <AccountManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path={routerPath.audio}
                            element={
                                <ProtectedRoute>
                                    <AudioManagement />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </MainContentContainer>
            </AuthLoginProvider>
        </BrowserRouter>
    );
}

export default App;
