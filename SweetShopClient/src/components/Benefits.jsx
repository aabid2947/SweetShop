import { Card, CardContent } from "@/components/ui/card";

const Benefits = () => {
  const benefits = [
    {
      value: "TDD",
      unit: "APPROACH",
      title: "Test-Driven Development",
      description: "Built using comprehensive TDD methodology with Red-Green-Refactor cycles ensuring high code quality and reliability.",
      subtitle: "Complete test coverage with meaningful test cases for both backend API and frontend components."
    },
    {
      value: "100%",
      unit: "COVERAGE",
      title: "Full-Stack Implementation",
      description: "Complete end-to-end solution including RESTful API backend, modern frontend SPA, database integration, and user authentication system. Perfect demonstration of modern development practices."
    },
    {
      value: "SOLID",
      unit: "PRINCIPLES",
      title: "Clean Architecture & Design",
      description: "Implementation follows SOLID principles and clean coding practices with comprehensive documentation, meaningful commit messages, and proper version control workflows."
    },
    {
      value: "AI",
      unit: "ENHANCED",
      title: "AI-Assisted Development",
      description: "Leveraging modern AI tools for enhanced development workflow while maintaining transparency and documentation of AI usage throughout the development process."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why This Sweet Shop System?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the technical excellence and development practices that make this sweet shop management system a comprehensive showcase of modern software development.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="bg-white border border-zinc-200 rounded-lg shadow-md shadow-zinc-300/50 hover:shadow-lg hover:shadow-zinc-400/60 transition-all duration-300 group animate-fade-in" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  {index === 0 && (
                    <div className="flex-shrink-0 w-24 h-24 bg-amber-500/10 rounded-2xl flex items-center justify-center group-hover:bg-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all duration-300">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-500">{benefit.value}</div>
                        <div className="text-xs text-amber-500/80 font-medium">{benefit.unit}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-2">
                      {index !== 0 && (
                        <>
                          <span className="text-3xl font-bold text-amber-500">{benefit.value}</span>
                          <span className="text-amber-500 text-sm font-medium">{benefit.unit}</span>
                        </>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                      {benefit.title}
                    </h3>
                    
                    <p className="text-zinc-600 leading-relaxed">
                      {benefit.description}
                    </p>
                    
                    {benefit.subtitle && (
                      <p className="text-zinc-600 text-sm mt-2 leading-relaxed">
                        {benefit.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;