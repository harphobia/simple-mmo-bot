import Bot from './bin/Bot.js';
import func from './bin/GlobalFunc.js';

let count = 1;

(async()=>{
    const email = process.env.EMAIL || "step@hi2.in"
    const password = process.env.PASSWORD || "sikatmiring"
    
    const bot =await new Bot(email,password)
    try {
        await bot.login()
        const {username} = await bot.getCharStats()
        console.log(`[${func.timeNow()}] Loggin as ${username}`);

        while(true){
            
            await bot.setToken()
            await bot.getCharStats()
            const body = await bot.takeStep()
            const {heading,step_type,gold_amount,exp_amount,wait_length,text} = body

            if(!heading) return process.exit(0)

            if(heading == "You're dead."){
                const {type} = await bot.instantHeal()

                if(type ==  'error'){
                    console.log(`[-] [${func.timeNow()}] Delay 10 Minnutes for refill HP`);
                    await func.delayInSecond(60*10)    
                }

            }

            console.log(`[${count}] [${func.timeNow()}] Heading : ${heading} | Gold : ${gold_amount} | EXP : ${exp_amount} `);

            if(step_type){
                if(step_type == 'player'){
                    const playerId = text.split("'").find(el=>el.includes('/user/view')).split('/').at(-1)
                    const {result} = await bot.waveToPlayer(playerId)
                    console.log(`[-] [${func.timeNow()}] [Wave] ${result}`);
                }

                if(step_type == 'npc'){
                    const npcId = text.split("'").find(el=>el.match('/npcs/attack')).split('/').at(-1).split('?').at(0)
                    const {type,player_hp} = await bot.battleHandler(npcId)
                    console.log(`[-] [${func.timeNow()}] [Battle] Status : ${type} | HP : ${player_hp}`);
                }

                if(step_type == 'material'){
                    if(!text.includes('color:#c0392b')){
                        const materialId = text.split("'").find(el=>el.match('/crafting/material/gather')).split('?').at(0).split('/').at(-1)
                        const {type,playerExpGained} = await bot.gatherMaterial(materialId)
                        console.log(`[-] [${func.timeNow()}] [Material] Status : ${type} | EXP : ${playerExpGained}`);
                    }
                }
            }
            count++
            await func.delayInMilisecond(wait_length+func.randNumbBetween(2000,5000))
        }


    } catch (error) {
        console.log(error);
    }
    
})()