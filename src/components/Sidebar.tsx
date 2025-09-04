import SearchInput from "@/components/SearchInput"
import CategoriesNav from "@/components/CategoriesNav"
import type { Category } from "@/types"
import { Card, CardContent } from "@/components/ui/card"

interface SidebarProps {
  categories: Category[]
  totalCount: number
  activeCategoryId?: string
  onSearch: (term: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ categories, totalCount, activeCategoryId, onSearch }) => {
  return (
    <aside className="fixed top-16 left-6 w-60">
      <Card>
        <CardContent className="pt-4">
          <div className="mb-3">
            <SearchInput onSearch={onSearch} />
          </div>
          <CategoriesNav
            categories={categories}
            totalCount={totalCount}
            activeCategoryId={activeCategoryId}
          />
        </CardContent>
      </Card>
    </aside>
  )
}

export default Sidebar
