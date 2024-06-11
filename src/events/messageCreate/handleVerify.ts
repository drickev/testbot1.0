import { AttachmentBuilder, EmbedBuilder, type Message } from 'discord.js';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import axios, { all } from 'axios';
import config from '../../config';

export default async function (message: Message<true>) {
	if (message.author.bot) return;
	if (message.attachments.size > 0) {
		const worker = await createWorker('eng');

		await Promise.all(
			message.attachments.map(async (attachment) => {
				const msg = await message.reply({
					content: 'Processing image...',
				});

				const fileBuffer = await axios.get<ArrayBuffer>(
					attachment.url,
					{
						responseType: 'arraybuffer',
					}
				);

				const image = await sharp(fileBuffer.data)
					.extract({ left: 1108, top: 463, width: 374, height: 71 })
					.toBuffer();

				const {
					data: { text },
				} = await worker.recognize(image);

				for (const alliance of config.ALLIANCE_LIST) {
					if (alliance.name === text.trim()) {
                        const user = message.guild.members.cache.get(message.author.id);

						await user?.roles.add(alliance.role_id);
						await msg.edit({
							content: '',
							embeds: [
								new EmbedBuilder()
									.setDescription('You have been verified!')
									.setTitle('Alliance Verify')
									.setImage(
										message.client.user.avatarDecorationURL()
									)
									.setFooter({
										iconURL:
											message.author.displayAvatarURL(),
										text: `Requested by ${message.author.displayName}`,
									}),
							],
						});
						break;
					}
				}
			})
		);

		await worker.terminate();
	}
}
