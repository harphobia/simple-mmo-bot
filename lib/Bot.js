import SimpleMMO from './SimpleMMO.js';
import fetch from 'node-fetch';
import func from './GlobalFunc.js';

const header = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0',
    'Accept': '*/*',
    'Accept-Language': 'en',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://web.simple-mmo.com',
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'Origin': 'https://web.simple-mmo.com',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
    'TE': 'trailers'
}

class Bot extends SimpleMMO {
    constructor (email,password){
        super(email,password)

        this.id = null
        this.bank = null
        this.diamonds = null
        this.health = null
        this.energy = null
        this.quest_points = null

    }

    getCharStats = () => new Promise((resolve, reject) => {
        fetch('https://web.simple-mmo.com/api/web-app', {
            headers: {...header, 'Cookie': `XSRF-TOKEN=${this.xsrf_token}; laravelsession=${this.laravel_session}; ${this.remember_web_key}=${this.remember_web_value}; d_h=true`,}
        })
        .then((res) => res.json())
        .then((res) => {
            if(!res.id) return reject(res)

            const {id,bank,diamonds,current_hp,energy,quest_points} = res

            this.id = id
            this.bank = bank
            this.diamonds = diamonds
            this.health = current_hp
            this.energy = energy
            this.quest_points = quest_points

            resolve(res)
        })
        .catch((err) => reject(err));
    });

    setToken = () => new Promise((resolve, reject) => {

        fetch("https://web.simple-mmo.com/", {
            headers: {...header, 'Cookie': `XSRF-TOKEN=${this.xsrf_token}; laravelsession=${this.laravel_session}; ${this.remember_web_key}=${this.remember_web_value}; d_h=true`}
        })
        .then(async(res) => {
            const body = await res.text()
            const header = await res.headers.raw()
            const cookie = header['set-cookie']

            await this.setCookie(cookie)
            await this.setApiToken(body)

            resolve()
        })
        .catch((err) => reject(err));
    });

    takeStep = () => new Promise(async(resolve, reject) => {

        fetch('https://api.simple-mmo.com/api/travel/perform/f4gl4l3k', {
            method: 'POST',
            headers: header,
            body: new URLSearchParams({
                '_token': this.token,
                'api_token': this.api_token,
                'd_1': `${func.randNumbBetween(111,999)}`,
                'd_2': `${func.randNumbBetween(111,999)}`,
                's': 'false',
                'travel_id': '0'
            })
        })
        .then((res)=>res.json())
        .then((res) => resolve(res))
        .catch((err)=> reject(err))
    });

    playGambling = (bet) => new Promise((resolve, reject) => {
        fetch('https://web.simple-mmo.com/gamecentre/5050/action', {
            method: 'POST',
            headers: {...header, 'Cookie': `XSRF-TOKEN=${this.xsrf_token}; laravelsession=${this.laravel_session}; ${this.remember_web_key}=${this.remember_web_value}; d_h=true`},
            body: new URLSearchParams({
                '_token': this.token,
                'GoldAmount': bet
            })
        })
        .then((_) => resolve())
        .catch((err)=> reject(err))
    });

    depositBank = (amount) => new Promise((resolve, reject) => {
        fetch('https://web.simple-mmo.com/bank/deposit/submit', {
            method: 'POST',
            headers: {...header, 'Cookie': `XSRF-TOKEN=${this.xsrf_token}; laravelsession=${this.laravel_session}; ${this.remember_web_key}=${this.remember_web_value}; d_h=true`},
            body: new URLSearchParams({
                '_token': this.token,
                'GoldAmount': amount
            })
        })
        .then((_) => resolve())
        .catch((err)=> reject(err))
    });

    battleHandler = (npcId) => new Promise(async(resolve, reject) => {
        const {player_hp,opponent_hp} = await this.attackNpc(npcId,true)

        if(player_hp<opponent_hp) return resolve(   )

        let data = {title : null}

        while(!data.title){
            await func.delayInSecond(3)
            const res = await await this.attackNpc(npcId,false)
            data = res
        }

        resolve(data)
    });

    attackNpc = (npcId,special) => new Promise((resolve, reject) => {
        fetch(`https://api.simple-mmo.com/api/npcs/attack/${npcId}/434g3s`, {
            method: 'POST',
            headers: header,
            body: new URLSearchParams({
                '_token': this.token,
                'special_attack': special ?? false,
                'api_token': this.api_token
            })
        })
        .then((res)=>res.json())
        .then((res) => resolve(res))
        .catch((err)=> reject(err))
    });

    gatherHandler = (materialId) => new Promise(async(resolve, reject) => {
        let data = {gatherEnd:false}

        while(data.gatherEnd == false){
           data = await this.gatherMaterial(materialId)
           await func.delayInSecond(3)
        }

        resolve(data)
    })

    gatherMaterial = (materialId) => new Promise(async(resolve, reject) => {
        fetch(`https://web.simple-mmo.com/api/crafting/material/gather/${materialId}`, {
            method: 'POST',
            headers: {...header, 'Cookie': `XSRF-TOKEN=${this.xsrf_token}; laravelsession=${this.laravel_session}; ${this.remember_web_key}=${this.remember_web_value}; d_h=true`},
            body: new URLSearchParams({'_token': this.token})
        })
        .then((res)=>res.json())
        .then((res) => resolve(res))
        .catch((err)=> reject(err))
    });

    instantHeal = () => new Promise(async(resolve, reject) => {
        fetch(`https://web.simple-mmo.com/api/healer/heal`, {
            method: 'POST',
            headers: {...header, 'Cookie': `XSRF-TOKEN=${this.xsrf_token}; laravelsession=${this.laravel_session}; ${this.remember_web_key}=${this.remember_web_value}; d_h=true`},
        })
        .then((res)=>res.json())
        .then((res) => resolve(res))
        .catch((err)=> reject(err))
    });

    waveToPlayer = (playerId) => new Promise((resolve, reject) => {
        fetch(`https://web.simple-mmo.com/api/wave/${playerId}`, {
            method: 'POST',
            headers: {...header, 'Cookie': `XSRF-TOKEN=${this.xsrf_token}; laravelsession=${this.laravel_session}; ${this.remember_web_key}=${this.remember_web_value}; d_h=true`},
            body: new URLSearchParams({
                '_token': this.token,
                'data': true
            })
        })
        .then((res)=>res.json())
        .then((res) => resolve(res))
        .catch((err)=> reject(err))
    });

    craftItem = (itemId) => new Promise((resolve, reject) => {
        fetch(`https://web.simple-mmo.com/api/crafting/craft/${itemId}`, {
            method: 'POST',
            headers: {...header, 'Cookie': `XSRF-TOKEN=${this.xsrf_token}; laravelsession=${this.laravel_session}; ${this.remember_web_key}=${this.remember_web_value}; d_h=true`},
            body: new URLSearchParams({
                '_token': this.token,
            })
        })
        .then((res)=>res.json())
        .then((res) => resolve(res))
        .catch((err)=> reject(err))
    });

}


export default Bot