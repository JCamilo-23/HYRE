import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { MatchCompany } from "@/lib/match-companies"

interface LikedCompaniesState {
  likedCompanies: MatchCompany[]
  addLike: (company: MatchCompany) => void
  removeLike: (companyId: number) => void
  isLiked: (companyId: number) => boolean
}

export const useLikedCompaniesStore = create<LikedCompaniesState>()(
  persist(
    (set, get) => ({
      likedCompanies: [],

      addLike: (company) => {
        if (get().likedCompanies.some((c) => c.id === company.id)) return
        set((s) => ({ likedCompanies: [...s.likedCompanies, company] }))
      },

      removeLike: (companyId) => {
        set((s) => ({
          likedCompanies: s.likedCompanies.filter((c) => c.id !== companyId),
        }))
      },

      isLiked: (companyId) => get().likedCompanies.some((c) => c.id === companyId),
    }),
    { name: "hyre-liked-companies" },
  ),
)
