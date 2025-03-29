import geopandas 
import json
import keys 
import googlemaps

gmaps = googlemaps.Client(key=keys.GOOGLE_MAPS_API)

class PointOfInterest:
    def __init__(self, placeID, type, address, longitude, latitude):
        '''
        Point of Interest class
        ---
        placeID - the given place ID (int)
        type - the type of object (e.g. bench) (str)
        name - the name of the object. In this case, it's the address. (str)
        longitude - longitude of the object (float)
        latitude - latitude of the object (float)
        '''

        self.id = placeID
        self.type = type  
        self.name = address #Assumed name equals address
        self.longitude = longitude
        self.latitude = latitude
    
    def __str__(self):
        return (f"Point of Interest:\n"
                f"ID: {self.id}\n"
                f"Type: {self.type}\n"
                f"Name (Address): {self.name}\n"
                f"Location: ({self.latitude}, {self.longitude})")

    def to_dict(self):
        return {
            "placeID": self.id,
            "type": self.type,
            "name": self.name,
            "longitude": self.longitude,
            "latitude": self.latitude
        }

stFurn = geopandas.read_file("./backend/sourcedData/streetFurninture.geojson")

i = 0
benchArray = []

while i < len(stFurn):
    placeID = int(stFurn.iloc[i, 0])
    coordinates = [point.coords[0] for point in stFurn.iloc[i].geometry.geoms]
    longitude, latitude = float(coordinates[0][0]), float(coordinates[0][1])

    if (stFurn.iloc[i, 3] == "None" or stFurn.iloc[i, 4] == "None"):    
        address = gmaps.reverse_geocode((latitude, longitude))
        firstListing = address[0]["address_components"][0]
        address = firstListing["long_name"]
    else:
        address = stFurn.iloc[i, 3] + " " + stFurn.iloc[i, 4]

    bench = PointOfInterest(placeID, "Bench", address, longitude, latitude)
    benchArray.append(bench)

    print(f"Creating class objects... [{i}/{len(stFurn)}]")

    i += 1


with open("./backend/cleanData/benches.json", "w") as file:
    json.dump([bench.to_dict() for bench in benchArray], file, indent=4)
    print("Finished copying to JSON")

'''
TYPESCRIPT INTEFACE:

interface PointOfInterest {
  id: string
  type: PoiType
  name: string
  location: [number, number] // [latitude, longitude]
  description: string
  features?: string[]
}
'''