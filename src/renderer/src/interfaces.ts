export interface Tab {
  title: string
  id: number
  url: string
  favicon: string
  navigation: {
    isLoading: boolean
    canGoBack: boolean
    canGoForward: boolean
  }
}

export interface Favicon {
  id: number
  url: string
}

export interface HistoryItem {
  id: string
  favicon: string
  title: string
  url: string
  timestamp: number
}
