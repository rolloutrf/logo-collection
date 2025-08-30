import type React from 'react'
import type { SvgFile } from '@/App'
import IconCard from '@/components/IconCard'

interface AllIconsGridProps {
  files: SvgFile[]
  onCopy: () => void
}

const AllIconsGrid: React.FC<AllIconsGridProps> = ({ files, onCopy }) => {
  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name))
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {sorted.map(file => (
        <IconCard key={`${file.folder}/${file.name}`} file={file} onCopy={onCopy} />
      ))}
    </div>
  )
}

export default AllIconsGrid

