import { useMemo, useCallback, useState, useLayoutEffect, useRef } from 'react'
import debounce from 'lodash.debounce'

const defaultOptions = {
  value: 0,
  delta: 50,
  onChange: () => {},
  onChangeCommitted: () => {}
}
const useMuiScrollableSlider = options => {
  const {
    delta,
    value: valueProp,
    onChange: onChangeProp,
    onChangeCommitted: onChangeCommittedProp
  } = { ...defaultOptions, ...options }
  const ref = useRef(null)
  const [value, setValue] = useState(() => valueProp ?? 0)
  const [touchStartY, setTouchStartY] = useState(0)
  const onChangeDebounced = useMemo(() => {
    return debounce(
      (evt, value) => {
        if (evt instanceof MouseEvent) {
          setValue(value)
        }
      },
      25,
      { leading: true, maxWait: 50 }
    )
  }, [setValue])
  const handleOnChange = useCallback(
    (evt, value, activeThumb) => {
      onChangeDebounced(evt, value, activeThumb)

      if (typeof onChangeProp === 'function') {
        onChangeProp(evt, value, activeThumb)
      }
    },
    [onChangeDebounced, onChangeProp]
  )
  const onChangeCommitted = useMemo(() => {
    return (evt, value) => {
      const threshold = delta || defaultOptions.delta

      if (evt instanceof TouchEvent) {
        const { changedTouches } = evt
        const touches = Array.from(changedTouches)

        if (
          Array.isArray(touches) &&
          touches.length > 0 &&
          Math.abs(touchStartY - touches[0].pageY) < threshold
        ) {
          setValue(value)
        }
      } else {
        setValue(value)
      }
    }
  }, [delta, touchStartY])
  const handleOnChangeCommitted = useCallback(
    (evt, value) => {
      onChangeCommitted(evt, value)

      if (typeof onChangeCommittedProp === 'function') {
        onChangeCommittedProp(evt, value)
      }
    },
    [onChangeCommitted, onChangeCommittedProp]
  )

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('touchstart', ({ changedTouches }) => {
        const touches = Array.from(changedTouches)

        if (Array.isArray(touches) && touches.length > 0) {
          setTouchStartY(touches[0].pageY)
        }
      })
    }
  }, [ref])

  return {
    ref,
    value,
    onChange: handleOnChange,
    onChangeCommitted: handleOnChangeCommitted
  }
}

export { useMuiScrollableSlider }
