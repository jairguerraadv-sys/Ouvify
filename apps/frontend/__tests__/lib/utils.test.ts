import { cn } from '@/lib/utils'

describe('Utils - cn function', () => {
  it('merges class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden')
    expect(result).toBe('base conditional')
  })

  it('handles undefined and null values', () => {
    const result = cn('base', undefined, null, 'end')
    expect(result).toBe('base end')
  })

  it('handles empty strings', () => {
    const result = cn('base', '', 'end')
    expect(result).toBe('base end')
  })

  it('handles array of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('handles object with boolean values', () => {
    const result = cn({
      base: true,
      active: true,
      hidden: false,
    })
    expect(result).toContain('base')
    expect(result).toContain('active')
    expect(result).not.toContain('hidden')
  })

  it('merges Tailwind classes correctly (overrides)', () => {
    const result = cn('px-2 py-1', 'px-4')
    // clsx + twMerge should keep only px-4 (last one wins)
    expect(result).toBe('py-1 px-4')
  })

  it('handles complex Tailwind class merging', () => {
    const result = cn('bg-red-500 text-white', 'bg-blue-500')
    expect(result).toBe('text-white bg-blue-500')
  })

  it('returns empty string for no arguments', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('handles multiple conditional classes', () => {
    const isActive = true
    const isDisabled = false
    const result = cn(
      'base',
      isActive && 'active',
      isDisabled && 'disabled',
      'end'
    )
    expect(result).toBe('base active end')
  })
})
