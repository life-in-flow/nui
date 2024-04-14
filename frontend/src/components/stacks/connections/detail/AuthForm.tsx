import Options from "@/components/Options"
import Button from "@/components/buttons/Button"
import { AUTH_MODE, Auth } from "@/types"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import TextInput from "../../../input/TextInput"
import StringUpRow from "@/components/rows/StringUpRow"
import PasswordInput from "@/components/input/PasswordInput"



interface Props {
	auth: Auth
	readOnly?: boolean,
	onClose?: (auth: Auth) => void
}

const AuthForm: FunctionComponent<Props> = ({
	auth,
	readOnly,
	onClose,
}) => {

	// HOOKS
	const [authEdit, setAuthEdit] = useState<Auth>(auth)
	useEffect(() => {
		setAuthEdit(auth ?? {
			mode: AUTH_MODE.TOKEN, creds: "", jwt: "", n_key_seed: "", password: "", token: "", username: ""
		})
	}, [auth])

	// HANDLER
	const handlePropChange = (prop: Partial<Auth>) => setAuthEdit({ ...authEdit, ...prop })
	const authItems = Object.values(AUTH_MODE)

	// RENDER
	if (!authEdit) return null
	return <div className="lyt-form var-dialog">

		<Options<string> style={{ marginBottom: 8 }}
			className={readOnly ? "lbl-prop-title" : ""}
			value={authEdit?.mode?.toUpperCase()}
			items={authItems}
			RenderRow={StringUpRow}
			readOnly={readOnly}
			onSelect={(mode) => handlePropChange({ mode: mode as AUTH_MODE })}
		/>

		{{
			[AUTH_MODE.USER_PASSWORD]: <>
				<div className="lyt-v"><div className="lbl-prop">USERNAME</div><TextInput
					value={authEdit.username}
					onChange={username => handlePropChange({ username })}
					readOnly={readOnly}
				/></div>
				<div className="lyt-v"><div className="lbl-prop">PASSWORD</div><PasswordInput
					value={authEdit.password}
					onChange={password => handlePropChange({ password })}
					readOnly={readOnly}
				/></div>
			</>,
			[AUTH_MODE.TOKEN]: (
				<div className="lyt-v"><div className="lbl-prop">TOKEN</div><TextInput
					value={authEdit.token}
					onChange={token => handlePropChange({ token })}
					readOnly={readOnly}
				/></div>
			),
			[AUTH_MODE.JWT]: <>
				<div className="lyt-v"><div className="lbl-prop">JWT</div><TextInput
					value={authEdit.jwt}
					onChange={jwt => handlePropChange({ jwt })}
					readOnly={readOnly}
				/></div>
				<div className="lyt-v"><div className="lbl-prop">NKEY</div><TextInput
					value={authEdit.n_key_seed}
					onChange={n_key_seed => handlePropChange({ n_key_seed })}
					readOnly={readOnly}
				/></div>
			</>,
			[AUTH_MODE.BEARER_JWT]: <>
				<div className="lyt-v"><div className="lbl-prop">BEARER JWT</div><TextInput
					value={authEdit.jwt}
					onChange={jwt => handlePropChange({ jwt })}
					readOnly={readOnly}
				/></div>
			</>,
			[AUTH_MODE.CREDS_FILE]: <>
				<div className="lyt-v"><div className="lbl-prop">CREDS PATH FILE</div><TextInput
					value={authEdit.creds}
					onChange={creds => handlePropChange({ creds })}
					readOnly={readOnly}
				/></div>
			</>,
		}[authEdit.mode]}

		<div className="cmp-footer">
			<Button children={readOnly ? "CLOSE" : "CANCEL"}
				onClick={() => onClose(null)}
			/>
			{!readOnly && (
				<Button children="SAVE"
					onClick={() => onClose(authEdit)}
				/>
			)}
		</div>
	</div>

}

export default AuthForm
