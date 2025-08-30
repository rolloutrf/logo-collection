import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"

type ViewMode = 'all' | 'grouped'

interface HeaderProps {
  viewMode: ViewMode
  onChangeViewMode: (mode: ViewMode) => void
}

const Header = ({ viewMode, onChangeViewMode }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-14 flex items-center justify-between px-6">
        <h1 className="text-base font-semibold">Logo Collection</h1>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 mr-2">
            <Button
              variant={viewMode === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChangeViewMode('all')}
            >
              Все
            </Button>
            <Button
              variant={viewMode === 'grouped' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChangeViewMode('grouped')}
            >
              Категории
            </Button>
          </div>
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
