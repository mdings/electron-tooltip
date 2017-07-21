module.exports = (() => {

    const electron = require('electron')
    const {BrowserWindow, app} = electron.remote
    const {ipcRenderer} = electron

    const path = require('path')
    const url = require('url')

    // Create the tooltop window
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

    tooltipWin.webContents.on('did-finish-load', () => {

        const tooltips = document.querySelectorAll('[data-tooltip]')
        const win = electron.remote.getCurrentWindow()

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

    // Dereference tooltip when app is closed
    app.on('window-all-closed', () => {

        tooltipWin = null
    })
})()