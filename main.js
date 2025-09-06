const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, 'assets/icon.png'),
        title: '🎮 AWS 노들섬 퀴즈 RPG',
        resizable: true,
        show: false
    });

    win.loadFile('index.html');
    
    win.once('ready-to-show', () => {
        win.show();
    });

    // 개발 모드에서 DevTools 열기
    if (process.argv.includes('--dev')) {
        win.webContents.openDevTools();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});