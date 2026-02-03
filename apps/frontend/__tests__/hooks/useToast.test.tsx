import { renderHook, act, waitFor } from '@testing-library/react'
import { useToast } from '@/hooks/use-toast'

describe('useToast Hook', () => {
  it('initializes with empty toasts', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toasts).toEqual([])
  })

  it('adds a toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'Test description',
      })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Test Toast',
      description: 'Test description',
    })
  })

  it('adds multiple toasts', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ title: 'Toast 1' })
      result.current.toast({ title: 'Toast 2' })
      result.current.toast({ title: 'Toast 3' })
    })

    expect(result.current.toasts).toHaveLength(3)
  })

  it('dismisses a toast', () => {
    const { result } = renderHook(() => useToast())

    let toastId: string

    act(() => {
      const { id } = result.current.toast({ title: 'Test Toast' })
      toastId = id!
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      result.current.dismiss(toastId)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('creates toast with different variants', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({
        title: 'Default',
        variant: 'default',
      })
      result.current.toast({
        title: 'Destructive',
        variant: 'destructive',
      })
    })

    expect(result.current.toasts[0].variant).toBe('default')
    expect(result.current.toasts[1].variant).toBe('destructive')
  })

  it('auto-dismisses after duration', async () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({
        title: 'Auto Dismiss',
        duration: 1000,
      })
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(result.current.toasts).toHaveLength(0)
    })

    jest.useRealTimers()
  })

  it('allows custom action', () => {
    const { result } = renderHook(() => useToast())
    const actionFn = jest.fn()

    act(() => {
      result.current.toast({
        title: 'Action Toast',
        action: {
          label: 'Undo',
          onClick: actionFn,
        },
      })
    })

    expect(result.current.toasts[0].action).toBeDefined()
    expect(result.current.toasts[0].action?.label).toBe('Undo')
  })
})
