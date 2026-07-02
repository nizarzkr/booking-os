import { AuthForm } from "@/components/auth/auth-form";
import { login } from "@/app/(auth)/actions";

export default function LoginPage() {
  return (
    <AuthForm
      action={login}
      title="Connexion"
      submitLabel="Se connecter"
      altText="Pas encore de compte ?"
      altHref="/register"
      altLinkLabel="Créer un compte"
      passwordAutoComplete="current-password"
    />
  );
}
