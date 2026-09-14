import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { HomePage } from './pages/HomePage'
import { ExercisesPage } from './pages/ExercisesPage'
import { GeneratePage } from './pages/GeneratePage'
import { CreatePage } from './pages/CreatePage'
import { LoginPage } from './pages/LoginPage'
import { MyWorkoutsPage } from './pages/MyWorkoutsPage'
import { SharedWorkoutPage } from './pages/SharedWorkoutPage'
import { Layout } from './components/Layout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/exercises" element={<ExercisesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/my-workouts" element={<MyWorkoutsPage />} />
              <Route path="/shared/:token" element={<SharedWorkoutPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
