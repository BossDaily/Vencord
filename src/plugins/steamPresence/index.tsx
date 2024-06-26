/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2024 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { ApplicationAssetUtils, FluxDispatcher } from "@webpack/common";






interface ActivityAssets {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
}

interface Activity {
    state: string;
    details?: string;
    timestamps?: {
        start?: number;
    };
    assets?: ActivityAssets;
    buttons?: Array<string>;
    name: string;
    application_id: string;
    metadata?: {
        button_urls?: Array<string>;
    };
    type: number;
    flags: number;
}

// only relevant enum values
const enum ActivityType {
    PLAYING = 0
}

const enum ActivityFlag {
    INSTANCE = 1 << 0,
}

const logger = new Logger("SteamPresence");

async function getApplicationAsset(key: string): Promise<string> {
    if (/https?:\/\/(cdn|media)\.discordapp\.(com|net)\/attachments\//.test(key)) return "mp:" + key.replace(/https?:\/\/(cdn|media)\.discordapp\.(com|net)\//, "");
    return (await ApplicationAssetUtils.fetchAssetIds(settings.store.appID!, [key]))[0];
}

const settings = definePluginSettings({
    appID: {
        type: OptionType.STRING,
        description: "Application ID (required)",
        isValid: (value: string) => {
            if (!value) return "Application ID is required.";
            if (value && !/^\d+$/.test(value)) return "Application ID must be a number.";
            return true;
        }
    },
    steamId: {
        type: OptionType.STRING,
        description: "API Key (required)",
        isValid: (value: string) => {
            if (!value) return "Steam ID is required.";
            if (value && !/^\d+$/.test(value)) return "SteamId must be a number.";
            return true;
        }
    },
});

async function createActivity(): Promise<Activity | undefined> {
    const {
        appID,
        steamId
    } = settings.store;

    if (!steamId) return;
    const Native = VencordNative.pluginHelpers.SteamPresence as PluginNative<typeof import("./native")>;


    const data = await Native.queryProfile(steamId);
    logger.info(data);
    const game = data.in_game;
    if (!game) return;

    const url = game.logo;
    const regex = /\/steam\/apps\/(\d+)\//;
    const match = url.match(regex);

    const gameId = match ? match[1] : null;

    const appName = game.name;
    const state = game.rich_presence;
    const type = ActivityType.PLAYING;
    const icon = `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/hero_capsule.jpg`;
    logger.info(icon);

    const activity: Activity = {
        application_id: appID || "0",
        name: appName,
        state,
        type,
        assets: {
            large_image: await getApplicationAsset(icon),
            large_text: appName,
        },
        flags: 1 << 0,
    };



    for (const k in activity) {
        if (k === "type") continue;
        const v = activity[k];
        if (!v || v.length === 0)
            delete activity[k];
    }

    return activity;
}

function setActivity(activity: Activity | null) {
    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity,
        socketId: "SteamPresence",
    });
}

export default definePlugin({
    name: "SteamPresence",
    description: "This allows you to sync your Discord rich presence with your steam rich presence.",
    authors: [
        {
            id: 12345n,
            name: "BossDaily",
        },
    ],
    patches: [],
    settings,
    // Delete these two below if you are only using code patches
    start() {
        this.update = setInterval(async () => {
            const activity = await createActivity();
            setActivity(activity!);
        }, 10000);
    },
    stop() { clearInterval(this.update); },
});
