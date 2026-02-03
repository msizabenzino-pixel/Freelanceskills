import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      >
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              #1 Freelance Marketplace in South Africa
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight leading-[1.1]">
              World-class African talent <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-300">
                at your fingertips.
              </span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
          >
            Ispani connects businesses with South Africa's top 1% of freelance developers, designers, writers, and financial experts.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto bg-white/5 backdrop-blur-sm p-2 rounded-2xl border border-white/10"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
              <input 
                type="text" 
                placeholder="What service are you looking for?"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border-transparent text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>
            <Button size="lg" className="w-full md:w-auto h-12 rounded-xl bg-accent hover:bg-accent/90 text-primary font-bold px-8 shadow-lg shadow-accent/20">
              Search
            </Button>
          </motion.div>

          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.6, delay: 0.4 }}
             className="pt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-white/60 text-sm font-medium"
          >
            <span>Popular:</span>
            <a href="#" className="hover:text-accent transition-colors underline decoration-dotted">Web Development</a>
            <a href="#" className="hover:text-accent transition-colors underline decoration-dotted">Graphic Design</a>
            <a href="#" className="hover:text-accent transition-colors underline decoration-dotted">Copywriting</a>
            <a href="#" className="hover:text-accent transition-colors underline decoration-dotted">Accounting</a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}