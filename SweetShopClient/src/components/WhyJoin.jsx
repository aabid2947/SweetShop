import { memo } from "react";
import { Card, CardContent } from "./ui/card";
import { Shield, Zap, Code, Users, TestTube, Database } from "lucide-react";

const features = [
  { icon: Shield, title: "Secure Authentication", description: "JWT-based authentication system with proper token management and user session handling" },
  { icon: Zap, title: "Modern Tech Stack", description: "Built with React, Node.js, Express, and database integration using latest best practices" },
  { icon: Code, title: "Clean Architecture", description: "SOLID principles implementation with separation of concerns and maintainable code structure" },
  { icon: Users, title: "User-Friendly Interface", description: "Intuitive design with responsive layouts and accessibility considerations for all users" },
  { icon: TestTube, title: "Test-Driven Development", description: "Comprehensive testing with Red-Green-Refactor methodology ensuring code quality" },
  { icon: Database, title: "Database Integration", description: "Persistent data storage with proper schema design and efficient query optimization" }
];

const stats = [
  { value: "REST", label: "API Design", color: "text-amber-500" },
  { value: "JWT", label: "Authentication", color: "text-teal-500" },
  { value: "TDD", label: "Methodology", color: "text-emerald-500" },
  { value: "CRUD", label: "Operations", color: "text-blue-500" }
];

export const WhyJoin = memo(function WhyJoin() {
  return (
    <section className="py-16 bg-white relative overflow-hidden font-sans">
      {/* Subtle decorative background elements for light theme */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-zinc-900 sm:text-5xl">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-teal-500">Sweet Shop System</span>?
          </h2>
          <p className="mt-6 text-xl text-zinc-600 max-w-3xl mx-auto">
            Experience a comprehensive full-stack application built with modern development practices, clean architecture, and thorough testing methodology.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-zinc-500 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white border border-zinc-200 rounded-lg shadow-md shadow-zinc-300/50 hover:shadow-lg hover:shadow-zinc-400/60 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all duration-300">
                  <feature.icon className="h-7 w-7 text-amber-500" />
                </div>

                <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-zinc-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Card className="bg-white border border-zinc-200 rounded-2xl max-w-2xl mx-auto shadow-md shadow-zinc-300/50 hover:shadow-lg hover:shadow-zinc-400/60 transition-all duration-300 group">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">Ready to Explore the System?</h3>
              <p className="text-zinc-600 mb-6">
                Dive into our comprehensive sweet shop management system featuring modern development practices and clean architecture. Perfect for learning and demonstration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-amber-500 text-zinc-900 px-8 py-3 rounded-full font-semibold hover:bg-amber-600 transition-all duration-300 transform hover:scale-105">
                  View Live Demo
                </button>
                <button className="border border-zinc-300 text-zinc-700 px-8 py-3 rounded-full font-semibold hover:border-amber-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all duration-300">
                  Check Repository
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
});