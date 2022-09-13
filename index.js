import {Worker} from 'worker_threads';

const stepBot = new Worker('./step-bot.js')

stepBot.on('message',(msg)=>{
    console.error(msg)
})

stepBot.on('error',(err)=>{
    console.error(err)
})

stepBot.on('exit',()=>{
    process.exit(0)
})