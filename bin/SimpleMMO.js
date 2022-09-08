import fetch from 'node-fetch';
import cheerio from 'cheerio';

const header = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
    'TE': 'trailers'
}

class SimpleMMO {
    constructor(email, password){
        this.email = email
        this.password = password

        this.token = null
        this.api_token = null

        this.login_token = null
        this.xsrf_token = null
        this.laravel_session = null

        this.remember_web_key= null
        this.remember_web_value = null
    }

    setApiToken = (body) => new Promise((resolve, reject) => {
        const $ = cheerio.load(body)
        const token = $('meta[name=csrf-token]').attr('content')
        //need optimize with regex
        const api_token = $("div[x-data={chat:false,chatSrc:'about:blank;'}]").attr("x-init").split('&').find((el)=> el.match("api_token=")).split("'")[0].split('=')[1]

        if(!token && !api_token) return reject('No API token...')

        this.token = token
        this.api_token = api_token

        resolve()
    });

    setCookie = (cookie) => new Promise((resolve, reject) => {
        const xsrf_token = cookie.find((el)=>el.match('XSRF-TOKEN')).split(';')[0].split('=')[1]
        const laravel_session = cookie.find((el)=>el.match('laravelsession')).split(';')[0].split('=')[1]

        if(!xsrf_token && !laravel_session) return reject('No XSRF or Laravel cookie..')

        this.xsrf_token = xsrf_token
        this.laravel_session = laravel_session

        resolve()
    });

    getLoginToken = () => new Promise((resolve, reject) => {
        fetch('https://web.simple-mmo.com/login', {
            headers: header
        })
        .then(async(res) => {
            const header = await res.headers.raw()
            const body = await res.text()

            const cookie = header['set-cookie']

            const $ = cheerio.load(body)
            const token = $("input[type=hidden]").val()

            await this.setCookie(cookie)
            this.login_token = token

            resolve(token)
        })
        .catch((err)=>reject(err))
    });
    
    login = () => new Promise(async (resolve, reject) => {       

        if(!this.email && !this.password) reject("No email or password")
        
        await this.getLoginToken()
        
        fetch('https://web.simple-mmo.com/login', {
            method: 'POST',
            redirect : "manual",
            headers: {...header, 'Cookie': `XSRF-TOKEN=${this.xsrf_token}; laravelsession=${this.laravel_session}`,},
            body: new URLSearchParams({
                '_token': this.login_token,
                'email': this.email,
                'password': this.password,
                'remember': 'on'
            })
        })
        .then((res) => res.headers.raw())
        .then((res) => {
            const setCookie = res['set-cookie']

            const remember_web_key = setCookie.find((el)=>el.match('remember_web_')).split(';')[0].split('=')[0]
            const remember_web_value = setCookie.find((el)=>el.match('remember_web_')).split(';')[0].split('=')[1]

            this.remember_web_key = remember_web_key
            this.remember_web_value = remember_web_value

            resolve({remember_web_key : remember_web_value})
        })
        .catch((err) => reject(err))
    });

    logout = () => new Promise((resolve, reject) => {
        fetch('https://web.simple-mmo.com/logout', {
            headers: {...header, 'Cookie': `XSRF-TOKEN=${this.xsrf_token}; laravelsession=${this.laravel_session}; ${this.remember_web_key}=${this.remember_web_value}; d_h=true`}
        })
        .then((res)=>resolve())
        .catch((err)=>reject(err))
    });
}


export default SimpleMMO