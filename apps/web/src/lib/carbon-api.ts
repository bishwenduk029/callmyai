import axios from "axios"

interface CarbonAccessTokenResponse {
  access_token: string
}

export async function fetchCarbonAccessToken(customerId: string): Promise<CarbonAccessTokenResponse> {
  const response = await axios.get<CarbonAccessTokenResponse>(
    "https://api.carbon.ai/auth/v1/access_token",
    {
      headers: {
        "Content-Type": "application/json",
        "customer-id": customerId,
        "Authorization": `Bearer ${process.env.CARBON_API_KEY!}`,
      },
    }
  )

  if (response.status !== 200 || !response.data)
    throw new Error("Failed to retrieve access token")

  return response.data
}
