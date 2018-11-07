//==================================================================================================
// GS_dailyMissions.js
//==================================================================================================
/*:
 * @plugindesc v1.00 - Aciona as missões diárias
 *
 * @author GuilhermeSantos
 *
 */

/**
 * EXPORTAÇÃO DAS FUNÇÕES
 */
function Scene_DailyMissionsSystem() {
    this.initialize.apply(this, arguments);
}

(function () {
    "use strict";
    /**
     * Variaveis Globais
     */
    let missionsId = [],
        missionsStatus = {};

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
        let obj = {
            missionsId: missionsId,
            missionsStatus: missionsStatus
        },
            fs = require('fs'),
            pathFolder = localPath('save'),
            pathFile = localPath('save/data_2.data');
        if (fs.existsSync(pathFolder)) {
            fs.writeFileSync(pathFile, LZString.compressToBase64(JSON.stringify(obj)), 'utf8');
        }
    };

    function loadData() {
        let fs = require('fs'),
            pathFolder = localPath('save'),
            pathFile = localPath('save/data_2.data');
        if (fs.existsSync(pathFolder) && fs.existsSync(pathFile)) {
            return JSON.parse(LZString.decompressFromBase64(fs.readFileSync(pathFile, 'utf8')));
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
     * Game_Interpreter
     */
    const _game_interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _game_interpreter_pluginCommand.apply(this, arguments);
        command = String(command).toLowerCase();
        if (command === 'dailymission') {
            args[0] = String(args[0]).toLowerCase();
            if (args[0] === 'add') {
                let questId = Number(args[1]);
                if (missionsId.filter(missionId => {
                    if (missionId === questId) return true;
                }).length <= 0) {
                    _game_interpreter_pluginCommand.call(this, 'Quest', ['Add', questId]);
                    missionsId.push(questId);
                    missionsStatus[questId] = {
                        dayMonth: $gameVariables.value(10),
                        status: 'incomplete'
                    };
                }
            } else if (args[0] === 'complete') {
                let questId = Number(args[1]);
                missionsId.map(missionId => {
                    if (missionId === questId) {
                        if (missionsStatus[questId]['status'] === 'incomplete') {
                            _game_interpreter_pluginCommand.call(this, 'Quest', ['Set', 'Completed', questId]);
                            missionsStatus[questId]['status'] = 'complete';
                        }
                    }
                });
            }
        }
    };

    /**
     * Game_System
     */
    const _game_map_onBeforeSave = Game_System.prototype.onBeforeSave;
    Game_System.prototype.onBeforeSave = function () {
        _game_map_onBeforeSave.call(this);
        saveData();
    };

    const _game_map_onAfterLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function () {
        _game_map_onAfterLoad.call(this);
        let obj = loadData();
        if (obj) {
            missionsId = obj.missionsId;
            missionsStatus = obj.missionsStatus;
        }
    };

    /**
     * Game_Map
     */
    const _game_map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function (sceneActive) {
        _game_map_update.apply(this, arguments);
        if (sceneActive) {
            this.updateDailyMissions();
        }
    };

    Game_Map.prototype.updateDailyMissions = function () {
        missionsId.map(questId => {
            if (missionsStatus[questId] && missionsStatus[questId]['status'] === 'complete') {
                if (missionsStatus[questId]['dayMonth'] < $gameVariables.value(10)) {
                    this._interpreter.pluginCommand('Quest', ['Set', 'Available', questId]);
                    missionsStatus[questId]['status'] = 'incomplete';
                    missionsStatus[questId]['dayMonth'] = $gameVariables.value(10);
                    saveData();
                }
            }
        });
    };

    /**
     * Scene_DailyMissionsSystem
     */

    Scene_DailyMissionsSystem.prototype = Object.create(Scene_Base.prototype);
    Scene_DailyMissionsSystem.prototype.constructor = Scene_DailyMissionsSystem;

    Scene_DailyMissionsSystem.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);
        missionsStatus[1] = {
            dayMonth: $gameVariables.value(10),
            status: 'incomplete'
        };
        missionsStatus[2] = {
            dayMonth: $gameVariables.value(10),
            status: 'incomplete'
        };
    };

    Scene_DailyMissionsSystem.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createWindowDailyMissions();
    };

    Scene_DailyMissionsSystem.prototype.createBackground = function () {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this.addChild(this._backgroundSprite);
    };

    Scene_DailyMissionsSystem.prototype.createWindowDailyMissions = function () {
        this._commandwindowDailyMissions = new Window_CommandDailyMissions();
        this._windowDailyMissions = new Window_DailyMissions();
        this._commandwindowDailyMissions.setHandler('cancel', this.popScene.bind(this));
        this.addChild(this._commandwindowDailyMissions);
        this.addChild(this._windowDailyMissions);
    };

    Scene_DailyMissionsSystem.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
        this.startFadeIn(this.fadeSpeed(), false);
    };

    Scene_DailyMissionsSystem.prototype.update = function () {
        Scene_Base.prototype.update.call(this);
    };

    /**
     * Window_CommandDailyMissions
     */
    function Window_CommandDailyMissions() {
        this.initialize.apply(this, arguments);
    }

    Window_CommandDailyMissions.prototype = Object.create(Window_Command.prototype);
    Window_CommandDailyMissions.prototype.constructor = Window_CommandDailyMissions;

    Window_CommandDailyMissions.prototype.initialize = function () {
        Window_Command.prototype.initialize.call(this, this.textPadding(), this.standardPadding() / 2);
    };

    Window_CommandDailyMissions.prototype.windowWidth = function () {
        return 580;
    };

    Window_CommandDailyMissions.prototype.windowHeight = function () {
        return Graphics.height - this.standardPadding();
    };

    Window_CommandDailyMissions.prototype.makeCommandList = function () {
        this.addMainCommands();
    };

    Window_CommandDailyMissions.prototype.addMainCommands = function () {
        let data = Object.assign({}, missionsStatus),
            getByID = {
                sintax: '_undefined_',
                value: 0
            }
        if (Object.keys(data).length < 18) {
            getByID.value = Object.keys(data).length;
            while (getByID.value < 18) {
                data[`${getByID.sintax}${getByID.value++}`] = 'undefined';
            }
        }
        Object.keys(data).map(key => {
            if (data[key] === 'undefined') {
                this.addCommand(null, getTextLanguage([
                    JSON.stringify(
                        {
                            Language: "pt_br",
                            Value: "\\i[192] --missão-diária--"
                        }),
                    JSON.stringify(
                        {
                            Language: "en_us",
                            Value: "\\i[192] --daily-mission--"
                        })
                ]), 'item', false);
            } else {
                this.addCommand(key, this.convertEscapeCharacters($dataQuests[key].name), 'item');
            }
        });
    };

    Window_CommandDailyMissions.prototype.addCommand = function (questId, name, symbol, enabled, ext) {
        if (enabled === undefined) {
            enabled = true;
        }
        if (ext === undefined) {
            ext = null;
        }
        if (questId === undefined) questId = '_undefined';
        this._list.push({ questId: questId, name: name, symbol: symbol, enabled: enabled, ext: ext });
    };

    Window_CommandDailyMissions.prototype.drawItem = function (index) {
        var rect = this.itemRectForText(index),
            text = this.commandName(index);
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawTextEx(text, rect.x, rect.y);
    };

    Window_CommandDailyMissions.prototype.commandQuestData = function () {
        return $dataQuests[this._list[this.index()]['questId']];
    };

    Window_CommandDailyMissions.prototype.select = function (index) {
        Window_Command.prototype.select.apply(this, arguments);
        if (SceneManager._scene._windowDailyMissions instanceof Window_DailyMissions)
            SceneManager._scene._windowDailyMissions.refresh();
    };

    //-----------------------------------------------------------------------------
    // Window_DailyMissions
    //
    function Window_DailyMissions() {
        this.initialize.apply(this, arguments);
    }

    Window_DailyMissions.prototype = Object.create(Window_Base.prototype);
    Window_DailyMissions.prototype.constructor = Window_DailyMissions;

    Window_DailyMissions.prototype.initialize = function () {
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Base.prototype.initialize.call(this, 580 + this.textPadding(), this.standardPadding() / 2,
            width, height);
        this.refresh();
    };

    Window_DailyMissions.prototype.windowWidth = function () {
        return (Graphics.width - 580) - this.textPadding() * 2;
    };

    Window_DailyMissions.prototype.windowHeight = function () {
        return Graphics.height - this.standardPadding();
    };

    Window_DailyMissions.prototype.refresh = function () {
        var windowDailyMissions = SceneManager._scene._commandwindowDailyMissions,
            x = this.textPadding(),
            width = this.contents.width - this.textPadding() * 2;
        this.contents.clear();
        if (!windowDailyMissions.commandQuestData()) {
            this.changePaintOpacity(false);
            this.drawTextEx(getTextLanguage([
                JSON.stringify(
                    {
                        Language: "pt_br",
                        Value: `Procure pessoas com este ícone(\\i[192]) para receber \
                               \nmissões. Algumas missões são diárias, após \
                               \ncompletar, espere até a meia-noite para repetir.`
                    }),
                JSON.stringify(
                    {
                        Language: "en_us",
                        Value: `Search for persons with this icon(\\i[192]) to receive \
                               \nmissions. Some missions are daily, after finishing \
                               \nthem, wait until midnight to repeat.`
                    })
            ]), x, 0);
            this.changePaintOpacity(true);
        } else {
            let description = windowDailyMissions.commandQuestData().description,
                lineDesc = {
                    base: 50,
                    space: 18,
                    draw: 1,
                    total: 0
                }
            this.drawTextEx(`\\tx[2017]`, x, 0);
            this.changePaintOpacity(false);
            this.contents.fillRect(x, 40, width, 1, 'white');
            this.changePaintOpacity(true);
            description.map(desc => {
                if (desc) {
                    let y = lineDesc.base,
                        w = this.textIsJumpLine(desc),
                        j = false;
                    if (lineDesc.draw > 1) y += lineDesc.space * lineDesc.draw;
                    if (w > 0) j = true;
                    while (w > 0) {
                        lineDesc.total += lineDesc.space * lineDesc.draw;
                        if (w <= 1) lineDesc.total += 40;
                        w--;
                    }
                    lineDesc.draw++;
                    if (!j) lineDesc.total = y;
                    this.drawTextEx(this.convertEscapeCharacters(JSON.parse(desc)), x, y);
                }
            }, this);
            let y = lineDesc.total + 40,
                location = windowDailyMissions.commandQuestData().location;
            this.drawTextEx(`\\tx[2018]`, x, y), y += 40;
            this.changePaintOpacity(false);
            this.contents.fillRect(x, y, width, 1, 'white'), y += 8;
            this.changePaintOpacity(true);
            this.drawTextEx(`\\c[4]${location}`, x, y);
        }
    };

    Window_DailyMissions.prototype.textIsJumpLine = function (text) {
        let l = text.length,
            i = 0,
            s = '',
            j = 0,
            m = '';
        for (; i < l; i++) {
            let letter = text[i];
            if (m != '\\') s = '';
            m = letter;
            if (letter === '\\' ||
                letter === 'n') s += letter;
            if (s === '\\n') j++ , s = '';
        }
        console.log(text);
        return j;
    };
})();