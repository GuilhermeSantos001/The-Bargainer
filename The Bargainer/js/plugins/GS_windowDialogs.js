//==================================================================================================
// GS_windowDialogs.js
//==================================================================================================
/*:
 * @plugindesc v1.00 - Exibe uma janela que mostra os dialogos do jogo
 *
 * @author GuilhermeSantos
 * 
 */
(function () {
    "use strict";
    //=============================================================================
    // Variaveis Globais
    //=============================================================================        
    let systemDialogs = {};

    //=============================================================================
    // Funções
    //=============================================================================    
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
            pathFile = localPath('save/data_3.data');
        if (fs.existsSync(pathFolder)) {
            fs.writeFileSync(pathFile, LZString.compressToBase64(
                JSON.stringify($gameSystem.systemDialogs())
            ), 'utf8');
        }
    };

    function loadData() {
        let fs = require('fs'),
            pathFolder = localPath('save'),
            pathFile = localPath('save/data_3.data');
        if (fs.existsSync(pathFolder) && fs.existsSync(pathFile)) {
            return JSON.parse(LZString.decompressFromBase64(fs.readFileSync(pathFile, 'utf8')));
        }
        return null;
    };

    //=============================================================================
    // Game_System
    //=============================================================================
    const _game_map_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function () {
        _game_map_initialize.call(this);
        if (loadData()) systemDialogs = loadData();
    };

    Game_System.prototype.systemDialogs = function () {
        return systemDialogs;
    };

    Game_System.prototype.isEnableDialogs = function () {
        return Object.keys(this.systemDialogs()).length > 0;
    };

    Game_System.prototype.systemDialogsRegister = function () {
        let dayWeek = (() => {
            let days = [
                '\\tx[985]',
                '\\tx[986]',
                '\\tx[987]',
                '\\tx[988]',
                '\\tx[989]',
                '\\tx[990]'
            ];
            return days[$gameVariables.value(11)];
        })(),
            month = (() => {
                let days = [
                    '\\tx[981]',
                    '\\tx[982]',
                    '\\tx[983]',
                    '\\tx[984]',
                ]
                return days[$gameVariables.value(12)]
            })(),
            dayMonth = $gameVariables.value(10),
            year = $gameVariables.value(13);
        return `\\}\\tx[1016] \\tx[2008](${dayWeek}), \\tx[2009](${dayMonth.padZero(2)}), \\tx[2010](${month}), \\tx[2011](${year})`;
    };

    Game_System.prototype.systemDialogsAdd = function (id, dialogs) {
        if (dialogs instanceof Array) {
            if (dialogs.length > 0) {
                systemDialogs[id] = {
                    data: [],
                    register: this.systemDialogsRegister()
                };
                dialogs.map(dialog => {
                    systemDialogs[id].data.push(dialog);
                });
                saveData();
            }
        }
    };

    //=============================================================================
    // Window_MenuCommand
    //=============================================================================
    const window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function () {
        window_MenuCommand_addOriginalCommands.call(this);
        this.addSystemDialogsCommand();
    };

    Window_MenuCommand.prototype.addSystemDialogsCommand = function () {
        var text = this.convertEscapeCharacters('\\tx[1015]');
        var enabled = $gameSystem.isEnableDialogs();
        this.addCommand(text, 'systemDialogs', enabled);
    };

    //=============================================================================
    // Scene_Menu
    //=============================================================================
    const scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
        scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler('systemDialogs', this.commandSystemDialogs.bind(this));
    };

    Scene_Menu.prototype.commandSystemDialogs = function () {
        SceneManager.push(Scene_SystemDialogs);
    };

    //-----------------------------------------------------------------------------
    // Scene_SystemDialogs
    //
    function Scene_SystemDialogs() {
        this.initialize.apply(this, arguments);
    }

    Scene_SystemDialogs.prototype = Object.create(Scene_Base.prototype);
    Scene_SystemDialogs.prototype.constructor = Scene_SystemDialogs;

    Scene_SystemDialogs.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
    };

    Scene_SystemDialogs.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createWindowLayer();
        this.windowCommandDialogs();
        this.windowDialogs();
    };

    Scene_SystemDialogs.prototype.createBackground = function () {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this.addChild(this._backgroundSprite);
    };

    Scene_SystemDialogs.prototype.windowCommandDialogs = function () {
        this._windowCommandDialogs = new Window_CommandDialogs();
        this._windowCommandDialogs.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._windowCommandDialogs);
    };

    Scene_SystemDialogs.prototype.windowDialogs = function () {
        this._windowDialogs = new Window_Dialogs();
        this.addWindow(this._windowDialogs);
    };

    Scene_SystemDialogs.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
    };

    Scene_SystemDialogs.prototype.update = function () {
        Scene_Base.prototype.update.call(this);
    };

    //-----------------------------------------------------------------------------
    // Window_CommandDialogs
    //
    function Window_CommandDialogs() {
        this.initialize.apply(this, arguments);
    }

    Window_CommandDialogs.prototype = Object.create(Window_HorzCommand.prototype);
    Window_CommandDialogs.prototype.constructor = Window_CommandDialogs;

    Window_CommandDialogs.prototype.initialize = function () {
        Window_HorzCommand.prototype.initialize.call(this, this.windowWidth() / 2, Graphics.height - (this.windowHeight() + this.textPadding()));
    };

    Window_CommandDialogs.prototype.windowWidth = function () {
        return Graphics.width / 2;
    };

    Window_CommandDialogs.prototype.maxCols = function () {
        return 2;
    };

    Window_CommandDialogs.prototype.makeCommandList = function () {
        this.addMainCommands();
    };

    Window_CommandDialogs.prototype.drawItem = function (index) {
        var rect = this.itemRectForText(index),
            text = this.commandName(index);
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawTextEx(text, rect.x, rect.y);
    };

    Window_CommandDialogs.prototype.addMainCommands = function () {
        let keys = Object.keys($gameSystem.systemDialogs());
        while (keys.length < 2) keys.push('--no--item--');
        keys.map(key => {
            if (key != '--no--item--') {
                var dialog = $gameSystem.systemDialogs()[key];
            } else {
                var dialog = { data: ['\\c[8]--\\tx[1022]--'] };
            }
            this.addCommand(key, dialog.data[0]);
        });
    };

    Window_CommandDialogs.prototype.addCommand = function (id, name) {
        this._list.push({ id: id, name: name, symbol: 'item', enabled: true, ext: null });
    };

    Window_CommandDialogs.prototype.commandId = function (index) {
        return this._list[index].id;
    };

    const _window_commandDialogs_select = Window_CommandDialogs.prototype.select;
    Window_CommandDialogs.prototype.select = function (index) {
        _window_commandDialogs_select.apply(this, arguments);
        if (SceneManager._scene._windowDialogs)
            SceneManager._scene._windowDialogs.refresh();
    };

    //-----------------------------------------------------------------------------
    // Window_Dialogs
    //
    function Window_Dialogs() {
        this.initialize.apply(this, arguments);
    }

    Window_Dialogs.prototype = Object.create(Window_Base.prototype);
    Window_Dialogs.prototype.constructor = Window_Dialogs;

    Window_Dialogs.prototype.initialize = function () {
        var width = this.windowWidth();
        var height = this.windowHeight(height);
        Window_Base.prototype.initialize.call(this, this.standardPadding() / 2, this.standardPadding() / 2, width, height);
        this.refresh();
    };

    Window_Dialogs.prototype.windowWidth = function () {
        return Graphics.width - this.standardPadding();
    };

    Window_Dialogs.prototype.windowHeight = function () {
        let height = SceneManager._scene._windowCommandDialogs.height;
        return Graphics.height - (height + this.standardPadding());
    };

    Window_Dialogs.prototype.drawHorzLine = function (y) {
        var lineY = y + this.lineHeight() / 2 - 1;
        this.contents.fillRect(0, lineY, this.contentsWidth(), 1, this.lineColor());
    };

    Window_Dialogs.prototype.lineColor = function () {
        return this.normalColor();
    };

    Window_Dialogs.prototype.refresh = function () {
        var x = this.textPadding();
        var index = SceneManager._scene._windowCommandDialogs.index();
        var id = SceneManager._scene._windowCommandDialogs.commandId(index);
        if (id != '--no--item--') var dialog = $gameSystem.systemDialogs()[id];
        else var dialog = { data: [''] };
        var texts = dialog.data.slice(1);
        var register = dialog.register;
        this.contents.clear();
        this.resetFontSettings();
        texts.map((text, i) => {
            if (i <= 0) {
                var y = 5;
            } else {
                var y = ((this.textPadding() + this.standardPadding() + 8) * i) + this.textPadding() * 3;
            }
            this.drawTextEx(text, x, y);
        });
        this.drawHorzLine(this.contents.height - this.textPadding() * 8);
        this.drawTextEx(register, x, this.contents.height - (this.textPadding() / 2) * 9);
    };
})();