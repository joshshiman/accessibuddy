import geopandas 

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

stFurn = geopandas.read_file("./backend/streetFurninture.geojson")

i = 0
benchArray = []

while i < len(stFurn):
    placeID = int(stFurn.iloc[i, 0])
    address = stFurn.iloc[i, 3] + " " + stFurn.iloc[i, 4]
    coordinates = [point.coords[0] for point in stFurn.iloc[i].geometry.geoms]
    longitude, latitude = float(coordinates[0][0]), float(coordinates[0][1])

    bench = PointOfInterest(placeID, "Bench", address, longitude, latitude)
    benchArray.append(bench)

    i += 1

for bench in benchArray:
    print(bench)


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