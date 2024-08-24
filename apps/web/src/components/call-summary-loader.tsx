import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Skeleton } from "./ui/skeleton"

const CallSummaryLoadingState = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-4 w-full rounded-xl" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-[20%] rounded-xl" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[125px] w-[95%] rounded-xl" />
      </CardContent>
    </Card>
  )
}

export default CallSummaryLoadingState
