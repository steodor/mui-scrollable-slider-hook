# [`mui-scrollable-slider-hook`](https://www.npmjs.com/package/mui-scrollable-slider-hook)

![CI](https://github.com/morganney/mui-scrollable-slider-hook/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/morganney/mui-scrollable-slider-hook/branch/develop/graph/badge.svg?token=ZDOYLLR6M4)](https://codecov.io/gh/morganney/mui-scrollable-slider-hook)

Prevents unwanted [MUI Slider](https://mui.com/components/slider/) changes while scrolling on a mobile device.

## Usage

First `npm i mui-scrollable-slider-hook react react-dom @mui/material @emotion/styled @emotion/react`.

Then when you want to prevent slider values from changing while scrolling on your phone:

```js
import Slider from '@mui/material/Slider'
import { useMuiScrollableSlider } from 'mui-scrollable-slider-hook'

const App = () => {
  const { ref, value, onChange, onChangeCommitted } = useMuiScrollableSlider()

  return (
    <Slider
      ref={ref}
      value={value}
      onChange={onChange}
      onChangeCommitted={onChangeCommitted}
    />
  )
}
```

## Advanced Usage

The hook supports an `options` object:

* `value` The initial Slider value. Default is `0`.
* `delta` The range over which the y-coordinate of touch points can vary from start touch to end touch. See [`Touch.pageY`](https://developer.mozilla.org/en-US/docs/Web/API/Touch/pageY). Default is `50`.
* `onChange` Callback executed when the Slider value changes.
* `onChangeCommitted` Callback executed when the `mouseup` or `touchend` event fires on the Slider.

It can be used like this:

```js
const { ref, value, onChange, onChangeCommitted } = useMuiScrollableSlider({
  value: 15,
  delta: 25,
  onChange: (evt, value, activeThumb) => {
    console.log('onChangeCallback', evt, value, activeThumb)
  },
  onChangeCommitted: (evt, value) => {
    console.log('onChangeCommittedCallback', evt, value)
  }
})

return (
  <Slider
    ref={ref}
    value={value}
    onChange={onChange}
    onChangeCommitted={onChangeCommitted}
  />
)
```

Or made reusable:

```js
import Slider from '@mui/material/Slider'
import { useMuiScrollableSlider } from 'mui-scrollable-slider-hook'

const MobileSlider = ({
  delta = 50,
  value = 0,
  onChange = () => {},
  onChangeCommitted = () => {},
  ...rest
}) => {
  const hookProps = useMuiScrollableSlider({
    delta,
    value,
    onChange,
    onChangeCommitted
  })

  return <Slider {...hookProps} {...rest} />
}

export { MobileSlider }
```

See it on [CodeSandbox](https://codesandbox.io/embed/mui-scrollable-slider-hook-ljs6g?fontsize=14&hidenavigation=1&theme=dark).
