//==================================================================================================
//GS_tutorialSystem.js
//==================================================================================================
/*:
 * @plugindesc v1.00 - Controla os tutoriais do jogo.
 * @author GuilhermeSantos
 * 
 * @param Tutoriais
 * @desc Todos os tutoriais do jogo.
 * @type struct<Tutorials>[]
 * @default []
 * 
 */

/**
 * EXPORTAÇÃO DAS FUNÇÕES
 */
function Scene_SystemTutorials() {
    this.initialize.apply(this, arguments);
}

(function () {
    "use strict";
    /**
     * INITIALIZE SYSTEM
     */
    let params = PluginManager.parameters('GS_tutorialSystem'),
        tutorials = null;
    if (!params['Tutoriais']) params['Tutoriais'] = [];
    else tutorials = JSON.parse(params['Tutoriais']);

    /**
     * FUNÇÕES
     */
    function localPath(p) {
        if (p.substring(0, 1) === '/')
            p = p.substring(1);
        var path = require('path'),
            base = path.dirname(process.mainModule.filename);
        return path.join(base, p);
    };

    function saveData() {
        let fs = require('fs'),
            pathFolder = localPath('save'),
            pathFile = localPath('save/data_4.data');
        if (fs.existsSync(pathFolder)) {
            fs.writeFileSync(pathFile, LZString.compressToBase64(JSON.stringify($gameMap._tutorials)), 'utf8');
        }
    };

    function loadData() {
        let fs = require('fs'),
            pathFolder = localPath('save'),
            pathFile = localPath('save/data_4.data');
        if (fs.existsSync(pathFolder) && fs.existsSync(pathFile)) {
            return JSON.parse(LZString.decompressFromBase64(fs.readFileSync(pathFile, 'utf8')));
        }
        return null;
    };

    /**
     * Scene_Boot
     */
    const _scene_boot_loadSystemWindowImage = Scene_Boot.prototype.loadSystemWindowImage;
    Scene_Boot.prototype.loadSystemWindowImage = function () {
        _scene_boot_loadSystemWindowImage.call(this);
        ImageManager.reserveSystem('Window2');
    };

    /**
     * GAME_MAP
     */
    const _game_map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function (sceneActive) {
        _game_map_update.apply(this, arguments);
        this.updateTutorials();
        this.updateWindowMessageTutorials();
    };

    Game_Map.prototype.tutorials = function () {
        return this._tutorials || [];
    };

    Game_Map.prototype.tutorial = function (id) {
        return this.tutorials()[id];
    };

    Game_Map.prototype.updateTutorials = function () {
        if (!this._tutorials) {
            this._tutorials = loadData() || {};
        }
        if (!this._windowMessageTexts) {
            this._windowMessageTexts = [];
        }
        if (tutorials.length > 0) {
            tutorials.map(tutorial => {
                let data = JSON.parse(tutorial),
                    name = String(data['Tutorial-Name']) || '_default',
                    mapId = Number(data['Map-Id']) || 0,
                    type = String(data['Type']) || '',
                    script = JSON.parse(data['Run Script']) || '';
                if (!this._tutorials[name]) {
                    this._tutorials[name] = {
                        id: name,
                        window: JSON.parse(data['Tutorial-Window']),
                        complete: false
                    };
                }
                if (this._tutorials[name].window != JSON.parse(data['Tutorial-Window'])) {
                    this._tutorials[name].window = JSON.parse(data['Tutorial-Window']);
                }
                if (this.mapId() === mapId) {
                    if (this._tutorials[name].complete) return;
                    if (type === 'Dialogs') {
                        let data_dialogs = JSON.parse(data['Dialogs']),
                            initialize_type = String(data['Initialize Type']) || '';
                        if (initialize_type === 'Tile X e Y') {
                            let tileXy = JSON.parse(data['Tile X e Y']);
                            if (tileXy.length <= 0) return;
                            tileXy.map(Xy => {
                                Xy = JSON.parse(Xy);
                                let tileX = Number(Xy['Tile X']),
                                    tileY = Number(Xy['Tile Y']);
                                if (this.distance(tileX, tileY, $gamePlayer._x, $gamePlayer._y) <= 0) {
                                    this._tutorials[name].complete = true;
                                    eval(script);
                                    if (data_dialogs.length > 0) {
                                        let textsLines = { texts: [], line: 0, lineMax: data_dialogs.length - 1 };
                                        data_dialogs.map((dialog, index) => {
                                            textsLines.texts.push(dialog), textsLines.line++;
                                            if (textsLines.line >= 4 || index >= textsLines.lineMax) {
                                                this._windowMessageTexts.push(textsLines.texts);
                                                textsLines.texts = [];
                                                textsLines.line = 0;
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            });
        }
    };

    Game_Map.prototype.updateWindowMessageTutorials = function () {
        if (!this._windowMessageTextsDelay) this._windowMessageTextsDelay = 5;
        if (this._windowMessageTextsDelay > 0) return this._windowMessageTextsDelay -= .60;
        else {
            this._windowMessageTextsDelay = false;
            if (!$gameMessage.isBusy() && this._windowMessageTexts &&
                this._windowMessageTexts.length > 0) {
                $gameMessage.setPositionType(1);
                this._windowMessageTexts[0].map(message => {
                    if (Galv.Mstyle.checkTarget(String(message))) {
                        Galv.Mstyle.target = Galv.Mstyle.setTarget(Galv.Mstyle.checkTarget(String(message)));
                    }
                    $gameMessage.add(String(message));
                });
                this._windowMessageTexts.splice(0, 1);
                saveData();
            }
        }
    };

    /**
     * Game_System
     */
    Game_System.prototype.systemTutorials = function () {
        return tutorials;
    };

    Game_System.prototype.isEnableTutorials = function () {
        return this.systemTutorials().length > 0;
    };

    /**
     * Window_MenuCommand
     */
    const window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function () {
        window_MenuCommand_addOriginalCommands.call(this);
        this.addSystemTutorialsCommand();
    };

    Window_MenuCommand.prototype.addSystemTutorialsCommand = function () {
        var text = this.convertEscapeCharacters('\\tx[1019]');
        var enabled = $gameSystem.isEnableTutorials();
        this.addCommand(text, 'systemTutorials', enabled);
    };

    /**
     * Scene_Menu
     */
    const scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
        scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler('systemTutorials', this.commandSystemTutorials.bind(this));
    };

    Scene_Menu.prototype.commandSystemTutorials = function () {
        SceneManager.push(Scene_SystemTutorials);
    };

    /**
     * Scene_SystemTutorials
     */

    Scene_SystemTutorials.prototype = Object.create(Scene_Base.prototype);
    Scene_SystemTutorials.prototype.constructor = Scene_SystemTutorials;

    Scene_SystemTutorials.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
    };

    Scene_SystemTutorials.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createWindowLayer();
        this.windowCommandTutorials();
        this.windowTutorials();
    };

    Scene_SystemTutorials.prototype.createBackground = function () {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this.addChild(this._backgroundSprite);
    };

    Scene_SystemTutorials.prototype.windowCommandTutorials = function () {
        this._windowCommandTutorials = new Window_CommandTutorials();
        this._windowCommandTutorials.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._windowCommandTutorials);
    };

    Scene_SystemTutorials.prototype.windowTutorials = function () {
        this._windowTutorials = new Window_Tutorials();
        this.addWindow(this._windowTutorials);
    };

    /**
     * Window_CommandTutorials
     */
    function Window_CommandTutorials() {
        this.initialize.apply(this, arguments);
    }

    Window_CommandTutorials.prototype = Object.create(Window_HorzCommand.prototype);
    Window_CommandTutorials.prototype.constructor = Window_CommandTutorials;

    Window_CommandTutorials.prototype.initialize = function () {
        Window_HorzCommand.prototype.initialize.call(this, this.textPadding(), this.standardPadding() / 2);
    };

    Window_CommandTutorials.prototype.windowWidth = function () {
        return Graphics.width / 2;
    };

    Window_CommandTutorials.prototype.maxCols = function () {
        return 1;
    };

    Window_CommandTutorials.prototype.windowHeight = function () {
        return Graphics.height - this.standardPadding();
    };

    Window_CommandTutorials.prototype.lineHeight = function () {
        return 37;
    };

    Window_CommandTutorials.prototype.makeCommandList = function () {
        this.addMainCommands();
    };

    Window_CommandTutorials.prototype.drawItem = function (index) {
        var rect = this.itemRectForText(index),
            text = this.commandName(index);
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawTextEx(`\\i[193] ${text}`, rect.x, rect.y);
    };

    Window_CommandTutorials.prototype.addMainCommands = function () {
        let data_tutorials = $gameSystem.systemTutorials().slice();
        while (data_tutorials.length < 18) {
            data_tutorials.push('undefined');
        }
        data_tutorials.map(tutorial => {
            if (tutorial === 'undefined') {
                this.addCommand(null, '--tutorial--', 'item', false);
            } else {
                let data = JSON.parse(tutorial),
                    key = String(data['Tutorial-Name']);
                this.addCommand(data, this.convertEscapeCharacters(key), 'item');
            }
        });
    };

    Window_CommandTutorials.prototype.addCommand = function (data, name, symbol, enabled, ext) {
        if (enabled === undefined) {
            enabled = true;
        }
        if (ext === undefined) {
            ext = null;
        }
        this._list.push({ data: data, name: name, symbol: symbol, enabled: enabled, ext: ext });
    };

    Window_CommandTutorials.prototype.commandData = function (index) {
        return this._list[index].data;
    };

    const _Window_CommandTutorials = Window_CommandTutorials.prototype.select;
    Window_CommandTutorials.prototype.select = function (index) {
        _Window_CommandTutorials.apply(this, arguments);
        if (SceneManager._scene._windowTutorials)
            SceneManager._scene._windowTutorials.refresh();
    };

    /**
     * Window_Tutorials
     */
    function Window_Tutorials() {
        this.initialize.apply(this, arguments);
    }

    Window_Tutorials.prototype = Object.create(Window_Base.prototype);
    Window_Tutorials.prototype.constructor = Window_Tutorials;

    Window_Tutorials.prototype.initialize = function () {
        var width = this.windowWidth();
        var height = this.windowHeight(height);
        Window_Base.prototype.initialize.call(this, width + this.standardPadding(),
            this.standardPadding() / 2, width - 7, height);
        this.refresh();
    };

    Window_Tutorials.prototype.loadWindowskin = function () {
        this.windowskin = ImageManager.loadSystem('Window2');
    };

    Window_Tutorials.prototype.windowWidth = function () {
        let width = SceneManager._scene._windowCommandTutorials.width;
        return Graphics.width - (width + this.standardPadding() / 2);
    };

    Window_Tutorials.prototype.windowHeight = function () {
        return Graphics.height - this.standardPadding();
    };

    Window_Tutorials.prototype.drawHorzLine = function (y) {
        var lineY = y + this.lineHeight() / 2 - 1;
        this.contents.fillRect(0, lineY, this.contentsWidth(), 1, this.lineColor());
    };

    Window_Tutorials.prototype.lineColor = function () {
        return this.normalColor();
    };

    Window_Tutorials.prototype.refresh = function () {
        var x = this.textPadding();
        var y = this.windowHeight() / 8;
        var index = SceneManager._scene._windowCommandTutorials.index();
        var tutorial = SceneManager._scene._windowCommandTutorials.commandData(index);
        this.contents.clear();
        if (tutorial) {
            var id = String(tutorial['Tutorial-Name']),
                data = $gameMap.tutorial(id),
                window = data.window,
                description = JSON.parse(window['Description']),
                mapName = String(window['Map-Name']),
                status = String(data.complete);
            if (status === 'true') status = '\\c[4]\\tx[1020]';
            else status = '\\c[4]\\tx[1021]';
            if (mapName === $dataMapInfos[$gameMap.mapId()].name) {
                mapName = `\\c[4]${mapName}\\c[0], \\tx[28]`;
            } else {
                mapName = `\\c[4]${mapName}\\c[0], \\tx[29] \\c[4]${$dataMapInfos[$gameMap.mapId()].name}.`;
            }
        } else {
            var description = '',
                mapName = '',
                status = '';
        }
        this.drawTextEx('\\tx[2017]', x, y), y += 22;
        this.drawHorzLine(y), y += 22;
        this.drawTextEx(description, x, y), y += 160;
        this.drawTextEx('\\tx[2018]', x, y), y += 22;
        this.drawHorzLine(y), y += 22;
        this.drawTextEx(mapName, x, y), y += 108;
        this.drawTextEx('Status', x, y), y += 22;
        this.drawHorzLine(y), y += 22;
        this.drawTextEx(status, x, y), y += 22;
    };
})();
/*~struct~Tutorials:
 * @param Tutorial-Name
 * @desc O nome do tutorial, basicamento um ID
 * @type string
 * @default _default
 * 
 * @param Tutorial-Window
 * @desc As propriedades do tutorial na janela
 * @type struct<TutorialWindow>
 * 
 * @param Map-Id
 * @desc ID do mapa do tutorial
 * @type number
 * @min 1
 * @default 1
 * 
 * @param Type
 * @desc Tipo de tutorial
 * @type select
 * @default Dialogs
 * @option Diálogos
 * @value Dialogs
 * @option Objetivos
 * @value Objectives
 * 
 * @param Dialogs
 * @desc Todos os dialogos dos sistemas
 * @type string[]
 * @default []
 * 
 * @param Initialize Type
 * @desc Tipo de inicialização
 * @type select
 * @default Tile X e Y
 * @option Tile X e Y
 * @value TileXy
 * 
 * @param Tile X e Y
 * @desc Posição X e Y do mapa
 * @type struct<TileXy>[]
 * @default []
 * 
 * @param Run Script
 * @desc Script a ser executado ao iniciar o tutorial
 * @type note
 * @default ""
 *  
 */
/*~struct~TileXy:
 * @param Tile X
 * @desc Eixo X do mapa
 * @type number
 * @min 0
 * @max 256
 * @default 0
 * 
 * @param Tile Y
 * @desc Eixo Y do mapa
 * @type number
 * @min 0
 * @max 256
 * @default 0
 */
 /*~struct~TutorialWindow:
 * @param Description
 * @desc A descrição do tutorial
 * @type note
 * @default ""
 * 
 * @param Map-Name
 * @desc O nome do mapa
 * @type string
 * @default \\c[4]Heidel
 * 
 */