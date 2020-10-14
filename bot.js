const Discord = require('discord.js');
const auth = require('./auth.json');
const fs = require('fs');

var SBs = [];
var voiceChat = null;
var voiceConnection = null;
var dispatcher = null;
var status = true;

var bot = new Discord.Client();
bot.login(auth.token)

bot.once('ready', function (evt) {
    console.log('Connected');
});

bot.once('reconnecting', () => {
    console.log('Reconnecting!');
});

bot.once('disconnect', () => {
    console.log('Disconnect!');
});

function loadSBs(){
    var rawdata = fs.readFileSync(auth.sbsStorage);
    SBs = JSON.parse(rawdata);
}

function saveSBs(){
    fs.writeFile("sbs.json", JSON.stringify(SBs), (err) => {
        if (err) {
            console.log(err);
        }
    });
}

function checkPrefix(content, prefix=null){
    if(prefix === null){
        if(content.substring(0,3) === auth.prefix){
            return true;
        } else {
            return false;
        }
    } else {
        if(content.substring(0,prefix.length) === prefix){
            return true;
        } else {
            return false;
        }
    }
}

function joinVoiceChat(message){
    voiceChat = message.member.voice.channel;
    const permissions = voiceChat.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        message.channel.send('I need the permissions to join and speak in your voice channel!');
        return
    }
    voiceChat.join()
        .then(connection => {
            voiceConnection = connection;
        })
        .catch(e => {
            console.log(e)
        })
}

function leaveVoiceChat(){
    voiceChat.leave()
    voiceChat = null
    voiceConnection = null
}

function AddToSoundBoard(user, attachment, control){
    if(SBs[user.id]){
        SBs[user.id][control] = attachment.proxyURL;
    }else{
        SBs[user.id] = {
            [control]: attachment.proxyURL
        };
    }
    saveSBs();
}

bot.on('message', async message => {
    if(message.author.bot) return;

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}die`)) {
        message.channel.send("Bye bitch")
            .then(() => {
                bot.destroy()
            })
            .catch(e => {
                console.log(e)
            })
        return;
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}isma`)) {
        loadSBs();
        message.channel.send("Itfaha naqa PuNk!")
            .then(() => {        
                joinVoiceChat(message);
            })
            .catch(e => {
                console.log(e)
            })
        return;
    }

    if(voiceChat != null){
        if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}caw`)) {
            message.channel.send("Caw PuNk!")
                .then(() => {        
                    leaveVoiceChat();
                })
                .catch(e => {
                    console.log(e)
                })
        }

        if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}save`)){
            if(message.attachments === undefined || message.attachments.size === 0){
                return
            } else {
                var args = message.content.split(" ")
                if(args[1].length > 1){
                    message.channel.send("Ghazel buttuna wahda ghal soundboard bro.");
                    return;
                }else{
                    message.attachments.map(attachment => {
                        if(attachment.name.includes(".wav") || attachment.name.includes(".mp3")){
                            AddToSoundBoard(message.author,attachment, args[1]);
                        } else {
                            return;
                        }
                    })
                }
            }
        
        } 

        if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}help`)) {
            message.channel.send(
                "\nIsma naqa kemm jien semplici: \n\n" +
                "Kulhadd ghandi s-soundbored tieghu, igiefiri tipruvax tuza xoghol haddiehor."+
                "\t\t- Jekk trid nibda nghati kas, faqqa 'sb!isma'. \n" +
                "\t\t- Jekk trid nieqaf nghati kas, faqqa 'sb!caw'. U grazzi xorta. \n" +
                "\t\t- Jekk trid izzid xi haga gos-soundbored tieghek, kemm itella .mp3 jew .wav u tikteb 'sb!save *character*'. Character il-haga li trid tafas biex idoqq dak l-imbarazz. \n" +     
                "K'ma jahdiemx xi haga, wahlu f'John.")
            return ;
        }
    }  
})