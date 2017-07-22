const electron = require('electron')
const {BrowserWindow, app} = electron.remote
const {ipcRenderer, ipcMain} = electron
const tooltipWindow = electron.remote.getCurrentWindow()
const elm = document.getElementById('electron-tooltip')
const inheritProperties = require('./props')

process.on('uncaughtException', function(err) {

    electron.remote.process.log(err)
});

elm.addEventListener('transitionend', (e) => {

    if (e.target.style.opacity == 0) {

        elm.innerHTML = ''
        tooltipWindow.hide()
    }
})

// Inherits styling from the element as defined in the host window
ipcRenderer.on('set-styling', (e, props) => {

    inheritProperties.forEach(prop => {

        elm.style[prop] = props[prop]
    })
})

ipcRenderer.on('reset-content', e => {

    elm.style.transform = 'scale3d(.4,.4,1)'
    elm.style.opacity = 0;
    elm.removeAttribute('class')
})

ipcRenderer.on('set-content', (e, details) => {

    const {config, content, elmDimensions, originalWinBounds} = details

    // Set the input for the tooltip and resize the window to match the contents
    if (config.width) {

        elm.style.maxWidth = `${parseInt(config.width)}px`
        elm.style.whiteSpace = 'normal'

    } else {

        elm.style.maxWidth = 'none'
        elm.style.whiteSpace = 'nowrap'
    }

    elm.style.opacity = 1;
    elm.style.transform = 'scale3d(1, 1, 1)'
    elm.innerHTML = content

    // 16 = the arrow height + margin-top of the tooltip
    tooltipWindow.setContentSize(elm.clientWidth, elm.clientHeight + 16)

    // Calculate the position of the element on the screen. Below consts return the topleft position of the element that should hold the tooltip
    const elmOffsetLeft = Math.round(originalWinBounds.x + elmDimensions.left)
    const elmOffsetTop = Math.round(originalWinBounds.y + elmDimensions.top)

    // Set the tooltip above the element with 5px extra offset
    const top = config.position == 'bottom'
        ? elmOffsetTop + elmDimensions.height
        : elmOffsetTop - tooltipWindow.getContentSize()[1]
    elm.classList.add(`position-${config.position}`)

    // Center the tooltip above the element where possible
    const left = elmOffsetLeft - (Math.round((tooltipWindow.getContentSize()[0] - elmDimensions.width) / 2))
    tooltipWindow.setPosition(left, top)

    // Show it as inactive
    process.nextTick(() => {
        tooltipWindow.showInactive()
    })
})