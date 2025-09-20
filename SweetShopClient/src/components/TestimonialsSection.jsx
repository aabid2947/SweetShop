import { memo } from "react";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Emily Chen", role: "Sweet Shop Customer", content: "The sweet shop system is incredibly user-friendly! Finding my favorite chocolates and placing orders is so smooth and intuitive.", rating: 5 },
  { name: "Marcus Rodriguez", role: "Shop Administrator", content: "Managing inventory has never been easier. The admin panel makes adding new sweets and tracking stock levels a breeze.", rating: 5 },
  { name: "Aisha Patel", role: "Regular Customer", content: "I love the search functionality! I can easily filter sweets by category and price range to find exactly what I'm looking for.", rating: 5 },
  { name: "David Kim", role: "Technical Reviewer", content: "Impressive full-stack implementation with clean architecture. The TDD approach really shows in the code quality and reliability.", rating: 5 },
  { name: "Sophie Wilson", role: "Sweet Enthusiast", content: "The purchase process is seamless and secure. Real-time inventory updates mean I never order out-of-stock items.", rating: 5 },
  { name: "Ahmed Hassan", role: "Shop Owner", content: "Perfect demonstration of modern web development practices. The authentication system and API design are particularly well-implemented.", rating: 5 }
];

export const TestimonialsSection = memo(function TestimonialsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-black via-slate-900 to-black font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Loved by <span className="text-amber-400">customers</span> and developers
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
            See what users and technical reviewers say about our sweet shop management system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-amber-400/30 transition-all duration-300"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-slate-300 mb-6">
                "{testimonial.content}"
              </blockquote>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-teal-400 rounded-full flex items-center justify-center">
                  <span className="text-slate-900 font-semibold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-white font-medium">{testimonial.name}</div>
                  <div className="text-slate-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center"><div className="text-4xl font-bold text-amber-400">TDD</div><div className="text-slate-300 mt-1">Development</div></div>
          <div className="text-center"><div className="text-4xl font-bold text-teal-400">100%</div><div className="text-slate-300 mt-1">Test Coverage</div></div>
          <div className="text-center"><div className="text-4xl font-bold text-emerald-400">RESTful</div><div className="text-slate-300 mt-1">API Design</div></div>
          <div className="text-center"><div className="text-4xl font-bold text-blue-400">Modern</div><div className="text-slate-300 mt-1">Tech Stack</div></div>
        </div>
      </div>
    </section>
  );
});