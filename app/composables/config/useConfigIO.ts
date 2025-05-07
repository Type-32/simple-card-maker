import {BaseDirectory, exists, mkdir, readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";
import defaultConfig from "~/utils/defaults/defaultConfig";
import type {Config} from "~/types/config.types";
import {useDirs} from "~/composables/utility/useDirs";

export function useConfigIO() {
    const CONFIG_FILE = "scm.config.json"

    async function loadOrCreateConfig() {
        await useDirs().initDirs()

        if (await exists(CONFIG_FILE, {baseDir: BaseDirectory.AppConfig})) {
            return JSON.parse(await readTextFile(CONFIG_FILE, {baseDir: BaseDirectory.AppConfig})) as Config
        } else {
            const config = defaultConfig()
            await writeToConfig(config)

            return config
        }
    }

    async function writeToConfig(config: Config) {
        await writeTextFile(CONFIG_FILE, JSON.stringify(config), {baseDir: BaseDirectory.AppConfig})
    }

    async function resetConfig() {
        await writeToConfig(defaultConfig())
    }

    return {
        loadOrCreateConfig,
        writeToConfig,
        resetConfig
    }
}