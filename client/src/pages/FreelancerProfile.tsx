import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, ShieldCheck, Clock, CheckCircle, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { useCurrency } from "@/lib/currency";

export default function FreelancerProfile() {
  const { formatAmount } = useCurrency();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main id="main-content">
      {/* Header / Cover */}
      <div className="h-64 bg-primary relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative -mt-24 pb-20 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-accent" />
              <div className="relative inline-block mb-4">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  <AvatarImage src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=400&h=400" />
                  <AvatarFallback>TM</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm" title="Identity Verified">
                  <ShieldCheck className="w-6 h-6 text-accent fill-accent/20" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-primary">Thabo M.</h1>
              <p className="text-muted-foreground font-medium mb-4">Senior Software Engineer</p>
              
              <div className="flex justify-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Johannesburg
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> 2:00 PM Local
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 border-t border-b border-border py-4">
                <div>
                  <div className="font-bold text-lg text-primary">100%</div>
                  <div className="text-xs text-muted-foreground">Job Success</div>
                </div>
                <div>
                  <div className="font-bold text-lg text-primary">42</div>
                  <div className="text-xs text-muted-foreground">Jobs Done</div>
                </div>
              </div>

              <Button className="w-full bg-primary text-white hover:bg-primary/90 font-bold shadow-lg mb-3">
                Hire Thabo
              </Button>
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" /> Message
              </Button>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-bold text-lg mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {["Python", "Django", "React", "AWS", "PostgreSQL", "Docker", "TypeScript", "Redis"].map(skill => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 bg-secondary/50 hover:bg-secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-bold text-lg mb-4">Certifications</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="bg-accent/10 p-2 rounded-lg text-accent mt-1"><ShieldCheck className="w-4 h-4" /></div>
                  <div>
                    <div className="font-semibold text-sm">AWS Certified Solutions Architect</div>
                    <div className="text-xs text-muted-foreground">Amazon Web Services • 2024</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-accent/10 p-2 rounded-lg text-accent mt-1"><ShieldCheck className="w-4 h-4" /></div>
                  <div>
                    <div className="font-semibold text-sm">Professional Scrum Master I</div>
                    <div className="text-xs text-muted-foreground">Scrum.org • 2023</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-2xl font-bold text-primary">About Me</h2>
                   <p className="text-xl font-medium text-accent mt-1">{formatAmount(750)} <span className="text-sm text-muted-foreground font-normal">/ hour</span></p>
                 </div>
              </div>
              
              <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed">
                <p>
                  I am a Senior Software Engineer with over 8 years of experience building scalable web applications. 
                  My expertise lies in backend development with Python (Django/FastAPI) and frontend with React/TypeScript.
                </p>
                <p>
                  I have worked with startups and large enterprises in the Fintech and Edtech sectors, helping them architect 
                  robust solutions that handle high traffic loads. I am passionate about clean code, test-driven development, 
                  and mentoring junior developers.
                </p>
                <p>
                  <strong>Why work with me?</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Expert in building secure, compliant financial systems</li>
                  <li>Deep understanding of cloud infrastructure (AWS)</li>
                  <li>Excellent communicator and reliable professional</li>
                </ul>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <Tabs defaultValue="portfolio" className="w-full">
                <div className="px-6 pt-6 border-b border-border">
                  <TabsList className="bg-transparent p-0 h-auto gap-6">
                    <TabsTrigger value="portfolio" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:shadow-none rounded-none px-0 pb-3 font-bold text-muted-foreground data-[state=active]:text-primary text-base">
                      Portfolio (6)
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:shadow-none rounded-none px-0 pb-3 font-bold text-muted-foreground data-[state=active]:text-primary text-base">
                      Reviews (42)
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="portfolio" className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="group cursor-pointer">
                        <div className="aspect-video bg-muted rounded-xl mb-3 overflow-hidden relative">
                          <img 
                            src={`https://images.unsplash.com/photo-155${item}00000-xxxxx?auto=format&fit=crop&w=600&h=400`} 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                            alt="Project thumbnail"
                            onError={(e) => {
                              // Fallback for mock images
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.classList.add('flex', 'items-center', 'justify-center', 'bg-secondary');
                                parent.innerHTML = '<span class="text-muted-foreground font-medium">Project Preview</span>';
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold border border-white/30 px-4 py-2 rounded-full backdrop-blur-md">View Case Study</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-primary group-hover:text-accent transition-colors">Fintech Dashboard Revamp</h4>
                        <p className="text-sm text-muted-foreground">React, TypeScript, D3.js</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="p-6 space-y-6">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="pb-6 border-b border-border last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-primary">E-commerce API Integration</h4>
                        <div className="flex text-accent">
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                      </div>
                      <p className="text-muted-foreground italic mb-3">"Thabo is an exceptional developer. He communicated clearly throughout the project and delivered high-quality code ahead of schedule. Highly recommended!"</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <span className="bg-secondary px-2 py-1 rounded">Nov 2025</span>
                        <span>•</span>
                        <span>{formatAmount(45000)} Paid</span>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      </main>
      <Footer />
    </div>
  );
}