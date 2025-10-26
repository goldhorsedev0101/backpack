import { useTranslation } from "react-i18next";
import { Plane, Calendar, Users, MapPin, Loader2, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

interface FlightBooking {
  id: number;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;
  adults: number;
  children: number;
  cabinClass: string;
  totalAmount: string;
  currency: string;
  status: string;
  bookingReference: string | null;
  flightData: any;
  createdAt: string;
}

export default function CurrentBookingsTab() {
  const { t, i18n } = useTranslation();

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['/api/flights/bookings/upcoming'],
  });

  const bookings: FlightBooking[] = bookingsData?.bookings || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">{t('flights.loading_bookings')}</p>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="text-center py-12 border-2 border-dashed border-gray-300">
        <CardContent>
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('flights.no_upcoming_bookings')}</h3>
          <p className="text-gray-500">{t('flights.book_flight_to_see_here')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('flights.upcoming_flights', { count: bookings.length })}
        </h2>
        <Badge variant="default" className="text-lg px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600">
          {bookings.length} {t('flights.active')}
        </Badge>
      </div>

      <div className="space-y-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="shadow-xl border-2 border-blue-100 hover:border-blue-300 transition-all">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Plane className="w-6 h-6 text-blue-600" />
                  {booking.origin} → {booking.destination}
                </CardTitle>
                <Badge variant="default" className="bg-green-500">
                  {t('flights.confirmed')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">{t('flights.departure')}</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatDate(booking.departureDate)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(booking.departureDate)}
                  </div>
                </div>

                {booking.returnDate && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-5 h-5 text-cyan-600" />
                      <span className="font-semibold">{t('flights.return')}</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatDate(booking.returnDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(booking.returnDate)}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold">{t('flights.passengers')}</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {booking.adults} {t('flights.adults')}
                    {booking.children > 0 && `, ${booking.children} ${t('flights.children')}`}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {booking.cabinClass.replace('_', ' ')}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Receipt className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold">{t('flights.total_price')}</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {booking.currency === 'ILS' ? '₪' : '$'}{booking.totalAmount}
                  </div>
                </div>

                {booking.bookingReference && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-semibold">{t('flights.booking_ref')}</span>
                    </div>
                    <div className="text-lg font-mono font-bold text-gray-900">
                      {booking.bookingReference}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-semibold">{t('flights.booked_on')}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {formatDate(booking.createdAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
