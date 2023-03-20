import React, { useState } from "react"
import { useHistory, Link } from "react-router-dom"
import { Grid, Typography, Button } from "@material-ui/core"
import {
	Add as CreateIcon,
} from "@material-ui/icons"

import {
	CreateGameEventResponse,
	Game,
} from "@uno-game/protocols"

import useDidMount from "@/hooks/useDidMount"
import useSocket from "@/hooks/useSocket"

import DeviceUtil from "@/utils/device"
import { orderByCreatedAtDesc } from "@/utils/game"

import api from "@/services/api"
import SocketService from "@/services/socket"

import { Divider, LoadingComponent, GameCard } from "@/components"

import useStyles from "@/pages/Dashboard/styles"
import useCustomStyles from "@/styles/custom"

let isRetrievingGames = false

const Dashboard: React.FC = () => {
	const [games, setGames] = useState<Game[]>([])

	const [loadingCreateGame, setLoadingCreateGame] = useState(false)
	const [loadingGetGames, setLoadingGetGames] = useState(true)

	const history = useHistory()
	const classes = useStyles()
	const customClasses = useCustomStyles({})

	const socket = useSocket()

	const handleCreateNewGame = async () => {
		setLoadingCreateGame(true)

		const { gameId } = await SocketService.emit<unknown, CreateGameEventResponse>("CreateGame", {})

		setLoadingCreateGame(false)

		history.push(`/${gameId}`)
	}

	const getGameList = async () => {
		const { data } = await api.get("/games")

		setGames(data.games)

		setLoadingGetGames(false)
	}

	const onGameListUpdated = () => {
		socket.onGameListUpdated(async () => {
			if (isRetrievingGames) {
				return
			}

			isRetrievingGames = true

			await getGameList()

			isRetrievingGames = false
		})
	}

	useDidMount(() => {
		getGameList()
		onGameListUpdated()
	})

	return (
		<LoadingComponent loading={loadingGetGames}>
			<Grid
				container
				className={customClasses.pageContainer}
			>
				<Grid
					container
					alignItems="center"
					justify="flex-start"
					className={classes.pageTitleContainer}
				>
					<Typography
						variant="h1"
						color="textSecondary"
					>
						Games
					</Typography>

					{DeviceUtil.isMobile ? (
						<Divider orientation="horizontal" size={3} />
					) : (
						<Divider orientation="vertical" size={5} />
					)}

					<Button
						variant="contained"
						color="primary"
						startIcon={<CreateIcon />}
						onClick={handleCreateNewGame}
						disabled={loadingCreateGame}
					>
						{loadingCreateGame ? "CREATING..." : "CREATE NEW GAME"}
					</Button>
				</Grid>

				<Divider orientation="horizontal" size={4} />

				<Grid
					container
					wrap="wrap"
				>
					{games
						.sort(orderByCreatedAtDesc)
						.filter(game => game.status !== "ended")
						.map(game => (
							<Button
								{...({
									component: Link,
									to: `/${game.id}`,
									className: classes.gameCardButton,
								})}
							>
								<GameCard
									key={game.id}
									gameId={game.id}
									name={game.title}
									players={game.players}
									status={game.status}
									maxPlayers={game.maxPlayers}
									mode="preview"
								/>
							</Button>
						))}
				</Grid>
			</Grid>
		</LoadingComponent>
	)
}

export default Dashboard
