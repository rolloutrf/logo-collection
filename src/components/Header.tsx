import { Button } from "@/components/ui/button"

const Header = () => {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-14 flex items-center justify-between px-6">
        <h1 className="text-base font-semibold">Logo Collection</h1>
        <a href="https://github.com/rolloutrf/logos" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm">GitHub</Button>
        </a>
      </div>
    </header>
  )
}

export default Header

