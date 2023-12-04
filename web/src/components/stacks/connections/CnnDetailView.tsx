import Header from "@/components/Heder"
import connSo, { ConnectionState } from "@/stores/connections"
import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import CnnDetailCmp from "./CnnDetailCmp"
import layoutSo from "@/stores/layout"



interface Props {
	store?: CnnDetailStore
	style?: React.CSSProperties,
}

const CnnDetailView: FunctionComponent<Props> = ({
	store: cnnDetailSo,
	style,
}) => {

	// STORE
	useStore(cnnDetailSo) as CnnDetailState
	useStore(connSo) as ConnectionState

	// HOOKs

	// HANDLER
	const handleClickMessages = () => {
		cnnDetailSo.openMessages()
	}

	// RENDER
	return <div style={{ ...cssContainer, ...style }}>

		<Header view={cnnDetailSo} 
			title="DETAIL" 
			style={{color: layoutSo.state.theme.palette.fg.acid[0]}}
		/>

		<div style={cssItem}
			onClick={handleClickMessages}
		>MESSAGES</div>
		<div style={cssItem}>DATABASES</div>
		<div style={cssItem}>SETTINGS</div>
		
		<hr />

		<CnnDetailCmp
			cnnDetailSo={cnnDetailSo}
		/>
	</div>
}

export default CnnDetailView

const cssContainer: React.CSSProperties = {
	paddingLeft: "15px",
	flex: 1,
	display: "flex", flexDirection: "column",
	backgroundColor: "#BBFB35",
	color: "black",
	//width: "146px",
}

const cssItem: React.CSSProperties = {
}
