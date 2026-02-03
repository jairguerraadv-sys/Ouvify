import { renderHook, act } from '@testing-library/react'
import { useFormState } from '@/hooks/useFormState'

describe('useFormState Hook', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => 
      useFormState({ name: '', email: '' })
    )

    expect(result.current.values).toEqual({ name: '', email: '' })
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
  })

  it('handles input change', () => {
    const { result } = renderHook(() => 
      useFormState({ name: '' })
    )

    act(() => {
      result.current.handleChange('name', 'John Doe')
    })

    expect(result.current.values.name).toBe('John Doe')
  })

  it('marks field as touched on blur', () => {
    const { result } = renderHook(() => 
      useFormState({ email: '' })
    )

    act(() => {
      result.current.handleBlur('email')
    })

    expect(result.current.touched.email).toBe(true)
  })

  it('validates required fields', () => {
    const validate = (values: any) => {
      const errors: any = {}
      if (!values.name) {
        errors.name = 'Nome é obrigatório'
      }
      return errors
    }

    const { result } = renderHook(() => 
      useFormState({ name: '' }, validate)
    )

    act(() => {
      result.current.handleSubmit((values) => {
        // Submit handler
      })
    })

    expect(result.current.errors.name).toBe('Nome é obrigatório')
  })

  it('calls onSubmit when form is valid', () => {
    const onSubmit = jest.fn()
    const validate = () => ({}) // No errors

    const { result } = renderHook(() => 
      useFormState({ name: 'John' }, validate)
    )

    act(() => {
      result.current.handleSubmit(onSubmit)
    })

    expect(onSubmit).toHaveBeenCalledWith({ name: 'John' })
  })

  it('does not call onSubmit when form is invalid', () => {
    const onSubmit = jest.fn()
    const validate = () => ({ name: 'Error' })

    const { result } = renderHook(() => 
      useFormState({ name: '' }, validate)
    )

    act(() => {
      result.current.handleSubmit(onSubmit)
    })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('resets form to initial values', () => {
    const { result } = renderHook(() => 
      useFormState({ name: 'John', email: 'john@example.com' })
    )

    act(() => {
      result.current.handleChange('name', 'Jane')
      result.current.handleChange('email', 'jane@example.com')
    })

    expect(result.current.values.name).toBe('Jane')

    act(() => {
      result.current.reset()
    })

    expect(result.current.values).toEqual({ 
      name: 'John', 
      email: 'john@example.com' 
    })
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
  })

  it('sets custom error', () => {
    const { result } = renderHook(() => 
      useFormState({ email: '' })
    )

    act(() => {
      result.current.setError('email', 'Email inválido')
    })

    expect(result.current.errors.email).toBe('Email inválido')
  })

  it('clears specific error', () => {
    const { result } = renderHook(() => 
      useFormState({ email: '' })
    )

    act(() => {
      result.current.setError('email', 'Email inválido')
    })

    expect(result.current.errors.email).toBe('Email inválido')

    act(() => {
      result.current.clearError('email')
    })

    expect(result.current.errors.email).toBeUndefined()
  })
})
