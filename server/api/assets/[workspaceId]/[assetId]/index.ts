import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineEventHandler, getRouterParam, createError, setResponseHeader } from 'h3';
import {useServerUtilities} from "~~/server/utils/useServerUtilities";

export default defineEventHandler(async (event) => {
    const $util = useServerUtilities()

    try {
        const workspaceId = getRouterParam(event, "workspaceId") || '';
        const assetId = getRouterParam(event, "assetId") || '';
        const BUFFER_FOLDER = "workspace_buffer";
        const ASSETS_FOLDER = "assets";
        const APP_ID = 'dev.ctrl-neo.simple-card-maker'

        // Construct paths
        const appDataDir = $util.getAppDataPath(APP_ID);
        const assetsFolderPath = path.join(appDataDir, BUFFER_FOLDER, workspaceId, ASSETS_FOLDER);
        const assetBasePath = path.join(assetsFolderPath, assetId);

        // console.log('Looking for assets in:', assetsFolderPath);
        // console.log('Asset base path:', assetBasePath);

        // Check if assets folder exists
        try {
            await fs.access(assetsFolderPath);
            // console.log('Assets folder exists');
        } catch (err) {
            console.error('Assets folder access error:', err);
            return createError({
                statusCode: 404,
                statusMessage: "Assets folder not found",
            });
        }

        // Check for existing image files
        const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
        let existingPath = '';

        for (const ext of extensions) {
            const testPath = `${assetBasePath}${ext}`;
            // console.log('Checking path:', testPath);

            try {
                await fs.access(testPath);
                existingPath = testPath;
                // console.log('Found asset at:', existingPath);
                break;
            } catch (err) {
                // console.log('Not found:', testPath);
                continue;
            }
        }

        if (!existingPath) {
            // console.error('No matching asset found with any extension');
            return createError({
                statusCode: 404,
                statusMessage: "Asset not found",
            });
        }

        // Read the found file
        const fileData = await fs.readFile(existingPath);
        // console.log('Successfully read file, size:', fileData.length);

        // Determine content type
        let contentType = 'application/octet-stream';
        if (existingPath.endsWith('.png')) contentType = 'image/png';
        else if (existingPath.endsWith('.jpg') || existingPath.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (existingPath.endsWith('.gif')) contentType = 'image/gif';
        else if (existingPath.endsWith('.webp')) contentType = 'image/webp';

        // Set headers
        setResponseHeader(event, 'Content-Type', contentType);
        setResponseHeader(event, 'Content-Length', fileData.length);
        setResponseHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate');
        setResponseHeader(event, 'Pragma', 'no-cache');
        setResponseHeader(event, 'Expires', '0');

        return fileData;
    } catch (e) {
        console.error('Unexpected error:', e);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Server Error",
        });
    }
});