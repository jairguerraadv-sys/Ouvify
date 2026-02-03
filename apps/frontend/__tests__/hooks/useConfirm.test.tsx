import { renderHook, act } from '@testing-library/react'
import { useConfirm } from '@/hooks/useConfirm'

describe('useConfirm Hook', () => {
  it('initializes with closed state', () => {
    const { result } = renderHook(() => useConfirm())
    
    expect(result.current.confirmState.isOpen).toBe(false)
    expect(result.current.confirmState.title).toBe('')
    expect(result.current.confirmState.description).toBe('')
  })

  it('opens confirmation dialog', () => {
    const { result } = renderHook(() => useConfirm())

    act(() => {
      result.current.confirm({
        title: 'Delete Item',
        description: 'Are you sure?',
      })
    })

    expect(result.current.confirmState.isOpen).toBe(true)
    expect(result.current.confirmState.title).toBe('Delete Item')
    expect(result.current.confirmState.description).toBe('Are you sure?')
  })

  it('returns promise that resolves on confirm', async () => {
    const { result } = renderHook(() => useConfirm())

    let confirmResult: boolean | undefined
    
    act(() => {
      result.current.confirm({
        title: 'Test',
        description: 'Test description',
      }).then((res) => {
        confirmResult = res
      })
    })

    act(() => {
      result.current.handleConfirm()
    })

    // Wait for promise to resolve
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(confirmResult).toBe(true)
  })

  it('returns promise that resolves on cancel', async () => {
    const { result } = renderHook(() => useConfirm())

    let confirmResult: boolean | undefined
    
    act(() => {
      result.current.confirm({
        title: 'Test',
        description: 'Test description',
      }).then((res) => {
        confirmResult = res
      })
    })

    act(() => {
      result.current.handleCancel()
    })

    // Wait for promise to resolve
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(confirmResult).toBe(false)
  })

  it('closes dialog after confirmation', async () => {
    const { result } = renderHook(() => useConfirm())

    act(() => {
      result.current.confirm({
        title: 'Test',
        description: 'Test',
      })
    })

    expect(result.current.confirmState.isOpen).toBe(true)

    act(() => {
      result.current.handleConfirm()
    })

    expect(result.current.confirmState.isOpen).toBe(false)
  })

  it('closes dialog after cancellation', () => {
    const { result } = renderHook(() => useConfirm())

    act(() => {
      result.current.confirm({
        title: 'Test',
        description: 'Test',
      })
    })

    expect(result.current.confirmState.isOpen).toBe(true)

    act(() => {
      result.current.handleCancel()
    })

    expect(result.current.confirmState.isOpen).toBe(false)
  })

  it('supports custom confirm button text', () => {
    const { result } = renderHook(() => useConfirm())

    act(() => {
      result.current.confirm({
        title: 'Test',
        description: 'Test',
        confirmText: 'Delete',
      })
    })

    expect(result.current.confirmState.confirmText).toBe('Delete')
  })

  it('supports custom cancel button text', () => {
    const { result } = renderHook(() => useConfirm())

    act(() => {
      result.current.confirm({
        title: 'Test',
        description: 'Test',
        cancelText: 'Keep',
      })
    })

    expect(result.current.confirmState.cancelText).toBe('Keep')
  })

  it('manages loading state', () => {
    const { result } = renderHook(() => useConfirm())

    expect(result.current.confirmState.isLoading).toBe(false)

    act(() => {
      result.current.setLoading(true)
    })

    expect(result.current.confirmState.isLoading).toBe(true)

    act(() => {
      result.current.setLoading(false)
    })

    expect(result.current.confirmState.isLoading).toBe(false)
  })
})
