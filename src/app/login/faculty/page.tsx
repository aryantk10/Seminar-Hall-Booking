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
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register here
          </Link>
          .
        </>
      }
    >
      <LoginForm userType="faculty" />
    </AuthFormCard>
  );
}
