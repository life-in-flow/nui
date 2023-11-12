import { useState, FunctionComponent } from "react"

export interface RenderRowBaseProps<T> {
	item: T
}

export interface RenderDetailBaseProps<T> {
	item: T
	onChange: (item:T) => void
}

interface Props<T> {
	items: T[]
	
	/** renderizza una ROW ITEM in lista */
	RenderRow?: FunctionComponent<RenderRowBaseProps<T>>
	/** renderizza la form per editare un ITEM */
	RenderDetail?: FunctionComponent<RenderDetailBaseProps<T>>
	/** restituisce nuovo ITEM (su click btt NEW) */
	fnNewItem: () => T

	onChange?: (newItems: T[]) => void
	onClose?: () => void
}


function ListEditDlg<T>({
	items,

	RenderRow,
	RenderDetail,
	fnNewItem,

	onChange,
	onClose,
}: Props<T>) {

	// STORES
	//const cnnDetailSa = useStore(parentSo) as CnnDetailState

	// HOOKS
	const [select, setSelect] = useState<number>(null)

	// HANDLERS
	const handleSelect = (index: number) => {
		setSelect(index)
	}
	const handleChangeSelect = (item:T) => {
		const newItems = [...items]
		newItems[select] = item
		onChange?.(newItems)
	}
	const handleDelete = () => {
		const newItems = [...items]
		newItems.splice(select, 1)
		onChange?.(newItems)
	}
	const handleNew = () => {
		const newItem = fnNewItem()
		const newItems = [...items, newItem]
		setSelect(newItems.length - 1)
		onChange?.(newItems)
	}
	const handleClose = () => onClose()

	// RENDER
	const itemSel = items[select]

	return <div style={cssContainer}>

		{/* CHUSURA */}
		<div onClick={handleClose}>X</div>

		{/* LISTA */}
		{items?.map((item, index) =>
			<div 
				key={index} 
				style={{ backgroundColor: index == select ? "red" : null }}
				onClick={() => handleSelect(index)}
			>
				<RenderRow item={item} />
			</div>
		)}

		{/* SE é SELEZONATO UN ITEM... */}
		{itemSel != null && <>
			<RenderDetail item={itemSel} onChange={handleChangeSelect} />
			<button
				onClick={handleDelete}
			>DELETE</button>
		</>}

		{/* BOTTONE NEW */}
		<button onClick={handleNew}>NEW</button>
	</div>
}

export default ListEditDlg

const cssContainer: React.CSSProperties = {
	paddingLeft: "15px",
	flex: 1,
	display: "flex", flexDirection: "column",
	backgroundColor: "#a0e312",
	color: "black",
	width: "146px",
}
