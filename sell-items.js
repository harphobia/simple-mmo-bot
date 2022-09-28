import Bot from './lib/Bot.js';
import func from './lib/GlobalFunc.js';

(async()=>{
    const email = process.env.EMAIL
    const password = process.env.PASSWORD
    const bot =await new Bot(email,password)
    
    try {
        await bot.login()
        const {username} = await bot.getCharStats()
        console.log(`[${func.timeNow()}] Loggin as ${username}`);

        for(let i =1 ; i<=20; i++){

            console.log(`get item page ${i}`);
            const itemList = await bot.getDowngradeItems(i)

            console.log(`found items : ${itemList.length}`);
            if(itemList.length > 0){
                const data = await bot.sellItemsToNpc(itemList)
                console.log(data);
            }

            await func.delayInSecond(5);
        }

    } catch (error) {
        console.log(error);
    }
    
})()