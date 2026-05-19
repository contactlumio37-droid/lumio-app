import { useEffect, useState, useCallback } from "react";
import { AuthProviderSupabase, useAuthSupabase } from "./context/AuthContext.tsx";
import { LoginForm } from "./components/LoginForm";
import { Home } from "./components/Home";
import { GdprBanner } from "./components/GdprBanner";
import { PrivacyPolicyModal } from "./components/PrivacyPolicy";
import { OnboardingScreen } from "./components/onboarding/OnboardingScreen";
import { enableAnalytics, disableAnalytics } from "./firebase";

function AppContent() {
  const { user, profile, setProfile } = useAuthSupabase();
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleOnboardingComplete = useCallback(() => {
    if (profile) setProfile({ ...profile, onboarding_done: true });
  }, [profile, setProfile]);

  // Listen for privacy modal requests from any part of the app (GDPR banner, settings)
  useEffect(() => {
    const handler = () => setShowPrivacy(true);
    window.addEventListener("lumio:privacy", handler);
    return () => window.removeEventListener("lumio:privacy", handler);
  }, []);

  function handleConsent(accepted) {
    if (accepted) {
      enableAnalytics();
    } else {
      disableAnalytics();
    }
  }

  if (user && profile && !profile.onboarding_done) {
    return <OnboardingScreen userId={user.id} onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      {user ? <Home /> : <LoginForm />}
      <GdprBanner onConsent={handleConsent} />
      {showPrivacy && (
        <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProviderSupabase>
      <AppContent />
    </AuthProviderSupabase>
  );
}

export default App;
