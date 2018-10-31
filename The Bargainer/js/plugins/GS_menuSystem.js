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
        _scene_map_createAllWindows = Scene_Map.prototype.createAllWindows;

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
        if (Input.isTriggered('cancel')) this.showMenu();
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
        this.addChild(this._windowMenu);
    };

    Scene_Map.prototype.showWindowMenu = function () {
        this._windowMenu.showNow = true;
    };

    Scene_Map.prototype.hideWindowMenu = function () {
        this._windowMenu.showNow = null;
    };

    /**
     * Window_Menu
     */
    function Window_Menu() {
        this.initialize.apply(this, arguments);
    }

    Window_Menu.prototype = Object.create(Window_Base.prototype);
    Window_Menu.prototype.constructor = Window_Menu;

    Window_Menu.prototype.initialize = function () {
        var width = this.windowWidth();
        var height = this.windowHeight();
        var x = (Graphics.width - width) / 2;
        var y = (Graphics.height - height) / 2;
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.deactivate();
        this.contentsOpacity = 0;
        this.opacity = 0;
        this._menuSelected = 0;
        this._fontBitmap2 = new Sprite(new Bitmap(this.windowWidth(), this.windowHeight()));
        this.addChild(this._fontBitmap2);
    };

    Window_Menu.prototype.windowWidth = function () {
        return 480;
    };

    Window_Menu.prototype.windowHeight = function () {
        return this.fittingHeight(2);
    };

    Window_Menu.prototype.update = function () {
        if (!this.showNow) {
            if (this.opacity > 0) this.opacity -= 12;
            if (this.contentsOpacity > 0) this.contentsOpacity -= 14;
            if (this.opacity & this.contentsOpacity <= 0) if (this.active) this.deactivate();
            return;
        } else {
            if (this.opacity < 255) this.opacity += 12;
            if (this.contentsOpacity < 255) this.contentsOpacity += 14;
            if (this.opacity & this.contentsOpacity >= 255) if (!this.active) this.activate();
        }
        this.refresh();
    };

    Window_Menu.prototype.refresh = function () {
        var x = this.textPadding();
        var iconsX = [];
        var bitmap = this._fontBitmap2.bitmap;
        bitmap.fontSize = 12;
        bitmap.clear();
        this.contents.clear();
        if (this._menuSelected == 0) {
            this.drawIcon(209, x, 5), iconsX.push(x), x += 68;
            this.drawIcon(187, x, 5), iconsX.push(x), x += 68;
            this.drawIcon(191, x, 5), iconsX.push(x), x += 68;
            this.contents.fillRect(x, 5, 1, this.contentsHeight(), this.normalColor()), x += 10;
            this.drawTextEx('GERAL', x, (this.contentsHeight() / 4) + 2);
            bitmap.drawText('Itens', iconsX[0] + 32, this.contentsHeight() + 15, this.windowWidth(), 0, 'left');
            bitmap.drawText('Diario', iconsX[1] + 30, this.contentsHeight() + 15, this.windowWidth(), 0, 'left');
            bitmap.drawText('Missões', iconsX[2] + 24, this.contentsHeight() + 15, this.windowWidth(), 0, 'left');
        } else if (this._menuSelected == 1) {
        }
    };

    Window_Menu.prototype.drawIcon = function (iconIndex, x, y) {
        var bitmap = ImageManager.loadSystem('IconSet');
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, 56, 56);
    };
})();