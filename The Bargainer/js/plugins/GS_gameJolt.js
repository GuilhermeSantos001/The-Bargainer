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
    const params = PluginManager.parameters('GS_gameJolt');

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

    Scene_GameJolt._changeValue = null;
    Scene_GameJolt._username = '';
    Scene_GameJolt._gameToken = '';
    Scene_GameJolt._gameTokenSecret = true;
    Scene_GameJolt._isLoading = null;
    Scene_GameJolt._isConnected = true;
    Scene_GameJolt._isInputProcess = null;
    Scene_GameJolt._inputProcess = null;
    Scene_GameJolt._isInputChangeValues = null;
    Scene_GameJolt._inputCharacterValue = null;
    Scene_GameJolt._inputValues = {
        default: '???',
        username: '',
        gameToken: ''
    };
    Scene_GameJolt._isErrorWindow = null;

    Scene_GameJolt.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
    };

    Scene_GameJolt.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createWindowLayer();
        this.createButtons();
        this.createInputWindow();
        this.createErrorWindow();
        this.createDashboardWindow();
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

    Scene_GameJolt.prototype.getUsername = function () {
        var username;
        if (Scene_GameJolt._inputCharacterValue && Scene_GameJolt._changeValue === 'username') {
            Scene_GameJolt._username = String(Scene_GameJolt._inputCharacterValue);
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
        return username;
    };

    Scene_GameJolt.prototype.getGameToken = function () {
        var gameToken;
        if (Scene_GameJolt._inputCharacterValue && Scene_GameJolt._changeValue === 'gameToken') {
            Scene_GameJolt._gameToken = String(Scene_GameJolt._inputCharacterValue);
            gameToken = Scene_GameJolt._gameToken;
        } else if (Scene_GameJolt._gameToken.length > 0) {
            gameToken = Scene_GameJolt._gameToken;
        } else {
            gameToken = 'Game Token';
        }
        if (gameToken != 'Game Token' && Scene_GameJolt._gameTokenSecret) {
            gameToken = this.getGameTokenSecret(gameToken);
        }
        return gameToken;
    };

    Scene_GameJolt.prototype.getGameTokenSecret = function (gameToken) {
        let i = 0, l = gameToken.length, str = '';
        for (; i < l; i++) str += '*';
        return str;
    };

    Scene_GameJolt.prototype.createButtonsLogin = function () {
        let button_1 = new Sprite_Button(),
            button_2 = new Sprite_Button(),
            button_3 = new Sprite_Button(),
            button_4 = new Sprite_Button(),
            _y = 270,
            _scene = this;
        /**
         * BUTTON 1
         */
        button_1.bitmap = new Bitmap(480, 52);
        button_1.bitmap.fillAll('#242424');
        button_1.x = (Graphics._width - button_1.width) / 2;
        button_1.y = _y;
        button_1.bitmap.drawText(this.getUsername(), 0, button_1.height / 2, button_1.width, 0, 'center');
        button_1.setClickHandler(() => {
            Scene_GameJolt._changeValue = 'username';
            Scene_GameJolt._isInputProcess = true;
            Scene_GameJolt._inputProcess = 0;
        });
        /**
         * BUTTON 2
         */
        _y = (_y + 52) + 5;
        button_2.bitmap = new Bitmap(480, 52);
        button_2.bitmap.fillAll('#242424');
        button_2.x = (Graphics._width - button_2.width) / 2;
        button_2.y = _y;
        button_2.bitmap.drawText(this.getGameToken(), 0, button_2.height / 2, button_2.width, 0, 'center');
        button_2.setClickHandler(() => {
            Scene_GameJolt._changeValue = 'gameToken';
            Scene_GameJolt._isInputProcess = true;
            Scene_GameJolt._inputProcess = 1;
        });
        /**
         * BUTTON 3
         */
        _y = (_y + 52) + 5;
        button_3.bitmap = new Bitmap(480, 52);
        button_3.bitmap.fillAll('#313131');
        button_3.x = (Graphics._width - button_3.width) / 2;
        button_3.y = _y;
        button_3.opacity = 72;
        button_3.bitmap.drawText(getTextLanguage([
            JSON.stringify(
                {
                    Language: "pt_br",
                    Value: "Mostrar a senha"
                }),
            JSON.stringify(
                {
                    Language: "en_us",
                    Value: "Show Password"
                })
        ]), 0, button_3.height / 2, button_3.width, 0, 'center');
        let _this = this;
        button_3.setClickHandler(() => {
            Scene_GameJolt._gameTokenSecret = Scene_GameJolt._gameTokenSecret ? false : true;
            _this.updateInputChangeValues();
        });
        /**
         * BUTTON 4
         */
        _y = (_y + 52) + 10;
        button_4.bitmap = new Bitmap(480, 52);
        button_4.bitmap.fillAll('#313131');
        button_4.x = (Graphics._width - button_4.width) / 2;
        button_4.y = _y;
        button_4.opacity = 72;
        button_4.bitmap.drawText(getTextLanguage([
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
        ]), 0, button_4.height / 2, button_4.width, 0, 'center');
        button_4.setClickHandler(() => {
            Scene_GameJolt._isLoading = true;
            if (this._errorWindow.opacity > 0) {
                this._errorWindow.calllistener = {
                    frame: 120,
                    callback: callback
                }
                return;
            }
            function callback() {
                let username = Scene_GameJolt._username,
                    gametoken = Scene_GameJolt._gameToken;
                if ($gameTemp.gameJoltAddUser(username, gametoken)) {
                    $gameTemp.gameJoltLoginUser(username, success => {
                        if (!success) {
                            Scene_GameJolt._isLoading = null;
                            Scene_GameJolt._isErrorWindow = { frames: 60 };
                            _scene.setErrorWindow(0);
                        } else {
                            Scene_GameJolt._isLoading = null;
                            Scene_GameJolt._isConnected = true;
                        }
                    });
                }
            }
            return callback();
        });
        this._buttonsLogin = [
            button_1,
            button_2,
            button_3,
            button_4
        ];
        this.addChild(button_1);
        this.addChild(button_2);
        this.addChild(button_3);
        this.addChild(button_4);
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

    Scene_GameJolt.prototype.createInputWindow = function () {
        this._spriteInputTitle = new Sprite(new Bitmap(480, 92));
        this._spriteInputTitle.move((Graphics.width - 480) / 2, 220);
        this._spriteInputText = new Sprite(new Bitmap(480, 92));
        this._spriteInputText.move((Graphics.width - 480) / 2, 615);
        this._inputWindow = new Window_GameJoltInput((Graphics.width - 480) / 2, (Graphics.height - 155) / 2, {
            add: (character) => {
                if (Scene_GameJolt._inputProcess === 0) {
                    Scene_GameJolt._inputValues.username += character;
                    return true;
                } else if (Scene_GameJolt._inputProcess === 1) {
                    Scene_GameJolt._inputValues.gameToken += character;
                    return true;
                }
            },
            back: () => {
                if (Scene_GameJolt._inputProcess === 0) {
                    let characters = Scene_GameJolt._inputValues.username.slice(0, -1);
                    Scene_GameJolt._inputValues.username = characters;
                } else if (Scene_GameJolt._inputProcess === 1) {
                    let characters = Scene_GameJolt._inputValues.gameToken.slice(0, -1);
                    Scene_GameJolt._inputValues.gameToken = characters;
                }
            },
            name: () => {
                if (Scene_GameJolt._inputProcess === 0) {
                    return Scene_GameJolt._inputValues.username;
                } else if (Scene_GameJolt._inputProcess === 1) {
                    return Scene_GameJolt._inputValues.gameToken;
                }
            },
            restoreDefault: () => {
                if (Scene_GameJolt._inputProcess === 0) {
                    Scene_GameJolt._username = '';
                    return true;
                } else if (Scene_GameJolt._inputProcess === 1) {
                    Scene_GameJolt._gameToken = '';
                    return true;
                }
            }
        });
        this._inputWindow.setHandler('ok', this.onInputOk.bind(this));
        this._spriteInputTitle.opacity = 0;
        this._spriteInputText.opacity = 0;
        this._inputWindow.opacity = 0;
        this._inputWindow.backOpacity = 0;
        this._inputWindow.contentsOpacity = 0;
        this._inputWindow.active = false;
        this.addChild(this._inputWindow);
        this.addChild(this._spriteInputTitle);
        this.addChild(this._spriteInputText);
    };

    Scene_GameJolt.prototype.onInputOk = function () {
        if (Scene_GameJolt._inputProcess === 0) {
            Scene_GameJolt._inputCharacterValue = Scene_GameJolt._inputValues.username;
            Scene_GameJolt._isInputProcess = null;
            Scene_GameJolt._inputProcess = null;
            Scene_GameJolt._isInputChangeValues = true;
        } else if (Scene_GameJolt._inputProcess === 1) {
            Scene_GameJolt._inputCharacterValue = Scene_GameJolt._inputValues.gameToken;
            Scene_GameJolt._isInputProcess = null;
            Scene_GameJolt._inputProcess = null;
            Scene_GameJolt._isInputChangeValues = true;
        }
    };

    Scene_GameJolt.prototype.createErrorWindow = function () {
        this._errorWindow = new Window_Help();
        this._errorWindow.move((Graphics.width - 480) / 2, (Graphics.height - 210), 480, 115);
        this._errorWindow.backOpacity = 0;
        this._errorWindow.contentsOpacity = 0;
        this._errorWindow.opacity = 0;
        this.addChild(this._errorWindow);
    };

    Scene_GameJolt.prototype.setErrorWindow = function (textId) {
        if (textId === 0) {
            this._errorWindow.setText(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: "Há algo errado com o nome de \nusuário ou Game Token!"
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: "There is something wrong with \nthe user name or Game Token!"
                    })
            ]));
        }
    };

    Scene_GameJolt.prototype.createDashboardWindow = function () {
        this._dashboardWindow = new Window_Dashboard();
        this._dashboardWindow.backOpacity = 0;
        this._dashboardWindow.contentsOpacity = 0;
        this._dashboardWindow.opacity = 0;
        this.addChild(this._dashboardWindow);
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
        this.updateInputWindow();
        this.updateErrorWindow();
        this.updateDashboard();
    };

    Scene_GameJolt.prototype.updateICON = function () {
        if (this._animationICON === undefined)
            this._animationICON = {
                return: false,
                frames1: 0,
                frames2: 24
            }
        if (Scene_GameJolt._isLoading || Scene_GameJolt._isConnected) {
            if (!this._animationICON.return)
                this._animationICON.return = true;
            if (this._animationICON.frame1 != this._animationICON.frame2)
                this._animationICON.frame1 = this._animationICON.frame2;
            if (this._icon.opacity > 0) this._icon.opacity -= 8;
            return;
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
        if (Scene_GameJolt._isLoading || Scene_GameJolt._isConnected || Scene_GameJolt._isInputProcess) {
            if (this._errorWindow.opacity > 0) return;
            if (this._buttonsLogin[0].opacity > 0)
                this._buttonsLogin[0].opacity -= 8;
            else this._buttonsLogin[0].visible = false;
            if (this._buttonsLogin[1].opacity > 0)
                this._buttonsLogin[1].opacity -= 8;
            else this._buttonsLogin[1].visible = false;
            if (this._buttonsLogin[2].opacity > 0)
                this._buttonsLogin[2].opacity -= 8;
            else this._buttonsLogin[2].visible = false;
            if (this._buttonsLogin[3].opacity > 0)
                this._buttonsLogin[3].opacity -= 8;
            else this._buttonsLogin[3].visible = false;
        } else {
            if (this._inputWindow.opacity > 0) return;
            if (Scene_GameJolt._gameTokenSecret) {
                if (this._buttonsLogin[2].opacity > 72)
                    this._buttonsLogin[2].opacity -= 8;
                if (this._buttonsLogin[2].opacity < 72)
                    this._buttonsLogin[2].opacity += 8;
            } else {
                if (this._buttonsLogin[2].opacity < 255)
                    this._buttonsLogin[2].opacity += 8;
            }
            if (Scene_GameJolt._username === '' || Scene_GameJolt._gameToken === '') {
                if (this._buttonsLogin[3].opacity > 72)
                    this._buttonsLogin[3].opacity -= 8;
                if (this._buttonsLogin[3].opacity < 72)
                    this._buttonsLogin[3].opacity += 8;
                if (typeof this._buttonsLogin[3].isActive === 'function' && !this._buttonsLogin[3].isActiveBKP) {
                    this._buttonsLogin[3].isActiveBKP = this._buttonsLogin[3].isActive;
                    this._buttonsLogin[3].isActive = () => { return false; }
                }
            } else {
                if (this._buttonsLogin[3].opacity < 255)
                    this._buttonsLogin[3].opacity += 8;
                if (typeof this._buttonsLogin[3].isActiveBKP === 'function') {
                    this._buttonsLogin[3].isActive = this._buttonsLogin[3].isActiveBKP;
                    this._buttonsLogin[3].isActiveBKP = null;
                }
            }
            if (!this._buttonsLogin[0].visible) this._buttonsLogin[0].visible = true;
            if (!this._buttonsLogin[1].visible) this._buttonsLogin[1].visible = true;
            if (!this._buttonsLogin[2].visible) this._buttonsLogin[2].visible = true;
            if (!this._buttonsLogin[3].visible) this._buttonsLogin[3].visible = true;
            if (this._buttonsLogin[0].opacity < 255)
                this._buttonsLogin[0].opacity += 8;
            if (this._buttonsLogin[1].opacity < 255)
                this._buttonsLogin[1].opacity += 8;
            if (this._buttonsLogin[0].opacity >= 255 && Scene_GameJolt._isInputChangeValues) {
                Scene_GameJolt._isInputChangeValues = null;
                this.updateInputChangeValues();
            }
        }
    };

    Scene_GameJolt.prototype.updateInputChangeValues = function () {
        this._buttonsLogin[0].bitmap.clear();
        this._buttonsLogin[0].bitmap.fillAll('#242424');
        this._buttonsLogin[0].bitmap.drawText(this.getUsername(), 0, this._buttonsLogin[0].height / 2, this._buttonsLogin[0].width, 0, 'center');
        this._buttonsLogin[1].bitmap.clear();
        this._buttonsLogin[1].bitmap.fillAll('#242424');
        this._buttonsLogin[1].bitmap.drawText(this.getGameToken(), 0, this._buttonsLogin[0].height / 2, this._buttonsLogin[0].width, 0, 'center');
    };
    Scene_GameJolt.prototype.updateLoading = function () {
        if (Scene_GameJolt._isLoading) {
            if (this._buttonsLogin[0].opacity > 0 ||
                this._buttonsLogin[1].opacity > 0 ||
                this._buttonsLogin[2].opacity > 0 ||
                this._buttonsLogin[3].opacity > 0) return;
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

    Scene_GameJolt.prototype.updateInputWindow = function () {
        if (Scene_GameJolt._isInputProcess) {
            this._spriteInputTitle.bitmap.clear();
            this._spriteInputText.bitmap.clear();
            if (this._buttonsLogin[0].opacity > 0) return;
            if (this._errorWindow.opacity > 0) return;
            if (this._spriteInputTitle.opacity < 255)
                this._spriteInputTitle.opacity += 4;
            if (this._spriteInputText.opacity < 255)
                this._spriteInputText.opacity += 4;
            if (this._inputWindow.opacity < 255)
                this._inputWindow.opacity += 4;
            if (this._inputWindow.contentsOpacity < 255)
                this._inputWindow.contentsOpacity += 4;
            if (this._inputWindow.contentsOpacity >= 255) if (!this._inputWindow.active) this._inputWindow.active = true;
            if (Scene_GameJolt._inputProcess === 0) {
                let username = Scene_GameJolt._inputValues.username.length > 0 ?
                    Scene_GameJolt._inputValues.username : Scene_GameJolt._inputValues.default;
                this._spriteInputTitle.bitmap.drawText(getTextLanguage([
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
                ]), 0, 92 / 2, 480, 0, 'center');
                this._spriteInputText.bitmap.drawText(username, 0, 92 / 2, 480, 0, 'center');
            } else if (Scene_GameJolt._inputProcess === 1) {
                let gameToken = Scene_GameJolt._inputValues.gameToken.length > 0 ?
                    Scene_GameJolt._inputValues.gameToken : Scene_GameJolt._inputValues.default;
                if (gameToken != '???' && Scene_GameJolt._gameTokenSecret) {
                    gameToken = this.getGameTokenSecret(gameToken);
                }
                this._spriteInputTitle.bitmap.drawText('Game Token', 0, 92 / 2, 480, 0, 'center');
                this._spriteInputText.bitmap.drawText(gameToken, 0, 92 / 2, 480, 0, 'center');
            }
        } else {
            if (this._inputWindow.active) this._inputWindow.active = false;
            if (this._spriteInputTitle.opacity > 0)
                this._spriteInputTitle.opacity -= 4;
            if (this._spriteInputText.opacity > 0)
                this._spriteInputText.opacity -= 4;
            if (this._inputWindow.opacity > 0)
                this._inputWindow.opacity -= 4;
            if (this._inputWindow.contentsOpacity > 0)
                this._inputWindow.contentsOpacity -= 4;
        }
    };

    Scene_GameJolt.prototype.updateErrorWindow = function () {
        if (Scene_GameJolt._isLoading || !Scene_GameJolt._isErrorWindow || Scene_GameJolt._isInputProcess) {
            if (Scene_GameJolt._isInputProcess) Scene_GameJolt._isErrorWindow = null;
            if (this._errorWindow.contentsOpacity > 0)
                this._errorWindow.contentsOpacity -= 4;
            if (this._errorWindow.opacity > 0)
                this._errorWindow.opacity -= 4;
            if (this._errorWindow.calllistener) {
                if (this._errorWindow.calllistener.frame > 0) {
                    this._errorWindow.calllistener.frame -= .60;
                } else {
                    this._errorWindow.calllistener.callback();
                    this._errorWindow.calllistener = null;
                }
            }
        } else if (Scene_GameJolt._isErrorWindow) {
            if (this._buttonsLogin[0].opacity < 255) return;
            if (this._errorWindow.contentsOpacity < 255)
                this._errorWindow.contentsOpacity += 4;
            if (this._errorWindow.opacity < 255)
                this._errorWindow.opacity += 4;
            else {
                if (Scene_GameJolt._isErrorWindow.frames > 0)
                    Scene_GameJolt._isErrorWindow.frames -= .60;
                else Scene_GameJolt._isErrorWindow = null;
            }
        }
    };

    Scene_GameJolt.prototype.updateDashboard = function () {
        this._dashboardWindow.update();
    };

    //=====================================================================================================
    // Window_GameJoltInput
    //=====================================================================================================
    function Window_GameJoltInput() {
        this.initialize.apply(this, arguments);
    }

    Window_GameJoltInput.prototype = Object.create(Window_Selectable.prototype);
    Window_GameJoltInput.prototype.constructor = Window_GameJoltInput;
    Window_GameJoltInput.LATIN1 =
        ['A', 'B', 'C', 'D', 'E', 'a', 'b', 'c', 'd', 'e',
            'F', 'G', 'H', 'I', 'J', 'f', 'g', 'h', 'i', 'j',
            'K', 'L', 'M', 'N', 'O', 'k', 'l', 'm', 'n', 'o',
            'P', 'Q', 'R', 'S', 'T', 'p', 'q', 'r', 's', 't',
            'U', 'V', 'W', 'X', 'Y', 'u', 'v', 'w', 'x', 'y',
            'Z', '[', ']', '^', '_', 'z', '{', '}', '|', '~',
            '0', '1', '2', '3', '4', '!', '#', '$', '%', '&',
            '5', '6', '7', '8', '9', '(', ')', '*', '+', '-',
            '/', '=', '@', '<', '>', ':', ';', ' ', 'Page', 'OK'];
    Window_GameJoltInput.LATIN2 =
        ['Á', 'É', 'Í', 'Ó', 'Ú', 'á', 'é', 'í', 'ó', 'ú',
            'À', 'È', 'Ì', 'Ò', 'Ù', 'à', 'è', 'ì', 'ò', 'ù',
            'Â', 'Ê', 'Î', 'Ô', 'Û', 'â', 'ê', 'î', 'ô', 'û',
            'Ä', 'Ë', 'Ï', 'Ö', 'Ü', 'ä', 'ë', 'ï', 'ö', 'ü',
            'Ā', 'Ē', 'Ī', 'Ō', 'Ū', 'ā', 'ē', 'ī', 'ō', 'ū',
            'Ã', 'Å', 'Æ', 'Ç', 'Ð', 'ã', 'å', 'æ', 'ç', 'ð',
            'Ñ', 'Õ', 'Ø', 'Š', 'Ŵ', 'ñ', 'õ', 'ø', 'š', 'ŵ',
            'Ý', 'Ŷ', 'Ÿ', 'Ž', 'Þ', 'ý', 'ÿ', 'ŷ', 'ž', 'þ',
            'Ĳ', 'Œ', 'ĳ', 'œ', 'ß', '«', '»', ' ', 'Page', 'OK'];
    Window_GameJoltInput.RUSSIA =
        ['А', 'Б', 'В', 'Г', 'Д', 'а', 'б', 'в', 'г', 'д',
            'Е', 'Ё', 'Ж', 'З', 'И', 'е', 'ё', 'ж', 'з', 'и',
            'Й', 'К', 'Л', 'М', 'Н', 'й', 'к', 'л', 'м', 'н',
            'О', 'П', 'Р', 'С', 'Т', 'о', 'п', 'р', 'с', 'т',
            'У', 'Ф', 'Х', 'Ц', 'Ч', 'у', 'ф', 'х', 'ц', 'ч',
            'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'ш', 'щ', 'ъ', 'ы', 'ь',
            'Э', 'Ю', 'Я', '^', '_', 'э', 'ю', 'я', '%', '&',
            '0', '1', '2', '3', '4', '(', ')', '*', '+', '-',
            '5', '6', '7', '8', '9', ':', ';', ' ', '', 'OK'];
    Window_GameJoltInput.JAPAN1 =
        ['あ', 'い', 'う', 'え', 'お', 'が', 'ぎ', 'ぐ', 'げ', 'ご',
            'か', 'き', 'く', 'け', 'こ', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
            'さ', 'し', 'す', 'せ', 'そ', 'だ', 'ぢ', 'づ', 'で', 'ど',
            'た', 'ち', 'つ', 'て', 'と', 'ば', 'び', 'ぶ', 'べ', 'ぼ',
            'な', 'に', 'ぬ', 'ね', 'の', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
            'は', 'ひ', 'ふ', 'へ', 'ほ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ',
            'ま', 'み', 'む', 'め', 'も', 'っ', 'ゃ', 'ゅ', 'ょ', 'ゎ',
            'や', 'ゆ', 'よ', 'わ', 'ん', 'ー', '～', '・', '＝', '☆',
            'ら', 'り', 'る', 'れ', 'ろ', 'ゔ', 'を', '　', 'カナ', '決定'];
    Window_GameJoltInput.JAPAN2 =
        ['ア', 'イ', 'ウ', 'エ', 'オ', 'ガ', 'ギ', 'グ', 'ゲ', 'ゴ',
            'カ', 'キ', 'ク', 'ケ', 'コ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ',
            'サ', 'シ', 'ス', 'セ', 'ソ', 'ダ', 'ヂ', 'ヅ', 'デ', 'ド',
            'タ', 'チ', 'ツ', 'テ', 'ト', 'バ', 'ビ', 'ブ', 'ベ', 'ボ',
            'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'パ', 'ピ', 'プ', 'ペ', 'ポ',
            'ハ', 'ヒ', 'フ', 'ヘ', 'ホ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ',
            'マ', 'ミ', 'ム', 'メ', 'モ', 'ッ', 'ャ', 'ュ', 'ョ', 'ヮ',
            'ヤ', 'ユ', 'ヨ', 'ワ', 'ン', 'ー', '～', '・', '＝', '☆',
            'ラ', 'リ', 'ル', 'レ', 'ロ', 'ヴ', 'ヲ', '　', '英数', '決定'];
    Window_GameJoltInput.JAPAN3 =
        ['Ａ', 'Ｂ', 'Ｃ', 'Ｄ', 'Ｅ', 'ａ', 'ｂ', 'ｃ', 'ｄ', 'ｅ',
            'Ｆ', 'Ｇ', 'Ｈ', 'Ｉ', 'Ｊ', 'ｆ', 'ｇ', 'ｈ', 'ｉ', 'ｊ',
            'Ｋ', 'Ｌ', 'Ｍ', 'Ｎ', 'Ｏ', 'ｋ', 'ｌ', 'ｍ', 'ｎ', 'ｏ',
            'Ｐ', 'Ｑ', 'Ｒ', 'Ｓ', 'Ｔ', 'ｐ', 'ｑ', 'ｒ', 'ｓ', 'ｔ',
            'Ｕ', 'Ｖ', 'Ｗ', 'Ｘ', 'Ｙ', 'ｕ', 'ｖ', 'ｗ', 'ｘ', 'ｙ',
            'Ｚ', '［', '］', '＾', '＿', 'ｚ', '｛', '｝', '｜', '～',
            '０', '１', '２', '３', '４', '！', '＃', '＄', '％', '＆',
            '５', '６', '７', '８', '９', '（', '）', '＊', '＋', '－',
            '／', '＝', '＠', '＜', '＞', '：', '；', '　', 'かな', '決定'];

    Window_GameJoltInput.prototype.initialize = function (x, y, editWindow) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._editWindow = editWindow;
        this._page = 0;
        this._index = 0;
        this.refresh();
        this.updateCursor();
        this.activate();
    };

    Window_GameJoltInput.prototype.windowWidth = function () {
        return 480;
    };

    Window_GameJoltInput.prototype.windowHeight = function () {
        return this.fittingHeight(9);
    };

    Window_GameJoltInput.prototype.table = function () {
        if ($gameSystem.isJapanese()) {
            return [Window_GameJoltInput.JAPAN1,
            Window_GameJoltInput.JAPAN2,
            Window_GameJoltInput.JAPAN3];
        } else if ($gameSystem.isRussian()) {
            return [Window_GameJoltInput.RUSSIA];
        } else {
            return [Window_GameJoltInput.LATIN1,
            Window_GameJoltInput.LATIN2];
        }
    };

    Window_GameJoltInput.prototype.maxCols = function () {
        return 10;
    };

    Window_GameJoltInput.prototype.maxItems = function () {
        return 90;
    };

    Window_GameJoltInput.prototype.character = function () {
        return this._index < 88 ? this.table()[this._page][this._index] : '';
    };

    Window_GameJoltInput.prototype.isPageChange = function () {
        return this._index === 88;
    };

    Window_GameJoltInput.prototype.isOk = function () {
        return this._index === 89;
    };

    Window_GameJoltInput.prototype.itemRect = function (index) {
        return {
            x: index % 10 * 42 + Math.floor(index % 10 / 5) * 24,
            y: Math.floor(index / 10) * this.lineHeight(),
            width: 42,
            height: this.lineHeight()
        };
    };

    Window_GameJoltInput.prototype.refresh = function () {
        var table = this.table();
        this.contents.clear();
        this.resetTextColor();
        for (var i = 0; i < 90; i++) {
            var rect = this.itemRect(i);
            rect.x += 3;
            rect.width -= 6;
            this.drawText(table[this._page][i], rect.x, rect.y, rect.width, 'center');
        }
    };

    Window_GameJoltInput.prototype.updateCursor = function () {
        var rect = this.itemRect(this._index);
        this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
    };

    Window_GameJoltInput.prototype.isCursorMovable = function () {
        return this.active;
    };

    Window_GameJoltInput.prototype.cursorDown = function (wrap) {
        if (this._index < 80 || wrap) {
            this._index = (this._index + 10) % 90;
        }
    };

    Window_GameJoltInput.prototype.cursorUp = function (wrap) {
        if (this._index >= 10 || wrap) {
            this._index = (this._index + 80) % 90;
        }
    };

    Window_GameJoltInput.prototype.cursorRight = function (wrap) {
        if (this._index % 10 < 9) {
            this._index++;
        } else if (wrap) {
            this._index -= 9;
        }
    };

    Window_GameJoltInput.prototype.cursorLeft = function (wrap) {
        if (this._index % 10 > 0) {
            this._index--;
        } else if (wrap) {
            this._index += 9;
        }
    };

    Window_GameJoltInput.prototype.cursorPagedown = function () {
        this._page = (this._page + 1) % this.table().length;
        this.refresh();
    };

    Window_GameJoltInput.prototype.cursorPageup = function () {
        this._page = (this._page + this.table().length - 1) % this.table().length;
        this.refresh();
    };

    Window_GameJoltInput.prototype.processCursorMove = function () {
        var lastPage = this._page;
        Window_Selectable.prototype.processCursorMove.call(this);
        this.updateCursor();
        if (this._page !== lastPage) {
            SoundManager.playCursor();
        }
    };

    Window_GameJoltInput.prototype.processHandling = function () {
        if (this.isOpen() && this.active) {
            if (Input.isTriggered('shift')) {
                this.processJump();
            }
            if (Input.isRepeated('cancel')) {
                this.processBack();
            }
            if (Input.isRepeated('ok')) {
                this.processOk();
            }
        }
    };

    Window_GameJoltInput.prototype.isCancelEnabled = function () {
        return true;
    };

    Window_GameJoltInput.prototype.processCancel = function () {
        this.processBack();
    };

    Window_GameJoltInput.prototype.processJump = function () {
        if (this._index !== 89) {
            this._index = 89;
            SoundManager.playCursor();
        }
    };

    Window_GameJoltInput.prototype.processBack = function () {
        if (this._editWindow.back()) {
            SoundManager.playCancel();
        }
    };

    Window_GameJoltInput.prototype.processOk = function () {
        if (this.character()) {
            this.onNameAdd();
        } else if (this.isPageChange()) {
            SoundManager.playOk();
            this.cursorPagedown();
        } else if (this.isOk()) {
            this.onNameOk();
        }
    };

    Window_GameJoltInput.prototype.onNameAdd = function () {
        if (this._editWindow.add(this.character())) {
            SoundManager.playOk();
        } else {
            SoundManager.playBuzzer();
        }
    };

    Window_GameJoltInput.prototype.onNameOk = function () {
        if (this._editWindow.name() === '') {
            if (this._editWindow.restoreDefault()) {
                SoundManager.playOk();
                this.callOkHandler();
            } else {
                SoundManager.playBuzzer();
            }
        } else {
            SoundManager.playOk();
            this.callOkHandler();
        }
    };

    //-----------------------------------------------------------------------------
    // Window_Dashboard
    //
    function Window_Dashboard() {
        this.initialize.apply(this, arguments);
    }

    Window_Dashboard.prototype = Object.create(Window_Base.prototype);
    Window_Dashboard.prototype.constructor = Window_Dashboard;

    Window_Dashboard.prototype.initialize = function () {
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    };

    Window_Dashboard.prototype.windowWidth = function () {
        return Graphics.width;
    };

    Window_Dashboard.prototype.windowHeight = function () {
        return Graphics.height;
    };

    Window_Dashboard.prototype.refresh = function () {
        var x = this.textPadding();
        var width = this.contents.width - this.textPadding() * 2;
        this.contents.clear();
        /**
         * Horizontal Lines (x, y, width, height, Color)
         */
        // Avatar Lines
        this.contents.fillRect(x, 5, 250, 1, 'white');
        this.contents.fillRect(x, 150, 250, 1, 'white');
        this.contents.fillRect(x + 5, 155, 240, 1, 'white');
        // Username Lines
        this.contents.fillRect(x, 188, 45, 1, 'white');
        // Type User Lines
        this.contents.fillRect(x, 223, 45, 1, 'white');
        /**
         * Vertical Lines (x, y, width, height, Color)
         */
        // Avatar Lines
        this.contents.fillRect(x, 5, 1, 145, 'white');
        this.contents.fillRect(255, 5, 1, 145, 'white');
        /**
         * Avatar of user
         */
        var bitmap = $gameTemp.gamejoltGetSpriteAvatar(Scene_GameJolt._username);
        bitmap.resize(96, 96); // CONFIGURAR O TAMANHO DA IMAGEM
        var sprite = new Sprite(bitmap);
        sprite.x = 30;
        sprite.y = 8;
        this.addChild(sprite);
        /**
         * Username
         */
        this.changeTextColor(this.textColor(16));
        this.contents.drawText(Scene_GameJolt._username || 'Anonymous', x, 175, width, 0, 'left');
        /**
         * Type User
         */
        this.changeTextColor(this.textColor(17));
        this.contents.drawText($gameTemp.gamejoltGetTypeUser(Scene_GameJolt._username) ||
            'Guest', x, 210, width, 0, 'left');
    };

    Window_Dashboard.prototype.update = function () {
        if (Scene_GameJolt._isLoading || !Scene_GameJolt._isConnected) {
            if (this.contentsOpacity > 0)
                this.contentsOpacity -= 4;
            if (this.opacity > 0)
                this.opacity -= 4;
        }
        if (Scene_GameJolt._isConnected) {
            if (this.contentsOpacity < 255)
                this.contentsOpacity += 4;
            if (this.opacity < 255)
                this.opacity += 4;
            this.refresh();
        }
    };
})();