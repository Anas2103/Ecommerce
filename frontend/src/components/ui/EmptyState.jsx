import { Link } from 'react-router-dom'

export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, actionTo, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {Icon && (
        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center mb-4" style={{ borderRadius: '4px' }}>
          <Icon size={36} className="text-gray-400" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
      {subtitle && <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{subtitle}</p>}
      {actionLabel && (
        actionTo
          ? <Link to={actionTo} className="btn-primary">{actionLabel}</Link>
          : <button onClick={onAction} className="btn-primary">{actionLabel}</button>
      )}
    </div>
  )
}

