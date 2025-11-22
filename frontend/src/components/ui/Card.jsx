import React from 'react'

const Card = ({
  children,
  className = '',
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  const paddingClass = paddingClasses[padding] || paddingClasses.md
  
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md
        ${paddingClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card

