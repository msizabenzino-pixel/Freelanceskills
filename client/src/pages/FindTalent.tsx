import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, List, Map as MapIcon, Star, Filter, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";

export default function FindTalent() {
  const [view, setView] = useState<'list' | 'map'>('map');
  const [selectedPro, setSelectedPro] = useState<number | null>(null);
  const { formatRate, formatAmount } = useCurrency();

  const freelancers = [
    {
      id: 1,
      name: "Thabo M.",
      title: "Senior Electrician",
      rate: formatRate(450, "hr"),
      rating: 5.0,
      reviews: 42,
      coords: { top: "40%", left: "50%" },
      verified: true,
      image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
      id: 2,
      name: "Sarah L.",
      title: "Safety Officer",
      rate: formatRate(600, "hr"),
      rating: 4.9,
      reviews: 85,
      coords: { top: "30%", left: "60%" },
      verified: true,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
      id: 3,
      name: "David K.",
      title: "Plumber",
      rate: formatRate(550, "hr"),
      rating: 4.8,
      reviews: 29,
      coords: { top: "55%", left: "45%" },
      verified: true,
      image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
      id: 4,
      name: "Nandi Z.",
      title: "Web Developer",
      rate: formatRate(750, "hr"),
      rating: 5.0,
      reviews: 63,
      coords: { top: "45%", left: "55%" },
      verified: true,
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200&h=200"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main id="main-content">
      {/* Search Header */}
      <div className="pt-24 pb-6 bg-card border-b border-border z-10 sticky top-0">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search electricians, plumbers, developers..." className="pl-10 h-10" data-testid="input-search-talent" />
            </div>
            <div className="relative w-full md:w-64">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Sandton, Johannesburg" className="pl-10 h-10" data-testid="input-location-talent" />
            </div>
            <div className="flex bg-muted p-1 rounded-lg shrink-0">
              <button 
                onClick={() => setView('list')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                  view === 'list' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
                )}
                data-testid="button-view-list"
              >
                <List className="w-4 h-4" /> List
              </button>
              <button 
                onClick={() => setView('map')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                  view === 'map' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
                )}
                data-testid="button-view-map"
              >
                <MapIcon className="w-4 h-4" /> Map
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {['Verified Only', 'Available Now', `Under ${formatRate(500, "hr")}`, '5 Star Rating'].map((filter) => (
              <Badge key={filter} variant="outline" className="cursor-pointer hover:bg-secondary transition-colors whitespace-nowrap" data-testid={`badge-filter-${filter.toLowerCase().replace(/\s/g, '-')}`}>
                {filter}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex">
        {view === 'map' ? (
          <div className="relative w-full h-[calc(100vh-180px)] bg-muted">
            {/* Mock Map Background */}
            <div className="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Map_of_Pretoria%2C_South_Africa.svg/2000px-Map_of_Pretoria%2C_South_Africa.svg.png')] bg-cover bg-center grayscale" />
            
            {/* Map Pins */}
            {freelancers.map((pro) => (
              <div 
                key={pro.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                style={{ top: pro.coords.top, left: pro.coords.left }}
                onClick={() => setSelectedPro(pro.id)}
              >
                <div className={cn(
                  "relative flex flex-col items-center transition-transform duration-300",
                  selectedPro === pro.id ? "scale-110 z-30" : "hover:scale-110"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full border-2 shadow-lg overflow-hidden relative z-10",
                    selectedPro === pro.id ? "border-accent ring-4 ring-accent/20" : "border-white"
                  )}>
                    <img src={pro.image} alt={pro.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-accent -mt-1 relative z-0" />
                  
                  {/* Tooltip Label */}
                  <div className="absolute top-12 bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {pro.rate}
                  </div>
                </div>
              </div>
            ))}

            {/* Selected Pro Card Overlay */}
            {selectedPro && (
              <div className="absolute bottom-8 left-4 right-4 md:left-8 md:w-96 z-40 animate-in slide-in-from-bottom-4">
                {freelancers.filter(f => f.id === selectedPro).map(pro => (
                  <Card key={pro.id} className="p-4 shadow-2xl border-accent/20">
                    <div className="flex gap-4">
                      <Avatar className="w-16 h-16 rounded-xl">
                        <AvatarImage src={pro.image} />
                        <AvatarFallback>{pro.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                         <div className="flex justify-between items-start">
                           <h3 className="font-bold text-lg">{pro.name}</h3>
                           <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">{pro.rate}</Badge>
                         </div>
                         <p className="text-muted-foreground text-sm mb-2">{pro.title}</p>
                         <div className="flex items-center gap-2 text-sm">
                           <Star className="w-4 h-4 fill-accent text-accent" />
                           <span className="font-bold">{pro.rating}</span>
                           <span className="text-muted-foreground">({pro.reviews} reviews)</span>
                         </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button variant="outline" className="w-full">View Profile</Button>
                      <Button className="w-full bg-primary text-white">Message</Button>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedPro(null); }}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1"
                    >
                      <span className="sr-only">Close</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {freelancers.map(pro => (
               <Card key={pro.id} className="p-6 hover:shadow-lg transition-shadow">
                 <div className="flex flex-col items-center text-center gap-4">
                   <div className="relative">
                     <Avatar className="w-24 h-24">
                       <AvatarImage src={pro.image} />
                       <AvatarFallback>{pro.name[0]}</AvatarFallback>
                     </Avatar>
                     {pro.verified && <ShieldCheck className="w-6 h-6 text-accent absolute bottom-0 right-0 bg-white rounded-full p-0.5" />}
                   </div>
                   <div>
                     <h3 className="font-bold text-lg">{pro.name}</h3>
                     <p className="text-muted-foreground text-sm">{pro.title}</p>
                   </div>
                   <div className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm font-medium">
                     <Star className="w-3 h-3 fill-accent text-accent" /> {pro.rating} ({pro.reviews})
                   </div>
                   <div className="w-full pt-2">
                     <Button className="w-full">View Profile</Button>
                   </div>
                 </div>
               </Card>
             ))}
          </div>
        )}
      </div>
      </main>
    </div>
  );
}