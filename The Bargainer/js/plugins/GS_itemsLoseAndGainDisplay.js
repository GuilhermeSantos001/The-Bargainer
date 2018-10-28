//==================================================================================================
// GS_itemsLoot.js
//==================================================================================================
/*:
 * @plugindesc v1.00 - Sistema de exibição de itens ganhos ou perdidos
 *
 * @author GuilhermeSantos
 *
 */
(function () {
    "use strict";
    //================================================================================================
    // Game_Party
    //================================================================================================
    const _game_party = {
        display: function (item, amount) {
            var scene = SceneManager._scene;
            if (scene instanceof Scene_Map) {
                let sceneSpriteset = scene._spriteset,
                    symbol;
                if (amount > 0) symbol = '+'; else symbol = '-';
                sceneSpriteset.createItemDisplay(item, amount, symbol);
            }
        },
        gainItem: Game_Party.prototype.gainItem,
        gainGold: Game_Party.prototype.gainGold,
        loseGold: Game_Party.prototype.loseGold
    };
    Game_Party.prototype.gainItem = function (item, amount, includeEquip) {
        _game_party.gainItem.apply(this, arguments);
        _game_party.display.apply(this, arguments);
    };

    Game_Party.prototype.gainGold = function (amount) {
        _game_party.gainGold.apply(this, arguments);
        _game_party.display.call(this, '_gold', amount);
    };

    Game_Party.prototype.loseGold = function (amount) {
        _game_party.loseGold.apply(this, arguments);
        _game_party.display.call(this, '_gold', amount);
    };

    //================================================================================================
    // Spriteset_Map
    //================================================================================================
    Spriteset_Map.prototype.createItemDisplay = function (item, amount, symbol) {
        if (!this._displayItems) this._displayItems = [];
        let sprite = new Sprite_itemDisplay(item, amount, symbol);
        this._displayItems.push(sprite);
    };

    const _spriteset_map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function () {
        _spriteset_map_update.call(this);
        this.updateItemDisplayDraw();
        this.updateItemDisplay();
    };

    Spriteset_Map.prototype.updateItemDisplayDraw = function () {
        if (!this._displayItemsDrawFrames) this._displayItemsDrawFrames = [0, 60];
        if (this._displayItemsDrawFrames[0] > 0) this._displayItemsDrawFrames[0] -= .60;
        else {
            this._displayItemsDrawFrames[0] = this._displayItemsDrawFrames[1];
            if (this._displayItems instanceof Array) {
                if (this._displayItems.length > 0) {
                    let i = 0,
                        length = this._displayItems.length;
                    for (; i < length; i++) {
                        let sprite = this._displayItems[i];
                        if (!sprite._isShow) {
                            sprite._isShow = true;
                            this._tilemap.addChild(sprite);
                            break;
                        }
                    }
                }
            }
        }
    };

    Spriteset_Map.prototype.updateItemDisplay = function () {
        if (this._displayItems instanceof Array) {
            if (this._displayItems.length > 0) {
                let remove = [];
                this._displayItems.map(sprite => {
                    if (sprite._isComplete && sprite.opacity <= 0) {
                        remove.push(this._displayItems.indexOf(sprite));
                    }
                });
                remove.map(spriteIndex => {
                    this._displayItems.splice(spriteIndex, 1);
                });
            }
        }
    };

    //================================================================================================
    // Sprite_itemDisplay
    //================================================================================================
    function Sprite_itemDisplay() {
        this.initialize.apply(this, arguments);
    }

    Sprite_itemDisplay.prototype = Object.create(Sprite_Base.prototype);
    Sprite_itemDisplay.prototype.constructor = Sprite_itemDisplay;

    Sprite_itemDisplay.prototype.initialize = function (item, amount, symbol) {
        Sprite_Base.prototype.initialize.call(this);
        this.initMembers(item, amount, symbol);
        this.setBitmap();
    };

    Sprite_itemDisplay.prototype.initMembers = function (item, amount, symbol) {
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        this._ty = 0;
        this._item = item;
        this._amount = String(Math.abs(amount));
        this.scale.x = 0;
        this.scale.y = 0;
        this.opacity = 0;
        this._isComplete = false;
        this._isShow = false;
        this._symbol = symbol;
    };

    Sprite_itemDisplay.prototype.update = function () {
        Sprite_Base.prototype.update.call(this);
        if (!this._isComplete) {
            this.updateScale();
            this.updateOpacity();
        }
        this.updateTy();
        this.updatePosition();
        this.updateComplete();
    };

    Sprite_itemDisplay.prototype.setBitmap = function () {
        var bitmap = ImageManager.loadSystem('IconSet');
        var sprite = new Sprite();
        if (this._item === '_gold') {
            var iconIndex = 313,
                iconName = $gameSystem.getTextLanguage(2006);
        } else {
            var iconIndex = $dataItems[this._item.id].iconIndex,
                iconName = $dataItems[this._item.id].name;
        }
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        this.bitmap = new Bitmap(480, 100);
        this.bitmap.fontSize = 18;
        this.bitmap.drawText(`${this._symbol}${this._amount}`, (pw * 6) + 22, this.bitmap.height / 2, this.bitmap.width, -10, 'left');
        sprite.bitmap = bitmap;
        sprite.move(-((pw * 2)), -((ph * 2) + 8));
        sprite.setFrame(sx, sy, pw, ph);
        this.addChild(sprite);
        this.bitmap.fontSize = 18;
        this.bitmap.drawText(iconName, 0, this.bitmap.height / 2, this.bitmap.width, 48, 'center');
    };

    Sprite_itemDisplay.prototype.scrolledX = function () {
        return $gameMap.adjustX($gamePlayer._realX);
    };

    Sprite_itemDisplay.prototype.scrolledY = function () {
        return $gameMap.adjustY($gamePlayer._realY);
    };

    Sprite_itemDisplay.prototype.screenX = function () {
        var tw = $gameMap.tileWidth();
        return Math.round(this.scrolledX() * tw + tw / 2);
    };

    Sprite_itemDisplay.prototype.screenY = function () {
        var th = $gameMap.tileHeight(),
            ty = this._ty;
        return Math.round(this.scrolledY() * th + th) - ty;
    };

    Sprite_itemDisplay.prototype.screenZ = function () {
        return 6;
    };

    Sprite_itemDisplay.prototype.isComplete = function () {
        return this.opacity >= 255 &&
            this.scale.x >= 1.5 && this.scale.y >= 1.5;
    };

    Sprite_itemDisplay.prototype.updateTy = function () {
        this._ty += .36;
    };

    Sprite_itemDisplay.prototype.updatePosition = function () {
        this.x = this.screenX();
        this.y = this.screenY();
        this.z = this.screenZ();
    };

    Sprite_itemDisplay.prototype.updateScale = function () {
        if (this.scale.x < 1.5) this.scale.x += .0178;
        if (this.scale.y < 1.5) this.scale.y += .0178;
    };

    Sprite_itemDisplay.prototype.updateOpacity = function () {
        if (this.opacity < 255) this.opacity += 2;
    };

    Sprite_itemDisplay.prototype.updateComplete = function () {
        if (!this._isComplete) {
            if (this.isComplete()) {
                this._isComplete = true;
            }
        } else {
            this.opacity -= 4;
        }
    };
})();