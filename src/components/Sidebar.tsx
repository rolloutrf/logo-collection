import SearchInput from "@/components/SearchInput"
import CategoriesNav from "@/components/CategoriesNav"
import { Card, CardContent } from "@/components/ui/card"
import type { SvgFile } from "@/App"

interface SidebarProps {
  groupedFiles: Record<string, SvgFile[]>
  totalCount?: number
  onSearch: (term: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ groupedFiles, totalCount, onSearch }) => {
  return (
    <aside className="fixed top-16 left-6 w-60">
      <Card>
        <CardContent className="pt-4">
          <div className="mb-3">
            <SearchInput onSearch={onSearch} />
          </div>
          <CategoriesNav groupedFiles={groupedFiles} totalCount={totalCount} />
        </CardContent>
      </Card>
    </aside>
  )
}

export default Sidebar
