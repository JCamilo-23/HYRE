export type Screen =
  | "splash"
  | "onboarding"
  | "userType"
  | "register"
  | "home"
  | "match"
  | "simulation"
  | "interview"
  | "report"
  | "profile"
  | "mentor"

export interface UserData {
  name: string
  email: string
  userType: "candidate" | "company" | null
}
