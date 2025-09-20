import { SiteHeader } from "../components/SiteHeader";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import Benefits from "../components/Benefits";
import Features from "../components/Fatures";
import { HowToEarn } from "../components/HowToEarn";
import { MarketingPanel } from "../components/MarketingPanel";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { WhyJoin } from "../components/WhyJoin";

const HomePage = () => {
  return (
    <div className="min-h-screen  ">
      <SiteHeader />
      <main>
        {/* <div className="container mx-auto px-4"> */}
          <HeroSection />
        {/* </div> */}
        
        <Benefits />
        
        <Features />
        
        <HowToEarn />
        
        {/* <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container mx-auto">
            <MarketingPanel />
          </div>
        </section> */}
        
        {/* <TestimonialsSection /> */}
        
        {/* <WhyJoin /> */}
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;