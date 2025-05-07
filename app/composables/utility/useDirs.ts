import {exists, mkdir} from "@tauri-apps/plugin-fs";
import {BaseDirectory} from "@tauri-apps/api/path";

export function useDirs() {
    async function initDirs() {
        if(!(await exists('', {baseDir: BaseDirectory.AppData})))
            await mkdir('', {baseDir: BaseDirectory.AppData})

        if(!(await exists('', {baseDir: BaseDirectory.AppConfig})))
            await mkdir('', {baseDir: BaseDirectory.AppConfig})
    }

    return {
        initDirs
    }
}