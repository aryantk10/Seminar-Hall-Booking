import LoginForm from "@/components/auth/LoginForm";
import AuthFormCard from "@/components/auth/AuthFormCard";
import Link from "next/link";

export default function FacultyLoginPage() {
  return (
    <AuthFormCard
      title="Faculty Login"
      description="Access your Hall Hub account to manage bookings."
      footerContent={
        <>
          <div>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
            .
          </div>
          <div className="mt-2">
            Are you an administrator?{" "}
            <Link href="/login/admin" className="font-medium text-primary hover:underline">
              Admin Login
            </Link>
            .
          </div>
        </>
      }
    >
      <LoginForm userType="faculty" />
    </AuthFormCard>
  );
}
