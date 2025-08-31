import { RealPlaceLinks } from "@/components/RealPlaceLinks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Demo data to showcase the RealPlaceLinks component
const demoSuggestion = {
  destination: "קוסקו",
  country: "פרו",
  description: "חקור את בירת האינקה העתיקה והשער למאצ'ו פיצ'ו עם מורשת תרבותית עשירה.",
  bestTimeToVisit: "מאי-ספטמבר",
  estimatedBudget: { low: 800, high: 1200 },
  highlights: ["מאצ'ו פיצ'ו", "עמק הקודש", "שכונת סן בלאס", "חורבות סקסיוואמן"],
  travelStyle: ["הרפתקה", "תרבותי"],
  duration: "7-10 ימים",
  realPlaces: [
    {
      title: "Machu Picchu",
      link: "https://www.google.com/maps/place/?q=place_id:ChIJAcBr8XFZcZERXNqbKDG3yz4",
      source: "Google" as const,
      placeId: "ChIJAcBr8XFZcZERXNqbKDG3yz4",
      rating: 4.6,
      address: "08680, Peru",
      photoUrl: "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Machu+Picchu"
    },
    {
      title: "Sacred Valley of the Incas",
      link: "https://www.google.com/maps/place/?q=place_id:ChIJC-OjQGBZcZERZMKTSAQ1z0w",
      source: "Google" as const,
      placeId: "ChIJC-OjQGBZcZERZMKTSAQ1z0w",
      rating: 4.7,
      address: "Cusco Region, Peru",
      photoUrl: "https://via.placeholder.com/400x300/059669/FFFFFF?text=Sacred+Valley"
    },
    {
      title: "Barrio de San Blas",
      link: "https://www.google.com/maps/place/?q=place_id:ChIJAzPRPfFZcZER4D1x8vMBqzQ",
      source: "Google" as const,
      placeId: "ChIJAzPRPfFZcZER4D1x8vMBqzQ",
      rating: 4.5,
      address: "San Blas, Cusco 08002, Peru",
      photoUrl: "https://via.placeholder.com/400x300/DC2626/FFFFFF?text=San+Blas"
    },
    {
      title: "Sacsayhuamán",
      link: "https://www.google.com/maps/place/?q=place_id:ChIJzQPRJfFZcZER-YHOlUOFjKg",
      source: "GetYourGuide" as const,
      placeId: "ChIJzQPRJfFZcZER-YHOlUOFjKg",
      rating: 4.4,
      address: "Cusco 08002, Peru",
      photoUrl: "https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Sacsayhuaman"
    },
    {
      title: "Qorikancha Temple",
      link: "https://www.google.com/maps/place/?q=place_id:ChIJXQhRGvFZcZERnOhCz3x4OW0",
      source: "TripAdvisor" as const,
      placeId: "ChIJXQhRGvFZcZERnOhCz3x4OW0",
      rating: 4.3,
      address: "Ahuacpinta, Cusco 08002, Peru"
    },
    {
      title: "Mercado Central de San Pedro",
      link: "https://www.google.com/maps/place/?q=place_id:ChIJUQkd8vFZcZER_m6gF5HFYZM",
      source: "Google" as const,
      placeId: "ChIJUQkd8vFZcZER_m6gF5HFYZM",
      rating: 4.2,
      address: "Cascaparo, Cusco 08002, Peru",
      photoUrl: "https://via.placeholder.com/400x300/0891B2/FFFFFF?text=Market"
    }
  ]
};

export default function DemoRealPlaces() {
  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">דמו - קומפוננטת המלצות מקומות</h1>
          <p className="text-gray-600">
            הצגה של קומפוננטת RealPlaceLinks שמציגה מקומות אמיתיים להזמנה
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{demoSuggestion.destination}, {demoSuggestion.country}</CardTitle>
            <p className="text-gray-600">{demoSuggestion.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span>💰 תקציב: ${demoSuggestion.estimatedBudget.low}-${demoSuggestion.estimatedBudget.high}</span>
                <span>📅 זמן מומלץ: {demoSuggestion.bestTimeToVisit}</span>
                <span>⏱️ משך: {demoSuggestion.duration}</span>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">אטרקציות מומלצות:</h4>
                <div className="flex flex-wrap gap-2">
                  {demoSuggestion.highlights.map((highlight, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              {/* השימוש בקומפוננטת RealPlaceLinks */}
              <RealPlaceLinks suggestion={demoSuggestion} />
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>דמו זה מציג איך הקומפוננטה מציגה מקומות אמיתיים מחוברים להיילייטס של הטיול</p>
        </div>
      </div>
    </div>
  );
}