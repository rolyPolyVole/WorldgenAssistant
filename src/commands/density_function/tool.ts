import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command, ToolType } from "../../types/types";
import messageData from "../../tasks/embeds/commands/dfeditor";


export default {
    data: new SlashCommandBuilder()
        .setName("tool")
        .setDescription("Use a worldgen utility tool")
        .addStringOption(option => 
            option
                .setName("tool")
                .setDescription("The tool you would like to use")
                .setRequired(true)
                .setChoices(
                    {
                        name: "Density Function Editor",
                        value: ToolType.DENSITY_FUNCTION_EDITOR
                    },
                    {
                        name: "Spline Viewer/Analyzer",
                        value: ToolType.SPLINE_EDITOR
                    },
                    {
                        name: "Noise Editor/Analyzer",
                        value: ToolType.NOISE_EDITOR
                    },
                    {
                        name: "Hex Colour Utility",
                        value: ToolType.HEX_UTIL
                    },
                )
        ),
    async execute(interaction, client) {

        switch (interaction.options.getString("tool")) {
            case ToolType.DENSITY_FUNCTION_EDITOR:
                const embed = messageData.embed.run(interaction, client);
                const buttons = messageData.button.run(interaction, client);
                
                await interaction.reply({
                    embeds: embed as EmbedBuilder[],
                    components: [new ActionRowBuilder<ButtonBuilder>().setComponents(...buttons as ButtonBuilder[])]
                });
                break;
            default:
                return;
        }
    },
} as Command;