import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Zap, Lock, Search, Package } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description:
        "JWT-based authentication system with user registration and login functionality to protect your sweet shop data.",
    },
    {
      icon: Users,
      title: "User Management",
      description:
        "Complete user registration and management system with role-based access control for customers and administrators.",
    },
    {
      icon: Search,
      title: "Advanced Search",
      description:
        "Powerful search functionality to find sweets by name, category, or price range with real-time filtering.",
    },
    {
      icon: Package,
      title: "Inventory Management",
      description:
        "Complete stock management system with automatic quantity tracking, purchase processing, and restock capabilities.",
    },
    {
      icon: Zap,
      title: "RESTful API",
      description:
        "Modern REST API built with Express/Node.js featuring CRUD operations for comprehensive sweet shop management.",
    },
    {
      icon: Lock,
      title: "Database Integration",
      description:
        "Robust database connectivity with PostgreSQL/MongoDB for persistent data storage and reliable transactions.",
    },
  ];

  return (
    // Assuming 'bg-background' is a light or white color as per the request.
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Sweet Shop Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built with modern technology stack including RESTful APIs, secure authentication,
            and comprehensive inventory management for your sweet shop business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              // Updated classes for a light theme card design
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
      </div>
    </section>
  );
};

export default Features;
