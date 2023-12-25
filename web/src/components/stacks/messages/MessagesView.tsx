import Header from "@/components/Header"
import ActionGroup from "@/components/buttons/ActionGroup"
import Button from "@/components/buttons/Button"
import FindInput from "@/components/input/FindInput"
import cnnSo, { ConnectionState } from "@/stores/connections"
import { VIEW_SIZE } from "@/stores/docs/viewBase"
import layoutSo from "@/stores/layout"
import { MessagesState, MessagesStore } from "@/stores/stacks/messages"
import { HistoryMessage, MSG_FORMAT } from "@/stores/stacks/messages/utils"
import { Subscription } from "@/types"
import { debounce } from "@/utils/time"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import Dialog from "../../dialogs/Dialog"
import SubscriptionsList from "../../lists/sunscriptions/SubscriptionsList"
import FormatDialog from "./FormatDialog"
import ItemsList from "./ItemsList"



interface Props {
	store?: MessagesStore
	style?: React.CSSProperties,
}

const MessagesView: FunctionComponent<Props> = ({
	store: msgSo,
	style,
}) => {

	// STORE
	const msgSa = useStore(msgSo) as MessagesState
	const cnnSa = useStore(cnnSo) as ConnectionState

	// HOOKs

	// HANDLER

	//#region  SUBSCRIPTIONS
	const handleClickSubs = (e: React.MouseEvent, select: boolean) => {
		if (select) return
		msgSo.setSubscriptionsOpen(!select)
	}
	const handleCloseSubsDialog = () => {
		msgSo.setSubscriptionsOpen(false)
	}
	const handleChangeSubs = (newSubs: Subscription[]) => {
		msgSo.setSubscriptions(newSubs)
		debounce("MessagesView:handleChangeSubs", () => {
			msgSo.sendSubscriptions()
		}, 2000)
	}
	//#endregion

	const handleFormatsClick = () => msgSo.setFormatsOpen(true)



	const handleSendClick = () => msgSo.openMessageSend()
	const hendleMessageClick = (message: HistoryMessage) => msgSo.openMessageDetail(message)
	const handleSearchChange = (value:string)=> msgSo.setTextSearch(value)

	// RENDER
	const formatSel = msgSa.format.toUpperCase()

	return (
		<div style={{ ...cssContainer, ...style }}>

			<Header view={msgSo} />

			<ActionGroup>
				<FindInput 
					value={msgSa.textSearch ?? ""}
					onChange={handleSearchChange}
					style={{ marginLeft: 7 }} 

				/>
				<Button
					select={msgSa.formatsOpen}
					label={formatSel}
					onClick={handleFormatsClick}
					colorVar={1}
				/>
				<Button
					select={msgSa.subscriptionsOpen}
					label="SUBJECTS"
					onClick={handleClickSubs}
					colorVar={1}
				/>
				<Button
					label="SEND"
					onClick={handleSendClick}
					colorVar={1}
				/>
			</ActionGroup>

			<ItemsList
				messages={msgSa.history}
				format={msgSa.format}
				onMessageClick={hendleMessageClick}
			/>

			<Dialog
				open={msgSa.subscriptionsOpen}
				store={msgSo}
				onClose={handleCloseSubsDialog}
			>
				<SubscriptionsList
					style={cssDialogSubs}
					subscriptions={msgSa.subscriptions}
					onChange={handleChangeSubs}
				/>
			</Dialog>

			<FormatDialog store={msgSo} />

		</div>
	)
}

export default MessagesView

const cssContainer: React.CSSProperties = {
	position: "relative",
	flex: 1,
	display: "flex",
	flexDirection: "column",
	height: "100%",
	width: "300px",
}

const cssDialogTypes: React.CSSProperties = {
	width: 70,
	flex: 1,
	padding: '10px 15px',
	backgroundColor: layoutSo.state.theme.palette.var[1].bg,
	color: layoutSo.state.theme.palette.var[1].fg,
}
const cssDialogSubs: React.CSSProperties = {
	width: 200,
	flex: 1,
	padding: '10px 15px',
	backgroundColor: layoutSo.state.theme.palette.var[1].bg,
	color: layoutSo.state.theme.palette.var[1].fg,
}