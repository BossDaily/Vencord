import definePlugin from "@utils/types";

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
    // Delete these two below if you are only using code patches
    start() {},
    stop() {},
});