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
  const [onChangeCallback, onChangeCommittedCallback] = useMemo(() => {
    const callbacks = [() => {}, () => {}]

    if (typeof onChangeProp === 'function') {
      callbacks.splice(0, 1, onChangeProp)
    }

    if (typeof onChangeCommittedProp === 'function') {
      callbacks.splice(1, 1, onChangeCommittedProp)
    }

    return callbacks
  }, [onChangeProp, onChangeCommittedProp])
  const onChangeDebounced = useMemo(() => {
    return debounce(
      (evt, value, activeThumb) => {
        if (evt instanceof MouseEvent) {
          setValue(value)
          onChangeCallback(evt, value, activeThumb)
        }
      },
      25,
      { leading: true, maxWait: 50 }
    )
  }, [setValue, onChangeCallback])
  const handleOnChange = useCallback(
    (evt, value, activeThumb) => {
      onChangeDebounced(evt, value, activeThumb)
    },
    [onChangeDebounced]
  )
  const handleOnChangeCommitted = useCallback(
    (evt, value) => {
      const threshold = delta || defaultOptions.delta
      const setValueCallback = () => {
        setValue(value)
        onChangeCommittedCallback(evt, value)
      }

      if (evt instanceof TouchEvent) {
        const { changedTouches } = evt
        const touches = Array.from(changedTouches)

        if (
          Array.isArray(touches) &&
          touches.length > 0 &&
          Math.abs(touchStartY - touches[0].pageY) < threshold
        ) {
          setValueCallback()
        }
      } else {
        setValueCallback()
      }
    },
    [delta, touchStartY, onChangeCommittedCallback]
  )

  useLayoutEffect(() => {
    const refCurrent = ref.current
    const handleTouchStart = ({ changedTouches }) => {
      const touches = Array.from(changedTouches)

      if (Array.isArray(touches) && touches.length > 0) {
        setTouchStartY(touches[0].pageY)
      }
    }

    if (refCurrent) {
      refCurrent.addEventListener('touchstart', handleTouchStart)
    }

    return () => {
      if (refCurrent) {
        refCurrent.removeEventListener('touchstart', handleTouchStart)
      }
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
