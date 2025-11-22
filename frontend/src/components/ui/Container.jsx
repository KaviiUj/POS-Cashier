import React from 'react'

const Container = ({
  children,
  className = '',
  maxWidth = 'lg',
  ...props
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  }
  
  const maxWidthClass = maxWidthClasses[maxWidth] || maxWidthClasses.lg
  
  return (
    <div
      className={`
        mx-auto px-4
        ${maxWidthClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export default Container

