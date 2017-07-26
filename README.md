# Electron tooltip

## Description

This module is intended to be used in Electron applications. It allows for tooltips to flow outside the window bounds they're called from.

## Installation

```javascript
npm install --save-dev electron-tooltip
```

## Usage
After importing the module, it will search for elements that have the data-tooltip attribute attached. All further configuration is done through additional data-attributes.

```javascript
// in the render process..
require('electron-tooltip')
```

```html
<a href="http://www.facebook.com" data-tooltip="Go to Facebook"></a>
```

### Configuration options

|option|description|default|values|
|---|---|---|---|
|data-position|Tooltip direction|top|left, top, right, bottom|
|data-width|Max-size of the tooltip. If no max-size is given, the tooltip will not wrap content|none|> 0|
|data-offset|Offset from the element to the tooltip|0|> 0|

### Styling
The tooltips are somewhat styleable with regular CSS using the `.electron-tooltip` selector. With somewhat I mean that not all properties are currently stylable. Also note that the classname doesn't necessarily have to be defined on the element itself. The following properties are currently supported:

- text-align
- padding
- border-radius
- background-color
- font-family
- font-size
- color
- line-height
