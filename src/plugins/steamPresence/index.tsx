import definePlugin from "@utils/types";

export default definePlugin({
    name: "Test",
    description: "This plugin is absolutely epic",
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