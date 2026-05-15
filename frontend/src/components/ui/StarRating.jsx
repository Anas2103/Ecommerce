import { Star } from 'lucide-react'

export default function StarRating({ rating = 0, max = 5, size = 16, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={`${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-slate-600'} ${interactive ? 'cursor-pointer hover:text-yellow-400 hover:fill-yellow-400 transition-colors' : ''}`}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
    </div>
  )
}

