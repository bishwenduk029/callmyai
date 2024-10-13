import { Composio } from "composio-core"

export const client = new Composio(process.env.COMPOSIO_API_KEY)

export async function createComposioLink(userEmail: string, appId: string): Promise<string> {
    const entity = client.getEntity(userEmail)
    const connection = await entity.initiateConnection(appId)
    if (!connection.redirectUrl) throw new Error("Failed to create Composio link")
    return connection.redirectUrl
}
