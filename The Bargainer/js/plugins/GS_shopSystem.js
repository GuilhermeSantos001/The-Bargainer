//==================================================================================================
// GS_shopSystem.js
//==================================================================================================
/*:
 *
 * @plugindesc v1.00 - Controla as lojas do jogo
 *
 * @author GuilhermeSantos
 *
 * @param Shops
 * @desc Todas as lojas do jogo.
 * @type struct<Shops>[]
 * @default []
 *
 * @help
 * ====================================================================================================
 *  Dialogos
 * ====================================================================================================
 * A criação de dialogos é composta por: texto, numerador e desativação.
 *
 * Texto: Um objeto que é composto por idiomas e tem seus respectivos valores em cada idioma.
 * Numerador: Um numero que é usado por todos os dialogos que são compativeis com o mesmo.
 * Desativação: Um Array que é composto por todos os index dos dialogos que devem ser desativados.
 *
 * EXEMPLO:
 * this.addDialog(
 * [{pt_br: 'Olá', en_us: 'Hello'}, 1, []],
 * [{pt_br: 'Como vai?', en_us: 'How are you?'}, 1, [0]]
 * );
 */

/**
 * Exportação
 */
function Game_ItemShop() {
    this.initialize.apply(this, arguments);
}

(function () {
    "use strict";
    /**
     * INITIALIZE SYSTEM
     */
    let params = PluginManager.parameters('GS_shopSystem'),
        shops = null;
    if (!params['Shops']) params['Shops'] = [];
    else shops = JSON.parse(params['Shops']);

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

    function saveData(data, path) {
        let fs = require('fs'),
            pathFolder = localPath('save'),
            pathFile = localPath('save/data_5.data');
        if (path) pathFile = localPath(`save/${path}.data`);
        if (fs.existsSync(pathFolder)) {
            fs.writeFileSync(pathFile, LZString.compressToBase64(JsonEx.stringify(data)), 'utf8');
        }
    };

    function loadData(path) {
        let fs = require('fs'),
            pathFolder = localPath('save'),
            pathFile = localPath('save/data_5.data');
        if (path) pathFile = localPath(`save/${path}.data`);
        if (fs.existsSync(pathFolder) && fs.existsSync(pathFile)) {
            return JsonEx.parse(LZString.decompressFromBase64(fs.readFileSync(pathFile, 'utf8')));
        }
        return null;
    };

    function getTextLanguage(text) {
        let _text = '???';
        text.map(data => {
            data = JSON.parse(data);
            if (data['Language'] === $gameSystem.getterLanguageSystem() ||
                data['Language'] === 'qualquer')
                return _text = data['Value'];
        });
        return _text;
    };

    /**
     * Graphics
     */
    const _graphics_createGameFontLoader = Graphics._createGameFontLoader;
    Graphics._createGameFontLoader = function () {
        _graphics_createGameFontLoader.call(this);
        this._createFontLoader("GameFont2");
    };

    /**
     * Game_Temp
     */
    Game_Temp.prototype.getShops = function () {
        return this._shops;
    };

    const _game_temp_initialize = Game_Temp.prototype.initialize;
    Game_Temp.prototype.initialize = function () {
        _game_temp_initialize.call(this);
        this.loadShops();
        this.createShops();
    };

    Game_Temp.prototype.loadShops = function () {
        if (loadData()) this._shops = loadData();
        if (!this._shops) this._shops = {};
    };

    Game_Temp.prototype.createShops = function () {
        shops.map(shop => {
            let data = JSON.parse(shop),
                shopDataDialog = JSON.parse(data['Shop-dataDialog']),
                shopName = JSON.parse(data['Shop-Name']),
                shopLevel = String(data['Shop-Level']),
                shopID = String(data['Shop-ID']),
                shopSeller = JSON.parse(data['Shop-Seller']),
                shopBuy = JSON.parse(data['Shop-Buy']),
                mapID = Number(data['Map-ID']),
                eventID = Number(data['Event-ID']),
                items = JSON.parse(data['Items']);
            if (!this._shops[shopID]) this._shops[shopID] = {}
            this._shops[shopID]['data'] = {
                'id': shopID,
                'shopDataDialog': shopDataDialog,
                'shopName': shopName,
                'shopLevel': shopLevel,
                'shopSeller': shopSeller,
                'shopBuy': shopBuy,
                'mapID': mapID,
                'eventID': eventID
            }
            if (this._shops[shopID]['data']['affinity'] === undefined) this._shops[shopID]['data']['affinity'] = 0;
            if (!this._shops[shopID]['items']) this._shops[shopID]['items'] = {}
            if (items.length > 0) {
                items.map(item => {
                    item = JSON.parse(item);
                    let itemId = String(item['Item-Id']),
                        price = Number(item['Item-Price']),
                        lucre = Number(item['Item-Lucre']),
                        sell = (sAmount) => {
                            if (!sAmount) sAmount = 1;
                            return eval(String(JSON.parse(item['Item-Sell-Formula'])).format(price, lucre, sAmount));
                        },
                        buy = (bPrice, bLucre, bAmount) => {
                            if (!bPrice) bPrice = 1;
                            if (!bLucre) bLucre = 1;
                            if (!bAmount) bAmount = 1;
                            return eval(String(JSON.parse(item['Item-Buy-Formula'])).format(bPrice, bLucre, bAmount));
                        },
                        name = JSON.parse(item['Item-Name']),
                        desc = JSON.parse(item['Item-Description']),
                        bitmap = String(item['Item-Icon-Bitmap']),
                        icon = Number(item['Item-Icon']),
                        usage = JSON.parse(item['Item-Usage']),
                        rarity = String(item['Item-Rarity']),
                        amount = Number(item['Item-Amount']),
                        sell_enabled = JSON.parse(item['Item-Sell']),
                        buy_enabled = JSON.parse(item['Item-Buy']),
                        fabrication = JSON.parse(item['Item-Fabrication']);
                    if (!this._shops[shopID]['items'][itemId])
                        this._shops[shopID]['items'][itemId] = {};
                    if (this._shops[shopID]['items'][itemId].sell != sell) {
                        if (!this._shops[shopID]['items'][itemId].hasOwnProperty('sell'))
                            Object.defineProperty(this._shops[shopID]['items'][itemId], 'sell', { writable: true, value: sell });
                        else this._shops[shopID]['items'][itemId].sell = sell;
                    }
                    if (this._shops[shopID]['items'][itemId].buy != buy) {
                        if (!this._shops[shopID]['items'][itemId].hasOwnProperty('buy'))
                            Object.defineProperty(this._shops[shopID]['items'][itemId], 'buy', { writable: true, value: buy });
                        else this._shops[shopID]['items'][itemId].buy = buy;
                    }
                    Array(
                        ['id', itemId],
                        ['name', name],
                        ['desc', desc],
                        ['bitmap', bitmap],
                        ['icon', icon],
                        ['usage', usage],
                        ['rarity', rarity],
                        ['amount', amount, true],
                        ['sell_enabled', sell_enabled],
                        ['buy_enabled', buy_enabled],
                        ['price', price],
                        ['lucre', lucre],
                        ['fabrication', fabrication]
                    ).map(key => {
                        if (key[2]) {
                            if (this._shops[shopID]['items'][itemId][key[0]] === undefined ||
                                this._shops[shopID]['items'][itemId][key[0]] === null)
                                this._shops[shopID]['items'][itemId][key[0]] = key[1];
                        } else {
                            if (this._shops[shopID]['items'][itemId][key[0]] != key[1])
                                this._shops[shopID]['items'][itemId][key[0]] = key[1];
                        }
                    }, this);
                }, this);
            }
            Object.keys(this._shops[shopID]['items']).map(key => {
                if (items.find(item => {
                    return JSON.parse(item)['Item-Id'] === key;
                }) === undefined) {
                    delete this._shops[shopID]['items'][key];
                }
            });
        }, this);
        saveData(this.getShops());
    };

    Game_Temp.prototype.getShopItems = function (shopID) {
        return this._shops[shopID] ? this._shops[shopID]['items'] : null;
    };

    Game_Temp.prototype.getItemShop = function (shopID, itemID) {
        if (!this.getShopItems(shopID)) return;
        return this.getShopItems(shopID)[itemID] ? this.getShopItems(shopID)[itemID] : null;
    };

    Game_Temp.prototype.addItemShop = function (shopID, itemID, amount) {
        if (typeof amount != 'number') return;
        this.getItemShop(shopID, itemID)['amount'] += Math.round(amount);
        saveData(this.getShops());
    };

    Game_Temp.prototype.loseItemShop = function (shopID, itemID, amount) {
        if (typeof amount != 'number') return;
        this.getItemShop(shopID, itemID)['amount'] -= Math.round(amount);
        if (this.getItemShop(shopID, itemID)['amount'] < 0)
            this.getItemShop(shopID, itemID)['amount'] = 0;
        saveData(this.getShops());
    };

    /**
     * Game_Interpreter
     */
    Game_Interpreter.prototype.startShop = function (shopID, mapID, eventID) {
        if (Object.keys($gameTemp.getShops()).length > 0)
            Object.keys($gameTemp.getShops()).map(key => {
                let shop = $gameTemp.getShops()[key];
                if (key === shopID && shop['data']['mapID'] === mapID && shop['data']['eventID'] === eventID) {
                    SceneManager.gotoExpress(Scene_SystemShop, shop);
                }
            }, this);
    };

    /**
     * Game_Map
     */
    const _game_map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function (sceneActive) {
        _game_map_update.apply(this, arguments);
        if (sceneActive) {
            this.updateSystemShop();
        }
    };

    Game_Map.prototype.updateSystemShop = function () {
        this.updateItemsShop();
    };

    Game_Map.prototype.updateItemsShop = function () {
        if (!this._itemsShop) {
            if (loadData('data_6')) this._itemsShop = loadData('data_6');
            if (!this._itemsShop) this._itemsShop = {};
            Object.keys($gameTemp.getShops()).map(key => {
                for (const key2 in $gameTemp.getShops()[key].items) {
                    if ($gameTemp.getShops()[key].items.hasOwnProperty(key2)) {
                        if (this._itemsShop[key] instanceof Game_ItemShop === false)
                            this._itemsShop[key] = new Game_ItemShop(
                                $gameTemp.getShops()[key].items[key2].fabrication,
                                $gameTemp.getShops()[key].data.id,
                                $gameTemp.getShops()[key].items[key2].id
                            );
                        else this._itemsShop[key].initialize(
                            $gameTemp.getShops()[key].items[key2].fabrication,
                            $gameTemp.getShops()[key].data.id,
                            $gameTemp.getShops()[key].items[key2].id
                        );
                    }
                }
            });
            this.itemShopSave();
        }
        this.getArrayItemsShop().map(itemShop => {
            if (this.getItemsShop()[itemShop] instanceof Game_ItemShop) this.getItemsShop()[itemShop].update();
        });
    };

    Game_Map.prototype.itemShopSave = function () {
        return saveData(this.getItemsShop(), 'data_6');
    };

    Game_Map.prototype.getItemsShop = function () {
        return this._itemsShop;
    };

    Game_Map.prototype.getArrayItemsShop = function () {
        return Object.keys(this.getItemsShop());
    };

    /**
     * Game_ItemShop
     */
    Game_ItemShop.prototype.initialize = function (data, shopID, itemID) {
        this._data = data;
        this._shopID = shopID;
        this._itemID = itemID;
        this._days_of_work = JSON.parse(this._data['Days of Work']);
        this._days_of_vacations = JSON.parse(this._data['Days and Months of vacations']);
        this._day_of_fabrication = null;
        this._mapId = Number(this._data['Map-ID']);
        this._eventId = Number(this._data['Event-ID']);
        this._eventSelfSwitches = [
            String(this._data['Event-SelfSwitches_1']).toUpperCase().trim(),
            String(this._data['Event-SelfSwitches_2']).toUpperCase().trim(),
            String(this._data['Event-SelfSwitches_3']).toUpperCase().trim()
        ];
        this._timer_of_fabrication = Number(this._data['Timer of Fabrication']);
    };

    Game_ItemShop.prototype.getDayOfFabrication = function () {
        return this._day_of_fabrication;
    };

    Game_ItemShop.prototype.update = function () {
        this.updateDayOfFabrication();
        this.updateItemFabrication();
    };

    Game_ItemShop.prototype.updateDayOfFabrication = function () {
        /**
         * Define o dia de fabricação
         */
        if (!this.getDayOfFabrication()) {
            this._days_of_work.map(days => {
                let day = JSON.parse(days);
                if (Number(day['Month of Year']) == $gameVariables.value(12) &&
                    Number(day['Day of Month']) == $gameVariables.value(10)) {
                    this._day_of_fabrication = [
                        $gameVariables.value(12),
                        $gameVariables.value(10)
                    ];
                    $gameMap.itemShopSave();
                    return;
                }
            }, this);
        } else if (this.getDayOfFabrication()[0] != $gameVariables.value(12) ||
            this.getDayOfFabrication()[0] == $gameVariables.value(12) &&
            this.getDayOfFabrication()[1] < $gameVariables.value(10)) {
            this._day_of_fabrication = null;
            $gameMap.itemShopSave();
        }
        /**
         * Define o dia de férias
         */
        if (this.getDayOfFabrication()) {
            this._days_of_vacations.map(days => {
                let day = JSON.parse(days);
                if (Number(day['Month of Year']) == $gameVariables.value(12) &&
                    Number(day['Day of Month']) == $gameVariables.value(10)) {
                    this._day_of_fabrication = null;
                    $gameMap.itemShopSave();
                }
            }, this);
        }
    };

    Game_ItemShop.prototype.updateItemFabrication = function () {
        /**
         * Configura a data do evento
         */
        if (typeof this._event != 'object') this._event = {};
        if (this._event['working'] === undefined) this._event['working'] = false;
        if (this._event['hide'] === undefined) this._event['hide'] = false;
        if (this._event['timeOfFabrication'] === undefined) this._event['timeOfFabrication'] = 0;
        if (this._event['itemFabricationAmount'] === undefined) this._event['itemFabricationAmount'] = 0;
        /**
         * Verifica se é dia de trabalho
         */
        if (this.getDayOfFabrication()) {
            if (this._mapId == $gameMap.mapId()) {
                /**
                 * Processos do evento
                 */
                if (!this._event['working']) {
                    if ($gameSelfSwitches.value([this._mapId, this._eventId, this._eventSelfSwitches[1]]) === false &&
                        $gameSelfSwitches.value([this._mapId, this._eventId, this._eventSelfSwitches[0]]) !== true) {
                        $gameSelfSwitches.setValue([this._mapId, this._eventId, this._eventSelfSwitches[0]], true);
                    }
                } else {
                    if ($gameSelfSwitches.value([this._mapId, this._eventId, this._eventSelfSwitches[1]]) !== true) {
                        $gameSelfSwitches.setValue([this._mapId, this._eventId, this._eventSelfSwitches[1]], true);
                        $gameMap.event(this._eventId)._shopSystem_eventSetPosition = true;
                    }
                }
                if ($gameSelfSwitches.value([this._mapId, this._eventId, this._eventSelfSwitches[1]])) {
                    if (!this._event['working']) this._event['working'] = true;
                    if (!this._event['hide']) this._event['hide'] = true;
                    if (this._event['timeOfFabrication'] < this._timer_of_fabrication) {
                        return this._event['timeOfFabrication'] += .60;
                    } else {
                        this._event['timeOfFabrication'] = 0;
                        if (Math.randomInt(2)) this._event['itemFabricationAmount']++;
                    }
                    $gameMap.itemShopSave();
                }
            }
        } else {
            if (this._event['working']) {
                if ($gameSelfSwitches.value([this._mapId, this._eventId, this._eventSelfSwitches[1]])) {
                    $gameSelfSwitches.setValue([this._mapId, this._eventId, this._eventSelfSwitches[1]], false);
                    $gameSelfSwitches.setValue([this._mapId, this._eventId, this._eventSelfSwitches[2]], true);
                }
                if (!$gameSelfSwitches.value([this._mapId, this._eventId, this._eventSelfSwitches[2]])) {
                    if (this._event['working']) this._event['working'] = false;
                    if (this._event['hide']) this._event['hide'] = false;
                    $gameTemp.addItemShop(this._shopID, this._itemID, this._event['itemFabricationAmount']);
                    $gameMap.itemShopSave();
                }
            }
        }
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
     * SceneManager
     */
    SceneManager.gotoExpress = function (sceneClass) {
        if (sceneClass) {
            this._nextScene = new sceneClass(arguments[1]);
        }
        if (this._scene) {
            this._scene.stop();
        }
    };

    /**
     * Scene_SystemShop
     */
    function Scene_SystemShop() {
        this.initialize.apply(this, arguments);
    }

    Scene_SystemShop.prototype = Object.create(Scene_Base.prototype);
    Scene_SystemShop.prototype.constructor = Scene_SystemShop;

    Scene_SystemShop.prototype.initialize = function (shop) {
        Scene_Base.prototype.initialize.call(this);
        this.shop = shop;
        this.event = $gameMap.event(this.shop['data']['eventID']);
        this.mapId = this.shop['data']['mapID'];
        this._animationFrames = 60;
    };

    Scene_SystemShop.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createWindowLayer();
        this.createContents();
        this.loadWindowskin();
    };

    Scene_SystemShop.prototype.createBackground = function () {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this.addChild(this._backgroundSprite);
    };

    Scene_SystemShop.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack();
        this.startFadeIn(this.fadeSpeed(), false);
    };

    Scene_SystemShop.prototype.update = function () {
        Scene_Base.prototype.update.call(this);
        this.refresh();
        this.updateAnimationFrames();
    };

    Scene_SystemShop.prototype.updateAnimationFrames = function () {
        if (this._animationFrames > 0) {
            if (this.sprite.opacity < 255) this.sprite.opacity += 4;
            if (this.sprite.x < 0) this.sprite.x += 10;
            this._animationFrames--;
        }
    };

    Scene_SystemShop.prototype.contentsWidth = function () {
        return Graphics.width;
    };

    Scene_SystemShop.prototype.contentsHeight = function () {
        return Graphics.height;
    };

    Scene_SystemShop.prototype.contentsPadding = function () {
        return 28;
    };

    Scene_SystemShop.prototype.standardBackOpacity = function () {
        return 192;
    };

    Scene_SystemShop.prototype.loadWindowskin = function () {
        this.windowskin = ImageManager.loadSystem('Window');
    };

    Scene_SystemShop.prototype.textColor = function (n) {
        var px = 96 + (n % 8) * 12 + 6;
        var py = 144 + Math.floor(n / 8) * 12 + 6;
        return this.windowskin.getPixel(px, py);
    };

    Scene_SystemShop.prototype.normalColor = function () {
        return this.textColor(0);
    };

    Scene_SystemShop.prototype.gaugeBackColor = function () {
        return this.textColor(19);
    };

    Scene_SystemShop.prototype.textsAmountMax = function () {
        return this._windowDialog ? this._windowDialog._dialogsTable.max() : 5;
    };

    Scene_SystemShop.prototype.createContents = function () {
        this.sprite = new Sprite();
        this.contents = new Bitmap(this.contentsWidth(), this.contentsHeight());
        this.sprite.bitmap = this.contents;
        this.sprite.opacity = 0;
        this.sprite.x -= 196;
        this.addChild(this.sprite);
    };

    Scene_SystemShop.prototype.refresh = function () {
        this.contents.clear();
        var page = this.event.page();
        var image = page.image;
        var bsY = 48;
        /**
         * BLOCO DO SPRITE
         */
        this.drawCharacter(image.characterName, image.characterIndex,
            this.contentsPadding(), this.contentsPadding() - 1);
        this.contents.fillRect(this.contentsPadding(), this.contentsPadding() - 5,
            this.characterSize(), 5, this.normalColor());
        this.contents.fillRect(this.contentsPadding(), this.contentsPadding() + (this.characterSize() - 5),
            this.characterSize(), 5, this.normalColor());
        this.contents.fillRect(this.contentsPadding() + (this.characterSize() - 5), this.contentsPadding() - 5,
            5, this.characterSize() + 5, this.normalColor());
        this.contents.fillRect(this.contentsPadding() - 5, this.contentsPadding() - 5,
            5, this.characterSize() + 5, this.normalColor());
        /**
         * BLOCO DO NOME DO SPRITE
         */
        this.contents.fillRect(this.contentsPadding() + (this.characterSize()), this.contentsPadding() - 5,
            this.characterSize2(), 5, this.normalColor());
        this.contents.fillRect(this.contentsPadding() + (this.characterSize()),
            (this.contentsPadding() + bsY) - 1, this.characterSize2(), 5, this.normalColor()), bsY += 53;
        this.contents.fillRect(this.contentsPadding() + (this.characterSize()),
            (this.contentsPadding() + bsY) - 5, this.characterSize2(), 5, this.normalColor()), bsY += 53;
        this.contents.fillRect(this.contentsPadding() + (this.characterSize()),
            (this.contentsPadding() + bsY) - 6, this.characterSize2(), 5, this.normalColor());
        this.contents.fillRect(this.contentsPadding() + (this.characterSize2() * 2) - 10, this.contentsPadding() - 5,
            5, bsY + 4, this.normalColor());
        /**
         * JANELAS
         */
        if (!this._windowSystemShop) {
            this._windowSystemShop = new Window_SystemShop(this.shop);
            this._windowSystemShop.backOpacity = 0;
            this.sprite.addChild(this._windowSystemShop);
        } else this._windowSystemShop.contents.clear(), this._windowSystemShop.refresh();
        if (!this._windowCommandSystemShop) {
            this._windowCommandSystemShop = new Window_commandSystemShop();
            this._windowCommandSystemShop.backOpacity = 0;
            /**
             * COMANDOS DO DIALOGO
             */
            this._windowCommandSystemShop.setHandler('_dialogue', this.commandSystemShopProcessOk.bind(this));
            this._windowCommandSystemShop.setHandler('_goback', this.commandSystemShopProcessGoback.bind(this));
            this._windowCommandSystemShop.setHandler('_speak', this.commandSystemShopProcessSpeak.bind(this));
            this._windowCommandSystemShop.setHandler('_selectWords', this.commandSystemShopProcessSelectWords.bind(this));
            /**
             * COMANDOS DE COMPRA
             */
            this._windowCommandSystemShop.setHandler('_seller', this.commandSystemShopProcessSeller.bind(this));
            this._windowCommandSystemShop.setHandler('_seller_goback', this.commandSystemShopSellerGoback.bind(this));
            this._windowCommandSystemShop.setHandler('_seller_next_item', this.commandSystemShopSellerNextItem.bind(this));
            this._windowCommandSystemShop.setHandler('_seller_goback_item', this.commandSystemShopSellerBackItem.bind(this));
            this._windowCommandSystemShop.setHandler('_seller_list_of_items', this.commandSystemShopSellerListOfItems.bind(this));
            /**
             * COMANDOS DA LISTA DE ITENS
             */
            this._windowCommandSystemShop.setHandler('_list_of_items_goback', this.commandSystemShopProcessListOfItemsGoback.bind(this));
            this._windowCommandSystemShop.setHandler('_list_of_items_select', this.commandSystemShopProcessListOfItemsSelect.bind(this));
            this.sprite.addChild(this._windowCommandSystemShop);
        }
        if (!this._windowDialog) {
            this._windowDialog = new Window_Dialog(this.shop.data['shopDataDialog']);
            this._windowDialog.backOpacity = 0;
            this._windowDialog._windowCommandDialog.setHandler('cancel', this.commandSystemShopProcessCancel.bind(this));
            this.sprite.addChild(this._windowDialog);
        }
        if (!this._windowItemsShop) {
            this._windowItemsShop = new Window_itemsShop(this.shop['items']);
            this._windowItemsShop.backOpacity = 0;
            this.sprite.addChild(this._windowItemsShop);
        }
        if (!this._windowBonusShop) {
            this._windowBonusShop = new Window_bonusShop();
            this._windowBonusShop.backOpacity = 0;
            this.sprite.addChild(this._windowBonusShop);
        }
    };

    Scene_SystemShop.prototype.characterSize = function () {
        return 280;
    };

    Scene_SystemShop.prototype.characterSize2 = function () {
        return 290;
    };

    Scene_SystemShop.prototype.characterFrame = function (sx) {
        if (this._characterFrame <= 0 ||
            this._characterFrame === undefined) return sx;
        return sx - this._characterFrame;
    };

    Scene_SystemShop.prototype.drawCharacter = function (characterName, characterIndex, x, y) {
        var bitmap = ImageManager.loadCharacter(characterName);
        var big = ImageManager.isBigCharacter(characterName);
        var pw = bitmap.width / (big ? 3 : 12);
        var ph = bitmap.height / (big ? 4 : 8);
        var n = characterIndex;
        var sx = (n % 4 * 3 + 1) * pw;
        var sy = (Math.floor(n / 4) * 4) * ph;
        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, this.characterSize(), this.characterSize());
    };

    Scene_SystemShop.prototype.commandSystemShopProcessOk = function () {
        this._windowDialog._windowCommandDialog.activate();
        this._windowCommandSystemShop._commandsType = 'dialog';
        this._windowCommandSystemShop.refresh();
    };

    Scene_SystemShop.prototype.commandSystemShopProcessSelectWords = function () {
        this._windowDialog._windowCommandDialog.activate();
        this._windowCommandSystemShop.select(0);
    };

    Scene_SystemShop.prototype.commandSystemShopProcessCancel = function () {
        this._windowDialog._windowCommandDialog.deactivate();
        this._windowCommandSystemShop.activate();
    };

    Scene_SystemShop.prototype.commandSystemShopProcessGoback = function () {
        this._windowCommandSystemShop._commandsType = false;
        this._windowCommandSystemShop.refresh();
        this._windowCommandSystemShop.activate();
        this._windowCommandSystemShop.select(0);
    };

    Scene_SystemShop.prototype.commandSystemShopProcessSpeak = function () {
        this._windowDialog.refresh();
        this._windowDialog._windowCommandDialog.select(0);
        this._windowDialog._windowCommandDialog.clearDialogs();
        this._windowDialog._windowCommandDialog.refresh();
        this._windowDialog._windowCommandDialog.activate();
    };

    Scene_SystemShop.prototype.commandSystemShopProcessSeller = function () {
        this._windowCommandSystemShop._commandsType = 'seller';
        this._windowCommandSystemShop.select(0);
        this._windowCommandSystemShop.refresh();
        this._windowCommandSystemShop.activate();
    };

    Scene_SystemShop.prototype.commandSystemShopSellerGoback = function () {
        this._windowCommandSystemShop._commandsType = false;
        this._windowCommandSystemShop.select(0);
        this._windowCommandSystemShop.refresh();
        this._windowCommandSystemShop.activate();
    };

    Scene_SystemShop.prototype.commandSystemShopSellerNextItem = function () {
        this._windowItemsShop.nextListItem();
        this._windowItemsShop.refresh();
        this._windowCommandSystemShop.refresh();
        this._windowCommandSystemShop.activate();
    };

    Scene_SystemShop.prototype.commandSystemShopSellerBackItem = function () {
        this._windowItemsShop.backListItem();
        this._windowItemsShop.refresh();
        this._windowCommandSystemShop.refresh();
        this._windowCommandSystemShop.activate();
    };

    Scene_SystemShop.prototype.commandSystemShopSellerListOfItems = function () {
        this._windowCommandSystemShop._commandsType = 'list_of_items';
        this._windowCommandSystemShop.refresh();
        this._windowCommandSystemShop.activate();
    };

    Scene_SystemShop.prototype.commandSystemShopProcessListOfItemsGoback = function () {
        this._windowCommandSystemShop._commandsType = 'seller';
        this._windowCommandSystemShop.select(0);
        this._windowCommandSystemShop.refresh();
        this._windowCommandSystemShop.activate();
    };

    Scene_SystemShop.prototype.commandSystemShopProcessListOfItemsSelect = function () {
        this._windowItemsShop.listItemSetId(this._windowCommandSystemShop.index());
        this._windowItemsShop.refresh();
        this._windowCommandSystemShop.refresh();
        this._windowCommandSystemShop.activate();
    };

    /**
     * Window_SystemShop
     */
    function Window_SystemShop() {
        this.initialize.apply(this, arguments);
    }

    Window_SystemShop.prototype = Object.create(Window_Base.prototype);
    Window_SystemShop.prototype.constructor = Window_SystemShop;

    Window_SystemShop.prototype.initialize = function (shop) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Base.prototype.initialize.call(this, 0, 0, width, height);
        this.shop = shop;
        this.refresh();
    };

    Window_SystemShop.prototype.windowWidth = function () {
        return Graphics.width;
    };

    Window_SystemShop.prototype.windowHeight = function () {
        return Graphics.height;
    };

    Window_SystemShop.prototype.textPadding2 = function () {
        return 280;
    };

    Window_SystemShop.prototype.textPadding3 = function () {
        return 48;
    };

    Window_SystemShop.prototype.refresh = function () {
        var x = 20;
        var y = (this.textPadding3() / 2) - 7;
        var shopName = getTextLanguage(this.shop['data']['shopName']);
        var shopLevel = ((level) => {
            switch (level) {
                case 'very low':
                    return [89, 90, 90];
                case 'medium low':
                    return [89, 89, 90];
                case 'low':
                    return [89, 89, 89];
                case 'very medium':
                    return [88, 90, 90];
                case 'medium medium':
                    return [88, 88, 90];
                case 'medium':
                    return [88, 88, 88];
                case 'low high':
                    return [87, 90, 90];
                case 'medium high':
                    return [87, 87, 90];
                case 'high':
                    return [87, 87, 87];
                default:
                    return [89, 90, 90];
            }
        })(this.shop['data']['shopLevel']);
        this.contents.clear();
        this.drawTextEx(shopName, this.textPadding2() + x, y), y += 51;
        this.drawTextEx(getTextLanguage([
            JSON.stringify(
                {
                    Language: "pt_br",
                    Value: `Nivel da loja \\i[${shopLevel[0]}]\\i[${shopLevel[1]}]\\i[${shopLevel[2]}]`
                }),
            JSON.stringify(
                {
                    Language: "en_us",
                    Value: `Store Level \\i[${shopLevel[0]}]\\i[${shopLevel[1]}]\\i[${shopLevel[2]}]`
                })
        ]), this.textPadding2() + x, y), y += 51;
        if (this.shop['data']['affinity'] >= 0 && this.shop['data']['affinity'] < 10)
            this.drawTextEx(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: "Desconhecido"
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: "Unknown"
                    })
            ]), this.textPadding2() + x, y), y += 51;
        else if (this.shop['data']['affinity'] >= 10 && this.shop['data']['affinity'] < 20)
            this.drawTextEx(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: "Conhecido"
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: "Known"
                    })
            ]), this.textPadding2() + x, y), y += 51;
        else if (this.shop['data']['affinity'] >= 20 && this.shop['data']['affinity'] < 30)
            this.drawTextEx(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "qualquer",
                        Value: "Familiar"
                    })
            ]), this.textPadding2() + x, y), y += 51;
        else if (this.shop['data']['affinity'] >= 30 && this.shop['data']['affinity'] < 60)
            this.drawTextEx(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: "Amigos"
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: "Friends"
                    })
            ]), this.textPadding2() + x, y), y += 51;
        else if (this.shop['data']['affinity'] >= 60)
            this.drawTextEx(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: "Melhores Amigos"
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: "Best Friends"
                    })
            ]), this.textPadding2() + x, y), y += 51;
    };


    /**
     * Window_commandSystemShop
     */
    function Window_commandSystemShop() {
        this.initialize.apply(this, arguments);
    }

    Window_commandSystemShop.prototype = Object.create(Window_Command.prototype);
    Window_commandSystemShop.prototype.constructor = Window_commandSystemShop;

    Window_commandSystemShop.prototype.initialize = function () {
        Window_Command.prototype.initialize.call(this, 20, Graphics.height - (this.windowHeight() + 15));
        this._commandsType = false;
    };

    Window_commandSystemShop.prototype.windowWidth = function () {
        return 291;
    };

    Window_commandSystemShop.prototype.windowHeight = function () {
        return this.fittingHeight(3);
    };

    Window_commandSystemShop.prototype.numVisibleRows = function () {
        return this.maxItems();
    };

    Window_commandSystemShop.prototype.makeCommandList = function () {
        this.addMainCommands();
    };

    Window_commandSystemShop.prototype.addMainCommands = function () {
        if (!this._iconId) this._iconId = {};
        if (this._commandsType === 'dialog') {
            this.addCommand(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: 'Dizer'
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: 'Say'
                    })
            ]), '_speak');
            this.addCommand(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: 'Selecionar'
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: 'Select'
                    })
            ]), '_selectWords');
            this.addCommand(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: 'Voltar'
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: 'Go back'
                    })
            ]), '_goback');
        } else if (this._commandsType === 'seller') {
            this.shop = SceneManager._scene.shop;
            let _seller_list_of_items = Object.keys(this.shop['items']).length > 1,
                _seller_next_item = Object.keys(this.shop['items']).length > 1 && !SceneManager._scene._windowItemsShop.isLastItem();
            this.addCommand(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: 'Lista de itens'
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: 'List of Items'
                    })
            ]), '_seller_list_of_items', _seller_list_of_items);
            this.addCommand(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: 'Próximo item'
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: 'Next item'
                    })
            ]), '_seller_next_item', _seller_next_item);
            this.addCommand(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: 'Item anterior'
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: 'Previous item'
                    })
            ]), '_seller_goback_item', SceneManager._scene._windowItemsShop.enabledBackItem());
            this.addCommand(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: 'Comprar'
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: 'Buy'
                    })
            ]), '_seller_buy');
            this.addCommand(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: 'Voltar'
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: 'Go back'
                    })
            ]), '_seller_goback');
        } else if (this._commandsType === 'list_of_items') {
            let _enabled = { activate: false, enabled: true, index: 0 };
            this.shop = SceneManager._scene.shop;
            for (const key in this.shop['items']) {
                if (this.shop['items'].hasOwnProperty(key)) {
                    if (!_enabled.activate && SceneManager._scene._windowItemsShop.listItem === _enabled.index)
                        _enabled.activate = true, _enabled.enabled = false;
                    else _enabled.enabled = true;
                    _enabled.index++;
                    this._iconId[String(getTextLanguage(this.shop['items'][key].name))] = this.shop['items'][key].icon;
                    this.addCommand(getTextLanguage(this.shop['items'][key].name), '_list_of_items_select', _enabled.enabled);
                }
            }
            this.addCommand(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: 'Voltar'
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: 'Go back'
                    })
            ]), '_list_of_items_goback');
        } else {
            this.shop = SceneManager._scene.shop;
            let dialogEnabled = true,
                buy_enabled = Object.keys(this.shop['items']).length > 0;
            if (typeof SceneManager._scene.textsAmountMax() === 'boolean' &&
                SceneManager._scene.textsAmountMax() ||
                SceneManager._scene._windowDialog &&
                SceneManager._scene._windowDialog._speakDisabled) dialogEnabled = false;
            this.addCommand(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: 'Falar'
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: 'Speak'
                    })
            ]), '_dialogue', dialogEnabled);
            this.addCommand(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: 'Comprar'
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: 'Purchase'
                    })
            ]), '_seller', this.shop['data']['shopSeller']);
            this.addCommand(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: 'Vender'
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: 'Sell'
                    })
            ]), '_buy', this.shop['data']['shopBuy'] && buy_enabled);
        }
    };

    Window_commandSystemShop.prototype.commandIconId = function (symbol) {
        return this._iconId[symbol];
    };

    Window_commandSystemShop.prototype.drawItem = function (index) {
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        var iconId = 0;
        var fontSize = this.contents.fontSize;
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        if (this.commandSymbol(index) === '_dialogue') {
            iconId = 4;
        } else if (this.commandSymbol(index) === '_seller') {
            iconId = 210;
        } else if (this.commandSymbol(index) === '_buy') {
            iconId = 209;
        } else if (this.commandSymbol(index) === '_seller_buy') {
            iconId = 196;
        } else if (this.commandSymbol(index) === '_speak') {
            iconId = 4;
        } else if (this.commandSymbol(index) === '_selectWords') {
            iconId = 75;
        } else if (this.commandSymbol(index) === '_goback' ||
            this.commandSymbol(index) === '_seller_goback' ||
            this.commandSymbol(index) === '_seller_goback_item' ||
            this.commandSymbol(index) === '_list_of_items_goback') {
            iconId = 74;
        } else if (this.commandSymbol(index) === '_seller_next_item') {
            iconId = 73;
        } else if (this.commandSymbol(index) === '_seller_list_of_items') {
            iconId = 186;
        }
        if (this.commandIconId(this.commandName(index)) != undefined) {
            iconId = this.commandIconId(this.commandName(index));
            this.contents.fontSize = 14;
        }
        this.drawIcon(iconId, rect.x - 1, rect.y + 2);
        this.drawText(this.commandName(index), rect.x + 36, rect.y, rect.width, align);
        this.contents.fontSize = fontSize;
    };

    //-----------------------------------------------------------------------------
    // Window_Dialog
    //
    function Window_Dialog() {
        this.initialize.apply(this, arguments);
    }

    Window_Dialog.prototype = Object.create(Window_Base.prototype);
    Window_Dialog.prototype.constructor = Window_Dialog;

    Window_Dialog.prototype.initialize = function (data) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Base.prototype.initialize.call(this, (280 * 2) + 45
            , 19, width, height);
        this._data = data;
        this._dialogsTable = {
            select: 0,
            next: 1,
            max() {
                return this.u5.length >= 5;
            },
            get(next) {
                let select = next === undefined ? this.select : next;
                switch (select) {
                    case 0:
                        return this.u1;
                    case 1:
                        return this.u2;
                    case 2:
                        return this.u3;
                    case 3:
                        return this.u4;
                    case 4:
                        return this.u5;
                    default:
                        return this.u1;
                }
            },
            push(text) {
                if (this.get().length >= 5) {
                    if (this.get(this.next).length >= 5) this.next++;
                    this.get(this.next).push(text);
                } else {
                    this.get().push(text);
                }
            },
            u1: [
                getTextLanguage(JSON.parse(this._data['Initial Message']))
            ],
            u2: [],
            u3: [],
            u4: [],
            u5: []
        };
        this._textsWords = [];
        this._textLine = '';
        this._textsForAnswers = [];
        this._lastAnswers = {};
        this._lastAnswers['_memory'] = {};
        this._dialogEfficiency = {};
        this._speakDisabled = false;
        this.refresh();
        this.createWindowCommandDialog();
    };

    Window_Dialog.prototype.windowWidth = function () {
        return 665;
    };

    Window_Dialog.prototype.windowHeight = function () {
        return 166;
    };

    Window_Dialog.prototype.standardFontSize = function () {
        return 18;
    };

    Window_Dialog.prototype.formatDialogs = function () {
        if (this._textsWords.length <= 0) return;
        let textLine = this._textsWords.join(' '),
            textPlayer = (() => {
                return getTextLanguage([
                    JSON.stringify(
                        {
                            Language: "pt_br",
                            Value: "\\c[8]Você\\c[0]"
                        }),
                    JSON.stringify(
                        {
                            Language: "en_us",
                            Value: "\\c[8]You\\c[0]"
                        })
                ])
            })();
        this._textsForAnswers.push(textLine);
        if (this.contentsWidth() >= this.textWidth(textLine)) {
            this._textLine = `${textLine} -${textPlayer}`;
        } else {
            this._textLine = '';
            this._dialogsTable.push(`\n${textLine} -${textPlayer}`);
        }
    };

    Window_Dialog.prototype.formatAnswers = function () {
        this._textsForAnswers.map(text => {
            let answer = this.databaseAnswers(text.toLowerCase().trim()),
                textSeller = (() => {
                    return getTextLanguage([
                        JSON.stringify(
                            {
                                Language: "pt_br",
                                Value: "\\c[8]Vendedor\\c[0]"
                            }),
                        JSON.stringify(
                            {
                                Language: "en_us",
                                Value: "\\c[8]Seller\\c[0]"
                            })
                    ]);
                })();
            if (answer.length > 0) {
                if (this.contentsWidth() >= this.textWidth(answer)) {
                    this._dialogsTable.push(`${answer} -${textSeller}`);
                } else {
                    this._dialogsTable.push(`\n${answer} -${textSeller}`);
                }
            }
        }, this);
        this._textsForAnswers = [];
    };

    Window_Dialog.prototype.memoryWords = function (...words) {
        return words.filter(word => {
            return this._lastAnswers['_memory'][word];
        }, this).length > 0;
    };

    Window_Dialog.prototype.dialogEfficiency = function (word, type) {
        let dialogs = JSON.parse(this._data['Dialog Efficiency']),
            buy_bonus = 0,
            sell_bonus = 0,
            buy_bonus_type = '',
            sell_bonus_type = '';
        dialogs.map(dialog => {
            let data = JSON.parse(dialog);
            if (String(data['Word']).toLowerCase().trim() === word) {
                if (String(data['Bonus Type']).toLowerCase().trim() === 'qualquer') {
                    buy_bonus = Number(data['Bonus Buy']);
                    sell_bonus = Number(data['Bonus Sell']);
                    buy_bonus_type = String(data['Bonus Buy Type']);
                    sell_bonus_type = String(data['Bonus Sell Type']);
                }
                if (String(data['Bonus Type']).toLowerCase().trim() === 'buy') {
                    buy_bonus = Number(data['Bonus Buy']);
                    buy_bonus_type = String(data['Bonus Buy Type']);
                }
                if (String(data['Bonus Type']).toLowerCase().trim() === 'sell') {
                    sell_bonus = Number(data['Bonus Sell']);
                    sell_bonus_type = String(data['Bonus Sell Type']);
                }
            }
        });
        return {
            qualquer: type['qualquer'],
            buy: [type['buy'], buy_bonus, buy_bonus_type],
            sell: [type['sell'], sell_bonus, sell_bonus_type]
        };
    };

    Window_Dialog.prototype.formatBonus = function (bonus) {
        let actor = $gameActors.actor(1);
        if (actor.isLearnedSkill(4)) {
            let score = (actor.skill(4).level * (actor.skill(4).levelMax / actor.skill(4).scoreDivider)) / 100,
                fame = (actor.skill(4).level * (score / actor.skill(4).fameDivider)) / 100,
                efficiency = (2 * bonus / 100) + (score + fame);
            bonus += parseFloat(efficiency.toFixed(2));
        }
        return parseFloat(bonus.toFixed(2));
    };

    Window_Dialog.prototype.formatBonusReclamation = function (bonus) {
        let actor = $gameActors.actor(1);
        if (actor.isLearnedSkill(9)) {
            let score = (actor.skill(9).level * (actor.skill(9).levelMax / actor.skill(9).scoreDivider)) / 100,
                fame = (actor.skill(9).level * (score / actor.skill(9).fameDivider)) / 100,
                efficiency = (2 * bonus / 100) + (score + fame);
            bonus -= parseFloat(efficiency.toFixed(2));
        }
        return parseFloat(bonus.toFixed(2));
    };

    Window_Dialog.prototype.databaseAnswers = function (text) {
        /**
         * CONFIGURAÇÃO DAS RESPOSTAS ANTERIORES
         */
        {
            if (!this._lastAnswers['_answer1']) this._lastAnswers['_answer1'] = { tolerance: 0 };
            if (!this._lastAnswers['_answer2']) this._lastAnswers['_answer2'] = { tolerance: 0 };
            if (!this._lastAnswers['_answer3']) this._lastAnswers['_answer3'] = { tolerance: 0 };
            if (!this._lastAnswers['_answer4']) this._lastAnswers['_answer4'] = { tolerance: 0 };
            if (!this._lastAnswers['_answer5']) this._lastAnswers['_answer5'] = { tolerance: 0 };
            if (!this._lastAnswers['_answer6']) this._lastAnswers['_answer6'] = { tolerance: 0 };
            if (!this._lastAnswers['_answer7']) this._lastAnswers['_answer7'] = { tolerance: 0 };
        }
        switch (text) {
            case String('Olá').toLocaleLowerCase().trim():
            case String('Hello').toLocaleLowerCase().trim():
                /**
                 * BLOCO DE CONTROLE DE RESPOSTAS ANTERIORES
                 */
                {
                    let withdrawal_of_bonus = JSON.parse(this._data['Answer 1 Withdrawal of Bonus for Reclamation, Exceeded and Cancel']);
                    if (this._lastAnswers['_answer1'].tolerance >= 1 && !this._lastAnswers['_answer1']['Tolerance']) {
                        this._lastAnswers['_answer1']['Tolerance'] = true;
                        this._lastAnswers['_answer1'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 1 Reclamation']));
                    } else if (this._lastAnswers['_answer1'].tolerance >= 2 && !this._lastAnswers['_answer1']['Tolerance Exceeded']) {
                        this._lastAnswers['_answer1']['Tolerance Exceeded'] = true;
                        this._lastAnswers['_answer1'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 1 Reclamation Exceeded']));
                    } else if (this._lastAnswers['_answer1'].tolerance >= 2 && !this._lastAnswers['_answer1']['Tolerance Cancel']) {
                        this._lastAnswers['_answer1']['Tolerance Cancel'] = true;
                        this._speakDisabled = true;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 1 Dialog Cancel']));
                    }
                }
                /**
                 * AUMENTA A TOLERANCIA DA RESPOSTA E GUARDA NA MEMORIA A RESPOSTA
                 */
                {
                    this._lastAnswers['_answer1'].tolerance++;
                    this._lastAnswers['_memory']['hello'] = true;
                }
                /**
                 * CONTROLA A EFICIENCIA DO DIALOGO
                 */
                {
                    if (this._dialogEfficiency['hello'] === undefined)
                        this._dialogEfficiency['hello'] = this.dialogEfficiency('hello', { qualquer: true });
                    if (this._dialogEfficiency['hello']['qualquer']) {
                        let buy_bonus = this._dialogEfficiency['hello']['buy'][1],
                            sell_bonus = this._dialogEfficiency['hello']['sell'][1],
                            buy_bonus_type = this._dialogEfficiency['hello']['buy'][2],
                            sell_bonus_type = this._dialogEfficiency['hello']['sell'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonus(buy_bonus));
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonus(sell_bonus));
                    } else if (this._dialogEfficiency['hello']['buy'][0]) {
                        let buy_bonus = this._dialogEfficiency['hello']['buy'][1],
                            buy_bonus_type = this._dialogEfficiency['hello']['buy'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                    } else if (this._dialogEfficiency['hello']['sell'][0]) {
                        let sell_bonus = this._dialogEfficiency['hello']['sell'][1],
                            sell_bonus_type = this._dialogEfficiency['hello']['sell'][2];
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                    }
                }
                /**
                 * RETORNA A RESPOSTA
                 */
                return getTextLanguage(JSON.parse(this._data['Answer 1']));
            case String('Tudo bem?').toLocaleLowerCase().trim():
            case String('You all right?').toLocaleLowerCase().trim():
                /**
                 * BLOCO DE CONTROLE DE RESPOSTAS ANTERIORES
                 */
                {
                    let withdrawal_of_bonus = JSON.parse(this._data['Answer 2 Withdrawal of Bonus for Reclamation, Exceeded and Cancel']);
                    if (this._lastAnswers['_answer2'].tolerance >= 1 && !this._lastAnswers['_answer2']['Tolerance']) {
                        this._lastAnswers['_answer2']['Tolerance'] = true;
                        this._lastAnswers['_answer2'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 2 Reclamation']));
                    } else if (this._lastAnswers['_answer2'].tolerance >= 2 && !this._lastAnswers['_answer2']['Tolerance Exceeded']) {
                        this._lastAnswers['_answer2']['Tolerance Exceeded'] = true;
                        this._lastAnswers['_answer2'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 2 Reclamation Exceeded']));
                    } else if (this._lastAnswers['_answer2'].tolerance >= 2 && !this._lastAnswers['_answer2']['Tolerance Cancel']) {
                        this._lastAnswers['_answer2']['Tolerance Cancel'] = true;
                        this._speakDisabled = true;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 2 Dialog Cancel']));
                    }
                }
                /**
                 * AUMENTA A TOLERANCIA DA RESPOSTA E GUARDA NA MEMORIA A RESPOSTA
                 */
                {
                    this._lastAnswers['_answer2'].tolerance++;
                    this._lastAnswers['_memory']['you all right?'] = true;
                }
                /**
                 * CONTROLA A EFICIENCIA DO DIALOGO
                 */
                {
                    if (this._dialogEfficiency['you all right?'] === undefined)
                        this._dialogEfficiency['you all right?'] = this.dialogEfficiency('you all right?', { qualquer: true });
                    if (this._dialogEfficiency['you all right?']['qualquer']) {
                        let buy_bonus = this._dialogEfficiency['you all right?']['buy'][1],
                            sell_bonus = this._dialogEfficiency['you all right?']['sell'][1],
                            buy_bonus_type = this._dialogEfficiency['you all right?']['buy'][2],
                            sell_bonus_type = this._dialogEfficiency['you all right?']['sell'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonus(buy_bonus));
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonus(sell_bonus));
                    } else if (this._dialogEfficiency['you all right?']['buy'][0]) {
                        let buy_bonus = this._dialogEfficiency['you all right?']['buy'][1],
                            buy_bonus_type = this._dialogEfficiency['you all right?']['buy'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                    } else if (this._dialogEfficiency['you all right?']['sell'][0]) {
                        let sell_bonus = this._dialogEfficiency['you all right?']['sell'][1],
                            sell_bonus_type = this._dialogEfficiency['you all right?']['sell'][2];
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                    }
                }
                /**
                 * RETORNA A RESPOSTA
                 */
                return getTextLanguage(JSON.parse(this._data['Answer 2']));
            case String('Olá tudo bem?').toLocaleLowerCase().trim():
            case String('Hello you all right?').toLocaleLowerCase().trim():
                /**
                 * BLOCO DE CONTROLE DE RESPOSTAS NA MEMORIA
                 */
                {
                    if (this.memoryWords('hello', 'you all right?') && !this._lastAnswers['_memory']['hello you all right?']) {
                        this._lastAnswers['_answer1'].tolerance++;
                        this._lastAnswers['_answer2'].tolerance++;
                        this._lastAnswers['_answer3'].tolerance++;
                        this._lastAnswers['_memory']['hello you all right?'] = true;
                        let withdrawal_of_bonus = JSON.parse(this._data['Answer 3 Withdrawal of Bonus for Reclamation, Exceeded and Cancel']);
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Same Phrase Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Same Phrase Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer Same phrase']));
                    }
                }
                /**
                 * BLOCO DE CONTROLE DE RESPOSTAS ANTERIORES
                 */
                {
                    let withdrawal_of_bonus = JSON.parse(this._data['Answer 3 Withdrawal of Bonus for Reclamation, Exceeded and Cancel']);
                    if (this._lastAnswers['_answer3'].tolerance >= 1 && !this._lastAnswers['_answer3']['Tolerance']) {
                        this._lastAnswers['_answer3']['Tolerance'] = true;
                        this._lastAnswers['_answer3'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 3 Reclamation']));
                    } else if (this._lastAnswers['_answer3'].tolerance >= 2 && !this._lastAnswers['_answer3']['Tolerance Exceeded']) {
                        this._lastAnswers['_answer3']['Tolerance Exceeded'] = true;
                        this._lastAnswers['_answer3'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 3 Reclamation Exceeded']));
                    } else if (this._lastAnswers['_answer3'].tolerance >= 2 && !this._lastAnswers['_answer3']['Tolerance Cancel']) {
                        this._lastAnswers['_answer3']['Tolerance Cancel'] = true;
                        this._speakDisabled = true;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 3 Dialog Cancel']));
                    }
                }
                /**
                 * AUMENTA A TOLERANCIA DA RESPOSTA E GUARDA NA MEMORIA A RESPOSTA
                 */
                {
                    this._lastAnswers['_answer1'].tolerance++;
                    this._lastAnswers['_answer2'].tolerance++;
                    this._lastAnswers['_answer3'].tolerance++;
                    this._lastAnswers['_memory']['hello'] = true;
                    this._lastAnswers['_memory']['you all right?'] = true;
                }
                /**
                 * CONTROLA A EFICIENCIA DO DIALOGO
                 */
                {
                    if (this._dialogEfficiency['hello you all right?'] === undefined)
                        this._dialogEfficiency['hello you all right?'] = this.dialogEfficiency('hello you all right?', { qualquer: true });
                    if (this._dialogEfficiency['hello you all right?']['qualquer']) {
                        let buy_bonus = this._dialogEfficiency['hello you all right?']['buy'][1],
                            sell_bonus = this._dialogEfficiency['hello you all right?']['sell'][1],
                            buy_bonus_type = this._dialogEfficiency['hello you all right?']['buy'][2],
                            sell_bonus_type = this._dialogEfficiency['hello you all right?']['sell'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonus(buy_bonus));
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonus(sell_bonus));
                    } else if (this._dialogEfficiency['hello you all right?']['buy'][0]) {
                        let buy_bonus = this._dialogEfficiency['hello you all right?']['buy'][1],
                            buy_bonus_type = this._dialogEfficiency['hello you all right?']['buy'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                    } else if (this._dialogEfficiency['hello you all right?']['sell'][0]) {
                        let sell_bonus = this._dialogEfficiency['hello you all right?']['sell'][1],
                            sell_bonus_type = this._dialogEfficiency['hello you all right?']['sell'][2];
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                    }
                }
                /**
                 * RETORNA A RESPOSTA
                 */
                return getTextLanguage(JSON.parse(this._data['Answer 3']));
            case String('Quero comprar').toLocaleLowerCase().trim():
            case String('I want to buy').toLocaleLowerCase().trim():
                /**
                 * BLOCO DE CONTROLE DE RESPOSTAS ANTERIORES
                 */
                {
                    let withdrawal_of_bonus = JSON.parse(this._data['Answer 4 Withdrawal of Bonus for Reclamation, Exceeded and Cancel']);
                    if (this._lastAnswers['_answer4'].tolerance >= 1 && !this._lastAnswers['_answer4']['Tolerance']) {
                        this._lastAnswers['_answer4']['Tolerance'] = true;
                        this._lastAnswers['_answer4'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 4 Reclamation']));
                    } else if (this._lastAnswers['_answer4'].tolerance >= 2 && !this._lastAnswers['_answer4']['Tolerance Exceeded']) {
                        this._lastAnswers['_answer4']['Tolerance Exceeded'] = true;
                        this._lastAnswers['_answer4'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 4 Reclamation Exceeded']));
                    } else if (this._lastAnswers['_answer4'].tolerance >= 2 && !this._lastAnswers['_answer4']['Tolerance Cancel']) {
                        this._lastAnswers['_answer4']['Tolerance Cancel'] = true;
                        this._speakDisabled = true;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 4 Dialog Cancel']));
                    }
                }
                /**
                 * AUMENTA A TOLERANCIA DA RESPOSTA E GUARDA NA MEMORIA A RESPOSTA
                 */
                {
                    this._lastAnswers['_answer4'].tolerance++;
                    this._lastAnswers['_memory']['i want to buy'] = true;
                }
                /**
                 * CONTROLA A EFICIENCIA DO DIALOGO
                 */
                {
                    if (this._dialogEfficiency['i want to buy'] === undefined)
                        this._dialogEfficiency['i want to buy'] = this.dialogEfficiency('i want to buy', { buy: true });
                    if (this._dialogEfficiency['i want to buy']['qualquer']) {
                        let buy_bonus = this._dialogEfficiency['i want to buy']['buy'][1],
                            sell_bonus = this._dialogEfficiency['i want to buy']['sell'][1],
                            buy_bonus_type = this._dialogEfficiency['i want to buy']['buy'][2],
                            sell_bonus_type = this._dialogEfficiency['i want to buy']['sell'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonus(buy_bonus));
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonus(sell_bonus));
                    } else if (this._dialogEfficiency['i want to buy']['buy'][0]) {
                        let buy_bonus = this._dialogEfficiency['i want to buy']['buy'][1],
                            buy_bonus_type = this._dialogEfficiency['i want to buy']['buy'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                    } else if (this._dialogEfficiency['i want to buy']['sell'][0]) {
                        let sell_bonus = this._dialogEfficiency['i want to buy']['sell'][1],
                            sell_bonus_type = this._dialogEfficiency['i want to buy']['sell'][2];
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                    }
                }
                /**
                 * RETORNA A RESPOSTA
                 */
                return getTextLanguage(JSON.parse(this._data['Answer 4']));
            case String('Olá quero comprar').toLocaleLowerCase().trim():
            case String('Hello i want to buy').toLocaleLowerCase().trim():
                /**
                 * BLOCO DE CONTROLE DE RESPOSTAS NA MEMORIA
                 */
                {
                    if (this.memoryWords('hello', 'i want to buy') && !this._lastAnswers['_memory']['hello i want to buy']) {
                        this._lastAnswers['_answer1'].tolerance++;
                        this._lastAnswers['_answer4'].tolerance++;
                        this._lastAnswers['_answer5'].tolerance++;
                        this._lastAnswers['_memory']['hello i want to buy'] = true;
                        let withdrawal_of_bonus = JSON.parse(this._data['Answer 5 Withdrawal of Bonus for Reclamation, Exceeded and Cancel']);
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Same Phrase Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Same Phrase Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer Same phrase']));
                    }
                }
                /**
                 * BLOCO DE CONTROLE DE RESPOSTAS ANTERIORES
                 */
                {
                    let withdrawal_of_bonus = JSON.parse(this._data['Answer 5 Withdrawal of Bonus for Reclamation, Exceeded and Cancel']);
                    if (this._lastAnswers['_answer5'].tolerance >= 1 && !this._lastAnswers['_answer5']['Tolerance']) {
                        this._lastAnswers['_answer5']['Tolerance'] = true;
                        this._lastAnswers['_answer5'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 5 Reclamation']));
                    } else if (this._lastAnswers['_answer5'].tolerance >= 2 && !this._lastAnswers['_answer5']['Tolerance Exceeded']) {
                        this._lastAnswers['_answer5']['Tolerance Exceeded'] = true;
                        this._lastAnswers['_answer5'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 5 Reclamation Exceeded']));
                    } else if (this._lastAnswers['_answer5'].tolerance >= 2 && !this._lastAnswers['_answer5']['Tolerance Cancel']) {
                        this._lastAnswers['_answer5']['Tolerance Cancel'] = true;
                        this._speakDisabled = true;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 5 Dialog Cancel']));
                    }
                }
                /**
                 * AUMENTA A TOLERANCIA DA RESPOSTA E GUARDA NA MEMORIA A RESPOSTA
                 */
                {
                    this._lastAnswers['_answer1'].tolerance++;
                    this._lastAnswers['_answer4'].tolerance++;
                    this._lastAnswers['_answer5'].tolerance++;
                    this._lastAnswers['_memory']['hello'] = true;
                    this._lastAnswers['_memory']['i want to buy'] = true;
                }
                /**
                 * CONTROLA A EFICIENCIA DO DIALOGO
                 */
                {
                    if (this._dialogEfficiency['hello i want to buy'] === undefined)
                        this._dialogEfficiency['hello i want to buy'] = this.dialogEfficiency('hello i want to buy', { buy: true });
                    if (this._dialogEfficiency['hello i want to buy']['qualquer']) {
                        let buy_bonus = this._dialogEfficiency['hello i want to buy']['buy'][1],
                            sell_bonus = this._dialogEfficiency['hello i want to buy']['sell'][1],
                            buy_bonus_type = this._dialogEfficiency['hello i want to buy']['buy'][2],
                            sell_bonus_type = this._dialogEfficiency['hello i want to buy']['sell'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonus(buy_bonus));
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonus(sell_bonus));
                    } else if (this._dialogEfficiency['hello i want to buy']['buy'][0]) {
                        let buy_bonus = this._dialogEfficiency['hello i want to buy']['buy'][1],
                            buy_bonus_type = this._dialogEfficiency['hello i want to buy']['buy'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                    } else if (this._dialogEfficiency['hello i want to buy']['sell'][0]) {
                        let sell_bonus = this._dialogEfficiency['hello i want to buy']['sell'][1],
                            sell_bonus_type = this._dialogEfficiency['hello i want to buy']['sell'][2];
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                    }
                }
                /**
                 * RETORNA A RESPOSTA
                 */
                return getTextLanguage(JSON.parse(this._data['Answer 5']));
            case String('Olá tudo bem? quero comprar').toLocaleLowerCase().trim():
            case String('Hello you all right? i want to buy').toLocaleLowerCase().trim():
                /**
                 * BLOCO DE CONTROLE DE RESPOSTAS NA MEMORIA
                 */
                {
                    if (this.memoryWords('hello', 'you all right?', 'i want to buy') && !this._lastAnswers['_memory']['hello you all right? i want to buy']) {
                        this._lastAnswers['_answer1'].tolerance++;
                        this._lastAnswers['_answer2'].tolerance++;
                        this._lastAnswers['_answer4'].tolerance++;
                        this._lastAnswers['_answer6'].tolerance++;
                        this._lastAnswers['_memory']['hello you all right? i want to buy'] = true;
                        let withdrawal_of_bonus = JSON.parse(this._data['Answer 6 Withdrawal of Bonus for Reclamation, Exceeded and Cancel']);
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Same Phrase Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Same Phrase Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer Same phrase']));
                    }
                }
                /**
                 * BLOCO DE CONTROLE DE RESPOSTAS ANTERIORES
                 */
                {
                    let withdrawal_of_bonus = JSON.parse(this._data['Answer 6 Withdrawal of Bonus for Reclamation, Exceeded and Cancel']);
                    if (this._lastAnswers['_answer6'].tolerance >= 1 && !this._lastAnswers['_answer6']['Tolerance']) {
                        this._lastAnswers['_answer6']['Tolerance'] = true;
                        this._lastAnswers['_answer6'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 6 Reclamation']));
                    } else if (this._lastAnswers['_answer6'].tolerance >= 2 && !this._lastAnswers['_answer6']['Tolerance Exceeded']) {
                        this._lastAnswers['_answer6']['Tolerance Exceeded'] = true;
                        this._lastAnswers['_answer6'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 6 Reclamation Exceeded']));
                    } else if (this._lastAnswers['_answer6'].tolerance >= 2 && !this._lastAnswers['_answer6']['Tolerance Cancel']) {
                        this._lastAnswers['_answer6']['Tolerance Cancel'] = true;
                        this._speakDisabled = true;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 6 Dialog Cancel']));
                    }
                }
                /**
                 * AUMENTA A TOLERANCIA DA RESPOSTA E GUARDA NA MEMORIA A RESPOSTA
                 */
                {
                    this._lastAnswers['_answer1'].tolerance++;
                    this._lastAnswers['_answer2'].tolerance++;
                    this._lastAnswers['_answer4'].tolerance++;
                    this._lastAnswers['_answer6'].tolerance++;
                    this._lastAnswers['_memory']['hello'] = true;
                    this._lastAnswers['_memory']['you all right?'] = true;
                    this._lastAnswers['_memory']['i want to buy'] = true;
                }
                /**
                 * CONTROLA A EFICIENCIA DO DIALOGO
                 */
                {
                    if (this._dialogEfficiency['hello you all right? i want to buy'] === undefined)
                        this._dialogEfficiency['hello you all right? i want to buy'] = this.dialogEfficiency('hello you all right? i want to buy', { buy: true });
                    if (this._dialogEfficiency['hello you all right? i want to buy']['qualquer']) {
                        let buy_bonus = this._dialogEfficiency['hello you all right? i want to buy']['buy'][1],
                            sell_bonus = this._dialogEfficiency['hello you all right? i want to buy']['sell'][1],
                            buy_bonus_type = this._dialogEfficiency['hello you all right? i want to buy']['buy'][2],
                            sell_bonus_type = this._dialogEfficiency['hello you all right? i want to buy']['sell'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonus(buy_bonus));
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonus(sell_bonus));
                    } else if (this._dialogEfficiency['hello you all right? i want to buy']['buy'][0]) {
                        let buy_bonus = this._dialogEfficiency['hello you all right? i want to buy']['buy'][1],
                            buy_bonus_type = this._dialogEfficiency['hello you all right? i want to buy']['buy'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                    } else if (this._dialogEfficiency['hello you all right? i want to buy']['sell'][0]) {
                        let sell_bonus = this._dialogEfficiency['hello you all right? i want to buy']['sell'][1],
                            sell_bonus_type = this._dialogEfficiency['hello you all right? i want to buy']['sell'][2];
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                    }
                }
                /**
                 * RETORNA A RESPOSTA
                 */
                return getTextLanguage(JSON.parse(this._data['Answer 7']));
            case String('Tudo bem? quero comprar').toLocaleLowerCase().trim():
            case String('You all right? i want to buy').toLocaleLowerCase().trim():
                /**
                 * BLOCO DE CONTROLE DE RESPOSTAS NA MEMORIA
                 */
                {
                    if (this.memoryWords('you all right?', 'i want to buy') && !this._lastAnswers['_memory']['you all right? i want to buy']) {
                        this._lastAnswers['_answer2'].tolerance++;
                        this._lastAnswers['_answer4'].tolerance++;
                        this._lastAnswers['_answer7'].tolerance++;
                        this._lastAnswers['_memory']['you all right? i want to buy'] = true;
                        let withdrawal_of_bonus = JSON.parse(this._data['Answer 7 Withdrawal of Bonus for Reclamation, Exceeded and Cancel']);
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Same Phrase Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Same Phrase Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer Same phrase']));
                    }
                }
                /**
                 * BLOCO DE CONTROLE DE RESPOSTAS ANTERIORES
                 */
                {
                    let withdrawal_of_bonus = JSON.parse(this._data['Answer 7 Withdrawal of Bonus for Reclamation, Exceeded and Cancel']);
                    if (this._lastAnswers['_answer7'].tolerance >= 1 && !this._lastAnswers['_answer7']['Tolerance']) {
                        this._lastAnswers['_answer7']['Tolerance'] = true;
                        this._lastAnswers['_answer7'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 7 Reclamation']));
                    } else if (this._lastAnswers['_answer7'].tolerance >= 2 && !this._lastAnswers['_answer7']['Tolerance Exceeded']) {
                        this._lastAnswers['_answer7']['Tolerance Exceeded'] = true;
                        this._lastAnswers['_answer7'].tolerance++;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Reclamation Exceeded Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 7 Reclamation Exceeded']));
                    } else if (this._lastAnswers['_answer7'].tolerance >= 2 && !this._lastAnswers['_answer7']['Tolerance Cancel']) {
                        this._lastAnswers['_answer7']['Tolerance Cancel'] = true;
                        this._speakDisabled = true;
                        SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Buy'])));
                        SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonusReclamation(Number(withdrawal_of_bonus['Dialog Cancel Sell'])));
                        return getTextLanguage(JSON.parse(this._data['Answer 7 Dialog Cancel']));
                    }
                }
                /**
                 * AUMENTA A TOLERANCIA DA RESPOSTA E GUARDA NA MEMORIA A RESPOSTA
                 */
                {
                    this._lastAnswers['_answer2'].tolerance++;
                    this._lastAnswers['_answer4'].tolerance++;
                    this._lastAnswers['_answer7'].tolerance++;
                    this._lastAnswers['_memory']['you all right?'] = true;
                    this._lastAnswers['_memory']['i want to buy'] = true;
                }
                /**
                 * CONTROLA A EFICIENCIA DO DIALOGO
                 */
                {
                    if (this._dialogEfficiency['you all right? i want to buy'] === undefined)
                        this._dialogEfficiency['you all right? i want to buy'] = this.dialogEfficiency('you all right? i want to buy', { buy: true });
                    if (this._dialogEfficiency['you all right? i want to buy']['qualquer']) {
                        let buy_bonus = this._dialogEfficiency['you all right? i want to buy']['buy'][1],
                            sell_bonus = this._dialogEfficiency['you all right? i want to buy']['sell'][1],
                            buy_bonus_type = this._dialogEfficiency['you all right? i want to buy']['buy'][2],
                            sell_bonus_type = this._dialogEfficiency['you all right? i want to buy']['sell'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusBuy(this.formatBonus(buy_bonus));
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.removeBonusSell(this.formatBonus(sell_bonus));
                    } else if (this._dialogEfficiency['you all right? i want to buy']['buy'][0]) {
                        let buy_bonus = this._dialogEfficiency['you all right? i want to buy']['buy'][1],
                            buy_bonus_type = this._dialogEfficiency['you all right? i want to buy']['buy'][2];
                        if (buy_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                        else if (buy_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusBuy(this.formatBonus(buy_bonus));
                    } else if (this._dialogEfficiency['you all right? i want to buy']['sell'][0]) {
                        let sell_bonus = this._dialogEfficiency['you all right? i want to buy']['sell'][1],
                            sell_bonus_type = this._dialogEfficiency['you all right? i want to buy']['sell'][2];
                        if (sell_bonus_type === 'positive')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                        else if (sell_bonus_type === 'negative')
                            SceneManager._scene._windowBonusShop.addBonusSell(this.formatBonus(sell_bonus));
                    }
                }
                /**
                 * RETORNA A RESPOSTA
                 */
                return getTextLanguage(JSON.parse(this._data['Answer 7']));
            default:
                return getTextLanguage(JSON.parse(this._data['Answer Default']));
        }
    };

    Window_Dialog.prototype.addText = function (text) {
        if (SceneManager._scene.textsAmountMax()) return;
        if (this._textsWords.length > 0) {
            let string = this._textsWords[this._textsWords.length - 1],
                stringIsFinal = string[string.length - 1] === '.';
            if (!stringIsFinal) text = text.replace(text[0], text[0].toLowerCase());
        }
        this._textsWords.push(text);
    };

    Window_Dialog.prototype.removeText = function (text) {
        this._textsWords.splice(this._textsWords.indexOf(text), 1);
    };

    Window_Dialog.prototype.refresh = function () {
        var y = 5;
        this.contents.clear();
        this.formatDialogs();
        if (this._textLine.length > 0) {
            this._dialogsTable.push(this._textLine);
            this._textsWords = [];
            this._textLine = '';
        }
        this.formatAnswers();
        this._dialogsTable.get().map(text => {
            this.drawTextEx(text, 0, y), y += 24;
        }, this);
        this.createNavbar();
    };

    Window_Dialog.prototype.createWindowCommandDialog = function () {
        if (!this._windowCommandDialog) {
            this._windowCommandDialog = new Window_commandDialog();
            this._windowCommandDialog.backOpacity = 0;
            SceneManager._scene.sprite.addChild(this._windowCommandDialog);
        }
    };

    Window_Dialog.prototype.createNavbar = function () {
        if (!this._spriteNavbar) {
            this._spriteNavbar = new Sprite(new Bitmap(this.contents.width, this.contents.height));
            this._spriteNavbar.move(25, 20);
            this.addChild(this._spriteNavbar);
        }
        var bitmap = this._spriteNavbar.bitmap,
            height = 20,
            y = 30,
            tx = { normal: 12, select: 14 },
            ty = 12,
            fontSize = { big: 24, small: 18 },
            x = tx.normal;
        bitmap.clear();
        /**
         * Tabela de dialogs 1
         */
        if (this._dialogsTable.select === 0) bitmap.paintOpacity = 255, bitmap.fontSize = fontSize.big, x = tx.select;
        else bitmap.paintOpacity = 155, bitmap.fontSize = fontSize.small, x = tx.normal;
        bitmap.fillRect(bitmap.width - 5, 5, 1, height, this.normalColor());
        bitmap.drawText(String(this._dialogsTable.u1.length), -x, ty, bitmap.width, 2, 'right'), ty += 25;
        /**
         * Tabela de dialogs 2
         */
        if (this._dialogsTable.select === 1) bitmap.paintOpacity = 255, bitmap.fontSize = fontSize.big, x = tx.select;
        else bitmap.paintOpacity = 155, bitmap.fontSize = fontSize.small, x = tx.normal;
        bitmap.fillRect(bitmap.width - 5, y, 1, height, this.normalColor()), y += 25;
        bitmap.drawText(String(this._dialogsTable.u2.length), -x, ty, bitmap.width, 2, 'right'), ty += 26;
        /**
         * Tabela de dialogs 3
         */
        if (this._dialogsTable.select === 2) bitmap.paintOpacity = 255, bitmap.fontSize = fontSize.big, x = tx.select;
        else bitmap.paintOpacity = 155, bitmap.fontSize = fontSize.small, x = tx.normal;
        bitmap.fillRect(bitmap.width - 5, y, 1, height, this.normalColor()), y += 25;
        bitmap.drawText(String(this._dialogsTable.u3.length), -x, ty, bitmap.width, 2, 'right'), ty += 26;
        /**
         * Tabela de dialogs 4
         */
        if (this._dialogsTable.select === 3) bitmap.paintOpacity = 255, bitmap.fontSize = fontSize.big, x = tx.select;
        else bitmap.paintOpacity = 155, bitmap.fontSize = fontSize.small, x = tx.normal;
        bitmap.fillRect(bitmap.width - 5, y, 1, height, this.normalColor()), y += 25;
        bitmap.drawText(String(this._dialogsTable.u4.length), -x, ty, bitmap.width, 2, 'right'), ty += 26;
        /**
         * Tabela de dialogs 5
         */
        if (this._dialogsTable.select === 4) bitmap.paintOpacity = 255, bitmap.fontSize = fontSize.big, x = tx.select;
        else bitmap.paintOpacity = 155, bitmap.fontSize = fontSize.small, x = tx.normal;
        bitmap.fillRect(bitmap.width - 5, y, 1, height, this.normalColor()), y += 25;
        bitmap.drawText(String(this._dialogsTable.u5.length), -x, ty, bitmap.width, 2, 'right'), ty += 26;
    };

    Window_Dialog.prototype.update = function () {
        Window_Base.prototype.update.call(this);
        this.processWheel();
        this.processDisabledCommandDialog();
    };

    Window_Dialog.prototype.isOpenAndActive = function () {
        return this.isOpen() && this.active;
    };

    Window_Dialog.prototype.processWheel = function () {
        if (this.isOpenAndActive()) {
            var threshold = 20;
            if (TouchInput.wheelY >= threshold) {
                this.scrollDown();
            }
            if (TouchInput.wheelY <= -threshold) {
                this.scrollUp();
            }
        }
    };

    Window_Dialog.prototype.scrollDown = function () {
        if (this._dialogsTable.select < 4) {
            let next = this._dialogsTable.select + 1;
            if (this._dialogsTable.get(next).length > 0) {
                this._dialogsTable.select++;
            } else {
                this._dialogsTable.select = 0;
            }
        } else {
            this._dialogsTable.select = 0;
        }
        this.refresh();
    };

    Window_Dialog.prototype.scrollUp = function () {
        if (this._dialogsTable.select > 0) {
            let next = this._dialogsTable.select - 1;
            if (this._dialogsTable.get(next).length > 0) {
                this._dialogsTable.select--;
            }
        } else {
            let next = 4;
            while (next > 0) {
                if (this._dialogsTable.get(next).length > 0) {
                    this._dialogsTable.select = next, next = 0;
                }
                next--;
            }
        }
        this.refresh();
    };

    Window_Dialog.prototype.processDisabledCommandDialog = function () {
        if (SceneManager._scene.textsAmountMax() || this._speakDisabled) {
            if (this._windowCommandDialog.active) {
                SceneManager._scene.commandSystemShopProcessGoback();
                SceneManager._scene.commandSystemShopProcessCancel();
            }
        }
    };

    /**
     * Window_commandDialog
     */
    function Window_commandDialog() {
        this.initialize.apply(this, arguments);
    }

    Window_commandDialog.prototype = Object.create(Window_Command.prototype);
    Window_commandDialog.prototype.constructor = Window_commandDialog;

    Window_commandDialog.prototype.initialize = function () {
        Window_Command.prototype.initialize.call(this, 20, 311);
        this.deactivate();
        this.updateCursor();
    };

    Window_commandDialog.prototype.loadWindowskin = function () {
        this.windowskin = ImageManager.loadSystem('Window2');
    };

    Window_commandDialog.prototype.windowWidth = function () {
        return 291;
    };

    Window_commandDialog.prototype.numVisibleRows = function () {
        return 6;
    };

    Window_commandDialog.prototype.standardFontSize = function () {
        return 18;
    };

    Window_commandDialog.prototype.makeCommandList = function () {
        this.addMainCommands();
    };

    Window_commandDialog.prototype.isCursorVisible = function () {
        if (!this.active) return false;
        var row = this.row();
        return row >= this.topRow() && row <= this.bottomRow();
    };

    Window_commandDialog.prototype.addDialog = function (...dialogs) {
        dialogs.map(dialog => {
            if (this._dialogs.filter(_dialog => {
                return _dialog[0] === dialog[0];
            }, this).length <= 0) {
                this._dialogs.push(dialog);
            }
        }, this);
    };

    Window_commandDialog.prototype.clearDialogs = function () {
        this._dialogs = [];
        this._activateDialogs = [];
        this._deactivateDialogs = [];
        this._lastActivateDialog = null;
        this.makeSkills();
    };

    Window_commandDialog.prototype.makeSkills = function () {
        let actor = $gameActors.actor(1);
        if (actor.isLearnedSkill(3)) {
            if (actor.skill(3).level === 1)
                this.addDialog(
                    // INDEX 0
                    [getTextLanguage([
                        JSON.stringify(
                            {
                                Language: "pt_br",
                                Value: "Olá"
                            }),
                        JSON.stringify(
                            {
                                Language: "en_us",
                                Value: "Hello"
                            })
                    ]), 1, []],
                    // INDEX 1
                    [getTextLanguage([
                        JSON.stringify(
                            {
                                Language: "pt_br",
                                Value: "Tudo bem?"
                            }),
                        JSON.stringify(
                            {
                                Language: "en_us",
                                Value: "You all right?"
                            })
                    ]), 1, [0]],
                    // INDEX 2
                    [getTextLanguage([
                        JSON.stringify(
                            {
                                Language: "pt_br",
                                Value: "Quero comprar"
                            }),
                        JSON.stringify(
                            {
                                Language: "en_us",
                                Value: "I want to buy"
                            })
                    ]), 1, [0, 1]]
                );
        }
        if (actor.isLearnedSkill(4)) {
        }
    };

    Window_commandDialog.prototype.makeDialogs = function () {
        if (!this._dialogs) this.clearDialogs();
        return this._dialogs;
    };

    Window_commandDialog.prototype.commandIsDeactivate = function (index) {
        return this._deactivateDialogs.filter(_index => {
            return _index === index;
        }, this).length > 0 ||
            this._activateDialogs.filter(_index => {
                if (this._lastActivateDialog === index)
                    return false;
                return _index === index;
            }, this).length > 0;
    };

    Window_commandDialog.prototype.addMainCommands = function () {
        this.makeDialogs().map((word, index) => {
            this.addCommand(word, word[0], !this.commandIsDeactivate(index));
        }, this);
    };

    Window_commandDialog.prototype.addCommand = function (data, name, enabled, ext) {
        if (data === undefined) {
            data = {};
        }
        if (enabled === undefined) {
            enabled = true;
        }
        if (ext === undefined) {
            ext = null;
        }
        this._list.push({ data: data, name: name, symbol: 'item', enabled: enabled, ext: ext });
    };

    Window_commandDialog.prototype.drawItem = function (index) {
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        if (this._activateDialogs.filter(_index => {
            return _index === index;
        }).length > 0) {
            this.changeTextColor(this.systemColor());
            this.changePaintOpacity(this.isCommandEnabled(index));
        } else this.resetTextColor(), this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
    };

    Window_commandDialog.prototype.currentWordData = function (index) {
        if (index != undefined) return index >= 0 ? this._list[index].data : null;
        return this.index() >= 0 ? this._list[this.index()].data : null;
    };


    Window_commandDialog.prototype.containDialogActivate = function (index) {
        let exists = false;
        this._activateDialogs.map(_index => {
            if (_index === index) return exists = true;
        }, this);
        return exists;
    };

    Window_commandDialog.prototype.containDialogDeactivate = function (index) {
        let exists = false;
        this._deactivateDialogs.map(_index => {
            if (_index === index) return exists = true;
        }, this);
        return exists;
    };

    Window_commandDialog.prototype.processOk = function () {
        Window_Command.prototype.processOk.call(this);
        if (!this.isCommandEnabled(this.index())) return;
        if (this.containDialogActivate(this.index())) {
            /**
             * ATIVA OS DIALOGOS
             */
            this._dialogs.map((dialog, index) => {
                if (this.currentWordData()[1] != dialog[1])
                    if (this.containDialogDeactivate(index))
                        this._deactivateDialogs.splice(this._deactivateDialogs.indexOf(index), 1);
                this.currentWordData()[2].map(_index => {
                    if (!this.containDialogActivate(_index) && this.containDialogDeactivate(_index)) {
                        this._deactivateDialogs.splice(this._deactivateDialogs.indexOf(_index), 1);
                    }
                }, this);
            }, this);
            this._activateDialogs.splice(this._activateDialogs.indexOf(this.index()), 1);
            this._lastActivateDialog = this._activateDialogs[this._activateDialogs.length - 1];
            /**
             * DESATIVA OS DIALOGOS
             */
            this._activateDialogs.map(index => {
                this._dialogs.map((dialog, _index) => {
                    if (this.currentWordData(index)[1] != dialog[1])
                        if (!this.containDialogDeactivate(_index) && !this.containDialogActivate(_index))
                            this._deactivateDialogs.push(_index);
                    this.currentWordData(index)[2].map(__index => {
                        if (__index === _index && !this.containDialogDeactivate(_index) && !this.containDialogActivate(_index))
                            this._deactivateDialogs.push(_index);
                    }, this);
                }, this);
            }, this)
            SceneManager._scene._windowDialog.removeText(this.currentWordData()[0]);
            return this.refresh();
        } else this._activateDialogs.push(this.index()), this._lastActivateDialog = this.index();
        /**
         * DESATIVA OS DIALOGOS
         */
        this._dialogs.map((dialog, index) => {
            if (this.currentWordData()[1] != dialog[1])
                if (!this.containDialogDeactivate(index) && !this.containDialogActivate(index))
                    this._deactivateDialogs.push(index);
            this.currentWordData()[2].map(_index => {
                if (_index === index && !this.containDialogDeactivate(index) && !this.containDialogActivate(index))
                    this._deactivateDialogs.push(index);
            }, this);
        }, this);
        SceneManager._scene._windowDialog.addText(this.currentWordData()[0]);
        this.refresh();
    };

    /**
     * Window_itemsShop
     */
    function Window_itemsShop() {
        this.initialize.apply(this, arguments);
    }

    Window_itemsShop.prototype = Object.create(Window_Base.prototype);
    Window_itemsShop.prototype.constructor = Window_itemsShop;

    Window_itemsShop.prototype.initialize = function (items) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Base.prototype.initialize.call(this, 315, 185, width, height);
        this.items = items;
        this.listItem = 0;
        this.createWindowDecription();
        this.refresh();
    };

    Window_itemsShop.prototype.loadWindowskin = function () {
        this.windowskin = ImageManager.loadSystem('Window2');
    };

    Window_itemsShop.prototype.windowWidth = function () {
        return 955;
    };

    Window_itemsShop.prototype.windowHeight = function () {
        return 520;
    };

    Window_itemsShop.prototype.standardFontSize = function () {
        return 18;
    };

    Window_itemsShop.prototype.listItemSetId = function (id) {
        return this.listItem = id;
    };

    Window_itemsShop.prototype.nextListItem = function () {
        this.listItem = this.listItem + 1 >= Object.keys(this.items).length ?
            this.listItem : this.listItem + 1;
    };

    Window_itemsShop.prototype.backListItem = function () {
        this.listItem = this.listItem - 1 < 0 ? 0 : this.listItem - 1;
    };

    Window_itemsShop.prototype.listItemId = function () {
        return Object.keys(this.items)[this.listItem];
    };

    Window_itemsShop.prototype.isLastItem = function () {
        return this.listItem + 1 == Object.keys(this.items).length;
    };

    Window_itemsShop.prototype.enabledBackItem = function () {
        return this.listItem > 0;
    };

    Window_itemsShop.prototype.createWindowDecription = function () {
        this._windowDesc = new Window_Base(15, 140, this.windowWidth() - (15 * 2), 220);
        this._windowDesc.backOpacity = 0;
        this._windowDesc.windowskin = ImageManager.loadSystem('Window2');
        this.addChild(this._windowDesc);
    };

    Window_itemsShop.prototype.drawDescItem = function (desc) {
        this._windowDesc.contents.clear();
        this._windowDesc.contents.fontSize = 18;
        this._windowDesc.contents.fontFace = "GameFont2";
        var x = this._windowDesc.textPadding() + 5,
            width = this._windowDesc.contentsWidth(),
            height = this._windowDesc.contentsHeight();
        this._windowDesc.contents.paintOpacity = this.standardBackOpacity();
        this._windowDesc.contents.fillRect(0, 0, width, height, this.gaugeBackColor());
        this._windowDesc.contents.paintOpacity = 255;
        this._windowDesc.drawTextEx = function (text, x, y) {
            if (text) {
                var textState = { index: 0, x: x, y: y, left: x };
                textState.text = this.convertEscapeCharacters(text);
                textState.height = this.calcTextHeight(textState, false);
                while (textState.index < textState.text.length) {
                    this.processCharacter(textState);
                }
                return textState.x - x;
            } else {
                return 0;
            }
        };
        this._windowDesc.drawTextEx(JSON.parse(desc), x, 5);
    };

    Window_itemsShop.prototype.refresh = function () {
        var item = this.items[this.listItemId()];
        var y = 22;
        var sell_price = item.sell(1);
        var sell_buy = item.buy(Math.floor(sell_price / 4), Math.floor(sell_price / 6), 1);
        var amount = item.amount;
        var rarity = ((rarity) => {
            switch (rarity) {
                case 'normal':
                    return getTextLanguage([
                        JSON.stringify(
                            {
                                Language: "pt_br",
                                Value: 'Comum'
                            }),
                        JSON.stringify(
                            {
                                Language: "en_us",
                                Value: 'Common'
                            })
                    ]);
                case 'medium':
                    return getTextLanguage([
                        JSON.stringify(
                            {
                                Language: "pt_br",
                                Value: 'Procurado'
                            }),
                        JSON.stringify(
                            {
                                Language: "en_us",
                                Value: 'Wanted'
                            })
                    ]);
                case 'high':
                    return getTextLanguage([
                        JSON.stringify(
                            {
                                Language: "pt_br",
                                Value: 'Relíquia'
                            }),
                        JSON.stringify(
                            {
                                Language: "en_us",
                                Value: 'Relic'
                            })
                    ]);
                case 'very high':
                    return getTextLanguage([
                        JSON.stringify(
                            {
                                Language: "pt_br",
                                Value: 'Para colecionadores'
                            }),
                        JSON.stringify(
                            {
                                Language: "en_us",
                                Value: 'For collectors'
                            })
                    ]);
                case 'rare':
                    return getTextLanguage([
                        JSON.stringify(
                            {
                                Language: "pt_br",
                                Value: 'Item Único'
                            }),
                        JSON.stringify(
                            {
                                Language: "en_us",
                                Value: 'Single Item'
                            })
                    ]);
                case 'very rare':
                    return getTextLanguage([
                        JSON.stringify(
                            {
                                Language: "pt_br",
                                Value: 'Único no mundo'
                            }),
                        JSON.stringify(
                            {
                                Language: "en_us",
                                Value: 'Unique in the world'
                            })
                    ]);
                default:
                    return getTextLanguage([
                        JSON.stringify(
                            {
                                Language: "pt_br",
                                Value: 'Comum'
                            }),
                        JSON.stringify(
                            {
                                Language: "en_us",
                                Value: 'Common'
                            })
                    ]);
            }
        })(item.rarity);
        var usage = getTextLanguage(item.usage);
        this.contents.clear();
        this.contents.paintOpacity = this.standardBackOpacity();
        this.contents.fillRect(0, 0, 120, 120, this.gaugeBackColor());
        this.contents.fillRect(124, y, 200, 36, this.gaugeBackColor()), y += 39;
        this.contents.fillRect(124, y, 200, 36, this.gaugeBackColor()), y = 22;
        this.contents.fillRect(327, y, 200, 36, this.gaugeBackColor()), y += 39;
        this.contents.fillRect(327, y, 200, 36, this.gaugeBackColor()), y = 22;
        this.contents.fillRect(530, y, 390, 36, this.gaugeBackColor()), y += 39;
        this.contents.fillRect(530, y, 390, 36, this.gaugeBackColor()), y += 39;
        this.contents.paintOpacity = 255;
        this.drawIcon(item.icon, 6, 7);
        this.contents.fontFace = "GameFont2", y = 30;
        this.drawTextEx(getTextLanguage(item.name), 130, y), y += 37;
        this.drawDescItem(getTextLanguage(item.desc));
        this.drawTextEx(getTextLanguage([
            JSON.stringify(
                {
                    Language: "pt_br",
                    Value: `Compra: \\c[29]${sell_price}($)`
                }),
            JSON.stringify(
                {
                    Language: "en_us",
                    Value: `Purchase: \\c[29]${sell_price}($)`
                })
        ]), 130, y), y = 30;
        this.drawTextEx(getTextLanguage([
            JSON.stringify(
                {
                    Language: "pt_br",
                    Value: `Venda: \\c[29]${sell_buy}($)`
                }),
            JSON.stringify(
                {
                    Language: "en_us",
                    Value: `Sale: \\c[29]${sell_buy}($)`
                })
        ]), 335, y), y += 37;
        this.drawTextEx(getTextLanguage([
            JSON.stringify(
                {
                    Language: "pt_br",
                    Value: `Montante: \\c[8]${amount}`
                }),
            JSON.stringify(
                {
                    Language: "en_us",
                    Value: `Amount: \\c[8]${amount}`
                })
        ]), 335, y), y = 30;
        this.drawTextEx(getTextLanguage([
            JSON.stringify(
                {
                    Language: "pt_br",
                    Value: `Raridade: \\c[8]${rarity}`
                }),
            JSON.stringify(
                {
                    Language: "en_us",
                    Value: `Rarity: \\c[8]${rarity}`
                })
        ]), 537, y), y += 37;
        this.drawTextEx(getTextLanguage([
            JSON.stringify(
                {
                    Language: "pt_br",
                    Value: `Uso: \\c[8]${usage}`
                }),
            JSON.stringify(
                {
                    Language: "en_us",
                    Value: `Usage: \\c[8]${usage}`
                })
        ]), 537, y);
    };

    Window_itemsShop.prototype.drawIcon = function (iconIndex, x, y) {
        var bitmap = ImageManager.loadSystem('IconSet');
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, 108, 108);
    };

    /**
     * Window_bonusShop
     */
    function Window_bonusShop() {
        this.initialize.apply(this, arguments);
    }

    Window_bonusShop.prototype = Object.create(Window_Base.prototype);
    Window_bonusShop.prototype.constructor = Window_bonusShop;

    Window_bonusShop.prototype.initialize = function () {
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Base.prototype.initialize.call(this, 330, 324 + 220, width, height);
        this._bonus = {
            buy: 0,
            sell: 0
        }
        this.refresh();
    };

    Window_bonusShop.prototype.windowWidth = function () {
        return this.fittingHeight(24) + 25;
    };

    Window_bonusShop.prototype.windowHeight = function () {
        return this.fittingHeight(2) + 36;
    };

    Window_bonusShop.prototype.refresh = function () {
        var x = this.textPadding();
        var y = 5;
        var gaugeMax = 540;
        var gaugeBonusBuy = parseFloat(this._bonus.buy.toFixed(2));
        var gaugeValueBuy = Math.floor(gaugeBonusBuy * gaugeMax / 100);
        var gaugeBonusSell = parseFloat(this._bonus.sell.toFixed(2));
        var gaugeValueSell = Math.floor(gaugeBonusSell * gaugeMax / 100);
        this.contents.clear();
        /**
         * BONUS DE COMPRA
         */
        this.contents.paintOpacity = this.standardBackOpacity();
        this.contents.fillRect(40, y, 305, 44, this.gaugeBackColor());
        this.contents.fillRect(350, y, gaugeMax, 44, this.gaugeBackColor());
        this.contents.gradientFillRect(350, y, gaugeValueBuy, 44, this.textColor(31), this.textColor(30));
        this.contents.paintOpacity = 255;
        this.drawIcon(314, x, y);
        this.contents.fontFace = "GameFont2", y = 10;
        this.drawTextEx(getTextLanguage([
            JSON.stringify(
                {
                    Language: "pt_br",
                    Value: "BÔNUS DE COMPRA"
                }),
            JSON.stringify(
                {
                    Language: "en_us",
                    Value: "PURCHASE BONUS"
                })
        ]), 58, y);
        this.drawTextEx(`${gaugeBonusBuy}% `, 358, y - 2);
        /**
         * BONUS DE VENDA
         */
        this.contents.paintOpacity = this.standardBackOpacity(), y = 60;
        this.contents.fillRect(40, y, 305, 44, this.gaugeBackColor());
        this.contents.fillRect(350, y, gaugeMax, 44, this.gaugeBackColor());
        this.contents.gradientFillRect(350, y, gaugeValueSell, 44, this.textColor(31), this.textColor(30));
        this.contents.paintOpacity = 255;
        this.drawIcon(313, x, y);
        this.contents.fontFace = "GameFont2", y = 65;
        this.drawTextEx(getTextLanguage([
            JSON.stringify(
                {
                    Language: "pt_br",
                    Value: "BÔNUS DE VENDA"
                }),
            JSON.stringify(
                {
                    Language: "en_us",
                    Value: "BONUS OF SALE"
                })
        ]), 58, y);
        this.drawTextEx(`${gaugeBonusSell}% `, 358, y - 2);
    };

    Window_bonusShop.prototype.drawIcon = function (iconIndex, x, y) {
        var bitmap = ImageManager.loadSystem('IconSet');
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, 44, 44);
    };

    Window_bonusShop.prototype.setBonusBuy = function (bonus) {
        if (typeof bonus != 'number') bonus = this._bonus.buy;
        if (bonus < 0) bonus = 0;
        if (bonus > 100) bonus = 100;
        this._bonus.buy = bonus;
        this.refresh();
    };

    Window_bonusShop.prototype.addBonusBuy = function (bonus) {
        if (typeof bonus != 'number') bonus = 0;
        if (bonus < 0) bonus = 0;
        if (bonus > 100) bonus = 100;
        this._bonus.buy += parseFloat(bonus.toFixed(2));
        if (this._bonus.buy > 100) this._bonus.buy = 100;
        this.refresh();
    };

    Window_bonusShop.prototype.removeBonusBuy = function (bonus) {
        if (typeof bonus != 'number') bonus = 0;
        if (bonus < 0) bonus = 0;
        if (bonus > 100) bonus = 100;
        this._bonus.buy -= parseFloat(bonus.toFixed(2));
        if (this._bonus.buy < 0) this._bonus.buy = 0;
        this.refresh();
    };

    Window_bonusShop.prototype.setBonusSell = function (bonus) {
        if (typeof bonus != 'number') bonus = this._bonus.sell;
        if (bonus < 0) bonus = 0;
        if (bonus > 100) bonus = 100;
        this._bonus.sell = bonus;
        this.refresh();
    };

    Window_bonusShop.prototype.addBonusSell = function (bonus) {
        if (typeof bonus != 'number') bonus = 0;
        if (bonus < 0) bonus = 0;
        if (bonus > 100) bonus = 100;
        this._bonus.sell += parseFloat(bonus.toFixed(2));
        if (this._bonus.sell > 100) this._bonus.sell = 100;
        this.refresh();
    };

    Window_bonusShop.prototype.removeBonusSell = function (bonus) {
        if (typeof bonus != 'number') bonus = 0;
        if (bonus < 0) bonus = 0;
        if (bonus > 100) bonus = 100;
        this._bonus.sell -= parseFloat(bonus.toFixed(2));
        if (this._bonus.sell < 0) this._bonus.sell = 0;
        this.refresh();
    };

})();
/*~struct~Shops:
 * @param Shop-dataDialog
 * @desc O banco de dados do dialogo do vendedor
 * @type struct<dataDialog>
 * @default []
 *
 * @param Shop-Name
 * @desc Nome da loja
 * @type struct<Language>[]
 * @default []
 *
 * @param Shop-Level
 * @desc Level da loja
 * @type select
 * @default very low
 * @option Muito Baixo
 * @value very low
 * @option Meio Baixo
 * @value medium low
 * @option Baixo
 * @value low
 * @option Muito Médio
 * @value very medium
 * @option Médio Médio
 * @value medium medium
 * @option Médio
 * @value medium
 * @option Baixo Alto
 * @value low high
 * @option Médio Alto
 * @value medium high
 * @option Alto
 * @value high
 *
 * @param Shop-ID
 * @desc ID da loja
 * @type string
 * @default _default
 *
 * @param Shop-Seller
 * @desc Vender na loja?
 * @type boolean
 * @default true
 * @on Sim
 * @off Não
 *
 * @param Shop-Buy
 * @desc Vender na loja?
 * @type boolean
 * @default true
 * @on Sim
 * @off Não
 *
 * @param Map-ID
 * @desc ID do mapa onde está a loja
 * @type number
 * @min 1
 * @default 1
 *
 * @param Event-ID
 * @desc ID do evento da loja
 * @type number
 * @min 1
 * @max 999
 * @default 1
 *
 * @param Items
 * @desc Todos os itens da loja
 * @type struct<Items>[]
 * @default []
 */
/*~struct~Items:
 * @param Item-Id
 * @desc Nome do item
 * @type string
 * @default _default
 *
 * @param Item-Name
 * @desc Nome do item
 * @type struct<Language>[]
 * @default []
 *
 * @param Item-Description
 * @desc Descrição do item
 * @type struct<LanguageNote>[]
 * @default []
 *
 * @param Item-Icon-Bitmap
 * @desc Bitmap para o icone do item
 * @type file
 * @require 1
 * @dir img/system/
 * @default IconSet
 *
 * @param Item-Icon
 * @desc Icone do item
 * @type number
 * @min 1
 * @max 2000
 * @default 1
 *
 * @param Item-Usage
 * @desc Tipo de uso do item
 * @type struct<Language>[]
 * @default []
 *
 * @param Item-Price
 * @desc Preço do item
 * @type number
 * @min 1
 * @max 1000000
 * @default 10
 *
 * @param Item-Lucre
 * @desc Lucro sobre o preço do item
 * @type number
 * @min 1
 * @max 1000000
 * @default 5
 *
 * @param Item-Rarity
 * @desc Raridade do item
 * @type select
 * @default normal
 * @option Normal
 * @value normal
 * @option Médio
 * @value medium
 * @option Alto
 * @value high
 * @option Muito Alto
 * @value very high
 * @option Raro
 * @value rare
 * @option Muito Raro
 * @value very rare
 *
 * @param Item-Amount
 * @desc Quantidade do item
 * @type number
 * @min 1
 * @max 1000
 * @default 1
 *
 * @param Item-Sell-Formula
 * @desc Formula para a venda do item
 * %1(Preço), %2(Lucro), %3(Quantidade)
 * @type note
 * @default "(%1 + %2) * %3;"
 *
 * @param Item-Buy-Formula
 * @desc Formula para a compra do item
 * %1(Preço), %2(Lucro), %3(Quantidade)
 * @type note
 * @default "(%1 + %2) * %3;"
 *
 * @param Item-Sell
 * @desc Vender esse item?
 * @type boolean
 * @on Sim
 * @off Não
 * @default true
 *
 * @param Item-Buy
 * @desc Comprar esse item?
 * @type boolean
 * @on Sim
 * @off Não
 * @default true
 * 
 * @param Item-Fabrication
 * @desc Fabricação desse item
 * @type struct<ItemFabrication>
 * 
 */
/*~struct~Language:
 * @param Value
 * @desc Valor do texto
 * @type string
 * @default ???
 *
 * @param Language
 * @desc O idioma do texto
 * @type string
 * @default pt_br
 */
/*~struct~LanguageNote:
 * @param Value
 * @desc Valor do texto
 * @type note
 * @default "???"
 *
 * @param Language
 * @desc O idioma do texto
 * @type string
 * @default pt_br
 */
 /*~struct~dataDialog:
 * @param Initial Message
 * @desc Mensagem inicial do vendedor
 * @type struct<Language>[]
 * @default []
 *
 * @param ----------------------
 * @default -------------------------------
 *
 * @param Answer Default
 * @desc Resposta padrão a ser usada quando a IA não achar uma adequada.
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer Same phrase
 * @desc Resposta usada quando o jogador fala a mesma coisa.
 * @type struct<Language>[]
 * @default []
 *
 * @param Dialog Efficiency
 * @desc Efficiencia dos dialogos nos bonus
 * @type struct<DialogEfficiency>[]
 * @default []
 *
 * @param ----------------------
 * @default -------------------------------
 *
 * @param Answer 1
 * @desc Resposta a "olá"
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 1 Withdrawal of Bonus for Reclamation, Exceeded and Cancel
 * @desc Retirada de bonus por reclamação, reclamação excedida e cancelamento
 * @type struct<DialogWithdrawalBonusREC>
 * @default {"Reclamation Buy":"0.06","Reclamation Exceeded Buy":"0.08","Dialog Cancel Buy":"0.10","Reclamation Sell":"0.06","Reclamation Exceeded Sell":"0.08","Dialog Cancel Sell":"0.10"}
 *
 * @param Answer 1 Reclamation
 * @desc Reclamação ao exceder o nivel de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 1 Reclamation Exceeded
 * @desc Reclamação ao exceder o nivel maximo de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 1 Dialog Cancel
 * @desc Resposta para cancelar o dialogo
 * @type struct<Language>[]
 * @default []
 *
 * @param ----------------------
 * @default -------------------------------
 *
 * @param Answer 2
 * @desc Resposta a "tudo bem?"
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 2 Withdrawal of Bonus for Reclamation, Exceeded and Cancel
 * @desc Retirada de bonus por reclamação, reclamação excedida e cancelamento
 * @type struct<DialogWithdrawalBonusREC>
 * @default {"Reclamation Buy":"0.06","Reclamation Exceeded Buy":"0.08","Dialog Cancel Buy":"0.10","Reclamation Sell":"0.06","Reclamation Exceeded Sell":"0.08","Dialog Cancel Sell":"0.10"}
 *
 * @param Answer 2 Reclamation
 * @desc Reclamação ao exceder o nivel de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 2 Reclamation Exceeded
 * @desc Reclamação ao exceder o nivel maximo de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 2 Dialog Cancel
 * @desc Resposta para cancelar o dialogo
 * @type struct<Language>[]
 * @default []
 *
 * @param ----------------------
 * @default -------------------------------
 *
 * @param Answer 3
 * @desc Resposta a "olá tudo bem?"
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 3 Withdrawal of Bonus for Reclamation, Exceeded and Cancel
 * @desc Retirada de bonus por reclamação, reclamação excedida e cancelamento
 * @type struct<DialogWithdrawalBonusREC>
 * @default {"Reclamation Buy":"0.06","Reclamation Exceeded Buy":"0.08","Dialog Cancel Buy":"0.10","Reclamation Sell":"0.06","Reclamation Exceeded Sell":"0.08","Dialog Cancel Sell":"0.10","Same Phrase Buy":"0.06","Same Phrase Sell":"0.06"}
 *
 * @param Answer 3 Reclamation
 * @desc Reclamação ao exceder o nivel de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 3 Reclamation Exceeded
 * @desc Reclamação ao exceder o nivel maximo de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 3 Dialog Cancel
 * @desc Resposta para cancelar o dialogo
 * @type struct<Language>[]
 * @default []
 *
 * @param ----------------------
 * @default -------------------------------
 *
 * @param Answer 4
 * @desc Resposta a "quero comprar"
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 4 Withdrawal of Bonus for Reclamation, Exceeded and Cancel
 * @desc Retirada de bonus por reclamação, reclamação excedida e cancelamento
 * @type struct<DialogWithdrawalBonusREC>
 * @default {"Reclamation Buy":"0.06","Reclamation Exceeded Buy":"0.08","Dialog Cancel Buy":"0.10","Reclamation Sell":"0.06","Reclamation Exceeded Sell":"0.08","Dialog Cancel Sell":"0.10","Same Phrase Buy":"0.06","Same Phrase Sell":"0.06"}
 *
 * @param Answer 4 Reclamation
 * @desc Reclamação ao exceder o nivel de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 4 Reclamation Exceeded
 * @desc Reclamação ao exceder o nivel maximo de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 4 Dialog Cancel
 * @desc Resposta para cancelar o dialogo
 * @type struct<Language>[]
 * @default []
 *
 * @param ----------------------
 * @default -------------------------------
 *
 * @param Answer 5
 * @desc Resposta a "Olá quero comprar"
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 5 Withdrawal of Bonus for Reclamation, Exceeded and Cancel
 * @desc Retirada de bonus por reclamação, reclamação excedida e cancelamento
 * @type struct<DialogWithdrawalBonusREC>
 * @default {"Reclamation Buy":"0.06","Reclamation Exceeded Buy":"0.08","Dialog Cancel Buy":"0.10","Reclamation Sell":"0.06","Reclamation Exceeded Sell":"0.08","Dialog Cancel Sell":"0.10","Same Phrase Buy":"0.06","Same Phrase Sell":"0.06"}
 *
 * @param Answer 5 Reclamation
 * @desc Reclamação ao exceder o nivel de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 5 Reclamation Exceeded
 * @desc Reclamação ao exceder o nivel maximo de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 5 Dialog Cancel
 * @desc Resposta para cancelar o dialogo
 * @type struct<Language>[]
 * @default []
 *
 * @param ----------------------
 * @default -------------------------------
 *
 * @param Answer 6
 * @desc Resposta a "Olá tudo bem? quero comprar"
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 6 Withdrawal of Bonus for Reclamation, Exceeded and Cancel
 * @desc Retirada de bonus por reclamação, reclamação excedida e cancelamento
 * @type struct<DialogWithdrawalBonusREC>
 * @default {"Reclamation Buy":"0.06","Reclamation Exceeded Buy":"0.08","Dialog Cancel Buy":"0.10","Reclamation Sell":"0.06","Reclamation Exceeded Sell":"0.08","Dialog Cancel Sell":"0.10","Same Phrase Buy":"0.06","Same Phrase Sell":"0.06"}
 *
 * @param Answer 6 Reclamation
 * @desc Reclamação ao exceder o nivel de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 6 Reclamation Exceeded
 * @desc Reclamação ao exceder o nivel maximo de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 6 Dialog Cancel
 * @desc Resposta para cancelar o dialogo
 * @type struct<Language>[]
 * @default []
 *
 * @param ----------------------
 * @default -------------------------------
 *
 * @param Answer 7
 * @desc Resposta a "Tudo bem? quero comprar"
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 7 Withdrawal of Bonus for Reclamation, Exceeded and Cancel
 * @desc Retirada de bonus por reclamação, reclamação excedida e cancelamento
 * @type struct<DialogWithdrawalBonusREC>
 * @default {"Reclamation Buy":"0.06","Reclamation Exceeded Buy":"0.08","Dialog Cancel Buy":"0.10","Reclamation Sell":"0.06","Reclamation Exceeded Sell":"0.08","Dialog Cancel Sell":"0.10","Same Phrase Buy":"0.06","Same Phrase Sell":"0.06"}
 *
 * @param Answer 7 Reclamation
 * @desc Reclamação ao exceder o nivel de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 7 Reclamation Exceeded
 * @desc Reclamação ao exceder o nivel maximo de tolerância
 * @type struct<Language>[]
 * @default []
 *
 * @param Answer 7 Dialog Cancel
 * @desc Resposta para cancelar o dialogo
 * @type struct<Language>[]
 * @default []
 *
 */
/*~struct~DialogEfficiency:
 * @param Word
 * @desc Palavra associada
 * @type string
 * @default Hello
 *
 * @param Bonus Type
 * @desc Tipo de bonus
 * @type select
 * @default qualquer
 * @option Qualquer
 * @value qualquer
 * @option Compra
 * @value buy
 * @option Venda
 * @value sell
 *
 * @param Bonus Buy Type
 * @desc Tipo de bonus de compra se ele é positivo ou negativo
 * @type select
 * @default positive
 * @option Positivo
 * @value positive
 * @option Negativo
 * @value negative
 *
 * @param Bonus Buy
 * @desc Valor do bonus de compra
 * @type number
 * @decimals 2
 * @default 0.04
 *
 * @param Bonus Sell Type
 * @desc Tipo de bonus de venda se ele é positivo ou negativo
 * @type select
 * @default positive
 * @option Positivo
 * @value positive
 * @option Negativo
 * @value negative
 *
 * @param Bonus Sell
 * @desc Valor do bonus de venda
 * @type number
 * @decimals 2
 * @default 0.02
 */
/*~struct~DialogWithdrawalBonusREC:
 * @param Reclamation Buy
 * @desc Valor a ser retirado do bonus de compra quando o vendedor reclamar
 * @type number
 * @decimals 2
 * @default 0.08
 *
 * @param Reclamation Exceeded Buy
 * @desc Valor a ser retirado do bonus de compra quando o vendedor exceder as reclamações
 * @type number
 * @decimals 2
 * @default 0.06
 *
 * @param Dialog Cancel Buy
 * @desc Valor a ser retirado do bonus de compra quando o vendedor cancelar o dialogo
 * @type number
 * @decimals 2
 * @default 0.10
 *
 * @param Reclamation Sell
 * @desc Valor a ser retirado do bonus de venda quando o vendedor reclamar
 * @type number
 * @decimals 2
 * @default 0.06
 *
 * @param Reclamation Exceeded Sell
 * @desc Valor a ser retirado do bonus de venda quando o vendedor exceder as reclamações
 * @type number
 * @decimals 2
 * @default 0.08
 *
 * @param Dialog Cancel Sell
 * @desc Valor a ser retirado do bonus de venda quando o vendedor cancelar o dialogo
 * @type number
 * @decimals 2
 * @default 0.10
 *
 * @param Same Phrase Buy
 * @desc Valor a ser retirado do bonus de compra quando o vendedor estiver cansado de repetir a mesma coisa
 * @type number
 * @decimals 2
 * @default 0.06
 *
 * @param Same Phrase Sell
 * @desc Valor a ser retirado do bonus de venda quando o vendedor estiver cansado de repetir a mesma coisa
 * @type number
 * @decimals 2
 * @default 0.06
 */
 /*~struct~ItemFabrication:
 * @param Days of Work
 * @desc Dias de trabalho
 * @type struct<CalendarDaysMonths>[]
 * @default []
 * 
 * @param Days and Months of vacations
 * @desc Dias e Meses de ferias
 * @type struct<CalendarDaysMonths>[]
 * @default []
 * 
 * @param Map-ID
 * @desc ID do mapa do NPC
 * @type number
 * @min 1
 * @default 1
 * 
 * @param Event-ID
 * @desc ID do evento do NPC
 * @type number
 * @min 1
 * @default 1
 * 
 * @param Event-SelfSwitches_1
 * @desc Primeiro 'Switch Local' a ser ativado enquanto o evento está trabalhando.
 * @type select
 * @default A
 * @option A
 * @option B
 * @option C
 * @option D
 * 
 * @param Event-SelfSwitches_2
 * @desc Segundo 'Switch Local' a ser ativado enquanto o evento está trabalhando.
 * @type select
 * @default A
 * @option A
 * @option B
 * @option C
 * @option D
 * 
 * @param Event-SelfSwitches_3
 * @desc Terceiro 'Switch Local' a ser ativado enquanto o evento está trabalhando.
 * @type select
 * @default A
 * @option A
 * @option B
 * @option C
 * @option D
 * 
 * @param Timer of Fabrication
 * @desc Tempo de fabricação
 * @type number
 * @min 1
 * @default 180
 * 
 */
/*~struct~CalendarDaysMonths:
 * @param Month of Year
 * @desc Mês do ano
 * @type select
 * @default 1
 * @option Mercúrio
 * @value 1
 * @option Vênus
 * @value 2
 * @option Terra
 * @value 3
 * @option Marte
 * @value 4
 * 
 * @param Day of Month
 * @desc Dia do mês
 * @type number
 * @min 1
 * @default 1
 * 
 */