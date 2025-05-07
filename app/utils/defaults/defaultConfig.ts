import type {Config} from "~/types/config.types";
import {useUUID} from "~/composables/utility/useUUID";

export default function(): Config {
    return {
        presets: [
            {
                id: '0',
                name: 'StatuoTW Botmakie Preset',
                source: 'https://rentry.co/statuobotmakie#step-2-descriptionpersonality',
                fields: [
                    {fieldName: 'name', fieldType: 'input', fieldValue: ''},
                    {fieldName: 'personality', fieldType: 'tags', fieldValue: ''},
                    {fieldName: 'sex', fieldType: 'input', fieldValue: ''},
                    {fieldName: 'race', fieldType: 'input', fieldValue: ''},
                    {fieldName: 'body', fieldType: 'textarea', fieldValue: ''},
                    {fieldName: 'traits', fieldType: 'textarea', fieldValue: ''},
                    {fieldName: 'clothing style', fieldType: 'textarea', fieldValue: ''},
                    {fieldName: 'age', fieldType: 'input', fieldValue: ''},
                    {fieldName: 'skills', fieldType: 'textarea', fieldValue: ''},
                    {fieldName: 'spells', fieldType: 'textarea', fieldValue: ''},
                    {fieldName: 'home', fieldType: 'textarea', fieldValue: ''},
                    {fieldName: 'loves', fieldType: 'textarea', fieldValue: ''},
                    {fieldName: 'hates', fieldType: 'textarea', fieldValue: ''},
                    {fieldName: 'backstory', fieldType: 'textarea', fieldValue: ''},
                    {fieldName: 'goals', fieldType: 'input', fieldValue: ''},
                    {fieldName: 'speaking style', fieldType: 'input', fieldValue: ''},
                    {fieldName: 'quirks', fieldType: 'input', fieldValue: ''},
                ]
            }
        ],
        bufferHistory: [],
        version: 1,
    } satisfies Config
}