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
      "id": "225",
      "type": "bench",
      "name": "5 Tangreen Crt",
      "location": [43.7969724294129, -79.4242901034448],
      "description": "Bench located at 5 Tangreen Crt.",
      "features": []
    },
    {
      "id": "226",
      "type": "bench",
      "name": "2471 St Clair Ave W",
      "location": [43.6686411321076, -79.4835258316795],
      "description": "Bench located at 2471 St Clair Ave W.",
      "features": []
    },
    {
      "id": "227",
      "type": "bench",
      "name": "530 Scarlett Rd",
      "location": [43.6870558134501, -79.5130488408004],
      "description": "Bench located at 530 Scarlett Rd.",
      "features": []
    },
    {
      "id": "228",
      "type": "bench",
      "name": "37 Viewcrest Crcl",
      "location": [43.7329079865426, -79.6196129655866],
      "description": "Bench located at 37 Viewcrest Crcl.",
      "features": []
    },
    {
      "id": "229",
      "type": "bench",
      "name": "305 Milner Ave",
      "location": [43.789301524609, -79.2366815806796],
      "description": "Bench located at 305 Milner Ave.",
      "features": []
    },
    {
      "id": "230",
      "type": "bench",
      "name": "180 Caledonia Rd",
      "location": [43.680067920469, -79.4568351563397],
      "description": "Bench located at 180 Caledonia Rd.",
      "features": []
    },
    {
      "id": "231",
      "type": "bench",
      "name": "8850 Sheppard Ave E",
      "location": [43.8058502701094, -79.1830163184238],
      "description": "Bench located at 8850 Sheppard Ave E.",
      "features": []
    },
    {
      "id": "232",
      "type": "bench",
      "name": "Markham Rd at Select Ave",
      "location": [43.8331732565218, -79.2507898041379],
      "description": "Bench located at Markham Rd at Select Ave.",
      "features": []
    },
    {
      "id": "233",
      "type": "bench",
      "name": "6005 Steeles Ave E",
      "location": [43.8365231932885, -79.2521686341436],
      "description": "Bench located at 6005 Steeles Ave E.",
      "features": []
    },
    {
      "id": "234",
      "type": "bench",
      "name": "159 Dynamic Dr",
      "location": [43.8297467831495, -79.2532791452577],
      "description": "Bench located at 159 Dynamic Dr.",
      "features": []
    },
    {
      "id": "235",
      "type": "bench",
      "name": "150 Dynamic Dr",
      "location": [43.8281392892642, -79.2526083894654],
      "description": "Bench located at 150 Dynamic Dr.",
      "features": []
    },
    {
      "id": "236",
      "type": "bench",
      "name": "80 Dynamic Dr",
      "location": [43.8243436172402, -79.2517294605107],
      "description": "Bench located at 80 Dynamic Dr.",
      "features": []
    },
    {
      "id": "237",
      "type": "bench",
      "name": "70 Maybrook Dr",
      "location": [43.8243850106904, -79.2609445153892],
      "description": "Bench located at 70 Maybrook Dr.",
      "features": []
    },
    {
      "id": "238",
      "type": "bench",
      "name": "1 Eastpark Blvd",
      "location": [43.7553878934232, -79.2346815032817],
      "description": "Bench located at 1 Eastpark Blvd.",
      "features": []
    },
    {
      "id": "239",
      "type": "bench",
      "name": "987 Danforth Rd",
      "location": [43.7317760958215, -79.2498197956024],
      "description": "Bench located at 987 Danforth Rd.",
      "features": []
    },
    {
      "id": "240",
      "type": "bench",
      "name": "Birchmount Rd at Opposite Walkway to River Grove Dr",
      "location": [43.8183786931725, -79.3153654914119],
      "description": "Bench located at Birchmount Rd opposite River Grove Dr walkway.",
      "features": []
    },
    {
      "id": "241",
      "type": "bench",
      "name": "3159 Birchmount Rd",
      "location": [43.8090662289214, -79.3090402998678],
      "description": "Bench located at 3159 Birchmount Rd.",
      "features": []
    },
    {
      "id": "242",
      "type": "bench",
      "name": "2190 Mcnicoll Ave",
      "location": [43.8140378430668, -79.2947587177452],
      "description": "Bench located at 2190 Mcnicoll Ave.",
      "features": []
    },
    {
      "id": "243",
      "type": "bench",
      "name": "1755 Brimley Rd",
      "location": [43.7766012569263, -79.2634667075704],
      "description": "Bench located at 1755 Brimley Rd.",
      "features": []
    },
    {
      "id": "244",
      "type": "bench",
      "name": "1517 O'Connor Dr",
      "location": [43.714013368885, -79.30607059741],
      "description": "Bench located at 1517 O'Connor Dr.",
      "features": []
    },
      {
        "id": "1",
        "type": "restroom",
        "name": "1681 Lake Shore Blvd E",
        "location": [43.6632980406659, -79.3094498094081],
        "description": "Public washroom located at 1681 Lake Shore Blvd E.",
        "features": []
      },
      {
        "id": "2",
        "type": "restroom",
        "name": "1275 Lake Shore Blvd W",
        "location": [43.6334653707643, -79.4375305244122],
        "description": "Public washroom located at 1275 Lake Shore Blvd W.",
        "features": []
      },
      {
        "id": "3",
        "type": "restroom",
        "name": "318 Queens Quay W",
        "location": [43.6390125331226, -79.3868628412625],
        "description": "Public washroom located at 318 Queens Quay W.",
        "features": []
      },
      {
        "id": "4",
        "type": "restroom",
        "name": "1 Strachan Ave",
        "location": [43.6359758223186, -79.4093814162204],
        "description": "Public washroom located at 1 Strachan Ave.",
        "features": []
      },
      {
        "id": "5",
        "type": "other",
        "name": "1524 Bathurst St",
        "location": [43.685179334043, -79.4192419633966],
        "description": "Transit shelter located at 1524 Bathurst St.",
        "features": []
      },
      {
        "id": "6",
        "type": "other",
        "name": "2345 Finch Ave W",
        "location": [43.7518326484722, -79.5421355711224],
        "description": "Transit shelter located at 2345 Finch Ave W.",
        "features": []
      },
      {
        "id": "7",
        "type": "other",
        "name": "15 Damascus Dr",
        "location": [43.7354624420894, -79.5978425623772],
        "description": "Transit shelter located at 15 Damascus Dr.",
        "features": []
      },
      {
        "id": "8",
        "type": "other",
        "name": "2051 Bridletowne Crcl",
        "location": [43.7982558220977, -79.3097458063405],
        "description": "Transit shelter located at 2051 Bridletowne Crcl.",
        "features": []
      },
      {
        "id": "9",
        "type": "other",
        "name": "63 Hunting Ridge",
        "location": [43.681259814307, -79.5525335015073],
        "description": "Transit shelter located at 63 Hunting Ridge.",
        "features": []
      },
      {
        "id": "10",
        "type": "other",
        "name": "7 Arleta Ave",
        "location": [43.7416745767321, -79.5013449571816],
        "description": "Transit shelter located at 7 Arleta Ave.",
        "features": []
      },
      {
        "id": "11",
        "type": "other",
        "name": "4002 Sheppard Ave E",
        "location": [43.7835098518048, -79.2880494320827],
        "description": "Transit shelter located at 4002 Sheppard Ave E.",
        "features": []
      },
      {
        "id": "12",
        "type": "other",
        "name": "63 Silversted Dr",
        "location": [43.8015974974863, -79.2639923972736],
        "description": "Transit shelter located at 63 Silversted Dr.",
        "features": []
      },
      {
        "id": "13",
        "type": "other",
        "name": "2500 Sheppard Ave E",
        "location": [43.7755353967602, -79.3233502905669],
        "description": "Transit shelter located at 2500 Sheppard Ave E.",
        "features": []
      },
      {
        "id": "14",
        "type": "other",
        "name": "5359 Dundas St W",
        "location": [43.6357663319677, -79.5401479113998],
        "description": "Transit shelter located at 5359 Dundas St W.",
        "features": []
      },
      {
        "id": "15",
        "type": "other",
        "name": "3077 Weston Rd",
        "location": [43.7318061169369, -79.537795395027],
        "description": "Transit shelter located at 3077 Weston Rd.",
        "features": []
      },
      {
        "id": "16",
        "type": "other",
        "name": "1111A College St",
        "location": [43.6524461259982, -79.4327269729055],
        "description": "Transit shelter located at 1111A College St.",
        "features": []
      },
      {
        "id": "17",
        "type": "other",
        "name": "781 Warden Ave",
        "location": [43.7252948045519, -79.2868126978688],
        "description": "Transit shelter located at 781 Warden Ave.",
        "features": []
      },
      {
        "id": "18",
        "type": "other",
        "name": "2200 Jane St",
        "location": [43.7212937142588, -79.5084781764239],
        "description": "Transit shelter located at 2200 Jane St.",
        "features": []
      },
      {
        "id": "19",
        "type": "other",
        "name": "986 The Queensway",
        "location": [43.623850867702, -79.5143936350267],
        "description": "Transit shelter located at 986 The Queensway.",
        "features": []
      },
      {
        "id": "20",
        "type": "other",
        "name": "1 Glen Watford Dr",
        "location": [43.7861379185644, -79.275767197261],
        "description": "Transit shelter located at 1 Glen Watford Dr.",
        "features": []
      },
      {
        "id": "21",
        "type": "other",
        "name": "7600 Sheppard Ave E",
        "location": [43.8019761111948, -79.2004362071333],
        "description": "Transit shelter located at 7600 Sheppard Ave E.",
        "features": []
      },
      {
        "id": "22",
        "type": "other",
        "name": "95 High Park Ave",
        "location": [43.6570109840403, -79.4666345849166],
        "description": "Transit shelter located at 95 High Park Ave.",
        "features": []
      },
      {
        "id": "23",
        "type": "other",
        "name": "443 Queen St W",
        "location": [43.6486182708151, -79.3966410731238],
        "description": "Transit shelter located at 443 Queen St W.",
        "features": []
      },
      {
        "id": "24",
        "type": "other",
        "name": "220 The East Mall",
        "location": [43.6320274691068, -79.5534542115062],
        "description": "Transit shelter located at 220 The East Mall.",
        "features": []
      },
      {
        "id": "25",
        "type": "other",
        "name": "245 Eglinton Ave E",
        "location": [43.708493638347, -79.3892401842983],
        "description": "Transit shelter located at 245 Eglinton Ave E.",
        "features": []
      },
      {
        "id": "26",
        "type": "other",
        "name": "1496 Kipling Ave",
        "location": [43.6790638489409, -79.5519333159798],
        "description": "Transit shelter located at 1496 Kipling Ave.",
        "features": []
      },
      {
        "id": "27",
        "type": "other",
        "name": "2606 St Clair Ave W",
        "location": [43.6673374460797, -79.4914618909566],
        "description": "Transit shelter located at 2606 St Clair Ave W.",
        "features": []
      },
      {
        "id": "28",
        "type": "other",
        "name": "294 Yonge St",
        "location": [43.656210754526, -79.3811303948228],
        "description": "Transit shelter located at 294 Yonge St.",
        "features": []
      },
      {
        "id": "29",
        "type": "other",
        "name": "580 Rathburn Rd",
        "location": [43.6507154778785, -79.5817990025372],
        "description": "Transit shelter located at 580 Rathburn Rd.",
        "features": []
      },
      {
        "id": "30",
        "type": "other",
        "name": "66 Lunsfield Cres",
        "location": [43.8053159025531, -79.2655400630756],
        "description": "Transit shelter located at 66 Lunsfield Cres.",
        "features": []
      },
      {
        "id": "31",
        "type": "other",
        "name": "43 Eglinton Ave E",
        "location": [43.7069050042631, -79.3971392360397],
        "description": "Transit shelter located at 43 Eglinton Ave E.",
        "features": []
      },
      {
        "id": "32",
        "type": "other",
        "name": "70 Parliament St",
        "location": [43.652526638611, -79.3634176889855],
        "description": "Transit shelter located at 70 Parliament St.",
        "features": []
      },
      {
        "id": "33",
        "type": "other",
        "name": "73 Mclaughlin Rd",
        "location": [43.7776040780323, -79.5029467137221],
        "description": "Transit shelter located at 73 Mclaughlin Rd.",
        "features": []
      },
      {
        "id": "34",
        "type": "other",
        "name": "20 Eglinton Ave W",
        "location": [43.7067275339444, -79.39891364514],
        "description": "Transit shelter located at 20 Eglinton Ave W.",
        "features": []
      },
      {
        "id": "35",
        "type": "other",
        "name": "626 Dundas St W",
        "location": [43.652138273089, -79.4021146447425],
        "description": "Transit shelter located at 626 Dundas St W.",
        "features": []
      },
      {
        "id": "36",
        "type": "other",
        "name": "731 College St",
        "location": [43.6550223599631, -79.4191921589497],
        "description": "Transit shelter located at 731 College St.",
        "features": []
      },
      {
        "id": "363",
        "type": "bench",
        "name": "2626 Bayview Ave",
        "location": [43.7521165462076, -79.3851199718854],
        "description": "Bench located at 2626 Bayview Ave.",
        "features": []
      },
      {
        "id": "364",
        "type": "bench",
        "name": "1 Lord Seaton Rd",
        "location": [43.7523593354602, -79.4078947133732],
        "description": "Bench located at 1 Lord Seaton Rd.",
        "features": []
      },
      {
        "id": "365",
        "type": "bench",
        "name": "353 Byng Ave",
        "location": [43.7816919590388, -79.3915653470454],
        "description": "Bench located at 353 Byng Ave.",
        "features": []
      },
      {
        "id": "366",
        "type": "bench",
        "name": "4719 Bathurst St",
        "location": [43.7721365550884, -79.442369296533],
        "description": "Bench located at 4719 Bathurst St.",
        "features": []
      },
      {
        "id": "367",
        "type": "bench",
        "name": "318 Holmes Ave",
        "location": [43.7831067720445, -79.3918724938667],
        "description": "Bench located at 318 Holmes Ave.",
        "features": []
      },
      {
        "id": "368",
        "type": "bench",
        "name": "3180 Bayview Ave",
        "location": [43.7846951373541, -79.3927177862103],
        "description": "Bench located at 3180 Bayview Ave.",
        "features": []
      },
      {
        "id": "369",
        "type": "bench",
        "name": "173 Senlac Rd",
        "location": [43.7761715460624, -79.4302288938982],
        "description": "Bench located at 173 Senlac Rd.",
        "features": []
      },
      {
        "id": "370",
        "type": "bench",
        "name": "549 Steeles Ave W",
        "location": [43.7942164170013, -79.4368537563624],
        "description": "Bench located at 549 Steeles Ave W.",
        "features": []
      },
      {
        "id": "371",
        "type": "bench",
        "name": "110 Willowdale Ave",
        "location": [43.7643054567749, -79.3999114833869],
        "description": "Bench located at 110 Willowdale Ave.",
        "features": []
      },
      {
        "id": "372",
        "type": "bench",
        "name": "1 Argonne Cres",
        "location": [43.7939062590541, -79.3937801006564],
        "description": "Bench located at 1 Argonne Cres.",
        "features": []
      },
      {
        "id": "373",
        "type": "bench",
        "name": "3396 Bayview Ave",
        "location": [43.7969235111767, -79.394461200246],
        "description": "Bench located at 3396 Bayview Ave.",
        "features": []
      },
      {
        "id": "374",
        "type": "bench",
        "name": "3343 Bayview Ave",
        "location": [43.7921260277513, -79.3934268566139],
        "description": "Bench located at 3343 Bayview Ave.",
        "features": []
      },
      {
        "id": "375",
        "type": "bench",
        "name": "3600 Bayview Ave",
        "location": [43.8027804081429, -79.3962111822891],
        "description": "Bench located at 3600 Bayview Ave.",
        "features": []
      },
      {
        "id": "376",
        "type": "bench",
        "name": "3555 Don Mills Rd",
        "location": [43.7942348989253, -79.3549429633292],
        "description": "Bench located at 3555 Don Mills Rd.",
        "features": []
      },
      {
        "id": "377",
        "type": "bench",
        "name": "200 Mcnicoll Ave",
        "location": [43.7998880514945, -79.3542237578182],
        "description": "Bench located at 200 Mcnicoll Ave.",
        "features": []
      },
      {
        "id": "378",
        "type": "bench",
        "name": "1500 Finch Ave E",
        "location": [43.7929267623568, -79.3541211793768],
        "description": "Bench located at 1500 Finch Ave E.",
        "features": []
      },
      {
        "id": "379",
        "type": "bench",
        "name": "10 Gossamer Ave",
        "location": [43.8018974432059, -79.4019082508587],
        "description": "Bench located at 10 Gossamer Ave.",
        "features": []
      },
      {
        "id": "380",
        "type": "bench",
        "name": "84 Covewood St",
        "location": [43.8053882704757, -79.3860034421984],
        "description": "Bench located at 84 Covewood St.",
        "features": []
      },
      {
        "id": "381",
        "type": "bench",
        "name": "3125 Steeles Ave E",
        "location": [43.8147636237195, -79.3443086340516],
        "description": "Bench located at 3125 Steeles Ave E.",
        "features": []
      },
      {
        "id": "382",
        "type": "bench",
        "name": "3600 Victoria Park Ave",
        "location": [43.8066136194333, -79.3376218997071],
        "description": "Bench located at 3600 Victoria Park Ave.",
        "features": []
      },
      {
        "id": "383",
        "type": "bench",
        "name": "2370 Bayview Ave",
        "location": [43.7342088131375, -79.3816543426367],
        "description": "Bench located at 2370 Bayview Ave.",
        "features": []
      },
      {
        "id": "384",
        "type": "bench",
        "name": "96 Fifeshire Rd",
        "location": [43.7607525942649, -79.3868591799096],
        "description": "Bench located at 96 Fifeshire Rd.",
        "features": []
      },
      {
        "id": "385",
        "type": "bench",
        "name": "93 York Rd",
        "location": [43.7458867388987, -79.3838713524641],
        "description": "Bench located at 93 York Rd.",
        "features": []
      },
      {
        "id": "386",
        "type": "bench",
        "name": "1110 Don Mills Rd",
        "location": [43.7374181348824, -79.3436778442713],
        "description": "Bench located at 1110 Don Mills Rd.",
        "features": []
      },
      {
        "id": "387",
        "type": "bench",
        "name": "1 Banbury Rd",
        "location": [43.7346155051916, -79.3566920955622],
        "description": "Bench located at 1 Banbury Rd.",
        "features": []
      },
      {
        "id": "388",
        "type": "bench",
        "name": "60 Underhill Dr",
        "location": [43.745417535826, -79.3259830973976],
        "description": "Bench located at 60 Underhill Dr.",
        "features": []
      },
      {
        "id": "389",
        "type": "bench",
        "name": "3304 Danforth Ave",
        "location": [43.6932238597647, -79.2797649810111],
        "description": "Bench located at 3304 Danforth Ave.",
        "features": []
      },
      {
        "id": "390",
        "type": "bench",
        "name": "3224 Danforth Ave",
        "location": [43.6926015235128, -79.2825362442391],
        "description": "Bench located at 3224 Danforth Ave.",
        "features": []
      },
      {
        "id": "391",
        "type": "bench",
        "name": "686 Warden Ave",
        "location": [43.7144154788986, -79.2821991561284],
        "description": "Bench located at 686 Warden Ave.",
        "features": []
      },
      {
        "id": "392",
        "type": "bench",
        "name": "1938 Eglinton Ave W",
        "location": [43.6951534432064, -79.4530595584116],
        "description": "Bench located at 1938 Eglinton Ave W.",
        "features": []
      },
      {
        "id": "393",
        "type": "bench",
        "name": "3699 St Clair Ave E",
        "location": [43.7194211262218, -79.2477004290716],
        "description": "Bench located at 3699 St Clair Ave E.",
        "features": []
      },
      {
        "id": "394",
        "type": "bench",
        "name": "405 Guildwood Pkwy",
        "location": [43.7502660837323, -79.1863759379843],
        "description": "Bench located at 405 Guildwood Pkwy.",
        "features": []
      },
      {
        "id": "395",
        "type": "bench",
        "name": "1221 Brimley Rd",
        "location": [43.7681358389517, -79.2605735087238],
        "description": "Bench located at 1221 Brimley Rd.",
        "features": []
      },
      {
        "id": "396",
        "type": "bench",
        "name": "3339 Warden Ave",
        "location": [43.8114949540444, -79.3231429710935],
        "description": "Bench located at 3339 Warden Ave.",
        "features": []
      },
      {
        "id": "397",
        "type": "bench",
        "name": "500 Sandhurst Crcl",
        "location": [43.8049130356939, -79.2650296857812],
        "description": "Bench located at 500 Sandhurst Crcl.",
        "features": []
      },
      {
        "id": "398",
        "type": "bench",
        "name": "8270 Sheppard Ave E",
        "location": [43.8032974662372, -79.1946642749801],
        "description": "Bench located at 8270 Sheppard Ave E.",
        "features": []
      }
      
      
      
      
      
  
  
  

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

