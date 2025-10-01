import { auth } from "@/db/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FormState } from "@/types/types";
import { parseError } from "@/lib/utils/parseError";

export async function signInAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

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
