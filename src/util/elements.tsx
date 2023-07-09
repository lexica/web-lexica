import { WithChildren } from "./types";

export const MaybeRender = ({
    maybeRender = false,
    children
}: WithChildren<{ maybeRender ?: any }>): JSX.Element => {
    if (maybeRender) return (<>{children}</>)
    else return <></>
}
