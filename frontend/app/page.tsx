import { HyreApp } from "@/components/skillmatch/hyre-app"

export default function Home() {
  return (
    <HyreApp
      initialScreen="home"
      initialUserType="candidate"
      initialIsOnboarded
      initialUserData={{
        name: "Empleado",
        email: "",
        userType: "candidate",
      }}
    />
  )
}
