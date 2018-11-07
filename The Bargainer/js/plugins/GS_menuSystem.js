/*:
 * @plugindesc v1.00 - Controla o menu do jogo
 * @author GuilhermeSantos
 *
*/
(() => {
    'use strict';
    /**
     * GLOBAL VARIABLES
     */
    const _game_map_update = Game_Map.prototype.update,
        _game_map_initialize = Game_Map.prototype.initialize,
        _scene_map_createAllWindows = Scene_Map.prototype.createAllWindows,
        _scene_map_update = Scene_Map.prototype.update;

    let _windowMenu_show,
        _windowMenu_show_delay = 0;

    /**
     * Game_Map
     */
    Game_Map.prototype.initialize = function () {
        _game_map_initialize.call(this);
        this._isEnabledMenu = null;
    };

    Game_Map.prototype.update = function (sceneActive) {
        _game_map_update.apply(this, arguments);
        if ($gameSystem.isMenuEnabled()) $gameSystem.disableMenu();
        if (Input.isTriggered('cancel') || TouchInput.isCancelled()) this.showMenu();
    };

    Game_Map.prototype.showMenu = function () {
        if (!this._isEnabledMenu) {
            this._isEnabledMenu = true;
            this._interpreter.pluginCommand('StopPlayerMovement', []);
            SceneManager._scene.showWindowMenu();
        } else {
            this._isEnabledMenu = null;
            this._interpreter.pluginCommand('AllowPlayerMovement', []);
            SceneManager._scene.hideWindowMenu();
        }
    };

    /**
     * Scene_Map
     */
    Scene_Map.prototype.createAllWindows = function () {
        _scene_map_createAllWindows.call(this);
        this.createWindowMenu();
    };

    Scene_Map.prototype.createWindowMenu = function () {
        this._windowMenu = new Window_Menu();
        this._windowMenu.setHandler('_inventory', this.onButtonWindowMenu.bind(this, '_inventory'));
        this._windowMenu.setHandler('_skills', this.onButtonWindowMenu.bind(this, '_skills'));
        this._windowMenu.setHandler('_missions', this.onButtonWindowMenu.bind(this, '_missions'));
        this._windowMenu.setHandler('_dialogs', this.onButtonWindowMenu.bind(this, '_dialogs'));
        this._windowMenu.setHandler('_tutorials', this.onButtonWindowMenu.bind(this, '_tutorials'));
        this._windowMenu.setHandler('_missionsDaily', this.onButtonWindowMenu.bind(this, '_missionsDaily'));
        this._windowMenu.setHandler('_options', this.onButtonWindowMenu.bind(this, '_options'));
        this.addChild(this._windowMenu);
    };

    Scene_Map.prototype.showWindowMenu = function () {
        if (!this._windowMenu.showNow) this._windowMenu.showNow = true;
        if (!_windowMenu_show) _windowMenu_show = true;
    };

    Scene_Map.prototype.hideWindowMenu = function (exception) {
        if (this._windowMenu.showNow) this._windowMenu.showNow = null;
        if (!exception) { if (_windowMenu_show) _windowMenu_show = null; }
    };

    Scene_Map.prototype.registerScenePush = function (scene) {
        this._registerScenePush = scene;
    };

    Scene_Map.prototype.onButtonWindowMenu = function (handler) {
        if (handler === '_inventory') {
            this._buttonWindowMenu = 0;
        } else if (handler === '_skills') {
            this._buttonWindowMenu = 1;
        } else if (handler === '_missions') {
            this._buttonWindowMenu = 2;
        } else if (handler === '_dialogs') {
            this._buttonWindowMenu = 3;
        } else if (handler === '_tutorials') {
            this._buttonWindowMenu = 4;
        } else if (handler === '_missionsDaily') {
            this._buttonWindowMenu = 5;
        } else if (handler === '_options') {
            this._buttonWindowMenu = 6;
        }
    };

    Scene_Map.prototype.update = function () {
        _scene_map_update.call(this);
        this.updateButtonWindowMenu();
    };

    Scene_Map.prototype.updateButtonWindowMenu = function () {
        if (_windowMenu_show) {
            if (_windowMenu_show_delay < 30) _windowMenu_show_delay += .60;
            else { this.showWindowMenu(), _windowMenu_show_delay = 0; }
        }
        if (typeof this._buttonWindowMenu === 'number') {
            this.hideWindowMenu(true);
            if (this._windowMenu.openness > 0) return;
            if (this._buttonWindowMenuDelay < 30) return this._buttonWindowMenuDelay += .60;
            if (this._buttonWindowMenu == 0) {
                SceneManager.push(Scene_Item);
            } else if (this._buttonWindowMenu == 1) {
                SceneManager.push(Scene_Skill);
            } else if (this._buttonWindowMenu == 2) {
                SceneManager.push(Scene_Quest);
            } else if (this._buttonWindowMenu == 3) {
                SceneManager.push(Scene_SystemDialogs);
            } else if (this._buttonWindowMenu == 4) {
                SceneManager.push(Scene_SystemTutorials);
            } else if (this._buttonWindowMenu == 5) {
                SceneManager.push(Scene_DailyMissionsSystem);
            } else if (this._buttonWindowMenu == 6) {
                SceneManager.push(Scene_Options);
            }
            this._buttonWindowMenu = null;
            this._buttonWindowMenuDelay = 0;
        }
    };

    //-----------------------------------------------------------------------------
    // Window_Menu
    //
    function Window_Menu() {
        this.initialize.apply(this, arguments);
    }

    Window_Menu.prototype = Object.create(Window_Command.prototype);
    Window_Menu.prototype.constructor = Window_Menu;

    Window_Menu.prototype.initialize = function () {
        Window_Command.prototype.initialize.call(this, (Graphics.width - this.windowWidth()) / 2,
            (Graphics.height - this.windowHeight()) / 2);
        this.openness = 0;
        this.showNow = false;
        this.deactivate();
        this.createStructures();
    };

    Window_Menu.prototype.windowWidth = function () {
        return 480;
    };

    Window_Menu.prototype.windowHeight = function () {
        return 340;
    };

    Window_Menu.prototype.itemHeight = function () {
        return 48;
    };

    Window_Menu.prototype.maxCols = function () {
        return 1;
    };

    Window_Menu.prototype.lineHeight = function () {
        return 1;
    };

    Window_Menu.prototype.update = function () {
        Window_Command.prototype.update.call(this);
        if (this.showNow) {
            if (this.openness < 255) this.openness += 16;
            else { if (this._bitmapStructures.opacity < 255) this._bitmapStructures.opacity += 16; }
            if (this.openness >= 255 && this._bitmapStructures.opacity >= 255) this.activate();
        } else {
            if (this._bitmapStructures.opacity > 0) this._bitmapStructures.opacity -= 16;
            else { if (this.openness > 0) this.openness -= 16; }
            if (this.openness <= 0 && this._bitmapStructures.opacity <= 0) this.deactivate();
        }
    };

    Window_Menu.prototype.makeCommandList = function () {
        this.addMainCommands();
    };

    Window_Menu.prototype.addMainCommands = function () {
        this.addCommand('Inventario', '_inventory');
        this.addCommand('Habilidades', '_skills');
        this.addCommand('Contratos', '_contracts', false);
        this.addCommand('Finanças', '_finances', false);
        this.addCommand('Plantação', '_plantation', false);
        this.addCommand('Cidades', '_cities', false);
        this.addCommand('Rotas', '_routes', false);
        this.addCommand('Musicas', '_musics', false);
        this.addCommand('Missões', '_missions');
        this.addCommand('Missões Diarias', '_missionsDaily');
        this.addCommand('Dialogos', '_dialogs');
        this.addCommand('Tutoriais', '_tutorials');
        this.addCommand('Opções', '_options');
    };

    Window_Menu.prototype.drawItem = function (index) {
        var rect = this.itemRectForText(index);
        this.resetTextColor();
        this.contents.fontSize = 26;
        this.changePaintOpacity(this.isCommandEnabled(index));
        if (this.commandSymbol(index) === '_inventory') {
            this.drawIcon(209, rect.x, rect.y + 3);
        } else if (this.commandSymbol(index) === '_dialogs') {
            this.drawIcon(187, rect.x, rect.y + 3);
        } else if (this.commandSymbol(index) === '_missions') {
            this.drawIcon(191, rect.x, rect.y + 3);
        } else if (this.commandSymbol(index) === '_tutorials') {
            this.drawIcon(207, rect.x, rect.y + 3);
        } else if (this.commandSymbol(index) === '_skills') {
            this.drawIcon(189, rect.x, rect.y + 3);
        } else if (this.commandSymbol(index) === '_missionsDaily') {
            this.drawIcon(79, rect.x, rect.y + 3);
        } else if (this.commandSymbol(index) === '_finances') {
            this.drawIcon(208, rect.x, rect.y + 3);
        } else if (this.commandSymbol(index) === '_plantation') {
            this.drawIcon(217, rect.x, rect.y + 3);
        } else if (this.commandSymbol(index) === '_musics') {
            this.drawIcon(206, rect.x, rect.y + 3);
        } else if (this.commandSymbol(index) === '_cities') {
            this.drawIcon(205, rect.x, rect.y + 3);
        } else if (this.commandSymbol(index) === '_contracts') {
            this.drawIcon(296, rect.x, rect.y + 3);
        } else if (this.commandSymbol(index) === '_routes') {
            this.drawIcon(68, rect.x, rect.y + 3);
        } else if (this.commandSymbol(index) === '_options') {
            this.drawIcon(242, rect.x, rect.y + 3);
        }
        this.drawText(this.commandName(index), 46 + rect.x, rect.y + 8, rect.width, 'left');
    };

    Window_Menu.prototype.drawIcon = function (iconIndex, x, y) {
        var bitmap = ImageManager.loadSystem('IconSet');
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, 42, 42);
    };

    Window_Menu.prototype.createStructures = function () {
        if (!this._bitmapStructures) {
            this._bitmapStructures = new Sprite(new Bitmap(Graphics.width, Graphics.height));
            this._bitmapStructures.opacity = 0;
            SceneManager._scene.addChild(this._bitmapStructures);
        }
        var sprite = this._bitmapStructures;
        var bitmap = this._bitmapStructures.bitmap;
        bitmap.fillRect(0, 0, sprite.width, 1, 'white');
        bitmap.fillRect(0, sprite.height - 1, sprite.width, 1, 'white');
        bitmap.fontSize = 42;
        bitmap.drawText('THE BARGAINER', 0, this.y - 20, sprite.width, 0, 'center');
        bitmap.fontSize = 18;
        bitmap.drawText(`Olá ${GS.MVD.computerUsername()}, tenha um bom jogo!`, 5, 20, sprite.width, 0, 'left');
        bitmap.drawText(`Versão | Alpha 0.01`, -5, sprite.height - 15, sprite.width, 0, 'right');
    };
})();