import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StoreProvider } from './StoreProvider'

const queryClient = new QueryClient()

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StoreProvider>
          {children}
        </StoreProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
