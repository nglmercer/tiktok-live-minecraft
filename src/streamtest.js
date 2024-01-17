import { WebcastPushConnection } from "tiktok-live-connector";
import http from 'http'; // Import http
import pkg from 'faye-websocket';
const FayeClient = pkg.Client;
import fs from 'fs';
const tiktokUsername = '@misterlobo_'; // replace with your TikTok username
const key = 'change_me'; // replace with your key
let ws = null; // Define ws here
import util from 'util';
const playername = 'melser';
let wson = false;
const connection = new WebcastPushConnection(tiktokUsername, {
    processInitialData: false,
    enableExtendedGiftInfo: true,
    enableWebsocketUpgrade: true,
    requestPollingIntervalMs: 2000,
    clientParams: {
        "app_language": "en-US",
        "device_platform": "web"
    },
    requestHeaders: {
        "headerName": "headerValue"
    },
    websocketHeaders: {
        "headerName": "headerValue"
    },
    requestOptions: {
        timeout: 10000
    },
    websocketOptions: {
        timeout: 10000
    }
});


function connectWebSocket() {
    const options = {
        host: 'localhost',
        port: 4567,
        path: '/v1/ws/console',
        headers: {
            'Cookie': `x-servertap-key=${key}`
        }
    };

    ws = new FayeClient(`ws://${options.host}:${options.port}${options.path}`, null, { headers: options.headers });

    ws.on('open', function open() {
        console.log('connected to websocket');
        wson = true;
        sendCommand(`/say Connected to roomId by ${tiktokUsername}`);
    });

    ws.on('error', function error(err) {
        console.log('Failed to connect to WebSocket', err);
    });

}

connection.connect().then(() => {
    console.info(`Connected to roomId by ${tiktokUsername}`);
    connectWebSocket();
}).catch(err => {
    console.error('Failed to connect to TikTok', err);
});
connection.on('streamEnd', (actionId) => {
    if (actionId === 3) {
        console.log('Stream ended by user');
    }
    if (actionId === 4) {
        console.log('Stream ended by platform moderator (ban)');
    }
})
connection.on('disconnected', () => {
    console.log('Disconnected :(');
    setTimeout(() => {
        connection.connect().catch(err => {
            console.error('Failed to reconnect to TikTok', err);
        });
    }, 5000); // wait for 5 seconds before attempting to reconnect
});
connection.on('chat', data => {
    console.log(`${data.uniqueId} : ${data.comment}`);

    // Add the message to the queue
    handleEvent('chat', data);
});

connection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) {
        // Streak in progress => show only temporarily
        console.log(`${data.uniqueId} is sending gift ${data.giftName} x${data.repeatCount}`);
    } else {
        // Streak ended or non-streakable gift => process the gift with final repeat_count
        console.log(`${data.uniqueId} has sent gift ${data.giftName} x${data.repeatCount}`);
    }

    handleEvent(`${data.uniqueId}:${data.giftName}x${data.repeatCount} `);
    handleEvent('gift', data);
});

connection.on('envelope', data => {
    handleEvent('envelope', data);
});

connection.on('subscribe', data => {
    handleEvent('subscribe', data);
});

connection.on('follow', data => {
    console.log(`${data.uniqueId} te sigue!`);
    handleEvent('follow', data);
});
connection.on('share', (data) => {
    console.log(`${data.uniqueId} compartio!`);
    handleEvent('share', data);
})
connection.on('member', data => {
    console.log(`welcome ${data.uniqueId}!`);
    handleEvent('welcome', data);
});
const keywordTogive = {
    'arena': 'minecraft:sand',
    'azúcar': 'minecraft:sugar',
    'azada': 'minecraft:wooden_hoe',
    'azada_diamante': 'minecraft:diamond_hoe',
    'azada_hierro': 'minecraft:iron_hoe',
    'azada_madera': 'minecraft:wooden_hoe',
    'azada_oro': 'minecraft:golden_hoe',
    'azada_piedra': 'minecraft:stone_hoe',
    'azúcar': 'minecraft:sugar',
    'azúcar_comestible': 'minecraft:cake',
    'azúcar_de_caña': 'minecraft:sugar_cane',
    'azúcar_de_calabaza': 'minecraft:pumpkin_seeds',
    'azúcar_de_melón': 'minecraft:melon_seeds',
    'azúcar_de_pasto': 'minecraft:wheat_seeds',
    'azúcar_de_trigo': 'minecraft:wheat_seeds',
    'azúcar_de_zanahoria': 'minecraft:carrot',
    'azúcar_de_patata': 'minecraft:potato',
    'azúcar_de_remolacha': 'minecraft:beetroot_seeds',
    'azúcar_de_cacao': 'minecraft:cocoa_beans',
    'azúcar_de_alga': 'minecraft:kelp',
    'bloque_de_carbón': 'minecraft:coal_block',
    'bloque_de_cuarzo': 'minecraft:quartz_block',
    'bloque_de_diamante': 'minecraft:diamond_block',
    'bloque_de_emerald': 'minecraft:emerald_block',
    'bloque_de_hierro': 'minecraft:iron_block',
    'bloque_de_lapislázuli': 'minecraft:lapis_block',
    'bloque_de_netherita': 'minecraft:netherite_block',
    'bloque_de_oro': 'minecraft:gold_block',
    'bloque_de_redstone': 'minecraft:redstone_block',
    'bloque_de_slime': 'minecraft:slime_block',
    'bloque_de_piedra': 'minecraft:stone',
    'bloque_de_obsidiana': 'minecraft:obsidian',
    'bloque_de_terracota': 'minecraft:terracotta',
    'bloque_de_vidrio': 'minecraft:glass',
    'bloque_de_vidrio_tintado': 'minecraft:stained_glass',
    'bloque_de_vidrio_tintado_negro': 'minecraft:black_stained_glass',
    'bloque_de_vidrio_tintado_azul': 'minecraft:blue_stained_glass',
    'bloque_de_vidrio_tintado_verde': 'minecraft:green_stained_glass',
    'bloque_de_vidrio_tintado_rojo': 'minecraft:red_stained_glass',
    'bloque_de_vidrio_tintado_blanco': 'minecraft:white_stained_glass',
    'bloque_de_vidrio_tintado_amarillo': 'minecraft:yellow_stained_glass',
    'bloque_de_vidrio_tintado_gris': 'minecraft:gray_stained_glass',
    'bloque_de_vidrio_tintado_cyan': 'minecraft:cyan_stained_glass',
    'bloque_de_vidrio_tintado_magenta': 'minecraft:magenta_stained_glass',
    'bloque_de_vidrio_tintado_naranja': 'minecraft:orange_stained_glass',
    'bloque_de_vidrio_tintado_rosa': 'minecraft:pink_stained_glass',
    'bloque_de_vidrio_tintado_violeta': 'minecraft:purple_stained_glass',
    'bloque_de_vidrio_tintado_marrón': 'minecraft:brown_stained_glass',
    'bloque_de_vidrio_tintado_lima': 'minecraft:lime_stained_glass',
    'bloque_de_vidrio_tintado_claro': 'minecraft:light_gray_stained_glass',
    'bloque_de_vidrio_tintado_turquesa': 'minecraft:light_blue_stained_glass',
    'carbón': 'minecraft:coal',
    'carbón_de_madera': 'minecraft:charcoal',
    'carne': 'minecraft:beef',
    'carne_cocida': 'minecraft:cooked_beef',
    'carne_de_cerdo': 'minecraft:porkchop',
    'carne_de_cerdo_cocida': 'minecraft:cooked_porkchop',
    'carne_de_conejo': 'minecraft:rabbit',
    'carne_de_conejo_cocida': 'minecraft:cooked_rabbit',
    'carne_de_pollo': 'minecraft:chicken',
    'carne_de_pollo_cocida': 'minecraft:cooked_chicken',
    'carne_de_venado': 'minecraft:deer',
    'carne_de_venado_cocida': 'minecraft:cooked_deer',
    'caña_de_azúcar': 'minecraft:sugar_cane',
    'caña_de_bambú': 'minecraft:bamboo',
    'caña_de_pescar': 'minecraft:fishing_rod',
    'ceniza': 'minecraft:ashes',
    'cobre': 'minecraft:copper_ingot',
    'cobre_puro': 'minecraft:raw_copper_block',
    'cono_de_resina': 'minecraft:resin',
    'crema_de_magma': 'minecraft:magma_cream',
    'crisálida': 'minecraft:chorus_fruit',
    'cristal': 'minecraft:crystal',
    'cristal_de_amatista': 'minecraft:amethyst_crystal',
    'cristal_de_hielo': 'minecraft:packed_ice',
    'cristal_del_end': 'minecraft:end_crystal',
    'cristal_del_end_destruido': 'minecraft:dragon_breath',
    'cristal_del_nether': 'minecraft:nether_quartz',
    'cristal_del_nether_pulido': 'minecraft:polished_nether_quartz',
    'cristal_del_nether_bruto': 'minecraft:raw_nether_quartz',
    'cristal_del_nether_bruto_pulido': 'minecraft:polished_raw_nether_quartz',
    'cuarzo': 'minecraft:quartz',
    'cuenco': 'minecraft:bowl',
    'cuerda': 'minecraft:string',
    'cuerda_de_arco': 'minecraft:bow',
    'cuerda_de_redstone': 'minecraft:redstone',
    'cuerda_de_redstone_glow': 'minecraft:glowstone_dust',
    'cuerda_de_redstone_luz_de_mar': 'minecraft:sea_lantern',
    'cuerda_de_redstone_piedra_luminosa': 'minecraft:stone_luminite',
    'cuerda_de_redstone_antorcha_de_redstone': 'minecraft:redstone_torch',
    'diamante': 'minecraft:diamond',
    'diamante_bruto': 'minecraft:raw_diamond',
    'dorada': 'minecraft:gold_ingot',
    'dorada_bruta': 'minecraft:raw_gold',
    'dorada_del_nether': 'minecraft:nether_gold_ingot',
    'dorada_del_nether_bruta': 'minecraft:raw_nether_gold',
    'dorada_del_end': 'minecraft:end_gold_ingot',
    'dorada_del_end_bruta': 'minecraft:raw_end_gold',
    'dorada_del_rio': 'minecraft:river_gold_ingot',
    'dorada_del_rio_bruta': 'minecraft:raw_river_gold',
    'dorada_del_mar': 'minecraft:ocean_gold_ingot',
    'dorada_del_mar_bruta': 'minecraft:raw_ocean_gold',
    'dorada_del_cielo': 'minecraft:sky_gold_ingot',
    'dorada_del_cielo_bruta': 'minecraft:raw_sky_gold',
    'dorada_del_infierno': 'minecraft:hell_gold_ingot',
    'dorada_del_infierno_bruta': 'minecraft:raw_hell_gold',
    'dorada_del_espacio': 'minecraft:space_gold_ingot',
    'dorada_del_espacio_bruta': 'minecraft:raw_space_gold',
    'ender_perla': 'minecraft:ender_pearl',
    'ender_ojo': 'minecraft:ender_eye',
    'esmeralda': 'minecraft:emerald',
    'esmeralda_bruta': 'minecraft:raw_emerald',
    'enredadera': 'minecraft:vine',
    'escama_de_dragón': 'minecraft:dragon_scale',
    'escayola': 'minecraft:plaster',
    'escayola_blanca': 'minecraft:white_plaster',
    'escayola_naranja': 'minecraft:orange_plaster',
    'escayola_magenta': 'minecraft:magenta_plaster',
    'escayola_luz_azul': 'minecraft:light_blue_plaster',
    'escayola_amarilla': 'minecraft:yellow_plaster',
    'escayola_lima': 'minecraft:lime_plaster',
    'escayola_rosa': 'minecraft:pink_plaster',
    'escayola_gris': 'minecraft:gray_plaster',
    'escayola_luz_gris': 'minecraft:light_gray_plaster',
    'escayola_cian': 'minecraft:cyan_plaster',
    'escayola_purpura': 'minecraft:purple_plaster',
    'escayola_azul': 'minecraft:blue_plaster',
    'escayola_marron': 'minecraft:brown_plaster',
    'escayola_verde': 'minecraft:green_plaster',
    'escayola_roja': 'minecraft:red_plaster',
    'escayola_negra': 'minecraft:black_plaster',
    'flecha': 'minecraft:arrow',
    'flecha_fuego': 'minecraft:tipped_arrow',
    'flecha_perforadora': 'minecraft:pointed_dripstone_arrow',
    'flecha_espectral': 'minecraft:spectral_arrow',
    'flecha_del_end': 'minecraft:end_arrow',
    'flecha_del_nether': 'minecraft:nether_arrow',
    'fuego': 'minecraft:fire',
    'gato': 'minecraft:cat_spawn_egg',
    'goma': 'minecraft:slime_ball',
    'globo': 'minecraft:balloon',
    'galleta': 'minecraft:cookie',
    'huevo': 'minecraft:egg',
    'hormiga': 'minecraft:ant_spawn_egg',
    'hueso': 'minecraft:bone',
    'hacha': 'minecraft:axe',
    'hierro': 'minecraft:iron_ingot',
    'harina': 'minecraft:flour',
    'jaula': 'minecraft:cage',
    'jamon': 'minecraft:ham',
    'jardín': 'minecraft:garden',
    'kelp': 'minecraft:kelp',
    'koi': 'minecraft:koi_spawn_egg',
    'lana': 'minecraft:wool',
    'lapislázuli': 'minecraft:lapis_lazuli',
    'libro': 'minecraft:book',
    'linterna': 'minecraft:lantern',
    'leche': 'minecraft:milk_bucket',
    'manzana': 'minecraft:apple',
    'melón': 'minecraft:melon',
    'nabo': 'minecraft:beetroot',
    'nugget': 'minecraft:nugget',
    'nuez': 'minecraft:acorn',
    'berries': 'minecraft:sweet_berries',
    'llama': 'minecraft:llama_spawn_egg',
    'oro': 'minecraft:gold_ingot',
    'roca': 'minecraft:stone',
    'ramita': 'minecraft:stick',
    'ramo': 'minecraft:bouquet',
    'sal': 'minecraft:salt',
    'semilla': 'minecraft:seed',
    'tierra': 'minecraft:dirt',
    'tinta': 'minecraft:ink_sac',
    'uva': 'minecraft:grape',
    'vaca': 'minecraft:cow_spawn_egg',
    'zanahoria': 'minecraft:carrot',
    'zapato': 'minecraft:shoe',
    'zorro': 'minecraft:fox_spawn_egg',
    'resina': 'minecraft:resin',
    'magma': 'minecraft:magma_cream',
    'chorus': 'minecraft:chorus_fruit',
    'amatista': 'minecraft:amethyst_crystal',
    'hielo': 'minecraft:packed_ice',
    'end': 'minecraft:end_crystal',
    'nether': 'minecraft:nether_quartz',
    'nether_pulido': 'minecraft:polished_nether_quartz',
    'nether_bruto': 'minecraft:raw_nether_quartz',
    'nether_bruto_pulido': 'minecraft:polished_raw_nether_quartz',
    'cuarzo': 'minecraft:quartz',
    'hueso': 'minecraft:bone',
    'lana': 'minecraft:wool',
    'lapis': 'minecraft:lapis_lazuli',
    'libro': 'minecraft:book',
    'lanterna': 'minecraft:lantern',
    'leche': 'minecraft:milk_bucket',
    'nuez': 'minecraft:acorn',
    'berries': 'minecraft:sweet_berries',
    'roca': 'minecraft:stone',
    'semilla': 'minecraft:seed',
    'tierra': 'minecraft:dirt',
    'tinta': 'minecraft:ink_sac'
};
const keywordTomob = {
    'enderman': 'minecraft:enderman',
    'pig': 'minecraft:pig',
    'enderman': 'minecraft:enderman',
    'pig': 'minecraft:pig',
    'sheep': 'minecraft:sheep',
    'cow': 'minecraft:cow',
    'chicken': 'minecraft:chicken',
    'rabbit': 'minecraft:rabbit',
    'horse': 'minecraft:horse',
    'donkey': 'minecraft:donkey',
    'mule': 'minecraft:mule',
    'bat': 'minecraft:bat',
    'parrot': 'minecraft:parrot',
    'villager': 'minecraft:villager',
    'iron_golem': 'minecraft:iron_golem',
    'snow_golem': 'minecraft:snow_golem',
    'bee': 'minecraft:bee',
    'cat': 'minecraft:cat',
    'dog': 'minecraft:dog',
    'fox': 'minecraft:fox',
    'panda': 'minecraft:panda',
    'polar_bear': 'minecraft:polar_bear',
    'turtle': 'minecraft:turtle',
    'dolphin': 'minecraft:dolphin',
    'llama': 'minecraft:llama',
    'wolf': 'minecraft:wolf',
    'mooshroom': 'minecraft:mooshroom'
};


function handleEvent(eventType, data) {
    const commandList = JSON.parse(fs.readFileSync('commandList.json', 'utf8'));
    let commands = [];

    if (commandList[eventType]) {
        let eventCommands = commandList[eventType];
        if (!Array.isArray(eventCommands)) {
            console.error(`eventCommands for ${eventType} is not an array`);
            return;
        }
        eventCommands.forEach(command => {
            let replacedCommand = command.replace('{uniqueId}', data.uniqueId || '')
                .replace('{comment}', data.comment || '')
                .replace('{message}', data.comment || '')
                .replace('{giftName}', data.giftName || '')
                .replace('{repeatCount}', data.repeatCount || '')
                .replace('{playername}', commandList.playername || '');

            // Si el comando es para dar un artículo y el comentario contiene una palabra clave válida, reemplaza {item} con el artículo correspondiente
            if (command.includes('give {playername} {item}') && keywordTogive[data.comment]) {
                replacedCommand = replacedCommand.replace('{item}', keywordTogive[data.comment]);
            }

            // Si el comando es para invocar un mob y el comentario contiene una palabra clave válida, reemplaza {mob} con el mob correspondiente
            if (command.includes('summon {mob}') && keywordTomob[data.comment]) {
                replacedCommand = replacedCommand.replace('{mob}', keywordTomob[data.comment]);
            }

            commands.push(replacedCommand);
        });
        for (const command of commands) {
            sendCommand(command);
        }

        commandList[`last${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`] = data.uniqueId;
        fs.writeFileSync('commandList.json', JSON.stringify(commandList, null, 2));

        // Display the last values in the action bar
        let delay = 0;
        let previousValues = {};

        for (const [key, value] of Object.entries(commandList.scoreboard)) {
            let objectiveName = key;
            let playerName = value;

            // Only process the value for the current event type
            if (objectiveName !== `last${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`) {
                continue;
            }

            // Only display the objective in the action bar if it's not empty, has changed, and is less than 40 characters
            if (playerName && (!previousValues[objectiveName] || previousValues[objectiveName] !== playerName) && playerName.length <= 40) {
                // Display the objective in the action bar with a delay
                setTimeout(() => {
                    sendCommand(`/title @a actionbar [{"text":"${objectiveName}: "}, {"text":"${playerName}"}]`);
                }, delay);

                // Increase the delay by 2 seconds for the next message
                delay += 100;
            }

            // Update the previous value for this objective
            previousValues[objectiveName] = playerName;
        }
    }
}

async function sendCommand(command) {
    if (command === null) {
        return;
    }
    if (!wson) { // Check if wson is false
        console.log('no conectado');
    }
    try {
        ws.send(command);
    } catch (error) {
        console.error('Error command:', error);
    }
}