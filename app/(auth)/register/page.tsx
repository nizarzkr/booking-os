import { AuthForm } from "@/components/auth/auth-form";
import { register } from "@/app/(auth)/actions";

export default function RegisterPage() {
  return (
    <AuthForm
      action={register}
      title="Créer un compte"
      submitLabel="Créer mon compte"
      altText="Déjà inscrit ?"
      altHref="/login"
      altLinkLabel="Se connecter"
      passwordAutoComplete="new-password"
    />
  );
}
