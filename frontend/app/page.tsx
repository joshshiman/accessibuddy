import MapComponent from "@/components/map-component"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <header className="w-full bg-primary p-4 text-white">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">AcsessiBuddy</h1>
          <p className="text-xl">Find accessible locations in Toronto</p>
        </div>
      </header>

      <div className="container mx-auto flex-1 p-4">
        <MapComponent />
      </div>

      <footer className="w-full bg-primary p-4 text-white">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} AcsessiBuddy - Making Toronto accessible for everyone</p>
        </div>
      </footer>
    </main>
  )
}

