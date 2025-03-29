"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TableIcon as Toilet, BlocksIcon as Bench, MapPin, Info } from "lucide-react"

// Fix Leaflet icon issues with Next.js
const fixLeafletIcon = () => {
  // Only run on client side
  if (typeof window !== "undefined") {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
  }
}

// Custom marker icons
const createCustomIcon = (iconUrl: string) => {
  return new L.Icon({
    iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
  })
}

// Define POI types
type PoiType = "restroom" | "bench" | "other"

// Define POI interface
interface PointOfInterest {
  id: string
  type: PoiType
  name: string
  location: [number, number] // [latitude, longitude]
  description: string
  features?: string[]
}

// Sample data (replace with actual Toronto open data)
const sampleData: PointOfInterest[] = [
  {
    id: "1",
    type: "restroom",
    name: "Nathan Phillips Square Accessible Restroom",
    location: [43.6529, -79.3849],
    description: "Public accessible restroom at Nathan Phillips Square",
    features: ["Wheelchair accessible", "Baby changing station", "Gender neutral option"],
  },
  {
    id: "2",
    type: "bench",
    name: "Harbourfront Accessible Bench",
    location: [43.6389, -79.3814],
    description: "Accessible bench with back support and armrests",
    features: ["Back support", "Armrests", "Covered area"],
  },
  {
    id: "3",
    type: "restroom",
    name: "Union Station Accessible Restroom",
    location: [43.6453, -79.3806],
    description: "Public accessible restroom at Union Station",
    features: ["Wheelchair accessible", "Family restroom", "Automatic door"],
  },
  {
    id: "4",
    type: "bench",
    name: "High Park Accessible Seating",
    location: [43.6465, -79.4637],
    description: "Accessible bench in High Park",
    features: ["Back support", "Armrests", "Near accessible path"],
  },
  {
    id: "5",
    type: "other",
    name: "Accessible Water Fountain",
    location: [43.657, -79.3903],
    description: "Wheelchair accessible water fountain",
    features: ["Wheelchair height", "Push button operation"],
  },
]

// Function to fetch Toronto open data
const fetchTorontoData = async (): Promise<PointOfInterest[]> => {
  // In a real application, you would fetch data from Toronto's open data API
  // For now, we'll use the sample data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleData)
    }, 500)
  })
}

// Component to recenter map
function SetViewOnClick({ coords }: { coords: [number, number] }) {
  const map = useMap()
  map.setView(coords, map.getZoom())
  return null
}

export default function MapComponent() {
  const [pois, setPois] = useState<PointOfInterest[]>([])
  const [filteredPois, setFilteredPois] = useState<PointOfInterest[]>([])
  const [filters, setFilters] = useState({
    restroom: true,
    bench: true,
    other: true,
  })
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([43.6532, -79.3832]) // Toronto center
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    fixLeafletIcon()

    // Fetch data
    fetchTorontoData().then((data) => {
      setPois(data)
      setFilteredPois(data)
    })
  }, [])

  // Update filtered POIs when filters change
  useEffect(() => {
    const filtered = pois.filter((poi) => {
      return filters[poi.type]
    })
    setFilteredPois(filtered)
  }, [filters, pois])

  // Handle filter changes
  const handleFilterChange = (type: PoiType) => {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  // Get icon based on POI type
  const getMarkerIcon = (type: PoiType) => {
    switch (type) {
      case "restroom":
        return <Toilet className="h-5 w-5 text-blue-600" />
      case "bench":
        return <Bench className="h-5 w-5 text-green-600" />
      default:
        return <MapPin className="h-5 w-5 text-red-600" />
    }
  }

  // Center map on POI
  const centerMapOnPoi = (poi: PointOfInterest) => {
    setSelectedPoi(poi)
    setMapCenter(poi.location)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[80vh]">
      {/* Sidebar */}
      <Card className="md:col-span-1 overflow-auto">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold mb-4">Accessible Locations</h2>

          {/* Filters */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Filters</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-restroom"
                  checked={filters.restroom}
                  onCheckedChange={() => handleFilterChange("restroom")}
                />
                <Label htmlFor="filter-restroom" className="flex items-center gap-2">
                  <Toilet className="h-4 w-4" /> Restrooms
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-bench"
                  checked={filters.bench}
                  onCheckedChange={() => handleFilterChange("bench")}
                />
                <Label htmlFor="filter-bench" className="flex items-center gap-2">
                  <Bench className="h-4 w-4" /> Benches
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-other"
                  checked={filters.other}
                  onCheckedChange={() => handleFilterChange("other")}
                />
                <Label htmlFor="filter-other" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Other
                </Label>
              </div>
            </div>
          </div>

          {/* Location list */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Locations</h3>
            <div className="space-y-2">
              {filteredPois.map((poi) => (
                <Button
                  key={poi.id}
                  variant={selectedPoi?.id === poi.id ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => centerMapOnPoi(poi)}
                >
                  <div className="flex items-center gap-2">
                    {getMarkerIcon(poi.type)}
                    <div>
                      <div className="font-medium">{poi.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">{poi.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <div className="md:col-span-2 h-full rounded-lg overflow-hidden border">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(map) => {
            mapRef.current = map
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredPois.map((poi) => (
            <Marker
              key={poi.id}
              position={poi.location}
              eventHandlers={{
                click: () => {
                  setSelectedPoi(poi)
                },
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-lg">{poi.name}</h3>
                  <p>{poi.description}</p>
                  {poi.features && (
                    <div className="mt-2">
                      <h4 className="font-semibold">Features:</h4>
                      <ul className="list-disc pl-5">
                        {poi.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Update map center when a POI is selected */}
          {selectedPoi && <SetViewOnClick coords={selectedPoi.location} />}
        </MapContainer>
      </div>

      {/* POI Details Panel (shows when a POI is selected) */}
      {selectedPoi && (
        <Card className="md:col-span-3 mt-4">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getMarkerIcon(selectedPoi.type)}
                <h2 className="text-2xl font-bold">{selectedPoi.name}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPoi(null)}>
                Close
              </Button>
            </div>

            <Tabs defaultValue="details" className="mt-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="features">Accessibility Features</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-2">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-lg">{selectedPoi.description}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <Info className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Coordinates: {selectedPoi.location[0].toFixed(4)}, {selectedPoi.location[1].toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="features" className="mt-2">
                {selectedPoi.features ? (
                  <ul className="space-y-2">
                    {selectedPoi.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No specific accessibility features listed.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

