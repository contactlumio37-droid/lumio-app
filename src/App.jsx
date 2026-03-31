import { AuthProvider } from "./context/AuthContext";
import { useProfile } from "./hooks/useProfile";
import { LoginForm } from "./components/LoginForm";
import { Home } from "./components/Home";

function AppContent() {
  const { user } = useProfile();
  return user ? <Home /> : <LoginForm />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
