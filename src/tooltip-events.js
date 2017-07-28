const electron = require('electron')
const {BrowserWindow, app} = electron.remote
const {ipcRenderer, ipcMain} = electron
const tooltipWindow = electron.remote.getCurrentWindow()
const elm = document.getElementById('electron-tooltip')

elm.addEventListener('transitionend', e => {

    if (e.target.style.opacity == 0) {
        elm.innerHTML = ''
        tooltipWindow.hide()
    }
})

// Inherits styling from the element as defined in the host window
ipcRenderer.on('set-styling', (e, props) => {

    for (let key in props) {

        elm.style[key] = props[key]
    }
})

ipcRenderer.on('reset-content', e => {

    elm.style.transform = 'scale3d(.4,.4,1)'
    elm.style.opacity = 0;
    elm.removeAttribute('class')
})

ipcRenderer.on('set-content', (e, details) => {

    const {config, content, elmDimensions, originalWinBounds} = details

    // Set the input for the tooltip and resize the window to match the contents
    if (parseInt(config.width) > 0) {

        elm.style.maxWidth = `${parseInt(config.width)}px`
        elm.style.whiteSpace = 'normal'

    } else {

        elm.style.maxWidth = 'none'
        elm.style.whiteSpace = 'nowrap'
    }

    elm.style.opacity = 1;
    elm.style.transform = 'scale3d(1, 1, 1)'
    elm.classList.add(`position-${config.position}`)
    elm.innerHTML = content

    // 12 = the margins on boths sides
    tooltipWindow.setContentSize(elm.clientWidth + 12, elm.clientHeight + 12)

    // Calculate the position of the element on the screen. Below consts return the topleft position of the element that should hold the tooltip
    var elmOffsetLeft = Math.round(originalWinBounds.x + elmDimensions.left)
    var elmOffsetTop = Math.round(originalWinBounds.y + elmDimensions.top)

    let positions = {
        top() {
            const top = elmOffsetTop - tooltipWindow.getContentSize()[1] - Math.max(0, config.offset)
            return [this.horizontalCenter(), top]
        },

        bottom() {
            const top = elmOffsetTop + elmDimensions.height + Math.max(0, config.offset)
            return [this.horizontalCenter(), top]
        },

        left() {
            const left = elmOffsetLeft - tooltipWindow.getContentSize()[0] - Math.max(0, config.offset)
            return [left, this.verticalCenter()]
        },

        right() {
            const left = elmOffsetLeft + Math.round(elmDimensions.width) + Math.max(0, config.offset)
            return [left, this.verticalCenter()]
        },

        horizontalCenter() {
            return elmOffsetLeft - (Math.round((tooltipWindow.getContentSize()[0] - elmDimensions.width) / 2))
        },

        verticalCenter() {
            return elmOffsetTop - (Math.round((tooltipWindow.getContentSize()[1] - elmDimensions.height) / 2))
        }
    }

    // Position the tooltip
    const getPosition = positions[config.position]()
    tooltipWindow.setPosition(...getPosition)

    // Show it as inactive
    process.nextTick(() => {
        tooltipWindow.showInactive()
    })
})
