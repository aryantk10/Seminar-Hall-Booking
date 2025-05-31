"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
// User type used in login function
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/api";

type UserRole = 'faculty' | 'admin';

interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  token: string;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface RegistrationFormProps {
  isAdminRegistration?: boolean;
}

export default function RegistrationForm({ isAdminRegistration = false }: RegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const role: UserRole = isAdminRegistration ? 'admin' : 'faculty';
      const response = await auth.register({
        name: values.name,
        email: values.email,
        password: values.password,
        role
      });

      const userData = response.data as AuthResponse;
      
      // Store the token
      localStorage.setItem('token', userData.token);
      
      // Login the user
      login({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department
      });
      
      toast({
        title: "Registration Successful",
        description: `Welcome, ${userData.name}! Your account has been created.`,
      });
      
      router.push("/dashboard");
    } catch (error: unknown) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration.",
        variant: "destructive",
      });
      
      // Handle specific error cases if needed
      const errorObj = error as { response?: { data?: { message?: string } } };
      if (errorObj.response?.data?.message === "User already exists") {
        form.setError("email", { 
          type: "manual", 
          message: "This email address is already in use." 
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Register
        </Button>
      </form>
    </Form>
  );
}
