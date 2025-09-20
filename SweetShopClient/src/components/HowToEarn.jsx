import { Card, CardContent } from "./ui/card";
import { UserCheck, Database, Code, TestTube } from "lucide-react";

const steps = [
  { icon: <UserCheck className="h-5 w-5" />, title: "Authentication & User Management", description: "Secure JWT-based authentication with user registration, login functionality, and role-based access control for customers and administrators." },
  { icon: <Database className="h-5 w-5" />, title: "Database & API Integration", description: "RESTful API backend with PostgreSQL/MongoDB database connectivity for persistent data storage and comprehensive CRUD operations." },
  { icon: <Code className="h-5 w-5" />, title: "Modern Frontend Implementation", description: "Single-page application built with React/Vue featuring responsive design, real-time search, and intuitive user interface components." },
  { icon: <TestTube className="h-5 w-5" />, title: "TDD & Quality Assurance", description: "Comprehensive test suite with high coverage, meaningful test cases, and Red-Green-Refactor development methodology implementation." },
];

export function HowToEarn() {
  return (
    <section id="how-to-earn" aria-labelledby="how-to-earn-title" className="relative w-full bg-background py-20">
      <div className="container mx-auto px-4">
        <header className="mb-16 text-center">
          <h2 id="how-to-earn-title" className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Technical Implementation
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four key technical areas demonstrating comprehensive full-stack development skills and modern software engineering practices.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {steps.map((s, i) => (
            <Card
              key={i}
              className="bg-white border border-zinc-200 rounded-lg shadow-md shadow-zinc-300/50 hover:shadow-lg hover:shadow-zinc-400/60 transition-all duration-300 group animate-fade-in hover:-translate-y-1 relative pt-10"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                aria-hidden="true"
                className="absolute -top-5 left-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 border border-zinc-200 text-amber-500 ring-8 ring-white group-hover:bg-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all duration-300"
              >
                {s.icon}
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-zinc-900 mb-3">{s.title}</h3>
                <p className="text-zinc-600 leading-relaxed">{s.description}</p>
                <span className="pointer-events-none absolute inset-x-6 bottom-5 block h-px origin-left scale-x-0 bg-gradient-to-r from-amber-400 to-teal-400 transition-transform duration-300 group-hover:scale-x-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowToEarn;