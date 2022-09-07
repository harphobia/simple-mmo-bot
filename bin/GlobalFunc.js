import moment from 'moment';

class GlobalFunc {
    timeNow = () => {
        return moment().format('HH:mm:ss')
    }

    randNumbBetween = (min,max) => {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    delayInMilisecond = (ms) => new Promise((resolve, _) => {
        // console.log(`[${this.timeNow()}] [Delay] Delay for ${ms/1000} seconds...`);
        setTimeout(()=>{
            resolve()
        },ms)
    });

    delayInSecond = (s) => new Promise((resolve, _) => {
        // console.log(`[${this.timeNow()}] [Delay] Delay for ${s} seconds...`);
        setTimeout(()=>{
            resolve()
        },s*1000)
    });
}

export default new GlobalFunc()