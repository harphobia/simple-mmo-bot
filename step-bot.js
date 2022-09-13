import Bot from './bin/Bot.js';
import func from './bin/GlobalFunc.js';
import chalk from 'chalk';
import {parentPort} from 'worker_threads';

const workerId = process.pid;
parentPort.postMessage(`[Worker] Worker ${workerId} ready on duty!`);

(async()=>{
    const email = process.env.EMAIL
    const password = process.env.PASSWORD
    const bot =await new Bot(email,password)
    
    try {
        await bot.login()
        const {username} = await bot.getCharStats()
        console.log(`[${workerId}] [${func.timeNow()}] Loggin as ${username}`);

        while(true){
            
            await bot.setToken()
            await bot.getCharStats()
            const body = await bot.takeStep()
            const {heading,step_type,gold_amount,exp_amount,wait_length,text} = body

            if(!heading) return process.exit(0)

            if(heading == "You're dead."){
                const {type} = await bot.instantHeal()

                if(type ==  'error'){
                    console.log(`[${workerId}] [${func.timeNow()}] Delay 10 Minnutes for refill HP`);
                    await func.delayInSecond(60*10)    
                }

            }

            console.log(`[${workerId}] [${func.timeNow()}] Heading : ${heading} | Gold : ${chalk.yellow(gold_amount)} | EXP : ${chalk.cyan(exp_amount)} `);

            if(step_type){
                if(step_type == 'player'){
                    const playerId = text.split("'").find(el=>el.includes('/user/view')).split('/').at(-1)
                    const {type} = await bot.waveToPlayer(playerId)
                    console.log(`[${workerId}] [${func.timeNow()}] [Wave] ${type == "success" ? chalk.bgGreen(type) : chalk.bgRed(type)}`);
                }

                if(step_type == 'npc'){
                    const npcId = text.split("'").find(el=>el.match('/npcs/attack')).split('/').at(-1).split('?').at(0)
                    const {type,player_hp} = await bot.battleHandler(npcId)
                    console.log(`[${workerId}] [${func.timeNow()}] [Battle] Status : ${type == "success" ? chalk.bgGreen(type) : chalk.bgRed(type)}`);
                }

                if(step_type == 'material'){
                    if(!text.includes('color:#c0392b')){
                        const materialId = text.split("'").find(el=>el.match('/crafting/material/gather')).split('?').at(0).split('/').at(-1)
                        const {type,playerExpGained} = await bot.gatherHandler(materialId)
                        console.log(`[${workerId}] [${func.timeNow()}] [Material] Status : ${type == "success" ? chalk.bgGreen(type) : chalk.bgRed(type)} | EXP : ${chalk.cyan(playerExpGained)}`);
                    }
                }
            }
            await func.delayInMilisecond(wait_length+func.randNumbBetween(2000,5000))
        }

    } catch (error) {
        console.log(error);
    }
    
})()