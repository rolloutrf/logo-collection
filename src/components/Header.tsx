import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Link } from "react-router-dom"

const Header = () => {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <h1 className="text-base font-semibold">Logo Collection</h1>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <Link to="/simple-icons" className="hover:text-foreground">Simple Icons</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href="https://github.com/rolloutrf/logos" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">GitHub</Button>
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header
