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
          Are you a faculty member?{" "}
          <Link href="/login/faculty" className="font-medium text-primary hover:underline">
            Login here
          </Link>
          .
        </>
      }
    >
      <LoginForm userType="admin" />
    </AuthFormCard>
  );
}
