import { Bot } from "../../main";
import fs from "node:fs";
import { Button, Menu, Modal } from "../../types/types";

export default (client: Bot): Bot => {
	client.handleComponents = async () => {
		const componentFolder = fs.readdirSync("./dist/components");

		for (const componentTypeFolder of componentFolder) {
			const componentType = fs.readdirSync(
				`./dist/components/${componentTypeFolder}`
			);

			switch (componentTypeFolder) {
				case "buttons":
					for (const buttonSubfolders of componentType) {
						const buttonSubfolder = fs
							.readdirSync(
								`./dist/components/buttons/${buttonSubfolders}`
							)
							.filter((file) => !file.endsWith(".js.map"));

						for (const file of buttonSubfolder) {
							const button: Button = (
								await import(
									`../../components/buttons/${buttonSubfolders}/${file}`
								)
							).default as Button;

							client.buttons.set(button.id, button);
						}
					}
					break;
				case "menus":
					for (const menuSubfolders of componentType) {
						const menuSubfolder = fs
							.readdirSync(
								`./dist/components/menus/${menuSubfolders}`
							)
							.filter((file) => !file.endsWith(".js.map"));

						for (const file of menuSubfolder) {
							const menu: Menu = (
								await import(
									`../../components/menus/${menuSubfolders}/${file}`
								)
							).default as Menu;

							client.menus.set(menu.id, menu);
						}
					}
					break;
				case "modals":
					for (const modalSubfolders of componentType) {
						const modalSubfolder = fs
							.readdirSync(
								`./dist/components/modals/${modalSubfolders}`
							)
							.filter((file) => !file.endsWith(".js.map"));

						for (const file of modalSubfolder) {
							const modal: Modal = (
								await import(
									`../../components/modals/${modalSubfolders}/${file}`
								)
							).default as Modal;

							client.modals.set(modal.id, modal);
						}
					}
					break;
				default:
					break;
			}
		}
	};

	return client;
};
