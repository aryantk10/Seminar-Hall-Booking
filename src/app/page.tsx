import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Building, CalendarCheck, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/shared/Header';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                    Welcome to Hall Hub
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Seamlessly book seminar halls for your events. Easy, fast, and reliable.
                    Manage your bookings with an intuitive interface and get admin approvals efficiently.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/register">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/login/faculty">
                      Faculty Login
                    </Link>
                  </Button>
                </div>
                 <Button variant="link" size="lg" asChild className="justify-start px-0 text-muted-foreground hover:text-primary">
                    <Link href="/login/admin">
                      Admin Login
                    </Link>
                  </Button>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Seminar Hall"
                data-ai-hint="modern auditorium"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">Everything You Need for Hall Bookings</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hall Hub offers a comprehensive suite of tools to make seminar hall bookings effortless for faculty and administrators.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none pt-12">
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2">
                  <Building className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold text-card-foreground">Hall Overview</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Easily view all available seminar halls with details and select the perfect one for your event.
                </p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-2">
                  <CalendarCheck className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold text-card-foreground">Interactive Calendar</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Visualize bookings on an interactive calendar, check availability, and plan effectively.
                </p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold text-card-foreground">Admin Approvals</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Streamlined admin panel for quick approval or rejection of booking requests, ensuring no clashes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Hall Hub. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
