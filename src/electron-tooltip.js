module.exports = ((params = {}) => {

    // Extend the default configuration
    const config = Object.assign({
        offset: '0',
        position: 'top',
        width: 'auto',
        style: {}
    }, params)

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
    window.onbeforeunload = e => {
        tooltipWin.destroy()
        tooltipWin = null
    }

    tooltipWin.webContents.on('did-finish-load', () => {

        tooltipWin.webContents.send('set-styling', config.style)

        const tooltips = document.querySelectorAll('[data-tooltip]')
        Array.prototype.forEach.call(tooltips, tooltip => {
            tooltip.addEventListener('mouseenter', e => {
                const content = e.target.getAttribute('data-tooltip')
                const dimensions = e.target.getBoundingClientRect()
                const localConfig = {
                    offset: e.target.getAttribute('data-tooltip-offset') || config.offset,
                    width: e.target.getAttribute('data-tooltip-width') || config.width,
                    position: e.target.getAttribute('data-tooltip-position') || config.position
                }

                tooltipWin.webContents.send('set-content', {
                    config: localConfig,
                    content: content,
                    elmDimensions: dimensions,
                    originalWinBounds: win.getContentBounds()
                })
            })

            tooltip.addEventListener('mouseleave', e => {
                tooltipWin.webContents.send('reset-content')
            })
        })
    })

})
