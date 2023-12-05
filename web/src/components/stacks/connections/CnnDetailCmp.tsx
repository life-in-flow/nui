import SubDetail from "@/components/subscription/Detail"
import SubRow from "@/components/subscription/Row"
import cnnSo from "@/stores/connections"
import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import Dialog from "../dialogs/Dialog"
import ListEditDlg from "../dialogs/ListEditDlg"
import TextInput from "@/components/input/TextInput"
import Label from "@/components/input/Label"



interface Props {
	cnnDetailSo: CnnDetailStore
}

/**
 * dettaglio di una CONNECTION
 */
const CnnDetailCmp: FunctionComponent<Props> = ({
	cnnDetailSo,
}) => {

	// STORE
	const cnnDetailSa = useStore(cnnDetailSo) as CnnDetailState

	// HOOKs
	// const refDialog = useMemo(() => {
	// 	if (!cnnDetailSa.dialogOpen) return null
	// 	const elm = document.getElementById(`dialog_${cnnDetailSa.uuid}`)
	// 	return elm
	// }, [cnnDetailSa.dialogOpen])


	// HANDLER
	const handleChangeName = (name: string) => {
		const cnn = { ...cnnDetailSa.connection, name }
		cnnDetailSo.setConnection(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleChangeHost = (host: string) => {
		const cnn = { ...cnnDetailSa.connection, hosts: [host] }
		cnnDetailSo.setConnection(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleClickSubs = () => {
		cnnDetailSo.setSubOpen(true)
	}
	const handleCloseDetail = () => {
		cnnDetailSo.setSubOpen(false)
	}
	const handleCreate = async () => {
		const cnn = await cnnSo.create(cnnDetailSa.connection)
		cnnDetailSo.setConnection(cnn)
	}

	const handleChangeSubs = (newItems: Subscription[]) => {
		cnnDetailSa.connection.subscriptions = newItems
		const newConnection = { ...cnnDetailSa.connection }
		cnnDetailSo.setConnection(newConnection)
		cnnSo.modify(newConnection)
	}

	// RENDER
	// const subscrsDlg = <SubscriptionsDlg
	// 	parentSo={parentSo}
	// 	onClose={() => parentSo.setDialogCmp(null)}
	// />

	const isNew = cnnDetailSa.connection?.id == null

	if (cnnDetailSa.connection == null) return null

	const name = cnnDetailSa.connection.name ?? ""
	const host = cnnDetailSa.connection.hosts?.[0] ?? ""
	const subscriptions = cnnDetailSa.connection.subscriptions ?? []

	return (<div>

		<Label>NAME</Label>
		<TextInput
			value={name}
			onChange={handleChangeName}
		/>

		<Label>HOST</Label>
		<TextInput
			value={host}
			onChange={handleChangeHost}
		/>

		<Label>SUBSCRIPTIONS</Label>
		<TextInput
			value={host}
			onChange={handleClickSubs}
		/>

		<ListEditDlg<Subscription> style={{ flex: 1, backgroundColor: "#a0e312" }}
			items={cnnDetailSa.connection.subscriptions}
			RenderRow={SubRow}
			RenderDetail={SubDetail}
			fnNewItem={() => ({ subject: "<new>" })}
			onChange={handleChangeSubs}
		/>


		{/* <button
			onClick={handleClickSubs}
		>{subscriptions?.map(s => s.subject).join(",")}</button> */}

		{isNew &&
			<button
				onClick={handleCreate}
			>CREATE</button>
		}

		<Dialog
			open={cnnDetailSa.subOpen}
			store={cnnDetailSo}
			onClose={handleCloseDetail}
		>
			<ListEditDlg<Subscription> style={{ flex: 1, backgroundColor: "#a0e312" }}
				items={cnnDetailSa.connection.subscriptions}
				RenderRow={SubRow}
				RenderDetail={SubDetail}
				fnNewItem={() => ({ subject: "<new>" })}
				onChange={handleChangeSubs}
			/>
		</Dialog>

	</div>)
}

export default CnnDetailCmp
