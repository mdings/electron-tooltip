module.exports = (() => {

    const electron = require('electron')
    const {BrowserWindow, app} = electron.remote
    const {ipcRenderer} = electron
    const win = electron.remote.getCurrentWindow()

    const path = require('path')
    const url = require('url')

    let tooltipWin = new BrowserWindow({
        resizable: false,
        alwaysOnTop: true,
        focusable: false,
        frame: false,
        show: false,
        hasShadow: false,
        transparent: true
    })

    tooltipWin.loadURL(url.format({
        pathname: path.join(__dirname, 'electron-tooltip.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Remove the tooltip window object when the host window is being closed or reloaded.
    // Cannot win.on('close') here since the BW was created in the render process using remote.
    // See: https://github.com/electron/electron/issues/8196
    window.onbeforeunload = (e) => {

        tooltipWin.destroy()
        tooltipWin = null
    }

    tooltipWin.webContents.on('did-finish-load', () => {

        const tooltips = document.querySelectorAll('[data-tooltip]')


        // Create a fake element to apply the styling onto
        // @todo: find a way to get the properties without having to append an element to the body
        const fakeElm = document.createElement('div')
        fakeElm.classList.add('electron-tooltip')
        fakeElm.style.display = 'none'
        document.body.appendChild(fakeElm)
        const computedProperties = window.getComputedStyle(fakeElm)

        tooltipWin.webContents.send('set-styling', computedProperties)

        Array.prototype.forEach.call(tooltips, tooltip => {

            tooltip.addEventListener('mouseenter', (e) => {

                const content = e.target.getAttribute('data-tooltip')
                const dimensions = e.target.getBoundingClientRect()
                const config = {
                    offset: e.target.getAttribute('data-tooltip-offset') || 0,
                    width: e.target.getAttribute('data-tooltip-width') || null,
                    position: e.target.getAttribute('data-tooltip-position') || 'top'
                }

                tooltipWin.webContents.send('set-content', {
                    config: config,
                    content: content,
                    elmDimensions: dimensions,
                    originalWinBounds: win.getContentBounds()
                })
            })

            tooltip.addEventListener('mouseleave', (e) => {

                tooltipWin.webContents.send('reset-content')
            })
        })
    })

})()