import express from 'express';
//import data from './data.json' with { type: 'json' };
import game from './teams.json' with { type: 'json' };

import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));

app.use(express.json());

app.get('/leaderboard', async (req, res) => {
	const response = await fetchLeaderboard();
	const data = await response.json();

	const cutLine = data.cutLines[0].cutScore === "E" ? 0 : Number(data.cutLines[0].cutScore);

	res.send(`
		<div class="text-white text-semibold text-lg justify-center items-center w-screen">
			<h2>Winner buys dinner</h2>
			<h2>Cut line ${data.cutLines[0].cutScore}</h2>
		</div>
		<div class="flex flex-wrap justify-center items-center w-screen">
			${game.teams.map((team, i) => {
				const members = data.leaderboardRows.filter((row) => team.golfers.includes(row.playerId));
				const score = members.reduce((acc, player) => {
					const total = player.total === "E" ? 0 : Number(player.total);

					if (player.status === "cut") return acc + 2;
					else return acc + total; 
				}, 0);


				return (`
				<div class="mx-5 my-5 rounded-lg overflow-hidden w-full sm:w-2/3 lg:w-auto">
					<table class="w-full divide-y divide-gray-200 dark:divide-neutral-700">
						<thead>
							<tr>
								<th class="${i%2===1 ? 'bg-sky-500' : 'bg-lime-500'} text-lg border border-gray-800" colspan="3">
									${team.player} (${score === 0 ? 'E' : score > 0 ? '+' + score : score})
								</th>
							</tr>
							<tr class="bg-slate-100">
								<th>Name</th>
								<th class="py-1 px-2">Total Score</th>
								<th class="py-1 px-2">Hole</th>
							</tr>
						</thead>
						<tbody class="[&>tr:nth-child(odd)]:bg-slate-300 [&>tr:nth-child(even)]:bg-slate-400">
							${members.map((player) => 
								`<tr class="font-semibold text-gray-900">
									<td class="py-2 px-2">${player.firstName} ${player.lastName}</td>
									${player.status === "cut" ? 
										`<td class="text-rose-700">${player.total} -> +2</td>` : 
										`<td>${player.total}</td>`
									}
									${player.status === "cut" ? `<td class="text-rose-700">cut</td>` : player.roundComplete ?
										`<td>-</td>` :
										`<td>${player.currentHole.$numberInt}</td>`
									}
								</tr>`
							).join('')}
						</tbody>
					</table>
				</div>
				`)
				}).join(' ')
			}
		</div>
	`);
});

app.listen(8080, () => {
	console.log('Server listening on port 8080');
});

async function fetchLeaderboard() {
	return await fetch('https://live-golf-data.p.rapidapi.com/leaderboard?orgId=1&tournId=033&year=2025', {
		headers: {
			'x-rapidapi-host': process.env.GOLF_API_HOST,
			'x-rapidapi-key': process.env.GOLF_API_KEY 
		}
	});
}
