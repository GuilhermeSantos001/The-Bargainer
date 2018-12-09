//==================================================================================================
// GS_gameJolt.js
//==================================================================================================
/*:
 * @plugindesc v1.0.0 - GameJolt API
 *
 * @author GuilhermeSantos
 * 
 */
function Scene_GameJolt() {
    this.initialize.apply(this, arguments);
}
(() => {
    'use strict';
    //=====================================================================================================
    // Global Variables
    //=====================================================================================================
    const api = {
        gameId: '383365',
        privateKey: '34e852058f535125e6834a2fad9e18f2',
        url: 'https://api.gamejolt.com/api/game/v1_2',
        https: {
            base: require('https'),
            get: (url, callback) => {
                api.https.base.get(url, (res) => {
                    res.on('data', (data) => {
                        callback.sucess(JSON.parse(data));
                    });
                }).on('error', (e) => {
                    callback.error(e);
                });
            }
        }
    }

    //=====================================================================================================
    // Functions
    //=====================================================================================================
    /**
     * @function localPath
     * @description Retorna o caminho convertido para a pasta raiz do projeto
     * @param {String} p - Caminho para conversão
     * @returns {String}
     */
    function localPath(p) {
        // Retira uma parte da string
        if (p.substring(0, 1) === '/')
            p = p.substring(1);
        // Importa o modulo PATH do Node
        var path = require('path'),
            // Cria a base para o caminho local
            base = path.dirname(process.mainModule.filename);
        // Retorna a base do caminho associado ao caminho
        return path.join(base, p);
    };

    /**
     * @function get_signature
     * @description Usado para criar uma assinatura com conversão em MD5.
     * @param {String} data - Data usada para ser convertida
     * @returns {String}
     */
    function get_signature(data) {
        let crypto = require('crypto');
        return crypto.createHash('md5').update(data).digest('hex');
    };

    /**
     * @function user_auth
     * @description Usado para verificar os dados do usuario.
     * @param {String} username - Nome do usuario
     * @param {String} user_token - Senha do usuario
     * @param {Function} callback - Função a ser chamada ao final do processo
     */
    function user_auth(username, user_token, callback) {
        let url = `${api.url}/users/auth/?game_id=${api.gameId}&username=${username}&user_token=${user_token}`.replace(/\s{1,}/g, ""),
            signature = get_signature(url + api.privateKey);
        url += `&signature=${signature}`;
        return api.https.get(url, callback);
    };

    /**
     * @function getTextLanguage
     * @description Retorna o valor do texto no idioma padrão
     * @param {String} text - O texto a ser convertido
     */
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

    //=====================================================================================================
    // Scene_GameJolt
    //=====================================================================================================
    Scene_GameJolt.prototype = Object.create(Scene_Base.prototype);
    Scene_GameJolt.prototype.constructor = Scene_GameJolt;

    Scene_GameJolt._isPressAnyKey = null;
    Scene_GameJolt._changeValue = null;
    Scene_GameJolt._username = '';
    Scene_GameJolt._gameToken = '';
    Scene_GameJolt._isLoading = null;
    Scene_GameJolt._isConnected = null;

    Scene_GameJolt.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
    };

    Scene_GameJolt.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createWindowLayer();
        this.createButtons();
    };

    Scene_GameJolt.prototype.createBackground = function () {
        let blackLayer = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        blackLayer.bitmap.fillAll('black');
        blackLayer.opacity = 200;
        this._backgroundSprite.addChild(blackLayer);
        this.addChild(this._backgroundSprite);
    };

    Scene_GameJolt.prototype.createButtons = function () {
        this.createICON();
        this.createButtonsLogin();
        this.createLoading();
    };

    Scene_GameJolt.prototype.createICON = function () {
        this._icon = new Sprite(ImageManager.loadSystem('gamejolt'));
        this._icon.move((Graphics.width - 817) / 2, 45);
        this.addChild(this._icon);
    };

    Scene_GameJolt.prototype.createButtonsLogin = function () {
        let button_1 = new Sprite_Button(),
            button_2 = new Sprite_Button(),
            button_3 = new Sprite_Button(),
            _y = 270;
        /**
         * BUTTON 1
         */
        button_1.bitmap = new Bitmap(480, 52);
        button_1.bitmap.fillAll('#242424');
        button_1.x = (Graphics._width - button_1.width) / 2;
        button_1.y = _y;
        var username;
        if (Scene_GameJolt._isPressAnyKey &&
            typeof $gameVariables.value(15) === 'string' &&
            Scene_GameJolt._changeValue === 'username' ||
            Scene_GameJolt._isPressAnyKey &&
            typeof $gameVariables.value(15) === 'number' &&
            Scene_GameJolt._changeValue === 'username') {
            Scene_GameJolt._username = String($gameVariables.value(15));
            username = Scene_GameJolt._username;
        } else if (Scene_GameJolt._username.length > 0) {
            username = Scene_GameJolt._username;
        } else {
            username = getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: "Nome de usuário"
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: "Username"
                    })
            ]);
        }
        button_1.bitmap.drawText(username, 0, button_1.height / 2, button_1.width, 0, 'center');
        button_1.setClickHandler(() => {
            Scene_GameJolt._isPressAnyKey = null;
            Scene_GameJolt._changeValue = 'username';
            Game_Interpreter.prototype.pluginCommand('InputDialog', ['open']);
            Game_Interpreter.prototype.pluginCommand('InputDialog', ['text', getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: "Nome de usuário"
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: "Username"
                    })
            ])]);
        });
        /**
         * BUTTON 2
         */
        _y = (_y + 52) + 5;
        button_2.bitmap = new Bitmap(480, 52);
        button_2.bitmap.fillAll('#242424');
        button_2.x = (Graphics._width - button_2.width) / 2;
        button_2.y = _y;
        var gameToken;
        if (Scene_GameJolt._isPressAnyKey &&
            typeof $gameVariables.value(15) === 'string' &&
            Scene_GameJolt._changeValue === 'gameToken' ||
            Scene_GameJolt._isPressAnyKey &&
            typeof $gameVariables.value(15) === 'number' &&
            Scene_GameJolt._changeValue === 'gameToken') {
            Scene_GameJolt._gameToken = String($gameVariables.value(15));
            gameToken = Scene_GameJolt._gameToken;
        } else if (Scene_GameJolt._gameToken.length > 0) {
            gameToken = Scene_GameJolt._gameToken;
        } else {
            gameToken = 'Game Token';
        }
        button_2.bitmap.drawText(gameToken, 0, button_2.height / 2, button_2.width, 0, 'center');
        button_2.setClickHandler(() => {
            Scene_GameJolt._isPressAnyKey = null;
            Scene_GameJolt._changeValue = 'gameToken';
            Game_Interpreter.prototype.pluginCommand('InputDialog', ['open']);
            Game_Interpreter.prototype.pluginCommand('InputDialog', ['text', 'Game Token']);
        });
        /**
         * BUTTON 3
         */
        _y = (_y + 52) + 10;
        button_3.bitmap = new Bitmap(480, 52);
        button_3.bitmap.fillAll('#313131');
        button_3.x = (Graphics._width - button_3.width) / 2;
        button_3.y = _y;
        button_3.bitmap.drawText(getTextLanguage([
            JSON.stringify(
                {
                    Language: "pt_br",
                    Value: "Iniciar Sessão"
                }),
            JSON.stringify(
                {
                    Language: "en_us",
                    Value: "Begin Session"
                })
        ]), 0, button_3.height / 2, button_3.width, 0, 'center');
        button_3.setClickHandler(() => {
            Scene_GameJolt._isLoading = true;
            user_auth(Scene_GameJolt._username, Scene_GameJolt._gameToken, {
                sucess: (data) => {
                    Scene_GameJolt._isLoading = null;
                    Scene_GameJolt._isConnected = true;
                    console.log(data);
                },
                error: (e) => {
                    console.error(e);
                }
            });
        });
        this._buttonsLogin = [
            button_1,
            button_2,
            button_3
        ];
        this.addChild(button_1);
        this.addChild(button_2);
        this.addChild(button_3);
    };


    Scene_GameJolt.prototype.createLoading = function () {
        let sprite_1 = new Sprite(new Bitmap(96, 96)),
            sprite_2 = new Sprite(new Bitmap(96, 96)),
            sprite_3 = new Sprite(new Bitmap(96, 96));
        /**
         * Sprite 1
         */
        sprite_1.move((Graphics.width - 96) / 2, (Graphics.height - 96) / 2);
        sprite_1.x -= 32 * 3;
        sprite_1.bitmap.drawCircle(12, 12, 12, '#00ff00');
        sprite_1.opacity = 0;
        /**
         * Sprite 2
         */
        sprite_2.move((Graphics.width - 96) / 2, (Graphics.height - 96) / 2);
        sprite_2.x -= 32 * 2;
        sprite_2.bitmap.drawCircle(12, 12, 12, '#00ff00');
        sprite_2.opacity = 0;
        /**
         * Sprite 3
         */
        sprite_3.move((Graphics.width - 96) / 2, (Graphics.height - 96) / 2);
        sprite_3.x -= 32;
        sprite_3.bitmap.drawCircle(12, 12, 12, '#00ff00');
        sprite_3.opacity = 0;
        this._spritesLoading = [
            sprite_1,
            sprite_2,
            sprite_3
        ];
        this._spritesLoadingContainer = new PIXI.Container();
        this._spritesLoadingContainer.addChild(this._spritesLoading[0]);
        this._spritesLoadingContainer.addChild(this._spritesLoading[1]);
        this._spritesLoadingContainer.addChild(this._spritesLoading[2]);
        this._spritesLoadingContainer.x = 100;
        this._spritesLoadingContainer.y = 30;
        this.addChild(this._spritesLoadingContainer);
    };

    Scene_GameJolt.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack();
        this.startFadeIn(this.fadeSpeed(), false);
    };

    Scene_GameJolt.prototype.update = function () {
        Scene_Base.prototype.update.call(this);
        this.updateICON();
        this.updateButtonsLogin();
        this.updateLoading();
    };

    Scene_GameJolt.prototype.updateICON = function () {
        if (Scene_GameJolt._isLoading || Scene_GameJolt._isConnected) {
            if (this._animationICON) this._animationICON = undefined;
            if (this._icon.opacity > 0) this._icon.opacity -= 8;
            return;
        }
        if (this._animationICON === undefined)
            this._animationICON = {
                return: false,
                frames1: 0,
                frames2: 24
            }
        if (!this._animationICON.return && this._animationICON.frames1 < this._animationICON.frames2) {
            this._animationICON.frames1 += .60;
            if (this._icon.opacity > 30) this._icon.opacity -= 8;
        } else { this._animationICON.return = true; }
        if (this._animationICON.return && this._animationICON.frames1 > 0) {
            this._animationICON.frames1 -= .60;
            if (this._icon.opacity < 255) this._icon.opacity += 8;
        } else { this._animationICON.return = false }
    };

    Scene_GameJolt.prototype.updateButtonsLogin = function () {
        if (Scene_GameJolt._isLoading || Scene_GameJolt._isConnected) {
            if (this._buttonsLogin[0].opacity > 0)
                this._buttonsLogin[0].opacity -= 8;
            if (this._buttonsLogin[1].opacity > 0)
                this._buttonsLogin[1].opacity -= 8;
            if (this._buttonsLogin[2].opacity > 0)
                this._buttonsLogin[2].opacity -= 8;
            return;
        }
    };

    Scene_GameJolt.prototype.updateLoading = function () {
        if (Scene_GameJolt._isLoading) {
            if (!this._animationLoading) this._animationLoading = {
                frame1: true,
                frame2: false,
                frame3: false,
                frames: 10
            }
            if (this._animationLoading.frame1) {
                if (this._animationLoading.frames > 0) {
                    this._animationLoading.frames -= .60;
                    if (this._spritesLoading[0].opacity < 255) this._spritesLoading[0].opacity += 24;
                }
                else {
                    this._animationLoading.frame1 = false;
                    this._animationLoading.frame2 = true;
                    this._animationLoading.frames = 5;
                    this._spritesLoading[0].opacity = 92;
                }
            } else if (this._animationLoading.frame2) {
                if (this._animationLoading.frames > 0) {
                    this._animationLoading.frames -= .60;
                    if (this._spritesLoading[1].opacity < 255) this._spritesLoading[1].opacity += 24;
                }
                else {
                    this._animationLoading.frame2 = false;
                    this._animationLoading.frame3 = true;
                    this._animationLoading.frames = 5;
                    this._spritesLoading[1].opacity = 92;
                }
            } else if (this._animationLoading.frame3) {
                if (this._animationLoading.frames > 0) {
                    this._animationLoading.frames -= .60;
                    if (this._spritesLoading[2].opacity < 255) this._spritesLoading[2].opacity += 24;
                }
                else {
                    this._animationLoading.frame3 = false;
                    this._animationLoading.frame1 = true;
                    this._animationLoading.frames = 5;
                    this._spritesLoading[2].opacity = 92;
                }
            }
        } else {
            if (this._spritesLoading[0].opacity > 0) this._spritesLoading[0].opacity -= 24;
            if (this._spritesLoading[1].opacity > 0) this._spritesLoading[1].opacity -= 24;
            if (this._spritesLoading[2].opacity > 0) this._spritesLoading[2].opacity -= 24;
        }
    };

    //=====================================================================================================
    // Scene_InputDialog
    //=====================================================================================================
    const _scene_inputDialog_okResult = Scene_InputDialog.prototype.okResult;
    Scene_InputDialog.prototype.okResult = function () {
        _scene_inputDialog_okResult.call(this);
        var text = this._textBox.getText() || '';
        if (text.length > 0) Scene_GameJolt._isPressAnyKey = true;
    };

    const _scene_inputDialog_createTextBox = Scene_InputDialog.prototype.createTextBox;
    Scene_InputDialog.prototype.createTextBox = function () {
        _scene_inputDialog_createTextBox.call(this);
        if (Scene_GameJolt._changeValue === 'username')
            this._textBox.setText(Scene_GameJolt._username);
        else if (Scene_GameJolt._changeValue === 'gameToken')
            this._textBox.setText(Scene_GameJolt._gameToken);
    };
})();