//==================================================================================================
// GS_cultivateSystem.js
//==================================================================================================
/*:
 * @plugindesc v1.00 - Sistema de plantação
 *
 * @author Dr.Xamã
 *
 */
function Game_Cultivate() {
    this.initialize.apply(this, arguments);
};
(function () {
    "use strict";
    //-----------------------------------------------------------------------------
    // Game_Cultivate
    //
    Game_Cultivate.prototype.initialize = function () {
        this.clear();
    };

    Game_Cultivate.prototype.clear = function () {
        this._data = {};
    };

    Game_Cultivate.prototype.data = function (cultivateId) {
        return this._data[cultivateId];
    };

    Game_Cultivate.prototype.value = function (cultivateId) {
        return this._data[cultivateId].amount || 0;
    };

    Game_Cultivate.prototype.frames = function (cultivateId) {
        return this._data[cultivateId].frames || 0;
    };

    Game_Cultivate.prototype.setValue = function (cultivateId, amount) {
        if (typeof amount === 'number') {
            amount = Math.floor(Math.abs(amount));
        }
        this._data[cultivateId] = {
            amount: amount || 1,
            frames: 60
        };
    };

    Game_Cultivate.prototype.updateFrames = function (cultivateId, frames) {
        this._data[cultivateId].frames -= frames || 2;
    };

    //-----------------------------------------------------------------------------
    // Variables
    //
    let cultivate = new Game_Cultivate();

    //-----------------------------------------------------------------------------
    // Functions
    //

    // Retorna o caminho local para o arquivo/pasta
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

    function saveData() {
        let fs = require('fs');
        if (fs.existsSync(localPath('save'))) {
            fs.writeFileSync(localPath('save/data_1.data'), LZString.compressToBase64(JsonEx.stringify(cultivate)), 'utf8');
        }
    };

    function initializeData() {
        let fs = require('fs');
        if (fs.existsSync(localPath('save/data_1.data'))) {
            cultivate = JsonEx.parse(LZString.decompressFromBase64(fs.readFileSync(localPath('save/data_1.data'), 'utf8')));
        }
    };

    //-----------------------------------------------------------------------------
    // Game_Temp
    //
    const _game_temp_initialize = Game_Temp.prototype.initialize;
    Game_Temp.prototype.initialize = function () {
        _game_temp_initialize.call(this);
        initializeData();
    };

    Game_Temp.prototype.saveCultivate = function () {
        saveData();
    };

    Game_Temp.prototype.addCultivate = function (cultivateId, amount) {
        cultivate.setValue(cultivateId, amount), saveData();
    };

    Game_Temp.prototype.getCultivate = function () {
        return cultivate;
    };
})();