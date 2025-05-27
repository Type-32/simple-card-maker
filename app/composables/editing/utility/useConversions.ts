import type {WorkspaceCard} from "~/types/maker.types";
import type {TavernCardV2} from "~/types/tavern.types";
import defaultWorkspaceCard from "~/utils/defaults/defaultWorkspaceCard";
import defaultTavernCard from "~/utils/defaults/defaultTavernCard";
import {useWorkspace} from "~/composables/workspace/useWorkspace";

export function useConversions() {

    function convertWorkspaceCardToV2Card (card: WorkspaceCard): TavernCardV2 {
        const defaultedCard = defaultWorkspaceCard(card)
        const tavernCard = defaultTavernCard(defaultedCard.card)
        let descriptionString = tavernCard.data.description
        let exampleMessagesString = tavernCard.data.mes_example || ""

        if (defaultedCard.data.propertiesFormat && defaultedCard.data.descFields.length > 0) {
            let propertiesString = "["
            defaultedCard.data.descFields.forEach((value, index, array) => {
                if (value.fieldType == 'tags') {
                    let tagsString = ""
                    const tags = value.fieldValue as string[]
                    tags.forEach((tag, tagind, tagarr) => {
                        tagsString += tagarr.length - 1 >= tagind ? tag : `${tag}, `
                    })
                    propertiesString += `{{char}} ${value.fieldName}(${tagsString})`
                } else {
                    propertiesString += `{{char}} ${value.fieldName}(${value.fieldValue})`
                }

                if (!(index >= array.length - 1)) propertiesString += '\n'
            })
            descriptionString = propertiesString + "]"
        }

        if (defaultedCard.data.exampleMessages.length > 0) {
            defaultedCard.data.exampleMessages.forEach((value) => {
                exampleMessagesString += `<START>\n${value}\n<START>\n`
            })
        }

        if (defaultedCard.data.linkedLorebook) {
            tavernCard.data.character_book = useWorkspace().getLorebook(defaultedCard.data.linkedLorebook)?.book
            console.log(tavernCard.data.character_book)
        }

        tavernCard.data.description = descriptionString
        tavernCard.data.mes_example = exampleMessagesString

        return tavernCard
    }

    return {
        convertWorkspaceCardToV2Card
    }
}