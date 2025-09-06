// Professional RPG Maker XP Style Map Editor
class ProfessionalMapEditor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // Editor state
        this.isActive = false;
        this.currentTool = 'paint';
        this.currentLayer = 0;
        this.selectedTileId = 1;
        this.brushSize = 1;
        this.gridSnap = true;
        
        // Map data - 5 layers
        this.mapWidth = 50;
        this.mapHeight = 40;
        this.tileSize = 32;
        this.layers = [
            { name: 'Background', data: [], visible: true, opacity: 1.0, locked: false },
            { name: 'Midground', data: [], visible: true, opacity: 1.0, locked: false },
            { name: 'Foreground', data: [], visible: true, opacity: 1.0, locked: false },
            { name: 'Objects', data: [], visible: true, opacity: 1.0, locked: false },
            { name: 'Events', data: [], visible: true, opacity: 0.7, locked: false }
        ];
        
        // Initialize layers
        this.initializeLayers();
        
        // Undo/Redo system
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        
        // UI state
        this.ui = {
            leftPanel: { x: 0, y: 0, width: 250, height: 0, visible: true },
            rightPanel: { x: 0, y: 0, width: 200, height: 0, visible: true },
            bottomPanel: { x: 0, y: 0, width: 0, height: 150, visible: true },
            minimap: { x: 0, y: 0, width: 150, height: 120, visible: true }
        };
        
        // Tileset data
        this.tilesets = {
            terrain: {
                name: 'Terrain',
                tiles: [
                    { id: 1, name: 'Grass', category: 'terrain', walkable: true, animated: false },
                    { id: 2, name: 'Water', category: 'terrain', walkable: false, animated: true },
                    { id: 3, name: 'Stone', category: 'terrain', walkable: true, animated: false },
                    { id: 4, name: 'Sand', category: 'terrain', walkable: true, animated: false },
                    { id: 5, name: 'Dirt', category: 'terrain', walkable: true, animated: false }
                ]
            },
            objects: {
                name: 'Objects',
                tiles: [
                    { id: 10, name: 'Tree', category: 'objects', walkable: false, animated: false },
                    { id: 11, name: 'Rock', category: 'objects', walkable: false, animated: false },
                    { id: 12, name: 'Flower', category: 'objects', walkable: true, animated: true },
                    { id: 13, name: 'Bush', category: 'objects', walkable: false, animated: false }
                ]
            },
            buildings: {
                name: 'Buildings',
                tiles: [
                    { id: 20, name: 'House', category: 'buildings', walkable: false, animated: false },
                    { id: 21, name: 'Shop', category: 'buildings', walkable: false, animated: false },
                    { id: 22, name: 'Tower', category: 'buildings', walkable: false, animated: false }
                ]
            },
            npcs: {
                name: 'NPCs',
                tiles: [
                    { id: 30, name: 'Villager', category: 'npcs', walkable: false, animated: true },
                    { id: 31, name: 'Guard', category: 'npcs', walkable: false, animated: true },
                    { id: 32, name: 'Merchant', category: 'npcs', walkable: false, animated: true }
                ]
            }
        };
        
        this.currentTileset = 'terrain';
        this.selectedTiles = [];
        
        // Camera
        this.camera = { x: 0, y: 0, zoom: 1.0 };
        
        // Tools
        this.tools = {
            paint: { name: 'Paint', icon: '🖌️', cursor: 'crosshair' },
            fill: { name: 'Fill', icon: '🪣', cursor: 'crosshair' },
            rectangle: { name: 'Rectangle', icon: '⬜', cursor: 'crosshair' },
            circle: { name: 'Circle', icon: '⭕', cursor: 'crosshair' },
            line: { name: 'Line', icon: '📏', cursor: 'crosshair' },
            select: { name: 'Select', icon: '🔲', cursor: 'default' },
            clone: { name: 'Clone', icon: '📋', cursor: 'copy' },
            eraser: { name: 'Eraser', icon: '🧽', cursor: 'crosshair' }
        };
        
        // Selection
        this.selection = {
            active: false,
            startX: 0, startY: 0,
            endX: 0, endY: 0,
            data: null
        };
        
        // Drawing state
        this.isDrawing = false;
        this.drawStart = { x: 0, y: 0 };
        this.lastDrawPos = { x: -1, y: -1 };
        
        this.setupEventListeners();
        this.calculateLayout();
    }
    
    initializeLayers() {
        for (let layer of this.layers) {
            layer.data = [];
            for (let y = 0; y < this.mapHeight; y++) {
                const row = [];
                for (let x = 0; x < this.mapWidth; x++) {
                    row.push(0); // 0 = empty
                }
                layer.data.push(row);
            }
        }
    }
    
    calculateLayout() {
        const canvasRect = this.canvas.getBoundingClientRect();
        this.ui.leftPanel.height = this.canvas.height;
        this.ui.rightPanel.x = this.canvas.width - this.ui.rightPanel.width;
        this.ui.rightPanel.height = this.canvas.height;
        this.ui.bottomPanel.y = this.canvas.height - this.ui.bottomPanel.height;
        this.ui.bottomPanel.width = this.canvas.width;
        
        // Minimap position (top-right of right panel)
        this.ui.minimap.x = this.ui.rightPanel.x + 25;
        this.ui.minimap.y = 20;
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    }
    
    activate() {
        this.isActive = true;
        this.canvas.style.cursor = this.tools[this.currentTool].cursor;
    }
    
    deactivate() {
        this.isActive = false;
        this.canvas.style.cursor = 'default';
    }
    
    onMouseDown(e) {
        if (!this.isActive) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Check UI interactions first
        if (this.handleUIClick(mouseX, mouseY)) return;
        
        // Convert to world coordinates
        const worldPos = this.screenToWorld(mouseX, mouseY);
        const tileX = Math.floor(worldPos.x / this.tileSize);
        const tileY = Math.floor(worldPos.y / this.tileSize);
        
        if (tileX < 0 || tileX >= this.mapWidth || tileY < 0 || tileY >= this.mapHeight) return;
        
        this.isDrawing = true;
        this.drawStart = { x: tileX, y: tileY };
        this.lastDrawPos = { x: tileX, y: tileY };
        
        // Save state for undo
        this.saveState();
        
        switch (this.currentTool) {
            case 'paint':
                this.paintTile(tileX, tileY);
                break;
            case 'fill':
                this.floodFill(tileX, tileY);
                break;
            case 'eraser':
                this.eraseTile(tileX, tileY);
                break;
            case 'select':
                this.startSelection(tileX, tileY);
                break;
            case 'clone':
                this.cloneTile(tileX, tileY);
                break;
        }
    }
    
    onMouseMove(e) {
        if (!this.isActive) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldPos = this.screenToWorld(mouseX, mouseY);
        const tileX = Math.floor(worldPos.x / this.tileSize);
        const tileY = Math.floor(worldPos.y / this.tileSize);
        
        if (!this.isDrawing) return;
        if (tileX < 0 || tileX >= this.mapWidth || tileY < 0 || tileY >= this.mapHeight) return;
        
        switch (this.currentTool) {
            case 'paint':
                if (tileX !== this.lastDrawPos.x || tileY !== this.lastDrawPos.y) {
                    this.paintTile(tileX, tileY);
                    this.lastDrawPos = { x: tileX, y: tileY };
                }
                break;
            case 'eraser':
                if (tileX !== this.lastDrawPos.x || tileY !== this.lastDrawPos.y) {
                    this.eraseTile(tileX, tileY);
                    this.lastDrawPos = { x: tileX, y: tileY };
                }
                break;
            case 'select':
                this.updateSelection(tileX, tileY);
                break;
        }
    }
    
    onMouseUp(e) {
        if (!this.isActive || !this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldPos = this.screenToWorld(mouseX, mouseY);
        const tileX = Math.floor(worldPos.x / this.tileSize);
        const tileY = Math.floor(worldPos.y / this.tileSize);
        
        switch (this.currentTool) {
            case 'rectangle':
                this.drawRectangle(this.drawStart.x, this.drawStart.y, tileX, tileY);
                break;
            case 'circle':
                this.drawCircle(this.drawStart.x, this.drawStart.y, tileX, tileY);
                break;
            case 'line':
                this.drawLine(this.drawStart.x, this.drawStart.y, tileX, tileY);
                break;
            case 'select':
                this.finishSelection(tileX, tileY);
                break;
        }
        
        this.isDrawing = false;
    }
    
    onWheel(e) {
        if (!this.isActive) return;
        
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.camera.zoom = Math.max(0.25, Math.min(4.0, this.camera.zoom * zoomFactor));
    }
    
    onKeyDown(e) {
        if (!this.isActive) return;
        
        switch (e.key) {
            case 'z':
                if (e.ctrlKey) {
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                }
                break;
            case 'g':
                this.gridSnap = !this.gridSnap;
                break;
            case '1': case '2': case '3': case '4': case '5':
                this.currentLayer = parseInt(e.key) - 1;
                break;
            case 'Delete':
                if (this.selection.active) {
                    this.deleteSelection();
                }
                break;
        }
        
        // Tool shortcuts
        const toolKeys = {
            'b': 'paint', 'f': 'fill', 'r': 'rectangle', 'c': 'circle',
            'l': 'line', 's': 'select', 'k': 'clone', 'e': 'eraser'
        };
        
        if (toolKeys[e.key]) {
            this.setTool(toolKeys[e.key]);
        }
    }
    
    onKeyUp(e) {
        // Handle key releases if needed
    }
    
    handleUIClick(mouseX, mouseY) {
        // Left panel - Tileset
        if (this.ui.leftPanel.visible && mouseX < this.ui.leftPanel.width) {
            return this.handleTilesetClick(mouseX, mouseY);
        }
        
        // Right panel - Layers and tools
        if (this.ui.rightPanel.visible && mouseX > this.ui.rightPanel.x) {
            return this.handleRightPanelClick(mouseX, mouseY);
        }
        
        // Bottom panel - Properties
        if (this.ui.bottomPanel.visible && mouseY > this.ui.bottomPanel.y) {
            return this.handleBottomPanelClick(mouseX, mouseY);
        }
        
        return false;
    }
    
    handleTilesetClick(mouseX, mouseY) {
        // Tileset tabs
        const tabHeight = 30;
        const tabY = 50;
        
        if (mouseY >= tabY && mouseY < tabY + tabHeight) {
            const tilesetNames = Object.keys(this.tilesets);
            const tabWidth = this.ui.leftPanel.width / tilesetNames.length;
            const clickedTab = Math.floor(mouseX / tabWidth);
            
            if (clickedTab >= 0 && clickedTab < tilesetNames.length) {
                this.currentTileset = tilesetNames[clickedTab];
                return true;
            }
        }
        
        // Tile selection
        const tileStartY = tabY + tabHeight + 10;
        const tilesPerRow = Math.floor((this.ui.leftPanel.width - 20) / 34);
        const tileSize = 32;
        
        if (mouseY >= tileStartY) {
            const relativeX = mouseX - 10;
            const relativeY = mouseY - tileStartY;
            
            const tileCol = Math.floor(relativeX / 34);
            const tileRow = Math.floor(relativeY / 34);
            
            const tileset = this.tilesets[this.currentTileset];
            const tileIndex = tileRow * tilesPerRow + tileCol;
            
            if (tileIndex >= 0 && tileIndex < tileset.tiles.length) {
                this.selectedTileId = tileset.tiles[tileIndex].id;
                return true;
            }
        }
        
        return false;
    }
    
    handleRightPanelClick(mouseX, mouseY) {
        const panelX = mouseX - this.ui.rightPanel.x;
        
        // Tools section
        const toolsStartY = 200;
        const toolSize = 30;
        const toolsPerRow = Math.floor(this.ui.rightPanel.width / toolSize);
        
        if (mouseY >= toolsStartY && mouseY < toolsStartY + 120) {
            const toolCol = Math.floor(panelX / toolSize);
            const toolRow = Math.floor((mouseY - toolsStartY) / toolSize);
            const toolIndex = toolRow * toolsPerRow + toolCol;
            
            const toolNames = Object.keys(this.tools);
            if (toolIndex >= 0 && toolIndex < toolNames.length) {
                this.setTool(toolNames[toolIndex]);
                return true;
            }
        }
        
        // Layer section
        const layersStartY = 350;
        const layerHeight = 25;
        
        if (mouseY >= layersStartY) {
            const layerIndex = Math.floor((mouseY - layersStartY) / layerHeight);
            if (layerIndex >= 0 && layerIndex < this.layers.length) {
                // Check if clicking on visibility toggle
                if (panelX >= 10 && panelX <= 25) {
                    this.layers[layerIndex].visible = !this.layers[layerIndex].visible;
                    return true;
                }
                // Check if clicking on layer name
                else if (panelX >= 30) {
                    this.currentLayer = layerIndex;
                    return true;
                }
            }
        }
        
        return false;
    }
    
    handleBottomPanelClick(mouseX, mouseY) {
        // Property inspector clicks
        return false;
    }
    
    screenToWorld(screenX, screenY) {
        // Account for UI panels
        const mapAreaX = this.ui.leftPanel.visible ? this.ui.leftPanel.width : 0;
        const mapAreaY = 0;
        
        const relativeX = screenX - mapAreaX;
        const relativeY = screenY - mapAreaY;
        
        // Fix coordinate transformation
        const worldX = (relativeX / this.camera.zoom) + this.camera.x;
        const worldY = (relativeY / this.camera.zoom) + this.camera.y;
        
        return { x: worldX, y: worldY };
    }
    
    worldToScreen(worldX, worldY) {
        const mapAreaX = this.ui.leftPanel.visible ? this.ui.leftPanel.width : 0;
        const mapAreaY = 0;
        
        // Fix coordinate transformation
        const screenX = ((worldX - this.camera.x) * this.camera.zoom) + mapAreaX;
        const screenY = ((worldY - this.camera.y) * this.camera.zoom) + mapAreaY;
        
        return { x: screenX, y: screenY };
    }
    
    setTool(toolName) {
        if (this.tools[toolName]) {
            this.currentTool = toolName;
            this.canvas.style.cursor = this.tools[toolName].cursor;
            this.selection.active = false;
        }
    }
    
    paintTile(x, y) {
        if (this.layers[this.currentLayer].locked) return;
        
        const layer = this.layers[this.currentLayer];
        if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
            layer.data[y][x] = this.selectedTileId;
        }
    }
    
    eraseTile(x, y) {
        if (this.layers[this.currentLayer].locked) return;
        
        const layer = this.layers[this.currentLayer];
        if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
            layer.data[y][x] = 0;
        }
    }
    
    floodFill(startX, startY) {
        if (this.layers[this.currentLayer].locked) return;
        
        const layer = this.layers[this.currentLayer];
        const targetTile = layer.data[startY][startX];
        const replacementTile = this.selectedTileId;
        
        if (targetTile === replacementTile) return;
        
        const stack = [{x: startX, y: startY}];
        const visited = new Set();
        
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) continue;
            if (layer.data[y][x] !== targetTile) continue;
            
            visited.add(key);
            layer.data[y][x] = replacementTile;
            
            stack.push({x: x + 1, y: y});
            stack.push({x: x - 1, y: y});
            stack.push({x: x, y: y + 1});
            stack.push({x: x, y: y - 1});
        }
    }
    
    drawRectangle(x1, y1, x2, y2) {
        if (this.layers[this.currentLayer].locked) return;
        
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                this.paintTile(x, y);
            }
        }
    }
    
    drawCircle(centerX, centerY, edgeX, edgeY) {
        if (this.layers[this.currentLayer].locked) return;
        
        const radius = Math.sqrt(Math.pow(edgeX - centerX, 2) + Math.pow(edgeY - centerY, 2));
        
        for (let y = Math.floor(centerY - radius); y <= Math.ceil(centerY + radius); y++) {
            for (let x = Math.floor(centerX - radius); x <= Math.ceil(centerX + radius); x++) {
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                if (distance <= radius) {
                    this.paintTile(x, y);
                }
            }
        }
    }
    
    drawLine(x1, y1, x2, y2) {
        if (this.layers[this.currentLayer].locked) return;
        
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;
        
        let x = x1;
        let y = y1;
        
        while (true) {
            this.paintTile(x, y);
            
            if (x === x2 && y === y2) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }
    
    startSelection(x, y) {
        this.selection.active = true;
        this.selection.startX = x;
        this.selection.startY = y;
        this.selection.endX = x;
        this.selection.endY = y;
    }
    
    updateSelection(x, y) {
        if (this.selection.active) {
            this.selection.endX = x;
            this.selection.endY = y;
        }
    }
    
    finishSelection(x, y) {
        this.selection.endX = x;
        this.selection.endY = y;
        
        // Copy selection data
        const minX = Math.min(this.selection.startX, this.selection.endX);
        const maxX = Math.max(this.selection.startX, this.selection.endX);
        const minY = Math.min(this.selection.startY, this.selection.endY);
        const maxY = Math.max(this.selection.startY, this.selection.endY);
        
        this.selection.data = [];
        const layer = this.layers[this.currentLayer];
        
        for (let y = minY; y <= maxY; y++) {
            const row = [];
            for (let x = minX; x <= maxX; x++) {
                row.push(layer.data[y] ? layer.data[y][x] || 0 : 0);
            }
            this.selection.data.push(row);
        }
    }
    
    cloneTile(x, y) {
        if (this.selection.data && this.selection.active) {
            // Paste selection at new location
            const offsetX = x - this.selection.startX;
            const offsetY = y - this.selection.startY;
            
            for (let sy = 0; sy < this.selection.data.length; sy++) {
                for (let sx = 0; sx < this.selection.data[sy].length; sx++) {
                    const targetX = this.selection.startX + sx + offsetX;
                    const targetY = this.selection.startY + sy + offsetY;
                    
                    if (targetX >= 0 && targetX < this.mapWidth && targetY >= 0 && targetY < this.mapHeight) {
                        this.layers[this.currentLayer].data[targetY][targetX] = this.selection.data[sy][sx];
                    }
                }
            }
        }
    }
    
    deleteSelection() {
        if (!this.selection.active) return;
        
        const minX = Math.min(this.selection.startX, this.selection.endX);
        const maxX = Math.max(this.selection.startX, this.selection.endX);
        const minY = Math.min(this.selection.startY, this.selection.endY);
        const maxY = Math.max(this.selection.startY, this.selection.endY);
        
        const layer = this.layers[this.currentLayer];
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
                    layer.data[y][x] = 0;
                }
            }
        }
        
        this.selection.active = false;
    }
    
    saveState() {
        // Remove future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Add current state
        const state = {
            layers: this.layers.map(layer => ({
                ...layer,
                data: layer.data.map(row => [...row])
            }))
        };
        
        this.history.push(state);
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
        }
    }
    
    restoreState(state) {
        this.layers = state.layers.map(layer => ({
            ...layer,
            data: layer.data.map(row => [...row])
        }));
    }
    
    exportMap() {
        const exportData = {
            width: this.mapWidth,
            height: this.mapHeight,
            tileSize: this.tileSize,
            layers: this.layers,
            tilesets: this.tilesets,
            version: '1.0'
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    importMap(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            this.mapWidth = data.width;
            this.mapHeight = data.height;
            this.tileSize = data.tileSize || 32;
            this.layers = data.layers;
            this.tilesets = data.tilesets || this.tilesets;
            
            // Clear history
            this.history = [];
            this.historyIndex = -1;
            
            return true;
        } catch (error) {
            console.error('Failed to import map:', error);
            return false;
        }
    }
    
    render() {
        if (!this.isActive) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render map
        this.renderMap();
        
        // Render UI
        this.renderUI();
        
        // Render selection
        if (this.selection.active) {
            this.renderSelection();
        }
        
        // Render grid
        if (this.gridSnap) {
            this.renderGrid();
        }
    }
    
    renderMap() {
        const mapAreaX = this.ui.leftPanel.visible ? this.ui.leftPanel.width : 0;
        const mapAreaY = 0;
        const mapAreaWidth = this.canvas.width - (this.ui.leftPanel.visible ? this.ui.leftPanel.width : 0) - (this.ui.rightPanel.visible ? this.ui.rightPanel.width : 0);
        const mapAreaHeight = this.canvas.height - (this.ui.bottomPanel.visible ? this.ui.bottomPanel.height : 0);
        
        // Set clipping region for map area
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(mapAreaX, mapAreaY, mapAreaWidth, mapAreaHeight);
        this.ctx.clip();
        
        // Calculate visible tile range
        const startX = Math.floor(this.camera.x / this.tileSize);
        const startY = Math.floor(this.camera.y / this.tileSize);
        const endX = Math.min(startX + Math.ceil(mapAreaWidth / (this.tileSize * this.camera.zoom)) + 1, this.mapWidth);
        const endY = Math.min(startY + Math.ceil(mapAreaHeight / (this.tileSize * this.camera.zoom)) + 1, this.mapHeight);
        
        // Render layers
        for (let layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
            const layer = this.layers[layerIndex];
            if (!layer.visible) continue;
            
            this.ctx.globalAlpha = layer.opacity;
            
            for (let y = Math.max(0, startY); y < endY; y++) {
                for (let x = Math.max(0, startX); x < endX; x++) {
                    const tileId = layer.data[y][x];
                    if (tileId === 0) continue;
                    
                    const screenPos = this.worldToScreen(x * this.tileSize, y * this.tileSize);
                    const tileSize = this.tileSize * this.camera.zoom;
                    
                    this.renderTile(tileId, screenPos.x, screenPos.y, tileSize);
                }
            }
        }
        
        this.ctx.globalAlpha = 1.0;
        this.ctx.restore();
    }
    
    renderTile(tileId, x, y, size) {
        // Find tile info
        let tileInfo = null;
        for (let tilesetName in this.tilesets) {
            const tileset = this.tilesets[tilesetName];
            tileInfo = tileset.tiles.find(t => t.id === tileId);
            if (tileInfo) break;
        }
        
        if (!tileInfo) return;
        
        // Render based on tile type
        switch (tileInfo.category) {
            case 'terrain':
                this.renderTerrainTile(tileInfo, x, y, size);
                break;
            case 'objects':
                this.renderObjectTile(tileInfo, x, y, size);
                break;
            case 'buildings':
                this.renderBuildingTile(tileInfo, x, y, size);
                break;
            case 'npcs':
                this.renderNPCTile(tileInfo, x, y, size);
                break;
        }
    }
    
    renderTerrainTile(tileInfo, x, y, size) {
        const colors = {
            'Grass': '#4CAF50',
            'Water': '#2196F3',
            'Stone': '#9E9E9E',
            'Sand': '#FFC107',
            'Dirt': '#8D6E63'
        };
        
        this.ctx.fillStyle = colors[tileInfo.name] || '#666';
        this.ctx.fillRect(x, y, size, size);
        
        // Add texture
        if (tileInfo.name === 'Water' && tileInfo.animated) {
            this.ctx.fillStyle = '#64B5F6';
            const wave = Math.sin(Date.now() * 0.003) * 2;
            this.ctx.fillRect(x + 2, y + size/2 + wave, size - 4, 2);
        }
    }
    
    renderObjectTile(tileInfo, x, y, size) {
        const colors = {
            'Tree': '#2E7D32',
            'Rock': '#616161',
            'Flower': '#E91E63',
            'Bush': '#388E3C'
        };
        
        this.ctx.fillStyle = colors[tileInfo.name] || '#666';
        
        if (tileInfo.name === 'Tree') {
            // Tree trunk
            this.ctx.fillStyle = '#5D4037';
            this.ctx.fillRect(x + size*0.4, y + size*0.6, size*0.2, size*0.4);
            // Tree crown
            this.ctx.fillStyle = '#2E7D32';
            this.ctx.beginPath();
            this.ctx.arc(x + size/2, y + size*0.4, size*0.3, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            this.ctx.fillRect(x, y, size, size);
        }
    }
    
    renderBuildingTile(tileInfo, x, y, size) {
        const colors = {
            'House': '#8D6E63',
            'Shop': '#FF9800',
            'Tower': '#607D8B'
        };
        
        this.ctx.fillStyle = colors[tileInfo.name] || '#666';
        this.ctx.fillRect(x, y, size, size);
        
        // Add details
        this.ctx.fillStyle = '#424242';
        this.ctx.fillRect(x + size*0.1, y + size*0.1, size*0.8, size*0.8);
    }
    
    renderNPCTile(tileInfo, x, y, size) {
        // Body
        this.ctx.fillStyle = '#FF9800';
        this.ctx.fillRect(x + size*0.3, y + size*0.4, size*0.4, size*0.5);
        
        // Head
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size*0.3, size*0.15, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderUI() {
        // Left panel - Tileset
        if (this.ui.leftPanel.visible) {
            this.renderLeftPanel();
        }
        
        // Right panel - Tools and layers
        if (this.ui.rightPanel.visible) {
            this.renderRightPanel();
        }
        
        // Bottom panel - Properties
        if (this.ui.bottomPanel.visible) {
            this.renderBottomPanel();
        }
    }
    
    renderLeftPanel() {
        const panel = this.ui.leftPanel;
        
        // Panel background
        this.ctx.fillStyle = '#3a3a3a';
        this.ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
        
        // Title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('Tileset', 10, 25);
        
        // Tileset tabs
        const tilesetNames = Object.keys(this.tilesets);
        const tabHeight = 30;
        const tabY = 50;
        const tabWidth = panel.width / tilesetNames.length;
        
        tilesetNames.forEach((name, index) => {
            const x = index * tabWidth;
            const isActive = name === this.currentTileset;
            
            this.ctx.fillStyle = isActive ? '#555' : '#444';
            this.ctx.fillRect(x, tabY, tabWidth, tabHeight);
            
            this.ctx.strokeStyle = '#666';
            this.ctx.strokeRect(x, tabY, tabWidth, tabHeight);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(name, x + 5, tabY + 20);
        });
        
        // Tiles
        const tileset = this.tilesets[this.currentTileset];
        const tileStartY = tabY + tabHeight + 10;
        const tilesPerRow = Math.floor((panel.width - 20) / 34);
        const tileSize = 32;
        
        tileset.tiles.forEach((tile, index) => {
            const col = index % tilesPerRow;
            const row = Math.floor(index / tilesPerRow);
            const x = 10 + col * 34;
            const y = tileStartY + row * 34;
            
            // Tile background
            const isSelected = tile.id === this.selectedTileId;
            this.ctx.fillStyle = isSelected ? '#ffeb3b' : '#555';
            this.ctx.fillRect(x - 1, y - 1, tileSize + 2, tileSize + 2);
            
            // Render tile preview
            this.renderTile(tile.id, x, y, tileSize);
            
            // Tile border
            this.ctx.strokeStyle = '#666';
            this.ctx.strokeRect(x - 1, y - 1, tileSize + 2, tileSize + 2);
        });
    }
    
    renderRightPanel() {
        const panel = this.ui.rightPanel;
        
        // Panel background
        this.ctx.fillStyle = '#3a3a3a';
        this.ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
        
        // Minimap
        this.renderMinimap();
        
        // Tools section
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('Tools', panel.x + 10, 180);
        
        const toolNames = Object.keys(this.tools);
        const toolSize = 30;
        const toolsPerRow = Math.floor(panel.width / toolSize);
        const toolsStartY = 200;
        
        toolNames.forEach((toolName, index) => {
            const col = index % toolsPerRow;
            const row = Math.floor(index / toolsPerRow);
            const x = panel.x + col * toolSize;
            const y = toolsStartY + row * toolSize;
            
            const isActive = toolName === this.currentTool;
            this.ctx.fillStyle = isActive ? '#ffeb3b' : '#555';
            this.ctx.fillRect(x, y, toolSize - 2, toolSize - 2);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(this.tools[toolName].icon, x + 6, y + 20);
            
            this.ctx.strokeStyle = '#666';
            this.ctx.strokeRect(x, y, toolSize - 2, toolSize - 2);
        });
        
        // Layers section
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('Layers', panel.x + 10, 340);
        
        const layersStartY = 350;
        const layerHeight = 25;
        
        this.layers.forEach((layer, index) => {
            const y = layersStartY + index * layerHeight;
            const isActive = index === this.currentLayer;
            
            // Layer background
            this.ctx.fillStyle = isActive ? '#555' : '#444';
            this.ctx.fillRect(panel.x + 5, y, panel.width - 10, layerHeight - 2);
            
            // Visibility toggle
            this.ctx.fillStyle = layer.visible ? '#4CAF50' : '#666';
            this.ctx.fillRect(panel.x + 10, y + 5, 15, 15);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '10px Arial';
            this.ctx.fillText(layer.visible ? '👁' : '🚫', panel.x + 12, y + 15);
            
            // Layer name
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';\n            this.ctx.fillText(`${index + 1}. ${layer.name}`, panel.x + 30, y + 16);\n            \n            // Opacity indicator\n            this.ctx.fillStyle = '#888';\n            this.ctx.fillRect(panel.x + panel.width - 30, y + 8, 20, 8);\n            this.ctx.fillStyle = '#4CAF50';\n            this.ctx.fillRect(panel.x + panel.width - 30, y + 8, 20 * layer.opacity, 8);\n        });\n    }\n    \n    renderBottomPanel() {\n        const panel = this.ui.bottomPanel;\n        \n        // Panel background\n        this.ctx.fillStyle = '#3a3a3a';\n        this.ctx.fillRect(panel.x, panel.y, panel.width, panel.height);\n        \n        // Properties title\n        this.ctx.fillStyle = '#ffffff';\n        this.ctx.font = 'bold 14px Arial';\n        this.ctx.fillText('Properties', 10, panel.y + 25);\n        \n        // Current tool info\n        this.ctx.font = '12px Arial';\n        this.ctx.fillText(`Tool: ${this.tools[this.currentTool].name}`, 10, panel.y + 50);\n        this.ctx.fillText(`Layer: ${this.layers[this.currentLayer].name}`, 10, panel.y + 70);\n        this.ctx.fillText(`Tile: ${this.selectedTileId}`, 10, panel.y + 90);\n        this.ctx.fillText(`Zoom: ${(this.camera.zoom * 100).toFixed(0)}%`, 10, panel.y + 110);\n        \n        // Brush settings\n        this.ctx.fillText('Brush Size:', 200, panel.y + 50);\n        for (let i = 1; i <= 5; i++) {\n            const x = 200 + i * 25;\n            const y = panel.y + 60;\n            const isActive = i === this.brushSize;\n            \n            this.ctx.fillStyle = isActive ? '#ffeb3b' : '#555';\n            this.ctx.fillRect(x, y, 20, 20);\n            \n            this.ctx.fillStyle = '#ffffff';\n            this.ctx.font = '10px Arial';\n            this.ctx.fillText(i.toString(), x + 7, y + 14);\n        }\n        \n        // Grid toggle\n        this.ctx.fillStyle = this.gridSnap ? '#4CAF50' : '#666';\n        this.ctx.fillRect(200, panel.y + 90, 20, 20);\n        this.ctx.fillStyle = '#ffffff';\n        this.ctx.font = '12px Arial';\n        this.ctx.fillText('Grid Snap', 230, panel.y + 105);\n    }\n    \n    renderMinimap() {\n        const minimap = this.ui.minimap;\n        \n        // Minimap background\n        this.ctx.fillStyle = '#222';\n        this.ctx.fillRect(minimap.x, minimap.y, minimap.width, minimap.height);\n        \n        // Minimap border\n        this.ctx.strokeStyle = '#666';\n        this.ctx.strokeRect(minimap.x, minimap.y, minimap.width, minimap.height);\n        \n        // Calculate minimap scale\n        const scaleX = minimap.width / (this.mapWidth * this.tileSize);\n        const scaleY = minimap.height / (this.mapHeight * this.tileSize);\n        const scale = Math.min(scaleX, scaleY);\n        \n        // Render simplified map\n        this.ctx.save();\n        this.ctx.beginPath();\n        this.ctx.rect(minimap.x, minimap.y, minimap.width, minimap.height);\n        this.ctx.clip();\n        \n        for (let layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {\n            const layer = this.layers[layerIndex];\n            if (!layer.visible || layerIndex > 2) continue; // Only show first 3 layers in minimap\n            \n            for (let y = 0; y < this.mapHeight; y++) {\n                for (let x = 0; x < this.mapWidth; x++) {\n                    const tileId = layer.data[y][x];\n                    if (tileId === 0) continue;\n                    \n                    const pixelX = minimap.x + x * this.tileSize * scale;\n                    const pixelY = minimap.y + y * this.tileSize * scale;\n                    const pixelSize = Math.max(1, this.tileSize * scale);\n                    \n                    // Simple color coding for minimap\n                    let color = '#666';\n                    if (tileId >= 1 && tileId <= 5) color = '#4CAF50'; // Terrain\n                    else if (tileId >= 10 && tileId <= 15) color = '#8BC34A'; // Objects\n                    else if (tileId >= 20 && tileId <= 25) color = '#FF9800'; // Buildings\n                    else if (tileId >= 30 && tileId <= 35) color = '#2196F3'; // NPCs\n                    \n                    this.ctx.fillStyle = color;\n                    this.ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);\n                }\n            }\n        }\n        \n        // Camera viewport indicator\n        const mapAreaWidth = this.canvas.width - this.ui.leftPanel.width - this.ui.rightPanel.width;\n        const mapAreaHeight = this.canvas.height - this.ui.bottomPanel.height;\n        \n        const viewportX = minimap.x + (this.camera.x * scale);\n        const viewportY = minimap.y + (this.camera.y * scale);\n        const viewportWidth = (mapAreaWidth / this.camera.zoom) * scale;\n        const viewportHeight = (mapAreaHeight / this.camera.zoom) * scale;\n        \n        this.ctx.strokeStyle = '#ffeb3b';\n        this.ctx.lineWidth = 2;\n        this.ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);\n        \n        this.ctx.restore();\n    }\n    \n    renderSelection() {\n        if (!this.selection.active) return;\n        \n        const minX = Math.min(this.selection.startX, this.selection.endX);\n        const maxX = Math.max(this.selection.startX, this.selection.endX);\n        const minY = Math.min(this.selection.startY, this.selection.endY);\n        const maxY = Math.max(this.selection.startY, this.selection.endY);\n        \n        const startScreen = this.worldToScreen(minX * this.tileSize, minY * this.tileSize);\n        const endScreen = this.worldToScreen((maxX + 1) * this.tileSize, (maxY + 1) * this.tileSize);\n        \n        // Selection rectangle\n        this.ctx.strokeStyle = '#ffeb3b';\n        this.ctx.lineWidth = 2;\n        this.ctx.setLineDash([5, 5]);\n        this.ctx.strokeRect(\n            startScreen.x,\n            startScreen.y,\n            endScreen.x - startScreen.x,\n            endScreen.y - startScreen.y\n        );\n        this.ctx.setLineDash([]);\n        \n        // Selection overlay\n        this.ctx.fillStyle = 'rgba(255, 235, 59, 0.2)';\n        this.ctx.fillRect(\n            startScreen.x,\n            startScreen.y,\n            endScreen.x - startScreen.x,\n            endScreen.y - startScreen.y\n        );\n    }\n    \n    renderGrid() {\n        const mapAreaX = this.ui.leftPanel.visible ? this.ui.leftPanel.width : 0;\n        const mapAreaY = 0;\n        const mapAreaWidth = this.canvas.width - (this.ui.leftPanel.visible ? this.ui.leftPanel.width : 0) - (this.ui.rightPanel.visible ? this.ui.rightPanel.width : 0);\n        const mapAreaHeight = this.canvas.height - (this.ui.bottomPanel.visible ? this.ui.bottomPanel.height : 0);\n        \n        this.ctx.save();\n        this.ctx.beginPath();\n        this.ctx.rect(mapAreaX, mapAreaY, mapAreaWidth, mapAreaHeight);\n        this.ctx.clip();\n        \n        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';\n        this.ctx.lineWidth = 1;\n        \n        const tileSize = this.tileSize * this.camera.zoom;\n        const startX = Math.floor(this.camera.x / this.tileSize) * this.tileSize;\n        const startY = Math.floor(this.camera.y / this.tileSize) * this.tileSize;\n        \n        // Vertical lines\n        for (let x = startX; x < startX + mapAreaWidth / this.camera.zoom + this.tileSize; x += this.tileSize) {\n            const screenX = this.worldToScreen(x, 0).x;\n            this.ctx.beginPath();\n            this.ctx.moveTo(screenX, mapAreaY);\n            this.ctx.lineTo(screenX, mapAreaY + mapAreaHeight);\n            this.ctx.stroke();\n        }\n        \n        // Horizontal lines\n        for (let y = startY; y < startY + mapAreaHeight / this.camera.zoom + this.tileSize; y += this.tileSize) {\n            const screenY = this.worldToScreen(0, y).y;\n            this.ctx.beginPath();\n            this.ctx.moveTo(mapAreaX, screenY);\n            this.ctx.lineTo(mapAreaX + mapAreaWidth, screenY);\n            this.ctx.stroke();\n        }\n        \n        this.ctx.restore();\n    }\n}\n\n// Auto-tiling system for RPG Maker style A-tiles\nclass AutoTileSystem {\n    constructor() {\n        this.autotileRules = {\n            // Water autotile rules\n            water: {\n                baseId: 2,\n                variants: {\n                    // Single tile\n                    '0000': 0,\n                    // Edges\n                    '1000': 1, '0100': 2, '0010': 3, '0001': 4,\n                    // Corners\n                    '1100': 5, '0110': 6, '0011': 7, '1001': 8,\n                    // Three sides\n                    '1110': 9, '0111': 10, '1011': 11, '1101': 12,\n                    // All sides\n                    '1111': 13\n                }\n            }\n        };\n    }\n    \n    getAutotileVariant(tileId, x, y, mapData) {\n        // Check if tile supports autotiling\n        const autotileType = this.getAutotileType(tileId);\n        if (!autotileType) return tileId;\n        \n        // Check neighbors (top, right, bottom, left)\n        const neighbors = [\n            this.isSameTileType(tileId, x, y - 1, mapData),\n            this.isSameTileType(tileId, x + 1, y, mapData),\n            this.isSameTileType(tileId, x, y + 1, mapData),\n            this.isSameTileType(tileId, x - 1, y, mapData)\n        ];\n        \n        const pattern = neighbors.map(n => n ? '1' : '0').join('');\n        const rules = this.autotileRules[autotileType];\n        \n        return rules.variants[pattern] !== undefined ? \n            rules.baseId + rules.variants[pattern] : tileId;\n    }\n    \n    getAutotileType(tileId) {\n        if (tileId === 2) return 'water';\n        return null;\n    }\n    \n    isSameTileType(tileId, x, y, mapData) {\n        if (x < 0 || x >= mapData[0].length || y < 0 || y >= mapData.length) {\n            return false;\n        }\n        \n        const targetTile = mapData[y][x];\n        return this.getAutotileType(targetTile) === this.getAutotileType(tileId);\n    }\n}\n\n// Terrain generation algorithms\nclass TerrainGenerator {\n    constructor() {\n        this.noiseCache = new Map();\n    }\n    \n    generateTerrain(width, height, options = {}) {\n        const {\n            seed = Math.random(),\n            scale = 0.1,\n            octaves = 4,\n            persistence = 0.5,\n            lacunarity = 2.0,\n            waterLevel = 0.3,\n            mountainLevel = 0.7\n        } = options;\n        \n        const terrain = [];\n        \n        for (let y = 0; y < height; y++) {\n            const row = [];\n            for (let x = 0; x < width; x++) {\n                const noise = this.octaveNoise(x * scale, y * scale, octaves, persistence, lacunarity, seed);\n                \n                let tileId = 1; // Default grass\n                \n                if (noise < waterLevel) {\n                    tileId = 2; // Water\n                } else if (noise > mountainLevel) {\n                    tileId = 3; // Stone/Mountain\n                } else if (noise > 0.5) {\n                    tileId = Math.random() < 0.1 ? 10 : 1; // Grass with occasional trees\n                }\n                \n                row.push(tileId);\n            }\n            terrain.push(row);\n        }\n        \n        return terrain;\n    }\n    \n    octaveNoise(x, y, octaves, persistence, lacunarity, seed) {\n        let value = 0;\n        let amplitude = 1;\n        let frequency = 1;\n        let maxValue = 0;\n        \n        for (let i = 0; i < octaves; i++) {\n            value += this.noise(x * frequency + seed, y * frequency + seed) * amplitude;\n            maxValue += amplitude;\n            amplitude *= persistence;\n            frequency *= lacunarity;\n        }\n        \n        return value / maxValue;\n    }\n    \n    noise(x, y) {\n        const key = `${x},${y}`;\n        if (this.noiseCache.has(key)) {\n            return this.noiseCache.get(key);\n        }\n        \n        // Simple noise function (replace with Perlin noise for better results)\n        const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;\n        const result = (value - Math.floor(value)) * 2 - 1;\n        \n        this.noiseCache.set(key, result);\n        return result;\n    }\n    \n    generateRiver(width, height, startX, startY, endX, endY) {\n        const river = [];\n        for (let y = 0; y < height; y++) {\n            const row = new Array(width).fill(0);\n            river.push(row);\n        }\n        \n        // Simple river generation using Bresenham-like algorithm\n        const points = this.generateRiverPath(startX, startY, endX, endY, width, height);\n        \n        points.forEach(point => {\n            const riverWidth = 2 + Math.random() * 2;\n            for (let dy = -riverWidth; dy <= riverWidth; dy++) {\n                for (let dx = -riverWidth; dx <= riverWidth; dx++) {\n                    const x = point.x + dx;\n                    const y = point.y + dy;\n                    \n                    if (x >= 0 && x < width && y >= 0 && y < height) {\n                        const distance = Math.sqrt(dx * dx + dy * dy);\n                        if (distance <= riverWidth) {\n                            river[y][x] = 2; // Water tile\n                        }\n                    }\n                }\n            }\n        });\n        \n        return river;\n    }\n    \n    generateRiverPath(startX, startY, endX, endY, width, height) {\n        const points = [];\n        let currentX = startX;\n        let currentY = startY;\n        \n        while (Math.abs(currentX - endX) > 1 || Math.abs(currentY - endY) > 1) {\n            points.push({ x: Math.floor(currentX), y: Math.floor(currentY) });\n            \n            // Move towards target with some randomness\n            const dx = endX - currentX;\n            const dy = endY - currentY;\n            \n            const moveX = dx > 0 ? 1 : (dx < 0 ? -1 : 0);\n            const moveY = dy > 0 ? 1 : (dy < 0 ? -1 : 0);\n            \n            // Add randomness\n            const randomFactor = 0.3;\n            currentX += moveX + (Math.random() - 0.5) * randomFactor;\n            currentY += moveY + (Math.random() - 0.5) * randomFactor;\n            \n            // Keep within bounds\n            currentX = Math.max(1, Math.min(width - 2, currentX));\n            currentY = Math.max(1, Math.min(height - 2, currentY));\n        }\n        \n        points.push({ x: endX, y: endY });\n        return points;\n    }\n}"