import LoginForm from "@/components/auth/LoginForm";
import AuthFormCard from "@/components/auth/AuthFormCard";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <AuthFormCard
      title="Admin Login"
      description="Access the Hall Hub admin panel."
       footerContent={
        <>
          <div>
            Need to register a new admin account?{" "}
            <Link href="/login/admin/register" className="font-medium text-primary hover:underline">
              Register Admin
            </Link>
            .
          </div>
          <div className="mt-2">
            Are you a faculty member?{" "}
            <Link href="/login/faculty" className="font-medium text-primary hover:underline">
              Faculty Login
            </Link>
            .
          </div>
        </>
      }
    >
      <LoginForm userType="admin" />
    </AuthFormCard>
  );
}
