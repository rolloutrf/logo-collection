import type React from 'react'
import type { SvgFile } from '@/App'
import IconCard from '@/components/IconCard'
import { Separator } from '@/components/ui/separator'

interface AllIconsSectionProps {
  files: SvgFile[]
  onCopy: () => void
}

const AllIconsSection: React.FC<AllIconsSectionProps> = ({ files, onCopy }) => {
  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name))
  return (
    <section id="all" className="scroll-mt-24">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Все логотипы</h2>
        <span className="text-sm text-muted-foreground">{sorted.length}</span>
      </div>
      <Separator className="mb-3" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-5">
        {sorted.map((file) => (
          <IconCard key={`${file.folder}/${file.name}`} file={file} onCopy={onCopy} />
        ))}
      </div>
    </section>
  )
}

export default AllIconsSection
