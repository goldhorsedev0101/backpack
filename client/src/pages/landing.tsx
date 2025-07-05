import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Compass, 
  MapPin, 
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
  UserPlus
} from "lucide-react";

export default function Landing() {
  const [budget, setBudget] = useState([2500]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Compass className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold text-slate-700">TripWise</span>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="#discover" className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium">Discover</a>
                  <a href="#plan" className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium">Plan Trip</a>
                  <a href="#community" className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium">Community</a>
                  <a href="#budget" className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium">Budget</a>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button onClick={handleLogin} className="bg-primary text-white hover:bg-orange-600">
                <UserPlus className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Plan Your Perfect<br />
              <span className="text-accent">Adventure</span>
            </h1>
            <p className="text-xl text-white opacity-90 mb-8 max-w-3xl mx-auto">
              AI-powered trip planning for backpackers. Get personalized itineraries, connect with fellow travelers, and explore South America like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button onClick={handleLogin} className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100">
                <Bot className="w-5 h-5 mr-2" />
                Start Planning
              </Button>
              <Button variant="outline" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Where do you want to go?</Label>
                  <div className="relative">
                    <Input placeholder="e.g., Colombia, Peru, Bolivia" className="pr-10" />
                    <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Trip Duration</Label>
                  <Select>
                    <SelectTrigger>
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
                      <span className="text-lg font-semibold text-primary">${budget[0]}</span>
                      <span>$5000</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Travel Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'adventure', icon: Mountain, label: 'Adventure' },
                      { id: 'culture', icon: Camera, label: 'Culture' },
                      { id: 'food', icon: Utensils, label: 'Food' },
                      { id: 'nightlife', icon: GlassWater, label: 'Nightlife' }
                    ].map(style => (
                      <Button
                        key={style.id}
                        variant={selectedStyles.includes(style.id) ? "default" : "outline"}
                        onClick={() => toggleStyle(style.id)}
                        className="justify-start"
                      >
                        <style.icon className="w-4 h-4 mr-2" />
                        {style.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button onClick={handleLogin} className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-600">
                  <Bot className="w-5 h-5 mr-2" />
                  Generate My Trip
                </Button>
                <p className="text-sm text-gray-500 mt-2">Sign in to start planning your adventure</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="discover" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">Popular South American Routes</h2>
            <p className="text-gray-600 text-lg">Discover the most loved destinations by fellow backpackers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <Button onClick={handleLogin} className="bg-primary text-white hover:bg-orange-600">
                      View Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">Everything You Need in One App</h2>
            <p className="text-gray-600 text-lg">Discover what makes TripWise the perfect travel companion</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                icon: MapPin,
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
                <Compass className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold">TripWise</span>
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
                <li><a href="#" className="hover:text-white">AI Trip Planning</a></li>
                <li><a href="#" className="hover:text-white">Budget Tracking</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Reviews</a></li>
                <li><a href="#" className="hover:text-white">Live Chat</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Destinations</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Peru</a></li>
                <li><a href="#" className="hover:text-white">Colombia</a></li>
                <li><a href="#" className="hover:text-white">Bolivia</a></li>
                <li><a href="#" className="hover:text-white">Chile</a></li>
                <li><a href="#" className="hover:text-white">Argentina</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TripWise. All rights reserved. | Made with ❤️ for backpackers everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
