/*
	Токен от TELEGRAM бота
*/
const TOKEN = '';

/* */
const fs = require('fs'), path = require('path'), telegram = new (require('node-telegram-bot-api'))(TOKEN, { polling: true });

/* */
let users = {};

/* */
telegram.on('polling_error', (error) => {
	console.log(error);
});

/* */
telegram.onText(/\/start/, ( message ) => {
	/* */
	users[String(message.chat.id)] = {
		chat: message.chat,
		scene: 1,
		submit_an_application: false,
		
		come: {
			type: null,
			description: null
		},

		experience: null,
		time: null,
	};

	/* */
	let description = '🤠 Приветствую, ' + message.chat.first_name + ' ' + message.chat.last_name + '!\n\n';
	description += 'Мы оба прекрасно знаем зачем ты здесь. 😏\nНажимай `➕ Подать заявку` 👇';

	/* */
	telegram.sendMessage(message.chat.id, description, {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: '➕ Подать заявку',
						callback_data: 'submit_an_application'
					}
				]
			]
		}
	});
});

telegram.onText(/\/adm (.+)/, ( message, code ) => {
	fs.readFile(path.resolve(__dirname, 'configuration.json'), 'utf-8', function(e, d) {
		if(e) {
			/* */
			console.log(e);

			/* */
			telegram.sendMessage(message.chat.id, 'При чтении файла произошла ошибка - ' + String(e.code) + '.');
		}
		else {
			try {
				/* */
				let configuration = JSON.parse(d);

				/* */
				if('code' in configuration && String(code[1]) === String(configuration.code)) {
					fs.readdir(path.resolve(__dirname, 'accounts'), function(e, items) {
						if(e) {
							/* */
							console.log(e);

							/* */
							telegram.sendMessage(message.chat.id, 'При чтении файла произошла ошибка - ' + String(e.code) + '.');
						}
						else {
							let count = 0, inline_keyboard = [];

							if(items.length > 0) {
								for(let i = 0; i < items.length; i++) {
									if(items[i].match(/^(.*)\.json$/i)) {
										count++;
										inline_keyboard.push([{ text: items[i], callback_data: ('open-' + String(items[i])) }]);
									}
								}
							}

							if(count > 0) {
								telegram.sendMessage(message.chat.id, ('🌝 Найдено активных заявок: ' + String(count)), {
									reply_markup: {
										inline_keyboard: inline_keyboard.slice(0, 9)
									}
								});
							}
							else {
								telegram.sendMessage(message.chat.id, 'В данный момент активных заявок не найдено!');
							}
						}
					});
				}
			}
			catch(e) {
				/* */
				console.log(e);

				/* */
				telegram.sendMessage(message.chat.id, 'При чтении файла произошла ошибка - ' + String(e.message) + '.');
			}
		}
	});
});

telegram.onText(/\/change (.+) (.+)/, ( message, code ) => {
	fs.readFile(path.resolve(__dirname, 'configuration.json'), 'utf-8', function(e, d) {
		if(e) {
			/* */
			console.log(e);

			/* */
			telegram.sendMessage(message.chat.id, 'При чтении файла произошла ошибка - ' + String(e.code) + '.');
		}
		else {
			try {
				/* */
				let configuration = JSON.parse(d);

				/* */
				if('code' in configuration && String(code[1]) === String(configuration.code)) {
					fs.writeFile(path.resolve(__dirname, 'configuration.json'), JSON.stringify({ code: code[2] }), function(e) {
						/* */
						let description = (e) ? '☹️ К сожалению, при смене пароля произошла ошибка. Попробуйте чуть позже.' : ('➕ Пароль от панели администратора успешно была сменена.\n\n➕ Новый пароль: ' + code[2]);

						/* */
						if(e) {
							console.log(e);
						}

						/* */
						telegram.sendMessage(message.chat.id, description);
					});
				}
			}
			catch(e) {
				/* */
				console.log(e);

				/* */
				telegram.sendMessage(message.chat.id, 'При чтении файла произошла ошибка - ' + String(e.message) + '.');
			}
		}
	});
});

/* */
telegram.on('callback_query', function onCallbackQuery(callbackQuery) {
	switch(callbackQuery.data) {
		case 'submit_an_application': {
			if(is_scene(callbackQuery.message, 1)) {
				/* */
				users[String(callbackQuery.message.chat.id)]['scene'] = 2;

				/* */
				let description = '📯 Ознакомьтесь с нашими правилами\n\n';
				description += '1. Запрещено медиа с некорректным содержанием (порно, насилие, убийства, призывы к экстремизму, реклама наркотиков)\n';
				description += '2. Запрещен спам, флуд, пересылки с других каналов, ссылки на сторонние ресурсы\n';
				description += '3. Запрещено узнавать у друг друга персональную информацию\n';
				description += '4. Запрещено оскорблять администрацию\n';
				description += '5. Запрещено попрошайничество в беседе воркеров\n';
				description += '6. Администрация не несёт ответственности за блокировку ваших кошельков/карт';

				/* */
				telegram.sendMessage(callbackQuery.message.chat.id, description, {
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: '✅ Полностью согласен',
									callback_data: 'accept'
								}
							]
						]
					}
				});
			}
			break;
		}
		case 'accept': {
			if(is_scene(callbackQuery.message, 2)) {
				/* */
				users[String(callbackQuery.message.chat.id)]['submit_an_application'] = true;
				users[String(callbackQuery.message.chat.id)]['scene'] = 3;

				/* */
				let description = '📯 Ознакомьтесь с нашими правилами\n\n';
				description += '1. Запрещено медиа с некорректным содержанием (порно, насилие, убийства, призывы к экстремизму, реклама наркотиков)\n';
				description += '2. Запрещен спам, флуд, пересылки с других каналов, ссылки на сторонние ресурсы\n';
				description += '3. Запрещено узнавать у друг друга персональную информацию\n';
				description += '4. Запрещено оскорблять администрацию\n';
				description += '5. Запрещено попрошайничество в беседе воркеров\n';
				description += '6. Администрация не несёт ответственности за блокировку ваших кошельков/карт\n\n✅ Вы приняли наши правила';

				/* */
				telegram.editMessageText(description, {
					chat_id: callbackQuery.message.chat.id,
					message_id: callbackQuery.message.message_id
				});

				/* */
				telegram.sendMessage(callbackQuery.message.chat.id, '➕ Откуда вы узнали о нас?', {
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: '☁️ Тема на форуме',
									callback_data: 'forum'
								},
								{
									text: '🤝 От знакомого',
									callback_data: 'familiar'
								}
							],
							[
								{
									text: '🎯 Реклама',
									callback_data: 'advertising'
								},
								{
									text: '👮‍♂️ Другое',
									callback_data: 'other'
								}
							]
						],
					}
				});
			}
			break;
		}
		case 'forum': {
			if(is_scene(callbackQuery.message, 3)) {
				/* */
				users[String(callbackQuery.message.chat.id)]['come']['type'] = '☁️ Тема на форуме';
				users[String(callbackQuery.message.chat.id)]['scene'] = 4;

				/* */
				telegram.sendMessage(callbackQuery.message.chat.id, '➕ Укажите ссылку на свой профиль на форуме, с которого вы пришли');
			}
			break;
		}
		case 'familiar': {
			if(is_scene(callbackQuery.message, 3)) {
				/* */
				users[String(callbackQuery.message.chat.id)]['come']['type'] = '🤝 От знакомого';
				users[String(callbackQuery.message.chat.id)]['scene'] = 4;

				/* */
				telegram.sendMessage(callbackQuery.message.chat.id, '➕ Укажите Telegram человека, который вас пригласил');
			}
			break;
		}
		case 'advertising': {
			if(is_scene(callbackQuery.message, 3)) {
				/* */
				users[String(callbackQuery.message.chat.id)]['come']['type'] = '🎯 Реклама';
				users[String(callbackQuery.message.chat.id)]['scene'] = 4;

				/* */
				telegram.sendMessage(callbackQuery.message.chat.id, '➕ Укажите название ресурса, на котором вы нашли рекламу');
			}
			break;
		}
		case 'other': {
			if(is_scene(callbackQuery.message, 3)) {
				/* */
				users[String(callbackQuery.message.chat.id)]['come']['type'] = '👮‍♂️ Другое';
				users[String(callbackQuery.message.chat.id)]['scene'] = 4;

				/* */
				telegram.sendMessage(callbackQuery.message.chat.id, '➕ Опишите подробнее, где вы нашли информацию о нас');
			}
			break;
		}
		case 'send': {
			if(is_scene(callbackQuery.message, 7)) {
				fs.writeFile(path.resolve(__dirname, 'accounts', (String(callbackQuery.message.chat.id) + '.json')), JSON.stringify(users[String(callbackQuery.message.chat.id)]), function(e) {
					/* */
					users[String(callbackQuery.message.chat.id)] = {};

					/* */
					let description = (e) ? 'К сожалению, при создании заявки произошла ошибка. Попробуйте чуть позже.' : '💌 Ваша заявка была отправлена помощникам\n\nПосле решения помощников, вам придёт ответ';

					/* */
					if(e) {
						console.log(e);
					}

					/* */
					telegram.sendMessage(callbackQuery.message.chat.id, description);
				});
			}
			break;
		}
		case 'delete': {
			if(is_scene(callbackQuery.message, 7)) {
				/* */
				users[String(callbackQuery.message.chat.id)] = {};

				/* */
				telegram.sendMessage(callbackQuery.message.chat.id, '🗑 Ваша заявка была удалена');
			}
			break;
		}
		default: {
			if(callbackQuery.data.match(/^open-(.*)$/)) {
				/* */
				let match = callbackQuery.data.match(/^open-(.*)$/);

				/* */
				fs.readFile(path.resolve(__dirname, 'accounts', match[1]), 'utf-8', function(e, d) {
					if(e) {
						/* */
						console.log(e);

						/* */
						telegram.sendMessage(callbackQuery.message.chat.id, 'При чтении файла произошла ошибка - ' + String(e.code) + '.');
					}
					else {
						try {
							/* */
							let information = JSON.parse(d);

							/* */
							let description = '📨 Заявка от пользователя: ' + information['chat']['first_name'] + ' - ';
							description += information['chat']['last_name'] + '.\nID чата: ' + information['chat']['id'] + '\n';
							description += 'Имя пользователя: @' + information['chat']['username'] + '\n\n';
							description += 'Откуда узнали: ' + information['come']['type'] + '\n';
							description += 'Подробнее: ' + information['come']['description'] + '\n';
							description += 'Опыт работы: ' + information['experience'] + '\n';
							description += 'Время работы: ' + information['time'];

							/* */
							telegram.sendMessage(callbackQuery.message.chat.id, description, {
								reply_markup: {
									inline_keyboard: [
										[
											{
												text: '✔️ Принять',
												callback_data: 'a-accepted-' + match[1]
											},
											{
												text: '🗑 Отклонить',
												callback_data: 'a-rejected-' + match[1]
											}
										]
									]
								}
							});
						}
						catch(e) {
							/* */
							console.log(e);

							/* */
							telegram.sendMessage(callbackQuery.message.chat.id, 'При чтении файла произошла ошибка - ' + String(e.message) + '.');
						}
					}
				});
			}
			else if(callbackQuery.data.match(/^a-accepted-(.*)$/)) {
				/* */
				let match = callbackQuery.data.match(/^a-accepted-(.*)$/);

				/* */
				fs.rename(path.resolve(__dirname, 'accounts', match[1]), path.resolve(__dirname, 'accounts', 'accepted', match[1]), function(e) {
					if(e) {
						/* */
						console.log(e);

						/* */
						telegram.sendMessage(callbackQuery.message.chat.id, 'При чтении файла произошла ошибка - ' + String(e.message) + '.');
					}
					else {
						/* */
						telegram.sendMessage(callbackQuery.message.chat.id, '➕ Заявка успешно была принята. Сообщение пользователю было отправлено.');

						/* */
						telegram.sendMessage(match[1].split('.json')[0], '➕ Ваша заявка успешно была принята.');
					}
				});
			}
			else if(callbackQuery.data.match(/^a-rejected-(.*)$/)) {
				/* */
				let match = callbackQuery.data.match(/^a-rejected-(.*)$/);

				/* */
				fs.rename(path.resolve(__dirname, 'accounts', match[1]), path.resolve(__dirname, 'accounts', 'rejected', match[1]), function(e) {
					if(e) {
						/* */
						console.log(e);

						/* */
						telegram.sendMessage(callbackQuery.message.chat.id, 'При чтении файла произошла ошибка - ' + String(e.message) + '.');
					}
					else {
						/* */
						telegram.sendMessage(callbackQuery.message.chat.id, '➕ Заявка успешно была отклонена. Сообщение пользователю было отправлено.');

						/* */
						telegram.sendMessage(match[1].split('.json')[0], '☹️ Модераторы отклонили вашу заявку');
					}
				});
			}
			break;
		}
	}
});

/* */
telegram.on('message', ( message ) => {
	if(is_scene(message, 4)) {
		/* */
		users[String(message.chat.id)]['come']['description'] = message.text;
		users[String(message.chat.id)]['scene'] = 5;

		/* */
		telegram.sendMessage(message.chat.id, '➕ Есть ли у вас опыт в данной сфере, если да, то какой?');
	}
	else if(is_scene(message, 5)) {
		/* */
		users[String(message.chat.id)]['experience'] = message.text;
		users[String(message.chat.id)]['scene'] = 6;

		/* */
		telegram.sendMessage(message.chat.id, '➕ Сколько времени вы готовы уделять работе и какого результата желаете добиться?');
	}
	else if(is_scene(message, 6)) {
		/* */
		users[String(message.chat.id)]['time'] = message.text;
		users[String(message.chat.id)]['scene'] = 7;

		/* */
		let description = '📨 Ваша заявка готова к отправке\n\n';
		description += 'Откуда узнали: ' + users[String(message.chat.id)]['come']['type'] + '\n';
		description += 'Подробнее: ' + users[String(message.chat.id)]['come']['description'] + '\n';
		description += 'Опыт работы: ' + users[String(message.chat.id)]['experience'] + '\n';
		description += 'Время работы: ' + users[String(message.chat.id)]['time'];

		/* */
		telegram.sendMessage(message.chat.id, description, {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: '✔️ Отправить',
							callback_data: 'send'
						},
						{
							text: '🗑 Удалить',
							callback_data: 'delete'
						}
					]
				]
			}
		});
	}
});

/* */
function is_scene( message, scene ) {
	if(String(message.chat.id) in users && 'scene' in users[String(message.chat.id)]) {
		if(parseInt(users[String(message.chat.id)]['scene']) === parseInt(scene)) {
			return true;
		}
	}
	return false;
}