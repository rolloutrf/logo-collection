import type React from 'react'
import type { SvgFile } from '@/types'
import IconCard from '@/components/IconCard'
//

interface AllIconsSectionProps {
  files: SvgFile[]
  onCopy: () => void
}

const AllIconsSection: React.FC<AllIconsSectionProps> = ({ files, onCopy }) => {
  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name))
  return (
    <section id="all" className="scroll-mt-24">
      <div className="w-full" style={{ columnWidth: 180, columnGap: '1.25rem' }}>
        {sorted.map((file) => (
          <div key={`${file.folder}/${file.name}`} className="mb-16 inline-block w-full avoid-break">
            <IconCard file={file} onCopy={onCopy} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default AllIconsSection
