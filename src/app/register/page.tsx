import RegistrationForm from "@/components/auth/RegistrationForm";
import AuthFormCard from "@/components/auth/AuthFormCard";
import Link from "next/link";

export default function RegistrationPage() {
  return (
    <AuthFormCard
      title="Create Faculty Account"
      description="Join Hall Hub to book seminar halls for your events."
      footerContent={
        <>
          Already have an account?{" "}
          <Link href="/login/faculty" className="font-medium text-primary hover:underline">
            Login here
          </Link>
          .
        </>
      }
    >
      <RegistrationForm />
    </AuthFormCard>
  );
}
