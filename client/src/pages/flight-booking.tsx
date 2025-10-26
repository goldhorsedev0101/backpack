import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Plane, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function FlightBookingPage() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/flights/booking/:offerId');
  const { toast } = useToast();
  
  const offerId = params?.offerId;

  // Form state
  const [passengerData, setPassengerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    passportNumber: '',
    dateOfBirth: ''
  });

  // Fetch offer details
  const { data: offerData, isLoading } = useQuery({
    queryKey: ['/api/flights/offer', offerId],
    enabled: !!offerId,
  });

  const offer = offerData?.offer;

  const handleInputChange = (field: string, value: string) => {
    setPassengerData(prev => ({ ...prev, [field]: value }));
  };

  const handleBooking = () => {
    // Validate form
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !passengerData[field as keyof typeof passengerData]);
    
    if (missingFields.length > 0) {
      toast({
        title: t('booking.error'),
        description: t('booking.fill_required_fields'),
        variant: 'destructive'
      });
      return;
    }

    // TODO: Implement actual booking logic with Duffel API
    toast({
      title: t('booking.success'),
      description: t('booking.booking_confirmed'),
    });
    
    // Navigate to confirmation page or home
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('he-IL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    return `${hours}${t('flights.hours_short')} ${minutes}${t('flights.minutes_short')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg">{t('flights.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">{t('booking.offer_not_found')}</h2>
            <Button onClick={() => navigate('/flights')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('booking.back_to_search')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-teal-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/flights')}
            className="mb-4"
            data-testid="button-back-to-flights"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('booking.back_to_search')}
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {t('booking.complete_booking')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('booking.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Passenger Details Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('booking.passenger_details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('booking.first_name')} *</Label>
                    <Input
                      id="firstName"
                      value={passengerData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder={t('booking.enter_first_name')}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('booking.last_name')} *</Label>
                    <Input
                      id="lastName"
                      value={passengerData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder={t('booking.enter_last_name')}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('booking.email')} *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={passengerData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('booking.enter_email')}
                      className="pl-10"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('booking.phone')} *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={passengerData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder={t('booking.enter_phone')}
                      className="pl-10"
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passport">{t('booking.passport_number')}</Label>
                    <Input
                      id="passport"
                      value={passengerData.passportNumber}
                      onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                      placeholder={t('booking.enter_passport')}
                      data-testid="input-passport"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">{t('booking.date_of_birth')}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="dob"
                        type="date"
                        value={passengerData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="pl-10"
                        data-testid="input-dob"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>{t('booking.flight_summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {offer.slices.map((slice: any, idx: number) => (
                  <div key={idx} className="space-y-3">
                    <Badge variant={idx === 0 ? "default" : "secondary"}>
                      {idx === 0 ? t('flights.outbound') : t('flights.return')}
                    </Badge>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-center">
                          <div className="text-xl font-bold">{slice.origin.iata_code}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(slice.segments[0].departing_at).toLocaleTimeString('he-IL', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center px-2">
                          <Plane className="w-4 h-4 text-blue-600 transform rotate-90 mb-1" />
                          <div className="text-xs text-gray-600">{formatDuration(slice.duration)}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-bold">{slice.destination.iata_code}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(slice.segments[slice.segments.length - 1].arriving_at).toLocaleTimeString('he-IL', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Plane className="w-3 h-3" />
                        <span>{slice.segments[0]?.operating_carrier?.name || 'Airline'}</span>
                      </div>
                    </div>

                    {idx < offer.slices.length - 1 && <Separator />}
                  </div>
                ))}

                <Separator className="my-4" />

                {/* Price Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('booking.base_fare')}</span>
                    <span className="font-medium">{offer.total_currency === 'ILS' ? '₪' : '$'}{offer.base_amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('booking.taxes_fees')}</span>
                    <span className="font-medium">{offer.total_currency === 'ILS' ? '₪' : '$'}{offer.tax_amount}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('booking.total')}</span>
                    <span className="text-blue-600">{offer.total_currency === 'ILS' ? '₪' : '$'}{offer.total_amount}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all" 
                  size="lg"
                  onClick={handleBooking}
                  data-testid="button-complete-booking"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t('booking.proceed_payment')}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  {t('booking.secure_payment')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
