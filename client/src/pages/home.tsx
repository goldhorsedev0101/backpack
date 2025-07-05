import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import TripCard from "@/components/trip-card";
import { Link } from "wouter";
import { 
  Plus, 
  MapPin, 
  TrendingUp, 
  Users, 
  Star,
  MessageCircle,
  Calendar,
  DollarSign
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ["/api/trips"]
  });

  const { data: userTrips = [], isLoading: userTripsLoading } = useQuery({
    queryKey: ["/api/trips/user"]
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/reviews"]
  });

  const welcomeMessage = user?.firstName 
    ? `Welcome back, ${user.firstName}!` 
    : "Welcome to TripWise!";

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{welcomeMessage}</h1>
            <p className="text-xl opacity-90 mb-6">Ready for your next South American adventure?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/trip-builder">
                <Button className="bg-white text-primary hover:bg-gray-100 px-6 py-3">
                  <Plus className="w-5 h-5 mr-2" />
                  Plan New Trip
                </Button>
              </Link>
              <Link href="/community">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-6 py-3">
                  <Users className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Trips */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-700">My Trips</h2>
                <Link href="/trip-builder">
                  <Button className="bg-primary hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    New Trip
                  </Button>
                </Link>
              </div>
              
              {userTripsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userTrips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userTrips.slice(0, 4).map((trip: any) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="p-8 text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No trips yet</h3>
                    <p className="text-gray-500 mb-4">Start planning your first South American adventure!</p>
                    <Link href="/trip-builder">
                      <Button className="bg-primary hover:bg-orange-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Trip
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Popular Routes */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-700">Popular Routes</h2>
                <Button variant="outline">View All</Button>
              </div>
              
              {tripsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trips.slice(0, 4).map((trip: any) => (
                    <TripCard key={trip.id} trip={trip} showUser />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trips Planned</span>
                  <Badge variant="secondary">{userTrips.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Countries Visited</span>
                  <Badge variant="secondary">
                    {new Set(userTrips.flatMap((trip: any) => 
                      trip.destinations?.map((d: any) => d.country) || []
                    )).size}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reviews Written</span>
                  <Badge variant="secondary">
                    {reviews.filter((r: any) => r.userId === user?.id).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Community Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-secondary" />
                  Community Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="h-3 bg-gray-200 rounded flex-1"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review: any) => (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <img 
                            src={review.user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"} 
                            alt="User" 
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {review.user?.firstName} {review.user?.lastName}
                          </span>
                          <div className="flex">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-accent fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {review.destination}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
                
                <Link href="/community">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View All Activity
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/trip-builder" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Plan New Trip
                  </Button>
                </Link>
                <Link href="/budget-tracker" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Track Expenses
                  </Button>
                </Link>
                <Link href="/community" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Find Travel Buddies
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
