
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
import type { User } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface RegistrationFormProps {
  isAdminRegistration?: boolean;
}

const REGISTERED_USERS_STORAGE_KEY = "hallHubRegisteredUsers";

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    setTimeout(() => {
      const allRegisteredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_STORAGE_KEY) || "[]") as User[];
      const emailExists = allRegisteredUsers.some(u => u.email.toLowerCase() === values.email.toLowerCase());

      if (emailExists) {
        toast({
          title: "Registration Failed",
          description: "This email address is already in use. Please use a different email.",
          variant: "destructive",
        });
        setIsLoading(false);
        form.setError("email", { type: "manual", message: "This email address is already in use." });
        return;
      }

      const newUser: User = {
        id: `${isAdminRegistration ? 'admin' : 'faculty'}-${Math.random().toString(36).substring(7)}`,
        name: values.name,
        email: values.email,
        role: isAdminRegistration ? "admin" : "faculty",
      };
      
      allRegisteredUsers.push(newUser);
      localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(allRegisteredUsers));
      
      login(newUser);
      
      toast({
        title: "Registration Successful",
        description: `Welcome, ${newUser.name}! Your ${isAdminRegistration ? 'admin ' : ''}account has been created.`,
      });
      router.push("/dashboard");
      setIsLoading(false);
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
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
          Register {isAdminRegistration ? "Admin Account" : "Account"}
        </Button>
      </form>
    </Form>
  );
}
