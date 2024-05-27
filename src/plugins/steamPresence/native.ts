/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export async function queryProfile (_, steamId: string) {
    return await fetch(`https://steamcommunity.com/miniprofile/${steamId}/json`)
        .then(response => response.json());
}
