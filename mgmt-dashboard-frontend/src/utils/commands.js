//@ts-check
import React from 'react';
import cockpit from '../cockpit/pkg/lib/cockpit';

const cliPath = "~/rtk-base-station/mgmt-cli/mgmt-cli";
const configPath = "~/rtk-base-station/config/";
/**
 * discardコマンドを送信する関数です。
 * @returns {Promise<Error | null | undefined>} 成功時はnull、失敗時はError、undefinedは未実行
 */
export const sendDiscardCommand = async () => {
    let res = undefined;
    await cockpit.script(`${cliPath} -c ${configPath} discard`)
        .then(data => {
            console.log("[DISCARD] " + data);
            res = null;
        }).catch(exception => {
            console.error(`Failed to discard`);
            console.error(exception);
            res = exception;
        });
    return res;
};

/**
 * getコマンドを送信する関数です。
 * @returns {Promise<string | Error | undefined>} 成功時はstringでvalueを返す、失敗時はError、undefinedは未実行
 */
export const sendGetCommand = async (key) => {
    let res = undefined;
    await cockpit.script(`${cliPath} -c ${configPath} get ${key}`)
        .then(data => {
            res = data.slice(0, -1);
            console.log(`[GET] ${key}: "${res}"`);
        }).catch(exception => {
            console.error(`Failed to get ${key}`);
            console.error(exception);
            res = exception;
        });
    return res;
};

/**
 * setコマンドを送信する関数です。
 * @returns {Promise<Error | null | undefined>} 成功時はnull、失敗時はError、undefinedは未実行
 */
export const sendSetCommand = async (key, value) => {
    let res = undefined;
    await cockpit.script(`${cliPath} -c ${configPath} set ${key} "${value}"`)
        .then(data => {
            console.log("[SET] " + data);
            res = null;
        }).catch(exception => {
            console.error(`Failed to set ${key} ${value}`);
            res = exception;
        });
    return res;
}

/**
 * compareコマンドを送信する関数です。
 * @returns {Promise<String | Error | undefined>} 成功時はstring、失敗時はError、undefinedは未実行
 */
export const sendCompareCommand = async () => {
    let res = undefined;
    await cockpit.script(`${cliPath} -c ${configPath} compare`)
        .then(data => {
            res = data;
        }).catch(exception => {
            console.error(`Failed to compare`);
            console.error(exception);
            res = exception;
        });
    return res;
};

const str2strPath = "~/rtk-base-station/str2str/";
/**
 * commitコマンドを送信する関数です。
 * @param {React.SetStateAction<any>} setResultOfCommitCommand - コマンドの実行結果を格納するのに使うstateのsetterを指定。
 * @returns {Promise<Error | null | undefined>} 成功時はnull、失敗時はError、undefinedは未実行
 */
export const sendCommitCommand = async (setResultOfCommitCommand) => {
    let res = undefined;
    await cockpit.script(`${cliPath} -c ${configPath} commit -s ${str2strPath}`)
        .stream(data => {
            setResultOfCommitCommand(resultOfCommitCommand => resultOfCommitCommand + data);
        })
        .then(data => {
            res = null;
        }).catch(exception => {
            console.error(`Failed to commit`);
            console.error(exception);
            res = exception
        });
    return res;
};