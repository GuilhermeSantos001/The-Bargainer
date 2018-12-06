//==================================================================================================
// GS_gameJolt.js
//==================================================================================================
/*:
 * @plugindesc v1.0.0 - GameJolt API
 *
 * @author GuilhermeSantos
 * 
 */
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
     * @function get_signature
     * @description Usado para criar uma assinatura com conversão em MD5.
     * @param {String} data - Data usada para ser convertida
     * @return {String}
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

    user_auth('DrXama', '9ef00y2a', {
        sucess: (data) => {
            console.log(data);
        },
        error: (e) => {
            console.error(e);
        }
    });
})();