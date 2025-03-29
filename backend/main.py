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


def createObj(fileName, category, outputName):
    '''
    Given a geoJSON file, convert it to clean readable JSON text.
    Calls Google Maps Geocoding API if an address isn't listed 
    ---
    fileName - path to the file (str)
    pointData - type of street furniture (str)
    outputName - name of output json file (str)
    '''
    fileName = geopandas.read_file(fileName)
    i = 0
    objectArray = []

    while i < len(fileName):
        placeID = int(fileName.iloc[i, 0])
        coordinates = [point.coords[0] for point in fileName.iloc[i].geometry.geoms]
        longitude, latitude = float(coordinates[0][0]), float(coordinates[0][1])

        if (fileName.iloc[i, 3] == "None" or fileName.iloc[i, 4] == "None"):    
            address = gmaps.reverse_geocode((latitude, longitude))
            firstListing = address[0]["address_components"][0]
            address = firstListing["long_name"]
        else:
            address = fileName.iloc[i, 3] + " " + fileName.iloc[i, 4]

        objectPOI = PointOfInterest(placeID, category, address, longitude, latitude)
        objectArray.append(objectPOI)

        print(f"Creating class objects... [{i}/{len(fileName)}]")

        i += 1


    with open(f"./backend/cleanData/{outputName}.json", "w") as file:
        json.dump([objectPOI.to_dict() for objectPOI in objectArray], file, indent=4)
        print("Finished copying to JSON")


createObj("./backend/sourcedData/streetFurninture.geojson","Bench","benches")
createObj("./backend/sourcedData/washroom.geojson","Public washroom","washroom")
createObj("./backend/sourcedData/transitShelter.geojson","Transit shelter","transitShelter")
createObj("./backend/sourcedData/wayfinding.geojson","Wayfinding structure","wayfinding")
createObj("./backend/sourcedData/litter.geojson","Litter receptacle","litter")


'''
GIVEN TYPESCRIPT INTEFACE:

interface PointOfInterest {
  id: string
  type: PoiType
  name: string
  location: [number, number] // [latitude, longitude]
  description: string
  features?: string[]
}
'''