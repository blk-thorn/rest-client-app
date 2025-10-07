"use rest";

import { SignUpData, signUpSchema } from "@/lib/validation/auth";
import { auth } from "@/db/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FormState } from "@/types/types";
import { parseError } from "@/lib/utils/parse-error";

export async function signUpAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const data: SignUpData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = signUpSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0].message };

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(userCredential.user, { displayName: data.email.split("@")[0] });

    const idToken = await userCredential.user.getIdToken();

    await fetch("/api/session", {
      method: "POST",
      body: JSON.stringify({ token: idToken }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    return { error: null };
  } catch (err: unknown) {
    return { error: parseError(err) };
  }
}
