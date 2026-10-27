import { AuthScene } from "./AuthScene";

/** Sign-in, two-step code, forgot and set password share one animated stage. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthScene>{children}</AuthScene>;
}
