import express from 'express';
import data from './data.json' with { type: 'json' };
import game from './teams.json' with { type: 'json' };

import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get('/leaderboard', async (req, res) => {
	const response = await fetchLeaderboard();
	//	const data = await response.json();

	const cutLine = data.cutLines[0].cutScore === "E" ? 0 : Number(data.cutLines[0].cutScore);


	game.teams.forEach((team, i) => {
		const members = data.leaderboardRows
			.filter((row) => team.golfers.includes(row.playerId))
			.map((row) => {
				if (row.status === "cut") row.adjusted = 2;
				else if (row.total === "E") row.adjusted = 0;
				else row.adjusted = Number(row.total);
				return row;
			});

		team.members = members;

		team.score = members.reduce((acc, player) => {
			return acc + player.adjusted;
		}, 0);
	});

	res.send(`
		<div class="md:w-2/3 justify-center items-center w-screen my-10 mx-auto">
			<div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
				<table class="table">
					<!-- head -->
					<thead>
						<tr>
							<th>Name</th>
							<th>R1</th>
							<th>R2</th>
							<th>R3</th>
							<th>R4</th>
							<th>Final</th>
						</tr>
					</thead>
					<tbody>
						${game.teams.map((team, i) =>
						`
						<tr class="hover:bg-base-300" onclick="my_modal_3.showModal()">
							<td>
								<div class="flex items-center gap-3">
									<div class="avatar">
									<div class="mask mask-squircle h-12 w-12">
										<img
										src="https://img.daisyui.com/images/profile/demo/2@94.webp"
										alt="Avatar Tailwind CSS Component" />
									</div>
									</div>
									<div>
									<div class="font-bold">${team.player}</div>
									</div>
								</div>
							</td>
							<td>${team.score === 0 ? 'E' : team.score > 0 ? '+' + team.score : team.score}</td>
							<td>${team.score === 0 ? 'E' : team.score > 0 ? '+' + team.score : team.score}</td>
							<td>${team.score === 0 ? 'E' : team.score > 0 ? '+' + team.score : team.score}</td>
							<td>${team.score === 0 ? 'E' : team.score > 0 ? '+' + team.score : team.score}</td>
							<td>${team.score === 0 ? 'E' : team.score > 0 ? '+' + team.score : team.score}</td>
						</tr>
						`).join(' ')}
					</tbody>
				</table>
			</div>
		</div>
		<dialog id="my_modal_3" class="modal">
		  <div class="modal-box">
			<form method="dialog">
			  <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
			</form>
			<div class="overflow-x-auto">
			  <table class="table table-zebra">
				<thead>
				  <tr>
					<th>Name</th>
					<th>R1</th>
					<th>R2</th>
					<th>R3</th>
					<th>R4</th>
					<th>Total</th>
				  </tr>
				</thead>
				<tbody>
				  <tr>
					<th>Rory</th>
					<td>-2</td>
					<td>-1</td>
					<td>+2</td>
					<td>E</td>
					<td>-1</td>
				  </tr>
				  <tr>
					<th>Rory</th>
					<td>-2</td>
					<td>-1</td>
					<td>+2</td>
					<td>E</td>
					<td>-1</td>
				  </tr>
				  <tr>
				  <tr>
					<th>Rory</th>
					<td>-2</td>
					<td>-1</td>
					<td>+2</td>
					<td>E</td>
					<td>-1</td>
				  </tr>
					<th>Rory</th>
					<td>-2</td>
					<td>-1</td>
					<td>+2</td>
					<td>E</td>
					<td>-1</td>
				  </tr>
				</tbody>
			  </table>
			</div>
		  </div>
		</dialog>
		<div class="flex flex-wrap justify-center items-center w-screen">
			${game.teams.map((team, i) =>
			`	
				<div class="mx-5 my-5 rounded-lg overflow-hidden w-full sm:w-2/3 lg:w-auto">
					<table class="w-full divide-y divide-gray-200 dark:divide-neutral-700">
						<thead>
							<tr>
								<th class="${i % 2 === 1 ? 'bg-sky-500' : 'bg-lime-500'} text-lg border border-gray-800" colspan="3">
									${team.player} (${team.score === 0 ? 'E' : team.score > 0 ? '+' + team.score : team.score})
								</th>
							</tr>
							<tr class="bg-slate-100">
								<th>Name</th>
								<th class="py-1 px-2">Total Score</th>
								<th class="py-1 px-2">Hole</th>
							</tr>
						</thead>
						<tbody class="[&>tr:nth-child(odd)]:bg-slate-300 [&>tr:nth-child(even)]:bg-slate-400">
							${team.members.map((player) =>
				player.status === "cut" ?
					`<tr class="font-semibold text-rose-700">
											<td class="py-2 px-2">${player.firstName} ${player.lastName}</td>
											<td>${player.total} -> +2</td>
											<td>cut</td>
									</tr>`
					:
					`<tr class="font-semibold text-gray-900">
										<td class="py-2 px-2">${player.firstName} ${player.lastName}</td>
										<td>${player.total}</td>
										${player.roundComplete ? `<td>-</td>` : `<td>${player.currentHole.$numberInt}`}	
									</tr>`
			).join('')}
						</tbody>
					</table>
				</div>
				`
		).join(' ')
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
