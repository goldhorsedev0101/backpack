import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation, Link } from "wouter";
import { AuthModal } from "@/components/auth/AuthModal";
import { queryClient } from "@/lib/queryClient";
import { SOUTH_AMERICAN_COUNTRIES } from "@/lib/constants";
import logo from "@/assets/tripwise-logo.svg";
import { 
  Compass, 
  MapPin, 
  Navigation,
  Users, 
  Star, 
  Clock, 
  DollarSign, 
  Plus,
  Play,
  Search,
  Bot,
  Camera,
  Utensils,
  GlassWater,
  Mountain,
  MessageCircle,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Home,
  UserPlus,
  LogIn,
  LogOut
} from "lucide-react";

export default function Landing() {
  const [budget, setBudget] = useState([2500]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [destination, setDestination] = useState<string>("");
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Handle logout cleanup on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
      // Ensure complete cleanup after logout
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log("Logout cleanup completed");
    }
  }, []);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleLogin = () => {
    setAuthModalOpen(true);
  };

  const handleRegister = () => {
    setAuthModalOpen(true);
  };


  const handleLogout = async () => {
    try {
      // Clear all React Query cache
      queryClient.clear();
      
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out using Supabase Auth
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 mobile-nav">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src={logo} alt="TripWise" className="h-8 sm:h-10" />
              </div>
            </div>
            <div className="flex items-center space-x-2 nav-buttons">
              {user ? (
                <>
                  <span className="hidden sm:block text-slate-600 text-sm">Welcome!</span>
                  <Button onClick={handleLogout} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden">Out</span>
                  </Button>
                </>
              ) : (
                <Button onClick={handleLogin} variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                  <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Login</span>
                  <span className="sm:hidden">In</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center flex-center-mobile">
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 animate-fade-in">
              Plan Your Perfect<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="text-accent">Adventure</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white opacity-90 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              AI-powered trip planning for backpackers. Get personalized itineraries, connect with fellow travelers, and explore South America like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center button-group">
              <Button asChild className="w-full sm:w-auto bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-100">
                <Link href="/my-trips">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Start Planning
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-white hover:text-primary">
                <Link href="/explore">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Learn More
                </Link>
              </Button>
            </div>
            {!user && (
              <div className="flex flex-col gap-3 justify-center items-center mt-6 flex-row-mobile">
                <span className="text-white opacity-75 text-sm sm:text-base">Already have an account?</span>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button onClick={handleLogin} variant="outline" className="w-full sm:w-auto border-white text-white px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg hover:bg-white hover:text-primary">
                    <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Login
                  </Button>
                  <span className="text-white opacity-75 text-center sm:self-center">or</span>
                  <Button onClick={handleRegister} className="w-full sm:w-auto bg-accent text-white px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg hover:bg-orange-600">
                    <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Register
                  </Button>
                </div>
              </div>
            )}
            {user && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
                <span className="text-white opacity-90 text-sm sm:text-base">Welcome back!</span>
                <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto border-white text-white px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg hover:bg-red-500 hover:text-white">
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Trip Builder */}
      <section id="plan" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">AI Trip Builder</h2>
            <p className="text-gray-600 text-lg">Tell us your preferences and let our AI create the perfect itinerary</p>
          </div>
          
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Where do you want to go?</Label>
                  <Select onValueChange={(value) => setDestination(value)}>
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOUTH_AMERICAN_COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Trip Duration</Label>
                  <Select>
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                      <SelectItem value="2-4-weeks">2-4 weeks</SelectItem>
                      <SelectItem value="1-2-months">1-2 months</SelectItem>
                      <SelectItem value="3-months">3+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Budget Range</Label>
                  <div className="px-4">
                    <Slider
                      value={budget}
                      onValueChange={setBudget}
                      max={5000}
                      min={500}
                      step={100}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>$500</span>
                      <span className="text-orange-500 font-bold text-xl">${budget[0]}</span>
                      <span>$5000</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Travel Style</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'adventure', icon: Mountain, label: 'Adventure', description: 'Hiking, trekking, extreme sports' },
                      { id: 'culture', icon: Camera, label: 'Culture', description: 'Museums, local traditions, history' },
                      { id: 'food', icon: Utensils, label: 'Food', description: 'Local restaurants, cooking classes' },
                      { id: 'nightlife', icon: GlassWater, label: 'Nightlife', description: 'Bars, clubs, social experiences' }
                    ].map(style => (
                      <div
                        key={style.id}
                        onClick={() => toggleStyle(style.id)}
                        className={`p-4 rounded-lg border hover:bg-accent transition cursor-pointer ${
                          selectedStyles.includes(style.id)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <style.icon className="w-5 h-5 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-medium">{style.label}</h4>
                            <p className="text-sm text-muted-foreground">{style.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button asChild className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-600">
                  <Link href="/my-trips">
                    <Bot className="w-5 h-5 mr-2" />
                    {user ? "Generate My Trip" : "Start Planning"}
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  {user ? "Ready to plan your next adventure!" : "Sign in to start planning your adventure"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="discover" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-700 mb-3 sm:mb-4">Popular South American Routes</h2>
            <p className="text-gray-600 text-base sm:text-lg px-2">Discover the most loved destinations by fellow backpackers</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 card-grid">
            {[
              {
                title: "Peru Explorer",
                route: "Lima → Cusco → Machu Picchu → Arequipa",
                duration: "2-3 weeks",
                budget: "$1,200 - $2,000",
                rating: 4.9,
                reviews: 234,
                travelers: 15,
                image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=250&fit=crop"
              },
              {
                title: "Colombian Coast",
                route: "Bogotá → Medellín → Cartagena → Tayrona",
                duration: "3-4 weeks",
                budget: "$800 - $1,500",
                rating: 4.8,
                reviews: 189,
                travelers: 12,
                image: "https://images.unsplash.com/photo-1551009175-8a68da93d5f9?w=400&h=250&fit=crop"
              },
              {
                title: "Patagonia Trek",
                route: "Santiago → Patagonia → Ushuaia → Buenos Aires",
                duration: "4-6 weeks",
                budget: "$1,500 - $2,800",
                rating: 4.7,
                reviews: 156,
                travelers: 8,
                image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop"
              }
            ].map((route, index) => (
              <Card key={index} className="overflow-hidden card-hover">
                <div className="relative">
                  <img src={route.image} alt={route.title} className="w-full h-48 object-cover" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-700">{route.title}</h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-accent fill-current mr-1" />
                      <span className="text-sm text-gray-600">{route.rating} ({route.reviews})</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{route.route}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{route.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{route.budget}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(3, route.travelers) }).map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary border-2 border-white"></div>
                      ))}
                      {route.travelers > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{route.travelers - 3}</span>
                        </div>
                      )}
                    </div>
                    <Button asChild className="bg-primary text-white hover:bg-orange-600">
                      <Link href="/my-trips">View Route</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-700 mb-3 sm:mb-4">Everything You Need in One App</h2>
            <p className="text-gray-600 text-base sm:text-lg px-2">Discover what makes TripWise the perfect travel companion</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 card-grid">
            {[
              {
                icon: Bot,
                title: "AI Trip Planning",
                description: "Get personalized itineraries in seconds based on your preferences, budget, and travel style.",
                color: "bg-primary"
              },
              {
                icon: Users,
                title: "Traveler Community",
                description: "Connect with like-minded backpackers, share experiences, and find travel companions.",
                color: "bg-secondary"
              },
              {
                icon: DollarSign,
                title: "Smart Budgeting",
                description: "Track expenses automatically and get AI-powered tips to optimize your travel budget.",
                color: "bg-accent"
              },
              {
                icon: Navigation,
                title: "Interactive Maps",
                description: "Visualize your route, find nearby attractions, and navigate with confidence.",
                color: "bg-mint"
              },
              {
                icon: Star,
                title: "Real-time Reviews",
                description: "Get the latest reviews and recommendations from travelers currently on the ground.",
                color: "bg-primary"
              },
              {
                icon: MessageCircle,
                title: "Live Chat",
                description: "Connect instantly with fellow travelers and get real-time advice and tips.",
                color: "bg-secondary"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-700 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <img src={logo} alt="TripWise" className="h-8 brightness-0 invert" />
              </div>
              <p className="text-gray-300 mb-4">Smart, social, and personalized trip planning for the modern backpacker.</p>
              <div className="flex space-x-4">
                <Instagram className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                <Facebook className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                <Youtube className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/my-trips" className="hover:text-white">AI Trip Planning</Link></li>
                <li><Link href="/budget-tracker" className="hover:text-white">Budget Tracking</Link></li>
                <li><Link href="/community" className="hover:text-white">Community</Link></li>
                <li><Link href="/community" className="hover:text-white">Reviews</Link></li>
                <li><Link href="/community" className="hover:text-white">Live Chat</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Destinations</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/explore?country=Peru" className="hover:text-white">Peru</Link></li>
                <li><Link href="/explore?country=Colombia" className="hover:text-white">Colombia</Link></li>
                <li><Link href="/explore?country=Bolivia" className="hover:text-white">Bolivia</Link></li>
                <li><Link href="/explore?country=Chile" className="hover:text-white">Chile</Link></li>
                <li><Link href="/explore?country=Argentina" className="hover:text-white">Argentina</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Button type="button" className="hover:text-white bg-transparent p-0 h-auto text-gray-300">Help Center</Button></li>
                <li><Button type="button" className="hover:text-white bg-transparent p-0 h-auto text-gray-300">Contact Us</Button></li>
                <li><Button type="button" className="hover:text-white bg-transparent p-0 h-auto text-gray-300">Privacy Policy</Button></li>
                <li><Button type="button" className="hover:text-white bg-transparent p-0 h-auto text-gray-300">Terms of Service</Button></li>
                <li><Button type="button" className="hover:text-white bg-transparent p-0 h-auto text-gray-300">About Us</Button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TripWise. All rights reserved. | Made with ❤️ for backpackers everywhere</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />
    </div>
  );
}
