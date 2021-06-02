import { Telegraf } from 'telegraf';
import Axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.IMBD_API_KEY;
const tgToken = process.env.BOT_TOKEN;
const bot = new Telegraf(tgToken);

const botGithubLink = "";

const startMessage = `
Welcome to IMDB Search Bot
This bot makes use of the IMDB database to work
For more information use /help command

Property of the Creator
Bot details can be found here:

`;

const errorMessage = `
Oops...........
An unexpected error occured
Please try again after sometime
`;

const helpMessage = `
You can search for movies, series and episodes using some simple commands

    /movie : for searching movies
    /series : for searching series
    /episode : for searching episodes

    Example:
    /movie inception
    /series dark
    /episode london

Note:
Only the top 5 results will be displayed.
Since this bot uses an unofficial IMDB api, there is a limit for api request
`;

bot.start((ctx) => {
    ctx.reply(startMessage);
});

bot.help((ctx) => {
    ctx.reply(helpMessage);
});

let sendFunction = ((ctx, command) => {
    let input = ctx.message.text.split(" ");

    if(input.length == 1)
    {
        ctx.reply(`
        Please enter a ${command} name to search the database
        `);
    }
    else
    {
        input.shift();
        input = input.join(" ");
        let url = `https://imdb-api.com/en/API/SearchSeries/${apiKey}/${input}`;
        Axios.get(url)
        .then(data => {
 
            let search = data["data"]["results"];
            if(search.length == 0)
            {
                ctx.reply(`Oops no such ${command}....\nIf you think the bot have made a mistake, please make sure the ${command} name is correct`);
            }
            else
            {
                let title, source, para;
                let chatId = ctx.message.chat.id;
                for(let i = 0; i < search.length; ++i)
                {
                    title = search[i]["title"];
                    source = search[i]["image"].replace("original", "300x500");
                    para = search[i]["description"];
                    bot.telegram.sendPhoto(
                        chatId, 
                        `${source}`, {
                        caption: `${title} ${para}`
                    });
                    
                    if(i >= 5)
                        break;
                }
            }
        })
        .catch(err => {
            ctx.reply(errorMessage);
        })
    }
});

bot.command("movie", (ctx) => {
    sendFunction(ctx, "movie");
});

bot.command("series", (ctx) => {
    sendFunction(ctx, "series");
});

bot.command("episode", (ctx) => {
    sendFunction(ctx, "episode");
});

bot.launch();