import { renderHook, act } from '@testing-library/react'
import { useNotification } from '@/hooks/useNotification'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    promise: jest.fn((promise) => promise),
    dismiss: jest.fn(),
  },
}))

describe('useNotification Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('provides notification methods', () => {
    const { result } = renderHook(() => useNotification())
    
    expect(typeof result.current.notify).toBe('function')
    expect(typeof result.current.success).toBe('function')
    expect(typeof result.current.error).toBe('function')
    expect(typeof result.current.warning).toBe('function')
    expect(typeof result.current.info).toBe('function')
  })

  it('shows success notification', () => {
    const { toast } = require('sonner')
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.success('Operation successful')
    })

    expect(toast.success).toHaveBeenCalledWith(
      'Operation successful',
      expect.objectContaining({ duration: 4000 })
    )
  })

  it('shows error notification with longer duration', () => {
    const { toast } = require('sonner')
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.error('Operation failed')
    })

    expect(toast.error).toHaveBeenCalledWith(
      'Operation failed',
      expect.objectContaining({ duration: 6000 })
    )
  })

  it('shows warning notification', () => {
    const { toast } = require('sonner')
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.warning('Please review')
    })

    expect(toast.warning).toHaveBeenCalledWith(
      'Please review',
      expect.any(Object)
    )
  })

  it('shows info notification', () => {
    const { toast } = require('sonner')
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.info('Information message')
    })

    expect(toast.info).toHaveBeenCalledWith(
      'Information message',
      expect.any(Object)
    )
  })

  it('supports custom duration', () => {
    const { toast } = require('sonner')
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.success('Message', { duration: 8000 })
    })

    expect(toast.success).toHaveBeenCalledWith(
      'Message',
      expect.objectContaining({ duration: 8000 })
    )
  })

  it('supports action buttons', () => {
    const { toast } = require('sonner')
    const { result } = renderHook(() => useNotification())
    const actionFn = jest.fn()

    act(() => {
      result.current.info('Message', {
        action: {
          label: 'Undo',
          onClick: actionFn,
        },
      })
    })

    expect(toast.info).toHaveBeenCalledWith(
      'Message',
      expect.objectContaining({
        action: { label: 'Undo', onClick: actionFn },
      })
    )
  })

  it('supports description', () => {
    const { toast } = require('sonner')
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.success('Title', {
        description: 'Additional details',
      })
    })

    expect(toast.success).toHaveBeenCalledWith(
      'Title',
      expect.objectContaining({
        description: 'Additional details',
      })
    )
  })

  it('dismisses specific notification', () => {
    const { toast } = require('sonner')
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.dismiss('notification-1')
    })

    expect(toast.dismiss).toHaveBeenCalledWith('notification-1')
  })

  it('dismisses all notifications', () => {
    const { toast } = require('sonner')
    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.dismiss()
    })

    expect(toast.dismiss).toHaveBeenCalledWith()
  })

  it('handles promise notifications', async () => {
    const { toast } = require('sonner')
    const { result } = renderHook(() => useNotification())
    const testPromise = Promise.resolve('success')

    await act(async () => {
      await result.current.promise(testPromise, {
        loading: 'Loading...',
        success: 'Done!',
        error: 'Failed!',
      })
    })

    expect(toast.promise).toHaveBeenCalledWith(
      testPromise,
      expect.objectContaining({
        loading: 'Loading...',
        success: 'Done!',
        error: 'Failed!',
      })
    )
  })
})
