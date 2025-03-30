import MapComponent from "@/components/map-component"
import Image from "next/image"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <header className="w-full bg-primary p-4 text-white">
        <div className="container mx-auto flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
            <Image
              src="/AccessiBuddy Logo Transparent.png"
              alt="AccessiBuddy Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AccessiBuddy</h1>
            <p className="text-xl">Find accessible locations in Toronto</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex-1 p-4">
        <MapComponent />
      </div>

      <footer className="w-full bg-primary p-4 text-white">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} AccessiBuddy - Making Toronto accessible for everyone</p>
        </div>
      </footer>
    </main>
  )
}

