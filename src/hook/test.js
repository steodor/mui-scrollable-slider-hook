import { renderHook, act } from '@testing-library/react-hooks'

import { useMuiScrollableSlider } from './index'

const mockEventTarget = new EventTarget()

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(() => ({
    current: mockEventTarget
  }))
}))

describe('useMuiScrollableSlider', () => {
  it('prevents Slider changes when touch events are meant for scrolling', () => {
    const onChangeMock = jest.fn()
    const onChangeCommittedMock = jest.fn()
    const { result } = renderHook(() =>
      useMuiScrollableSlider({
        value: 15,
        onChange: onChangeMock,
        onChangeCommitted: onChangeCommittedMock
      })
    )
    const mouseEvent = new MouseEvent('click')
    const touchEndEvent = new TouchEvent('touchend', { changedTouches: [{ pageY: 40 }] })
    const scrollTouchEvent = new TouchEvent('touchend', {
      changedTouches: [{ pageY: 200 }]
    })

    expect(result.current.onChange).toStrictEqual(expect.any(Function))
    expect(result.current.onChangeCommitted).toStrictEqual(expect.any(Function))
    expect(result.current.value).toBe(15)

    act(() => {
      mockEventTarget.dispatchEvent(
        new TouchEvent('touchstart', {
          changedTouches: [{ pageY: 30 }]
        })
      )
    })

    act(() => {
      result.current.onChange(mouseEvent, 20)
    })

    expect(onChangeMock).toHaveBeenCalledWith(mouseEvent, 20, undefined)
    expect(result.current.value).toBe(20)

    act(() => {
      result.current.onChange(touchEndEvent, 25)
    })

    expect(result.current.value).toBe(20)

    act(() => {
      result.current.onChangeCommitted(touchEndEvent, 25)
    })

    expect(onChangeCommittedMock).toHaveBeenCalled()
    expect(result.current.value).toBe(25)

    act(() => {
      result.current.onChangeCommitted(mouseEvent, 30)
    })

    expect(onChangeCommittedMock).toHaveBeenCalled()
    expect(result.current.value).toBe(30)

    act(() => {
      result.current.onChangeCommitted(scrollTouchEvent, 75)
    })

    expect(onChangeCommittedMock).not.toHaveBeenCalledWith(scrollTouchEvent, 75)
    expect(result.current.value).toBe(30)
  })

  it('uses defaults and ignores callback options that are not functions', () => {
    const { result } = renderHook(() =>
      useMuiScrollableSlider({
        delta: undefined,
        value: null,
        onChange: 'string',
        onChangeCommitted: 'string'
      })
    )

    expect(result.current.value).toBe(0)

    act(() => {
      result.current.onChange(new TouchEvent('touchend'), 10)
      result.current.onChangeCommitted(new MouseEvent('click'), 10)
    })

    expect(result.current.value).toBe(10)
  })

  it('changes value at a pageY < delta when no touchstart touches', () => {
    const { result } = renderHook(() => useMuiScrollableSlider())

    act(() => {
      mockEventTarget.dispatchEvent(
        new TouchEvent('touchstart', {
          changedTouches: []
        })
      )
    })

    act(() => {
      result.current.onChangeCommitted(
        new TouchEvent('touchend', { changedTouches: [{ pageY: 51 }] }),
        10
      )
    })
    expect(result.current.value).toBe(0)

    act(() => {
      result.current.onChangeCommitted(
        new TouchEvent('touchend', { changedTouches: [{ pageY: 49 }] }),
        10
      )
    })
    expect(result.current.value).toBe(10)
  })
})
