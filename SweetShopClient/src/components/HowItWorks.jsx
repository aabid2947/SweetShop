import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Search, ShoppingCart, Package } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: UserCheck,
      title: "Register and authenticate your account",
      description: "Create your account using our secure registration system with JWT-based authentication. Complete user verification to access the sweet shop platform."
    },
    {
      icon: Search,
      title: "Browse and search for sweets",
      description: "Use our advanced search functionality to find sweets by name, category, or price range. Filter and discover all available sweet products in our inventory."
    },
    {
      icon: ShoppingCart,
      title: "Purchase your favorite sweets",
      description: "Add sweets to your cart and complete secure purchases. Our system automatically updates inventory quantities and processes your orders in real-time."
    },
    {
      icon: Package,
      title: "Admin manages inventory and stock",
      description: "Administrators can add new sweets, update product details, manage stock levels, and restock inventory through our comprehensive management interface."
    }
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How the Sweet Shop Works
          </h2>
          <p className="text-xl text-muted-foreground">
            4 simple steps to understand the complete sweet shop management workflow
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="shadow-card hover:shadow-elegant transition-all duration-300 border-0 bg-background animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-accent-foreground" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-4 leading-tight">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;